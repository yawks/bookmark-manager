import { Bookmark, Collection } from '../../types';
import { Cross2Icon, TrashIcon } from '@radix-ui/react-icons';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import React, { useEffect, useMemo, useState } from 'react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Tag, TagSelector } from '@/components/ui/tag-selector';
import { useLoaderData, useRouter } from '@tanstack/react-router';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { t } from '../../lib/l10n';

// Helper to get Nextcloud's request token
function getRequestToken() {
  if (typeof document === 'undefined') {
    return null;
  }
  return document.querySelector('meta[name="requesttoken"]')?.getAttribute('content');
}

// Helper function to build collection tree structure
interface CollectionNode extends Collection {
  children: CollectionNode[];
}

function buildCollectionTree(collections: Collection[]): CollectionNode[] {
  const collectionMap = new Map<number, CollectionNode>();
  const rootCollections: CollectionNode[] = [];

  // First pass: create all nodes
  collections.forEach(collection => {
    collectionMap.set(collection.id, {
      ...collection,
      children: [],
    });
  });

  // Second pass: build tree structure
  collections.forEach(collection => {
    const node = collectionMap.get(collection.id)!;
    if (collection.parentId === null) {
      rootCollections.push(node);
    } else {
      const parent = collectionMap.get(collection.parentId);
      if (parent) {
        parent.children.push(node);
      } else {
        // If parent not found, treat as root
        rootCollections.push(node);
      }
    }
  });

  return rootCollections;
}

// Recursive component to render collection tree
interface CollectionTreeItemProps {
  collection: CollectionNode;
  selectedId: string;
  onSelect: (value: string) => void;
  level: number;
  isLast?: boolean;
  parentPrefix?: string;
}

const CollectionTreeItem: React.FC<CollectionTreeItemProps> = ({
  collection,
  selectedId,
  onSelect,
  level,
  isLast = false,
  parentPrefix = '',
}) => {
  const indent = level * 20; // 20px per level
  let prefix = '';
  if (level > 0) {
    prefix = isLast ? '└─ ' : '├─ ';
  }
  const displayName = parentPrefix + prefix + collection.name;

  return (
    <>
      <SelectItem
        value={String(collection.id)}
        className="pl-8"
        style={{ paddingLeft: `${8 + indent}px` }}
      >
        {displayName}
      </SelectItem>
      {collection.children.map((child, index) => {
        const isChildLast = index === collection.children.length - 1;
        let childPrefix = '';
        if (level > 0) {
          childPrefix = isLast ? '   ' : '│  ';
        }
        return (
          <CollectionTreeItem
            key={child.id}
            collection={child}
            selectedId={selectedId}
            onSelect={onSelect}
            level={level + 1}
            isLast={isChildLast}
            parentPrefix={childPrefix}
          />
        );
      })}
    </>
  );
};

interface EditBookmarkFormProps {
  bookmark: Bookmark | null;
  isOpen: boolean;
  onOpenChange: (isOpen: boolean) => void;
}

