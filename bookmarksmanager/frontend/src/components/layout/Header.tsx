import React from 'react';
import { AddBookmarkForm } from '../bookmarks/AddBookmarkForm';
import { translate } from '../../lib/l10n';

export default function Header() {
  return (
    <header className="flex justify-between items-center p-4 border-b">
      <h1 className="text-2xl font-semibold">{translate('Bookmarks')}</h1>
      <AddBookmarkForm />
    </header>
  );
}