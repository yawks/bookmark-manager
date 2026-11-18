import React, { useState } from 'react';

import { Bookmark } from '../../types';
import { FaviconImage } from './FaviconImage';
import { Pencil2Icon, DragHandleDots2Icon } from '@radix-ui/react-icons';

interface BookmarkListItemProps {
  bookmark: Bookmark;
  onEdit: () => void;
  onDelete?: () => void;
  dragHandleListeners?: any;
}

const BookmarkListItem = ({ bookmark, onEdit, onDelete, dragHandleListeners }: BookmarkListItemProps) => {
  const domain = new URL(bookmark.url).hostname;
  const bookmarkTags = bookmark.tags || [];
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
          <FaviconImage
            src={bookmark.favicon || `https://www.google.com/s2/favicons?domain=${domain}&sz=64`}
            alt={`${domain} favicon`}
            width={64}
            height={64}
            className="w-16 h-16"
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
            {dragHandleListeners && (
              <button
                type="button"
                {...dragHandleListeners}
                onClick={e => e.preventDefault()}
                className="bookmark-action ml-2 cursor-grab active:cursor-grabbing"
                tabIndex={-1}
                title="Déplacer"
              >
                <DragHandleDots2Icon className="w-5 h-5" />
              </button>
            )}
            <button
              type="button"
              onClick={e => { e.preventDefault(); onEdit(); }}
              className="bookmark-action ml-2"
              tabIndex={-1}
              title="Modifier"
            >
              <Pencil2Icon className="w-5 h-5" />
            </button>
            <button
              type="button"
              onClick={e => { e.preventDefault(); onDelete && onDelete(); }}
              className="bookmark-action bookmark-action-delete ml-2"
              tabIndex={-1}
              title="Supprimer"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
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
