import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import React, { useState } from 'react';

import { Bookmark } from '../../types';
import { Pencil2Icon } from '@radix-ui/react-icons';
import { useLoaderData } from '@tanstack/react-router';
import { useTranslation } from 'react-i18next';

interface BookmarkCardProps {
  bookmark: Bookmark;
  showCollection?: boolean;
  onEdit: () => void;
  onDelete?: () => void;
}

const BookmarkCard = ({ bookmark, showCollection = false, onEdit, onDelete }: BookmarkCardProps) => {
  const { t } = useTranslation();
  const { collections, tags: allTags } = useLoaderData({ from: '__root__' }) || { collections: [], tags: [] };
  const allCollections = collections || [];
  const tags = allTags || [];
  const domain = new URL(bookmark.url).hostname;

  const [hovered, setHovered] = useState(false);
  const bookmarkTags = tags.filter(tag => bookmark.tags.includes(tag.id));
  const collection = allCollections.find(c => c.id === bookmark.collectionId);

  return (
    <a
      href={bookmark.url}
      target="_blank"
      rel="noopener noreferrer"
      className="block group"
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      tabIndex={0}
    >
      <Card 
        className={`overflow-hidden flex flex-col h-full transition-colors ${hovered ? 'border-primary' : 'border-border'}`}
        style={{ 
          border: `1px solid ${hovered ? 'var(--color-primary-element, #0099ff)' : 'var(--color-border, #d0d7de)'}`,
          borderRadius: 'var(--border-radius-large, 8px)'
        }}
      >
        <CardHeader className="p-0 relative">
          {bookmark.screenshot ? (
            <img src={bookmark.screenshot} alt={bookmark.title} className="aspect-video w-full object-cover" />
          ) : (
            <div className="bg-muted aspect-video w-full flex items-center justify-center">
              <span className="text-muted-foreground text-sm">{t('bookmark.no_preview')}</span>
            </div>
          )}
          {hovered && (
            <div className="absolute top-2 right-2 flex gap-2">
              <button
                type="button"
                onClick={e => { e.preventDefault(); onEdit(); }}
                className="bg-white/80 hover:bg-white rounded-full p-1 shadow"
                tabIndex={-1}
                title="Modifier"
              >
                <Pencil2Icon className="w-5 h-5 text-gray-700" />
              </button>
              <button
                type="button"
                onClick={e => { e.preventDefault(); onDelete && onDelete(); }}
                className="bg-white/80 hover:bg-white rounded-full p-1 shadow"
                tabIndex={-1}
                title="Supprimer"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          )}
        </CardHeader>
        <CardContent className="p-4 flex-grow">
          <CardTitle className="text-lg font-semibold">{bookmark.title}</CardTitle>
          <p className="text-sm text-muted-foreground mt-1">{bookmark.description || ''}</p>
        </CardContent>
        <CardFooter className="p-4 pt-0 flex flex-col items-start gap-2">
          <div className="flex flex-wrap gap-1">
          {bookmarkTags.map(tag => (
            <span key={tag.id} className="text-xs bg-muted-foreground/20 text-muted-foreground rounded-full px-2 py-0.5">
              #{tag.name}
            </span>
          ))}
        </div>

        <div className="flex items-center space-x-2 text-xs text-muted-foreground w-full">
          <img
            src={`https://www.google.com/s2/favicons?domain=${domain}&sz=16`}
            alt={`${domain} favicon`}
            width={16}
            height={16}
            className="rounded"
          />
          <span>{domain}</span>
          {showCollection && collection && (
            <>
              <span className="mx-1">·</span>
              <span>{collection.name}</span>
            </>
          )}
        </div>
      </CardFooter>
    </Card>
    </a>
  );
};

export default BookmarkCard;