import React from 'react';
import { Bookmark } from '../../types';
import { tags as allTags } from '../../data/mock';

interface BookmarkListItemProps {
  bookmark: Bookmark;
  onClick: () => void;
}

const BookmarkListItem = ({ bookmark, onClick }: BookmarkListItemProps) => {
  const domain = new URL(bookmark.url).hostname;
  const bookmarkTags = allTags.filter(tag => bookmark.tags.includes(tag.id));

  return (
    <div onClick={onClick} className="flex items-center justify-between p-3 border-b last:border-b-0 hover:bg-accent cursor-pointer">
      <div className="flex items-center space-x-4">
        <img
          src={`https://www.google.com/s2/favicons?domain=${domain}&sz=16`}
          alt={`${domain} favicon`}
          width={16}
          height={16}
          className="rounded"
        />
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
      </div>
    </div>
  );
};

export default BookmarkListItem;