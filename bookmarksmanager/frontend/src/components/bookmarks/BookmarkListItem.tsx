import React, { useState } from 'react';

import { Bookmark } from '../../types';
import { Pencil2Icon } from '@radix-ui/react-icons';
import { useLoaderData } from '@tanstack/react-router';

interface BookmarkListItemProps {
  bookmark: Bookmark;
  onEdit: () => void;
  onDelete?: () => void;
}

const BookmarkListItem = ({ bookmark, onEdit, onDelete }: BookmarkListItemProps) => {
  const { tags: allTags } = useLoaderData({ from: '__root__' }) || { tags: [] };
  const tags = allTags || [];
  const domain = new URL(bookmark.url).hostname;
  const bookmarkTags = tags.filter(tag => bookmark.tags.includes(tag.id));
  const [hovered, setHovered] = useState(false);

  return (
    <a
      href={bookmark.url}
      target="_blank"
      rel="noopener noreferrer"
      className={`mt-10 flex items-center justify-between p-3 border-b last:border-b-0 cursor-pointer transition-colors rounded-lg ${hovered ? 'border-primary' : 'border-border'}`}
      style={{ 
        border: `1px solid ${hovered ? 'var(--color-primary-element, #0099ff)' : 'var(--color-border, #d0d7de)'}`,
        borderRadius: 'var(--border-radius, 6px)'
      }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      tabIndex={0}
    >
      <div className="flex items-center space-x-4">
        {bookmark.screenshot ? (
          <img
            src={bookmark.screenshot}
            alt={bookmark.title}
            width={64}
            height={64}
            className="rounded object-cover w-16 h-16 bg-muted"
          />
        ) : (
          <img
            src={`https://www.google.com/s2/favicons?domain=${domain}&sz=64`}
            alt={`${domain} favicon`}
            width={64}
            height={64}
            className="rounded w-16 h-16 bg-muted"
          />
        )}
        <div className="flex flex-col">
          <p className="font-semibold text-sm">{bookmark.title}</p>
          <p className="text-xs text-muted-foreground">{domain}</p>
        </div>
      </div>
      <div className="flex items-center space-x-2">
        {bookmarkTags.map(tag => (
          <span key={tag.id} className="text-xs bg-muted-foreground/20 text-muted-foreground rounded-full px-2 py-0.5">
            #{tag.name}
          </span>
        ))}
        {hovered && (
          <>
            <button
              type="button"
              onClick={e => { e.preventDefault(); onEdit(); }}
              className="ml-2 bg-white/80 hover:bg-white rounded-full p-1 shadow"
              tabIndex={-1}
              title="Modifier"
            >
              <Pencil2Icon className="w-5 h-5 text-gray-700" />
            </button>
            <button
              type="button"
              onClick={e => { e.preventDefault(); onDelete && onDelete(); }}
              className="ml-2 bg-white/80 hover:bg-white rounded-full p-1 shadow"
              tabIndex={-1}
              title="Supprimer"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </>
        )}
      </div>
    </a>
  );
};

export default BookmarkListItem;