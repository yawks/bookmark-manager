import React, { useState } from 'react';
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group';
import { ViewGridIcon, ViewHorizontalIcon } from '@radix-ui/react-icons';

import { Bookmark } from '../../types';
import BookmarkCard from './BookmarkCard';
import BookmarkListItem from './BookmarkListItem';
import { EditBookmarkForm } from './EditBookmarkForm';
import { useBookmarks } from '@/lib/BookmarkContext';

type ViewMode = 'grid' | 'list';

interface BookmarkListProps {
  bookmarks: Bookmark[];
  showCollection?: boolean;
}

const BookmarkList = ({ bookmarks = [], showCollection = false }: BookmarkListProps) => {
  const [viewMode, setViewMode] = useState<ViewMode>('grid');
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [selectedBookmark, setSelectedBookmark] = useState<Bookmark | null>(null);
  const { bookmarks: bookmarkList, setBookmarks } = useBookmarks();

  const handleBookmarkEdit = (bookmark: Bookmark) => {
    setSelectedBookmark(bookmark);
    setIsEditModalOpen(true);
  };

  // Delete a bookmark and update the context
  const handleBookmarkDelete = async (bookmark: Bookmark) => {
    if (!window.confirm('Are you sure you want to delete this bookmark?')) return;
    const requestToken = (window as any).OC?.requestToken || document.querySelector('head meta[name="requesttoken"]')?.getAttribute('content');
    if (!requestToken) {
      alert('CSRF token missing');
      return;
    }
    const response = await fetch(`/apps/bookmarksmanager/api/v1/bookmarks/${bookmark.id}`, {
      method: 'DELETE',
      headers: { 'requesttoken': requestToken },
    });
    if (response.ok) {
      setBookmarks(prev => prev.filter(b => b.id !== bookmark.id));
    } else {
      alert('Error while deleting');
    }
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
          {bookmarkList.map(bookmark => (
            <BookmarkCard
              key={bookmark.id}
              bookmark={bookmark}
              showCollection={showCollection}
              onEdit={() => handleBookmarkEdit(bookmark)}
              onDelete={() => handleBookmarkDelete(bookmark)}
            />
          ))}
        </div>
      ) : (
        <div className="border rounded-md">
          {bookmarkList.map(bookmark => (
            <BookmarkListItem
              key={bookmark.id}
              bookmark={bookmark}
              onEdit={() => handleBookmarkEdit(bookmark)}
              onDelete={() => handleBookmarkDelete(bookmark)}
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