import { DrawingPinIcon, ViewGridIcon, ViewHorizontalIcon } from '@radix-ui/react-icons';
import React, { useMemo, useState } from 'react';
import { Search, X } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
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
import { searchBookmarks } from '../../lib/bookmark-search';

import { useLoaderData, useRouter } from '@tanstack/react-router';

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
  const [searchQuery, setSearchQuery] = useState('');
  const { collections = [] } = useLoaderData({ from: '__root__' }) || {};
  const visibleBookmarks = useMemo(
    () => searchBookmarks(localBookmarks, searchQuery, collections),
    [localBookmarks, searchQuery, collections]
  );
  const isSearching = searchQuery.trim().length > 0;

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
    // Reordering a partial search result would also move hidden bookmarks.
    if (isSearching) return;
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

  return (
    <div>
      <div className="flex flex-col sm:flex-row gap-3 sm:items-center mb-4">
        <div className="bookmark-search-control">
          <Search aria-hidden="true" className="bookmark-search-icon" />
          <Input
            type="search"
            value={searchQuery}
            onChange={event => setSearchQuery(event.target.value)}
            onKeyDown={event => { if (event.key === 'Escape') setSearchQuery(''); }}
            aria-label={t('bookmark.search')}
            placeholder={t('bookmark.search_placeholder')}
            className="bookmark-search"
          />
          {searchQuery && (
            <Button
              type="button"
              variant="ghost"
              size="icon"
              className="bookmark-search-clear"
              aria-label={t('bookmark.clear_search')}
              onClick={() => setSearchQuery('')}
            >
              <X aria-hidden="true" className="h-4 w-4" />
            </Button>
          )}
        </div>
        <ToggleGroup
          className="self-end sm:self-auto shrink-0"
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

      {isLoading ? (
        <div className={viewMode === 'grid' ? 'grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6' : 'space-y-2'}>
          {Array.from({ length: 8 }, (_, index) => viewMode === 'grid'
            ? <BookmarkCardSkeleton key={index} />
            : <BookmarkListItemSkeleton key={index} />)}
        </div>
      ) : visibleBookmarks.length === 0 ? (
        <div role="status" className="flex flex-col items-center justify-center text-center py-10 min-h-32">
          <DrawingPinIcon className="w-16 h-16 text-muted-foreground mb-4 opacity-60" />
          <h2 className="text-2xl font-semibold">{isSearching ? t('bookmark.no_search_results') : t('No bookmarks here')}</h2>
          <p className="text-muted-foreground mt-2">{isSearching ? t('bookmark.search_hint') : t('Add a new bookmark to see it here.')}</p>
        </div>
      ) : (
        <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
          <SortableContext
            items={visibleBookmarks.map((b) => b.id)}
            strategy={viewMode === 'grid' ? rectSortingStrategy : verticalListSortingStrategy}
          >
            {viewMode === 'grid' ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                {visibleBookmarks.map(bookmark => (
                  <SortableBookmarkCard
                    key={bookmark.id}
                    bookmark={bookmark}
                    sortingDisabled={isSearching}
                    showCollection={showCollection}
                    onEdit={() => handleBookmarkEdit(bookmark)}
                    onDelete={() => handleBookmarkDelete(bookmark)}
                  />
                ))}
              </div>
            ) : (
              <div className="space-y-2">
                {visibleBookmarks.map(bookmark => (
                  <SortableBookmarkListItem
                    key={bookmark.id}
                    bookmark={bookmark}
                    sortingDisabled={isSearching}
                    onEdit={() => handleBookmarkEdit(bookmark)}
                    onDelete={() => handleBookmarkDelete(bookmark)}
                  />
                ))}
              </div>
            )}
          </SortableContext>
        </DndContext>
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
