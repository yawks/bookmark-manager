import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
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
  const { t } = useTranslation();
  const router = useRouter();
  const { collections, tags: allTags } = useRouteContext({ from: '__root__' });

  const [open, setOpen] = useState(false);
  const [url, setUrl] = useState('');
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [collectionId, setCollectionId] = useState<string | undefined>();
  const [selectedTags, setSelectedTags] = useState<Option[]>([]);
  const [screenshot, setScreenshot] = useState<string | null>(null);
  const [isFetching, setIsFetching] = useState(false);

  const tagOptions: Option[] = allTags.map(tag => ({ label: tag.name, value: String(tag.id) }));

  const handleUrlBlur = async () => {
    if (!url || !url.startsWith('http')) return;
    setIsFetching(true);
    try {
      const response = await fetch(`/apps/bookmarks/api/v1/page-info?url=${encodeURIComponent(url)}`);
      if (response.ok) {
        const data = await response.json();
        if (data.title) setTitle(data.title);
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
    const requestToken = getRequestToken();
    if (!requestToken) {
      console.error('CSRF token not found!');
      return;
    }

    const bookmarkData = {
      url,
      title,
      description,
      collectionId: collectionId ? parseInt(collectionId, 10) : null,
      tags: selectedTags.map(tag => parseInt(tag.value, 10)),
      screenshot,
    };

    const response = await fetch('/apps/bookmarks/api/v1/bookmarks', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'requesttoken': requestToken,
      },
      body: JSON.stringify(bookmarkData),
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
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        <Button>
          <PlusIcon className="mr-2 h-4 w-4" /> {t('bookmark.add')}
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>{t('bookmark.add_new')}</DialogTitle>
            <DialogDescription>
              {t('bookmark.add_description')}
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="url" className="text-right">
                {t('bookmark.url')}
              </Label>
              <Input id="url" value={url} onChange={e => setUrl(e.target.value)} onBlur={handleUrlBlur} placeholder={t('bookmark.placeholder_url')} className="col-span-3" />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="title" className="text-right">
                {t('bookmark.title')}
              </Label>
              <Input id="title" value={title} onChange={e => setTitle(e.target.value)} placeholder={isFetching ? t('bookmark.fetching_title') : t('bookmark.placeholder_title')} className="col-span-3" />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="description" className="text-right">
                {t('bookmark.description')}
              </Label>
              <Input id="description" value={description} onChange={e => setDescription(e.target.value)} placeholder={t('bookmark.placeholder_description')} className="col-span-3" />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="collection" className="text-right">
                {t('bookmark.collection')}
              </Label>
              <Select onValueChange={setCollectionId} value={collectionId}>
                <SelectTrigger className="col-span-3">
                  <SelectValue placeholder={t('bookmark.select_collection')} />
                </SelectTrigger>
                <SelectContent>
                  {collections.map(collection => (
                    <SelectItem key={collection.id} value={String(collection.id)}>{collection.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-4 items-start gap-4">
              <Label htmlFor="tags" className="text-right mt-2">
                {t('bookmark.tags')}
              </Label>
              <div className="col-span-3">
                <MultipleSelector
                  value={selectedTags}
                  onChange={setSelectedTags}
                  options={tagOptions}
                  placeholder={t('bookmark.select_tags')}
                  emptyIndicator="No tags found."
                />
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button type="submit">{t('bookmark.save')}</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}