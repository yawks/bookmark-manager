import { DrawingPinIcon, ViewGridIcon, ViewHorizontalIcon } from '@radix-ui/react-icons';
import React, { useState } from 'react';
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group';
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
  rectSortingStrategy,
} from '@dnd-kit/sortable';

import { Bookmark } from '../../types';
import BookmarkCardSkeleton from './BookmarkCardSkeleton';
import BookmarkListItemSkeleton from './BookmarkListItemSkeleton';
import SortableBookmarkCard from './SortableBookmarkCard';
import SortableBookmarkListItem from './SortableBookmarkListItem';
import { EditBookmarkForm } from './EditBookmarkForm';
import { t } from '../../lib/l10n';
import { reorderBookmarks } from '../../lib/utils';

import { useRouter } from '@tanstack/react-router';

type ViewMode = 'grid' | 'list';

interface BookmarkListProps {
  bookmarks: Bookmark[];
  isLoading?: boolean;
  showCollection?: boolean;
}

const BookmarkList = ({ bookmarks = [], isLoading = false, showCollection = false }: BookmarkListProps) => {
  const [viewMode, setViewMode] = useState<ViewMode>('grid');
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [selectedBookmark, setSelectedBookmark] = useState<Bookmark | null>(null);
  const [localBookmarks, setLocalBookmarks] = useState<Bookmark[]>(bookmarks);

  const router = useRouter();

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  React.useEffect(() => {
    setLocalBookmarks(bookmarks);
  }, [bookmarks]);

  const handleBookmarkEdit = (bookmark: Bookmark) => {
    setSelectedBookmark(bookmark);
    setIsEditModalOpen(true);
  };

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
      await router.invalidate();
    } else {
      alert('Error while deleting');
    }
  };

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;

    if (over && active.id !== over.id) {
      const oldIndex = localBookmarks.findIndex((b) => b.id === active.id);
      const newIndex = localBookmarks.findIndex((b) => b.id === over.id);

      const newBookmarks = arrayMove(localBookmarks, oldIndex, newIndex);
      setLocalBookmarks(newBookmarks);

      const reorderedBookmarks = newBookmarks.map((bookmark, index) => ({
        id: bookmark.id,
        order: index,
      }));

      try {
        await reorderBookmarks(reorderedBookmarks);
        await router.invalidate();
      } catch (error) {
        console.error('Failed to reorder bookmarks:', error);
        setLocalBookmarks(bookmarks);
      }
    }
  };

  if (isLoading) {
    const skeletons = Array.from({ length: 8 });
    return (
      <div>
        <div className="flex justify-end mb-4">
          <ToggleGroup type="single" value={viewMode} onValueChange={(value) => { if (value) setViewMode(value as ViewMode); }}>
            <ToggleGroupItem value="grid" aria-label="Toggle grid"><ViewGridIcon /></ToggleGroupItem>
            <ToggleGroupItem value="list" aria-label="Toggle list"><ViewHorizontalIcon /></ToggleGroupItem>
          </ToggleGroup>
        </div>
        {viewMode === 'grid' ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {skeletons.map((_, index) => <BookmarkCardSkeleton key={index} />)}
          </div>
        ) : (
          <div className="space-y-2">
            {skeletons.map((_, index) => <BookmarkListItemSkeleton key={index} />)}
          </div>
        )}
      </div>
    );
  }

  if (bookmarks.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-full text-center py-10 min-h-32">
        <DrawingPinIcon className="w-16 h-16 text-muted-foreground mb-4 opacity-60" />
        <h2 className="text-2xl font-semibold">{t('No bookmarks here')}</h2>
        <p className="text-muted-foreground mt-2">{t('Add a new bookmark to see it here.')}</p>
      </div>
    );
  }

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

      <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
        <SortableContext
          items={localBookmarks.map((b) => b.id)}
          strategy={viewMode === 'grid' ? rectSortingStrategy : verticalListSortingStrategy}
        >
          {viewMode === 'grid' ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {localBookmarks.map(bookmark => (
                <SortableBookmarkCard
                  key={bookmark.id}
                  bookmark={bookmark}
                  showCollection={showCollection}
                  onEdit={() => handleBookmarkEdit(bookmark)}
                  onDelete={() => handleBookmarkDelete(bookmark)}
                />
              ))}
            </div>
          ) : (
            <div className="space-y-2">
              {localBookmarks.map(bookmark => (
                <SortableBookmarkListItem
                  key={bookmark.id}
                  bookmark={bookmark}
                  onEdit={() => handleBookmarkEdit(bookmark)}
                  onDelete={() => handleBookmarkDelete(bookmark)}
                />
              ))}
            </div>
          )}
        </SortableContext>
      </DndContext>

      <EditBookmarkForm
        bookmark={selectedBookmark}
        isOpen={isEditModalOpen}
        onOpenChange={setIsEditModalOpen}
      />
    </div>
  );
};

export default BookmarkList;