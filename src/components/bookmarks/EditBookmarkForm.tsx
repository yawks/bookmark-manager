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
import { collections, tags as allTags } from '../../data/mock';
import { Bookmark } from '../../types';

interface EditBookmarkFormProps {
  bookmark: Bookmark | null;
  isOpen: boolean;
  onOpenChange: (isOpen: boolean) => void;
}

export function EditBookmarkForm({ bookmark, isOpen, onOpenChange }: EditBookmarkFormProps) {
  const { t } = useTranslation();
  const [selectedTags, setSelectedTags] = useState<Option[]>([]);
  const tagOptions: Option[] = allTags.map(tag => ({ label: tag.name, value: tag.id }));

  useEffect(() => {
    if (bookmark) {
      const currentTags = allTags
        .filter(tag => bookmark.tags.includes(tag.id))
        .map(tag => ({ label: tag.name, value: tag.id }));
      setSelectedTags(currentTags);
    }
  }, [bookmark]);

  if (!bookmark) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
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
            <Input id="url" defaultValue={bookmark.url} className="col-span-3" />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="title" className="text-right">
              {t('bookmark.title')}
            </Label>
            <Input id="title" defaultValue={bookmark.title} className="col-span-3" />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="description" className="text-right">
              {t('bookmark.description')}
            </Label>
            <Input id="description" defaultValue={bookmark.description} className="col-span-3" />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="collection" className="text-right">
              {t('bookmark.collection')}
            </Label>
            <Select defaultValue={bookmark.collectionId}>
              <SelectTrigger className="col-span-3">
                <SelectValue placeholder={t('bookmark.select_collection')} />
              </SelectTrigger>
              <SelectContent>
                {collections.map(collection => (
                  <SelectItem key={collection.id} value={collection.id}>{collection.name}</SelectItem>
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
      </DialogContent>
    </Dialog>
  );
}