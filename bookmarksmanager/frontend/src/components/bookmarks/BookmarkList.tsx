import React, { useState } from 'react';
import { Bookmark } from '../../types';
import BookmarkCard from './BookmarkCard';
import BookmarkListItem from './BookmarkListItem';
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group';
import { ViewGridIcon, ViewHorizontalIcon } from '@radix-ui/react-icons';
import { EditBookmarkForm } from './EditBookmarkForm';

type ViewMode = 'grid' | 'list';

interface BookmarkListProps {
  bookmarks: Bookmark[];
  showCollection?: boolean;
}

const BookmarkList = ({ bookmarks = [], showCollection = false }: BookmarkListProps) => {
  const [viewMode, setViewMode] = useState<ViewMode>('grid');
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [selectedBookmark, setSelectedBookmark] = useState<Bookmark | null>(null);

  const handleBookmarkClick = (bookmark: Bookmark) => {
    setSelectedBookmark(bookmark);
    setIsEditModalOpen(true);
  };

  return (
    <div>
      <div className="flex justify-end mb-4">
        <ToggleGroup
          type="single"
          value={viewMode}
          onValueChange={(value) => {
            if (value) setViewMode(value as ViewMode);
          }}
        >
          <ToggleGroupItem value="grid" aria-label="Toggle grid">
            <ViewGridIcon />
          </ToggleGroupItem>
          <ToggleGroupItem value="list" aria-label="Toggle list">
            <ViewHorizontalIcon />
          </ToggleGroupItem>
        </ToggleGroup>
      </div>

      {viewMode === 'grid' ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {bookmarks.map(bookmark => (
            <BookmarkCard
              key={bookmark.id}
              bookmark={bookmark}
              showCollection={showCollection}
              onClick={() => handleBookmarkClick(bookmark)}
            />
          ))}
        </div>
      ) : (
        <div className="border rounded-md">
          {bookmarks.map(bookmark => (
            <BookmarkListItem
              key={bookmark.id}
              bookmark={bookmark}
              onClick={() => handleBookmarkClick(bookmark)}
            />
          ))}
        </div>
      )}

      <EditBookmarkForm
        bookmark={selectedBookmark}
        isOpen={isEditModalOpen}
        onOpenChange={setIsEditModalOpen}
      />
    </div>
  );
};

export default BookmarkList;