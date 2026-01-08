import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import React, { useState } from 'react';
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
import { PlusIcon } from '@radix-ui/react-icons';
import { X } from 'lucide-react';
import { Textarea } from '@/components/ui/textarea';
import { t } from '../../lib/l10n';
import { useBookmarks } from '@/lib/BookmarkContext';

// Helper to get Nextcloud's request token
function getRequestToken() {
  if (typeof document === 'undefined') {
    return null;
  }
  // Try meta tag first
  const meta = document.querySelector('meta[name="requesttoken"]');
  if (meta) return meta.getAttribute('content');
  // Fallback: try <head data-requesttoken="...">
  const head = document.querySelector('head[data-requesttoken]');
  if (head) return head.getAttribute('data-requesttoken');
  return null;
}

export function AddBookmarkForm() {
  console.log('AddBookmarkForm mounted');
  const router = useRouter();
  const { collections, tags: allTags } = useLoaderData({ from: '__root__' }) || { collections: [], tags: [] };
  const availableCollections = collections || [];
  const availableTags = allTags || [];

  const [open, setOpen] = useState(false);
  const [url, setUrl] = useState('');
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [collectionId, setCollectionId] = useState<string | undefined>(undefined);
  const [selectedTags, setSelectedTags] = useState<Tag[]>([]);
  // Screenshot URL for the bookmark
  const [screenshot, setScreenshot] = useState<string | null>(null);
  const [showScreenshotInput, setShowScreenshotInput] = useState(false);
  const [favicon, setFavicon] = useState<string | null>(null);
  const [showFaviconInput, setShowFaviconInput] = useState(false);
  // Loading state for fetching page info
  const [isFetching, setIsFetching] = useState(false);
  // Loading and error state for saving bookmark
  const [isSaving, setIsSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  const { setBookmarks } = useBookmarks();

  const tagOptions: Tag[] = availableTags.map(tag => ({ label: tag.name, value: String(tag.id) }));

  // Async tag creation handler
  const handleCreateTag = async (label: string): Promise<Tag> => {
    const requestToken = getRequestToken();
    if (!requestToken) return { label, value: label };
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
        // Invalidate root context to refresh tags in sidebar
        await router.invalidate();
        return { label: tag.name, value: String(tag.id) };
      }
    } catch (e) {
      // fallback: just return local
    }
    return { label, value: label };
  };

  // Fetch page info (title, description, image) from backend when URL is entered
  const handleUrlBlur = async () => {
    if (!url || !url.startsWith('http')) return;
    setIsFetching(true);
    try {
      const response = await fetch(`/apps/bookmarksmanager/api/v1/page-info?url=${encodeURIComponent(url)}`);
      if (response.ok) {
        const data = await response.json();
        if (data.title) setTitle(data.title);
        if (data.description) setDescription(data.description);
        if (data.image) setScreenshot(data.image);
        if (data.favicon) setFavicon(data.favicon);
      }
    } catch (error) {
      console.error('Failed to fetch page info', error);
    } finally {
      setIsFetching(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    setSaveError(null);
    const requestToken = getRequestToken();
    if (!requestToken) {
      setSaveError('CSRF token not found!');
      setIsSaving(false);
      return;
    }

    const bookmarkData = {
      url,
      title,
      description,
      collectionId: collectionId ? parseInt(collectionId, 10) : null,
      tags: selectedTags.map(tag => {
        const id = parseInt(tag.value, 10);
        return isNaN(id) ? tag.value : id;
      }),
      screenshot,
      favicon,
    };

    try {
      const response = await fetch('/apps/bookmarksmanager/api/v1/bookmarks', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'requesttoken': requestToken,
        },
        body: JSON.stringify(bookmarkData),
      });

      if (response.ok) {
        setOpen(false);
        await router.invalidate();
      } else {
        setSaveError('Failed to create bookmark');
      }
    } catch (err) {
      setSaveError('Network error');
    } finally {
      setIsSaving(false);
    }
  };

  const handleOpenChange = (isOpen: boolean) => {
    setOpen(isOpen);
    if (!isOpen) {
      // Reset form on close
      setUrl('');
      setTitle('');
      setDescription('');
      setCollectionId(undefined);
      setSelectedTags([]);
      setScreenshot(null);
      setFavicon(null);
      setShowScreenshotInput(false);
      setShowFaviconInput(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        <Button>
          <PlusIcon className="mr-2 h-4 w-4" /> {t('bookmark.add')}
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px] w-full max-w-lg max-h-[90vh] flex flex-col p-0 gap-0">
        <form onSubmit={handleSubmit} className="flex flex-col h-full overflow-hidden">
          <DialogHeader className="p-6 pb-2">
            <DialogTitle>{t('bookmark.add_new')}</DialogTitle>
            <DialogDescription>
              {t('bookmark.add_description')}
            </DialogDescription>
          </DialogHeader>

          <div className="flex-1 overflow-y-auto p-6 pt-2 gap-4 flex flex-col">
            {/* URL input */}
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="url" className="text-right">
                {t('bookmark.url')}
              </Label>
              <Input id="url" value={url} onChange={e => setUrl(e.target.value)} onBlur={handleUrlBlur} placeholder={t('bookmark.placeholder_url')} className="col-span-3" />
            </div>
            {/* Screenshot & Favicon area */}
            <div className="col-span-4 flex justify-center items-center gap-6 min-h-[80px]">
              {/* Screenshot */}
              <div className="flex flex-col items-center gap-2 relative">
                <div className="relative group w-24 h-20 flex-shrink-0">
                  {isFetching ? (
                    <div className="w-24 h-20 bg-muted animate-pulse rounded-md" />
                  ) : screenshot ? (
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
                  <div className="flex flex-col gap-1 absolute top-full mt-2 z-20 bg-background p-2 border rounded shadow-md left-1/2 -translate-x-1/2 min-w-[250px]">
                    <Label className="text-xs font-semibold">{t('bookmark.screenshot')}</Label>
                    <div className="flex items-center gap-1">
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
                        <X className="h-3 w-3" />
                      </Button>
                    </div>
                  </div>
                )}
              </div>

              {/* Favicon */}
              <div className="flex flex-col items-center gap-2 relative">
                <div className="relative group w-12 h-12 flex-shrink-0">
                  {isFetching ? (
                    <div className="w-12 h-12 bg-muted animate-pulse rounded-md" />
                  ) : favicon ? (
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
                        <X className="h-3 w-3 rotate-45" /> {/* Use plus icon metaphor */}
                      </Button>
                    </div>
                  )}
                </div>
                {/* Favicon Input */}
                {showFaviconInput && (
                  <div className="flex flex-col gap-1 absolute top-full mt-2 z-20 bg-background p-2 border rounded shadow-md left-1/2 -translate-x-1/2 min-w-[280px]">
                    <Label className="text-xs font-semibold">{t('bookmark.favicon_url')}</Label>
                    <div className="flex items-center gap-1">
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
                        <X className="h-3 w-3" />
                      </Button>
                    </div>
                  </div>
                )}
              </div>
            </div>
            {/* Title input */}
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="title" className="text-right">
                {t('bookmark.title')}
              </Label>
              <Input id="title" value={title} onChange={e => setTitle(e.target.value)} placeholder={isFetching ? t('app.loading') : t('bookmark.placeholder_title')} className="col-span-3" />
            </div>
            {/* Description input */}
            <div className="grid grid-cols-4 items-start gap-4">
              <Label htmlFor="description" className="text-right pt-2">
                {t('bookmark.description')}
              </Label>
              <Textarea id="description" value={description} onChange={e => setDescription(e.target.value)} placeholder={t('bookmark.placeholder_description')} className="col-span-3" />
            </div>
            {/* Collection select */}
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="collection" className="text-right">
                {t('bookmark.collection')}
              </Label>
              <Select onValueChange={setCollectionId} value={collectionId}>
                <SelectTrigger className="col-span-3">
                  <SelectValue placeholder={t('bookmark.select_collection')} />
                </SelectTrigger>
                <SelectContent>
                  {availableCollections.map(collection => (
                    <SelectItem key={collection.id} value={String(collection.id)}>{collection.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            {/* Tags multi-select */}
            <div className="grid grid-cols-4 items-start gap-4">
              <Label htmlFor="tags" className="text-right pt-2">
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
            {/* Error message for save */}
            {saveError && (
              <div className="col-span-4 text-red-600 text-sm text-center">{saveError}</div>
            )}
          </div>

          <DialogFooter className="p-6 pt-2 bg-background z-10 border-t">
            <Button type="submit" className="w-full md:w-auto" disabled={isSaving}>
              {isSaving ? t('app.saving') : t('bookmark.save')}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}