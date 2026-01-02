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
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        <Button>
          <PlusIcon className="mr-2 h-4 w-4" /> {t('Add Bookmark')}
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px] w-full max-w-lg">
        <form onSubmit={handleSubmit} className="flex flex-col">
          <DialogHeader>
            <DialogTitle>{t('Add a new bookmark')}</DialogTitle>
            <DialogDescription>
              {t('Enter the details of the bookmark you want to add.')}
            </DialogDescription>
          </DialogHeader>
          <div className="flex flex-col gap-4 py-4 flex-grow">
            {/* URL input */}
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="url" className="text-right">
                {t('URL')}
              </Label>
              <Input id="url" value={url} onChange={e => setUrl(e.target.value)} onBlur={handleUrlBlur} placeholder={t('https://example.com')} className="col-span-3" />
            </div>
            {/* Screenshot preview with skeleton - always rendered, even if no URL */}
            <div className="col-span-4 flex justify-center items-center min-h-[80px]" id="screenshot-debug-block">
              {(() => { console.log('RENDER screenshot block', { isFetching, screenshot }); return null; })()}
              {isFetching ? (
                <div className="w-24 h-20 bg-muted animate-pulse rounded-md" data-testid="skeleton" />
              ) : screenshot ? (
                <img
                  src={screenshot}
                  alt="Website preview"
                  className="w-24 h-20 object-cover rounded-md border"
                  style={{ maxWidth: '100%', maxHeight: 80 }}
                  data-testid="screenshot-img"
                />
              ) : (
                <div className="w-24 h-20 bg-muted/30 rounded-md flex items-center justify-center text-xs text-muted-foreground border border-dashed border-muted-foreground/30" data-testid="no-preview">
                  {t('No preview')}
                </div>
              )}
            </div>
            {/* Title input */}
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="title" className="text-right">
                {t('Title')}
              </Label>
              <Input id="title" value={title} onChange={e => setTitle(e.target.value)} placeholder={isFetching ? t('Fetching title...') : t('A cool website')} className="col-span-3" />
            </div>
            {/* Description input */}
            <div className="grid grid-cols-4 items-start gap-4">
              <Label htmlFor="description" className="text-right pt-2">
                {t('Description')}
              </Label>
              <Textarea id="description" value={description} onChange={e => setDescription(e.target.value)} placeholder={t('A short description')} className="col-span-3" />
            </div>
            {/* Collection select */}
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="collection" className="text-right">
                {t('Collection')}
              </Label>
              <Select onValueChange={setCollectionId} value={collectionId}>
                <SelectTrigger className="col-span-3">
                  <SelectValue placeholder={t('Select a collection')} />
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
                {t('Tags')}
              </Label>
              <div className="col-span-3">
                <TagSelector
                  value={selectedTags}
                  onChange={setSelectedTags}
                  options={tagOptions}
                  placeholder={t('Add tags...')}
                  emptyIndicator={t('No tags found.')}
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
          <DialogFooter className="sticky bottom-0 bg-background pt-2 z-10">
            <Button type="submit" className="w-full md:w-auto" disabled={isSaving}>
              {isSaving ? t('Saving...') : t('Save bookmark')}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}