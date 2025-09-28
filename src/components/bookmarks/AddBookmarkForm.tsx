import React from 'react';
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

export function AddBookmarkForm() {
  const { t } = useTranslation();

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button>
          <PlusIcon className="mr-2 h-4 w-4" /> {t('bookmark.add')}
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
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
            <Input id="url" placeholder={t('bookmark.placeholder_url')} className="col-span-3" />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="title" className="text-right">
              {t('bookmark.title')}
            </Label>
            <Input id="title" placeholder={t('bookmark.placeholder_title')} className="col-span-3" />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="description" className="text-right">
              {t('bookmark.description')}
            </Label>
            <Input id="description" placeholder={t('bookmark.placeholder_description')} className="col-span-3" />
          </div>
        </div>
        <DialogFooter>
          <Button type="submit">{t('bookmark.save')}</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}