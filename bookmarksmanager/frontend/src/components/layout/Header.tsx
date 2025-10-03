import React from 'react';
import { AddBookmarkForm } from '../bookmarks/AddBookmarkForm';
import { useTranslation } from 'react-i18next';

export default function Header() {
  const { t } = useTranslation();

  return (
    <header className="flex justify-between items-center p-4 border-b">
      <h1 className="text-2xl font-semibold">{t('app.title', 'Bookmarks')}</h1>
      <AddBookmarkForm />
    </header>
  );
}