export function EditBookmarkForm({ bookmark, isOpen, onOpenChange }: EditBookmarkFormProps) {
  console.log('EditBookmarkForm render v3');
  const router = useRouter();
  const { collections, tags: allTags } = useLoaderData({ from: '__root__' }) || { collections: [], tags: [] };
  const availableCollections = collections || [];
  const availableTags = allTags || [];
  const [localCreatedTags, setLocalCreatedTags] = useState<Tag[]>([]);

  // Build collection tree
  const collectionTree = useMemo(() => {
    return buildCollectionTree(availableCollections);
  }, [availableCollections]);

  const [url, setUrl] = useState('');
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [collectionId, setCollectionId] = useState<string>('');
  const [selectedTags, setSelectedTags] = useState<Tag[]>([]);
  const [screenshot, setScreenshot] = useState<string | null>(null);
  const [showScreenshotInput, setShowScreenshotInput] = useState(false);
  const [favicon, setFavicon] = useState<string | null>(null);
  const [showFaviconInput, setShowFaviconInput] = useState(false);

  // Merge available tags with locally created tags
  const tagOptions: Tag[] = useMemo(() => {
    const baseTags = availableTags.map(tag => ({ label: tag.name, value: String(tag.id) }));
    // Add locally created tags that aren't already in the list
    const localTagsToAdd = localCreatedTags.filter(
      localTag => !baseTags.some(baseTag => baseTag.value === localTag.value)
    );
    return [...baseTags, ...localTagsToAdd];
  }, [availableTags, localCreatedTags]);

  const handleCreateTag = async (label: string): Promise<Tag> => {
    const requestToken = getRequestToken();
    if (!requestToken) {
      return { label, value: label };
    }
    try {
      const response = await fetch('/apps/bookmarksmanager/api/v1/tags', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'requesttoken': requestToken,
        },
        body: JSON.stringify({ name: label }),
      });
      if (response.ok) {
        const tag = await response.json();
        const newTag = { label: tag.name, value: String(tag.id) };
        // Add to local tags instead of invalidating router immediately
        setLocalCreatedTags(prev => [...prev, newTag]);
        // Invalidate router only after form is closed or saved
        return newTag;
      }
    } catch {
      // fallback
    }
    return { label, value: label };
  };

  useEffect(() => {
    if (bookmark) {
      setUrl(bookmark.url);
      setTitle(bookmark.title);
      setDescription(bookmark.description || '');
      setCollectionId(bookmark.collectionId ? String(bookmark.collectionId) : '');
      setScreenshot(bookmark.screenshot);
      setFavicon(bookmark.favicon);

      const currentTags = bookmark.tags.map(tag => ({ label: tag.name, value: String(tag.id) }));
      setSelectedTags(currentTags);
      // Reset local created tags when bookmark changes
      setLocalCreatedTags([]);
    }
  }, [bookmark]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!bookmark) return;

    const requestToken = getRequestToken();
    if (!requestToken) {
      console.error('CSRF token not found!');
      return;
    }

    const updatedData = {
      url,
      title,
      description,
      collectionId: collectionId ? parseInt(collectionId, 10) : null,
      tags: selectedTags.map(tag => {
        const id = parseInt(tag.value, 10);
        return isNaN(id) ? tag.label : id;
      }),
      screenshot,
      favicon,
    };

    const response = await fetch(`/apps/bookmarksmanager/api/v1/bookmarks/${bookmark.id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'requesttoken': requestToken,
      },
      body: JSON.stringify(updatedData),
    });

    if (response.ok) {
      onOpenChange(false);
      // Invalidate router after closing to refresh tags in sidebar
      router.invalidate();
      setLocalCreatedTags([]);
    } else {
      console.error('Failed to update bookmark');
    }
  };

  const handleDelete = async () => {
    if (!bookmark) return;

    if (!window.confirm(t('bookmark.confirm_delete'))) {
      return;
    }

    const requestToken = getRequestToken();
    if (!requestToken) {
      console.error('CSRF token not found!');
      return;
    }

    const response = await fetch(`/apps/bookmarksmanager/api/v1/bookmarks/${bookmark.id}`, {
      method: 'DELETE',
      headers: {
        'requesttoken': requestToken,
      },
    });

    if (response.ok) {
      onOpenChange(false);
      router.invalidate();
      setLocalCreatedTags([]);
    } else {
      console.error('Failed to delete bookmark');
    }
  };

  if (!bookmark) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px] w-full max-w-lg max-h-[90vh] flex flex-col p-0 gap-0">
        <form onSubmit={handleSubmit} className="flex flex-col h-full overflow-hidden">
          <DialogHeader className="p-6 pb-2">
            <DialogTitle>{t('bookmark.edit_title')}</DialogTitle>
            <DialogDescription>
              {t('bookmark.edit_description')}
            </DialogDescription>
          </DialogHeader>

          <div className="flex-1 overflow-y-auto p-6 pt-2 gap-4 flex flex-col">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="url" className="text-right">
                {t('bookmark.url')}
              </Label>
              <Input id="url" value={url} onChange={e => setUrl(e.target.value)} className="col-span-3" />
            </div>

            {/* Screenshot preview with hover edit */}
            {/* Screenshot & Favicon area */}
            <div className="col-span-4 flex justify-center items-center gap-6 min-h-[80px]">
              {/* Screenshot */}
              <div className="flex flex-col items-center gap-2">
                <div className="relative group w-24 h-20 flex-shrink-0">
                  {screenshot ? (
                    <img
                      src={screenshot}
                      alt="Website preview"
                      className="w-24 h-20 object-cover rounded-md border"
                      style={{ maxWidth: '100%', maxHeight: 80 }}
                    />
                  ) : (
                    <div className="w-24 h-20 bg-muted/30 rounded-md flex items-center justify-center text-xs text-muted-foreground border border-dashed border-muted-foreground/30 text-center p-1">
                      {t('bookmark.no_preview')}
                    </div>
                  )}
                  {/* Edit overlay/button */}
                  {!showScreenshotInput && (
                    <div className="absolute inset-0 bg-black/50 flex items-center justify-center rounded-md opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer" onClick={() => setShowScreenshotInput(true)}>
                      <Button
                        type="button"
                        variant="secondary"
                        size="sm"
                        className="h-6 text-xs px-2"
                      >
                        {t('bookmark.edit')}
                      </Button>
                    </div>
                  )}
                </div>
                {/* Screenshot Input */}
                {showScreenshotInput && (
                  <div className="flex w-full max-w-[200px] items-center gap-1 absolute -bottom-10 z-10 bg-background p-1 border rounded shadow-md left-0">
                    <Input
                      value={screenshot || ''}
                      onChange={(e) => setScreenshot(e.target.value)}
                      placeholder={t('bookmark.screenshot')}
                      className="h-7 text-xs"
                      autoFocus
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className="h-7 w-7"
                      onClick={() => setShowScreenshotInput(false)}
                    >
                      <Cross2Icon className="h-3 w-3" />
                    </Button>
                  </div>
                )}
              </div>

              {/* Favicon */}
              <div className="flex flex-col items-center gap-2 relative">
                <div className="relative group w-12 h-12 flex-shrink-0">
                  {favicon ? (
                    <img
                      src={favicon}
                      alt="Favicon"
                      className="w-12 h-12 object-contain rounded-md border p-1"
                    />
                  ) : (
                    <div className="w-12 h-12 bg-muted/30 rounded-md flex items-center justify-center text-[10px] text-muted-foreground border border-dashed border-muted-foreground/30 text-center">
                      Icon
                    </div>
                  )}
                  {/* Edit overlay/button */}
                  {!showFaviconInput && (
                    <div className="absolute inset-0 bg-black/50 flex items-center justify-center rounded-md opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer"
                      onClick={() => {
                        if (!favicon && url) {
                          try {
                            const urlObj = new URL(url);
                            setFavicon(`${urlObj.origin}/favicon.ico`);
                          } catch {
                            // ignore invalid URL
                          }
                        }
                        setShowFaviconInput(true);
                      }}
                    >
                      <Button
                        type="button"
                        variant="secondary"
                        size="icon"
                        className="h-6 w-6"
                      >
                        <Cross2Icon className="h-3 w-3 rotate-45" /> {/* Use plus/edit icon metaphor or just simple edit */}
                      </Button>
                    </div>
                  )}
                </div>
                {/* Favicon Input */}
                {showFaviconInput && (
                  <div className="flex w-[280px] items-center gap-1 absolute -bottom-10 z-10 bg-background p-1 border rounded shadow-md left-1/2 -translate-x-1/2">
                    <Input
                      value={favicon || ''}
                      onChange={(e) => setFavicon(e.target.value)}
                      placeholder={t('bookmark.favicon_url')}
                      className="h-7 text-xs"
                      autoFocus
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className="h-7 w-7"
                      onClick={() => setShowFaviconInput(false)}
                    >
                      <Cross2Icon className="h-3 w-3" />
                    </Button>
                  </div>
                )}
              </div>
            </div>

            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="title" className="text-right">
                {t('bookmark.title')}
              </Label>
              <Input id="title" value={title} onChange={e => setTitle(e.target.value)} className="col-span-3" />
            </div>
            <div className="grid grid-cols-4 items-start gap-4">
              <Label htmlFor="description" className="text-right pt-2">
                {t('bookmark.description')}
              </Label>
              <Input id="description" value={description} onChange={e => setDescription(e.target.value)} className="col-span-3" />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="collection" className="text-right">
                {t('bookmark.collection')}
              </Label>
              <Select value={collectionId || ''} onValueChange={(value) => setCollectionId(value || '')}>
                <SelectTrigger className="col-span-3">
                  <SelectValue placeholder={t('bookmark.select_collection')} />
                </SelectTrigger>
                <SelectContent>
                  {collectionTree.map((collection, index) => (
                    <CollectionTreeItem
                      key={collection.id}
                      collection={collection}
                      selectedId={collectionId}
                      onSelect={setCollectionId}
                      level={0}
                      isLast={index === collectionTree.length - 1}
                    />
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-4 items-start gap-4">
              <Label htmlFor="tags" className="text-right mt-2">
                {t('bookmark.tags')}
              </Label>
              <div className="col-span-3">
                <TagSelector
                  value={selectedTags}
                  onChange={setSelectedTags}
                  options={tagOptions}
                  placeholder={t('bookmark.select_tags')}
                  emptyIndicator={t('bookmark.no_tags_found')}
                  creatable
                  onCreateOption={handleCreateTag}
                />
              </div>
            </div>
          </div>

          <DialogFooter className="p-6 pt-2 bg-background z-10 border-t justify-between sm:justify-between">
            <Button type="button" variant="destructive" onClick={handleDelete}>
              <TrashIcon className="mr-2 h-4 w-4" />
              {t('bookmark.delete')}
            </Button>
            <Button type="submit">{t('bookmark.save')}</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}