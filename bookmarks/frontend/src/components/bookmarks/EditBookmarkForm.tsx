import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import MultipleSelector, { Option } from '@/components/ui/multi-select';
import { Bookmark } from '../../types';
import { useRouteContext, useRouter } from '@tanstack/react-router';
import { TrashIcon } from '@radix-ui/react-icons';

// Helper to get Nextcloud's request token
function getRequestToken() {
  if (typeof document === 'undefined') {
    return null;
  }
  return document.querySelector('meta[name="requesttoken"]')?.getAttribute('content');
}

interface EditBookmarkFormProps {
  bookmark: Bookmark | null;
  isOpen: boolean;
  onOpenChange: (isOpen: boolean) => void;
}

export function EditBookmarkForm({ bookmark, isOpen, onOpenChange }: EditBookmarkFormProps) {
  const { t } = useTranslation();
  const router = useRouter();
  const { collections, tags: allTags } = useRouteContext({ from: '__root__' });

  const [url, setUrl] = useState('');
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [collectionId, setCollectionId] = useState<string | undefined>();
  const [selectedTags, setSelectedTags] = useState<Option[]>([]);
  const [screenshot, setScreenshot] = useState<string | null>(null);

  const tagOptions: Option[] = allTags.map(tag => ({ label: tag.name, value: String(tag.id) }));

  useEffect(() => {
    if (bookmark) {
      setUrl(bookmark.url);
      setTitle(bookmark.title);
      setDescription(bookmark.description || '');
      setCollectionId(bookmark.collectionId ? String(bookmark.collectionId) : undefined);
      setScreenshot(bookmark.screenshot);

      const currentTags = allTags
        .filter(tag => bookmark.tags.includes(tag.id))
        .map(tag => ({ label: tag.name, value: String(tag.id) }));
      setSelectedTags(currentTags);
    }
  }, [bookmark, allTags]);

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
      tags: selectedTags.map(tag => parseInt(tag.value, 10)),
      screenshot,
    };

    const response = await fetch(`/apps/bookmarks/api/v1/bookmarks/${bookmark.id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'requesttoken': requestToken,
      },
      body: JSON.stringify(updatedData),
    });

    if (response.ok) {
      onOpenChange(false);
      router.invalidate();
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

    const response = await fetch(`/apps/bookmarks/api/v1/bookmarks/${bookmark.id}`, {
      method: 'DELETE',
      headers: {
        'requesttoken': requestToken,
      },
    });

    if (response.ok) {
      onOpenChange(false);
      router.invalidate();
    } else {
      console.error('Failed to delete bookmark');
    }
  };

  if (!bookmark) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>{t('bookmark.edit_title')}</DialogTitle>
            <DialogDescription>
              {t('bookmark.edit_description')}
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="url" className="text-right">
                {t('bookmark.url')}
              </Label>
              <Input id="url" value={url} onChange={e => setUrl(e.target.value)} className="col-span-3" />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="title" className="text-right">
                {t('bookmark.title')}
              </Label>
              <Input id="title" value={title} onChange={e => setTitle(e.target.value)} className="col-span-3" />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="description" className="text-right">
                {t('bookmark.description')}
              </Label>
              <Input id="description" value={description} onChange={e => setDescription(e.target.value)} className="col-span-3" />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="collection" className="text-right">
                {t('bookmark.collection')}
              </Label>
              <Select value={collectionId} onValueChange={setCollectionId}>
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
          <DialogFooter className="sm:justify-between">
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