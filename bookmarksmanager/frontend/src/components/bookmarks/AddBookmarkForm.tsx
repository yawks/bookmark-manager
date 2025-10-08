import React, { useState } from 'react';
import { t } from '../../lib/l10n';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Skeleton } from '@/components/ui/skeleton';
import { PlusIcon } from '@radix-ui/react-icons';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import MultipleSelector, { Option } from '@/components/ui/multi-select';
import { useRouteContext, useRouter } from '@tanstack/react-router';

// Helper to get Nextcloud's request token
function getRequestToken() {
  if (typeof document === 'undefined') {
    return null;
  }
  return document.querySelector('meta[name="requesttoken"]')?.getAttribute('content');
}

export function AddBookmarkForm() {
  const router = useRouter();
  const { collections, tags: allTags } = useRouteContext({ from: '__root__' }) || { collections: [], tags: [] };
  const availableCollections = collections || [];
  const availableTags = allTags || [];

  const [open, setOpen] = useState(false);
  const [url, setUrl] = useState('');
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [collectionId, setCollectionId] = useState<string | undefined>();
  const [selectedTags, setSelectedTags] = useState<Option[]>([]);
  const [screenshot, setScreenshot] = useState<string | null>(null);
  const [isFetching, setIsFetching] = useState(false);
  const [isScreenshotLoading, setIsScreenshotLoading] = useState(false);

  const tagOptions: Option[] = availableTags.map(tag => ({ label: tag.name, value: String(tag.id) }));

  const handleUrlBlur = async () => {
    if (!url || !url.startsWith('http')) return;

    setIsFetching(true);
    setIsScreenshotLoading(true);
    setScreenshot(null); // Reset screenshot on new URL
    try {
      const response = await fetch(`/apps/bookmarksmanager/api/v1/page-info?url=${encodeURIComponent(url)}`);
      if (response.ok) {
        const data = await response.json();
        if (data.title) setTitle(data.title);
        if (data.description) setDescription(data.description);
        if (data.image) {
          setScreenshot(data.image);
        } else {
          setIsScreenshotLoading(false); // No image, stop loading
        }
      } else {
        setIsScreenshotLoading(false); // Error, stop loading
      }
    } catch (error) {
      console.error('Failed to fetch page info', error);
      setIsScreenshotLoading(false); // Error, stop loading
    } finally {
      setIsFetching(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const requestToken = getRequestToken();
    if (!requestToken) {
      console.error('CSRF token not found!');
      return;
    }

    const params = new URLSearchParams();
    params.append('url', url);
    params.append('title', title);
    if (description) params.append('description', description);
    if (collectionId) params.append('collectionId', collectionId);
    if (screenshot) params.append('screenshot', screenshot);

    selectedTags.forEach(tag => {
      params.append('tags[]', tag.value);
    });

    const response = await fetch('/apps/bookmarksmanager/api/v1/bookmarks', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded;charset=UTF-8',
        'requesttoken': requestToken,
      },
      body: params.toString(),
    });

    if (response.ok) {
      setOpen(false);
      router.invalidate();
    } else {
      console.error('Failed to create bookmark');
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
      setIsScreenshotLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        <Button>
          <PlusIcon className="mr-2 h-4 w-4" /> {t('Add Bookmark')}
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>{t('Add a new bookmark')}</DialogTitle>
            <DialogDescription>
              {t('Enter the details of the bookmark you want to add.')}
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="url" className="text-right">
                {t('URL')}
              </Label>
              <Input id="url" value={url} onChange={e => setUrl(e.target.value)} onBlur={handleUrlBlur} placeholder={t('https://example.com')} className="col-span-3" />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="title" className="text-right">
                {t('Title')}
              </Label>
              <Input id="title" value={title} onChange={e => setTitle(e.target.value)} placeholder={isFetching ? t('Fetching title...') : t('A cool website')} className="col-span-3" />
            </div>
            <div className="grid grid-cols-4 items-start gap-4">
              <Label htmlFor="description" className="text-right pt-2">
                {t('Description')}
              </Label>
              <Textarea id="description" value={description} onChange={e => setDescription(e.target.value)} placeholder={t('A short description')} className="col-span-3" />
            </div>
            <div className="grid grid-cols-4 items-start gap-4">
              <Label htmlFor="screenshot" className="text-right pt-2">
                {t('Screenshot')}
              </Label>
              <div className="col-span-3">
                {isFetching && <Skeleton className="w-full h-[150px] rounded-lg" />}
                {!isFetching && screenshot && (
                  <>
                    {isScreenshotLoading && <Skeleton className="w-full h-[150px] rounded-lg" />}
                    <img
                      src={screenshot}
                      alt={t('Screenshot preview')}
                      className={`w-full h-auto rounded-lg ${isScreenshotLoading ? 'hidden' : 'block'}`}
                      onLoad={() => setIsScreenshotLoading(false)}
                      onError={() => setIsScreenshotLoading(false)} // Also hide on error
                    />
                  </>
                )}
                {!isFetching && !screenshot && (
                  <div className="w-full h-[150px] rounded-lg bg-muted flex items-center justify-center">
                    <span className="text-muted-foreground text-sm">{t('No preview available')}</span>
                  </div>
                )}
              </div>
            </div>
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
            <div className="grid grid-cols-4 items-start gap-4">
              <Label htmlFor="tags" className="text-right mt-2">
                {t('Tags')}
              </Label>
              <div className="col-span-3">
                <MultipleSelector
                  value={selectedTags}
                  onChange={setSelectedTags}
                  options={tagOptions}
                  placeholder={t('Select tags...')}
                  emptyIndicator={t('No tags found.')}
                  creatable
                  badgeClassName="bg-primary text-primary-foreground"
                />
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button type="submit">{t('Save bookmark')}</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}