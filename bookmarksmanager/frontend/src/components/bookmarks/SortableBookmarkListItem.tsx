import React from 'react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import BookmarkListItem from './BookmarkListItem';
import { Bookmark } from '../../types';

interface SortableBookmarkListItemProps {
  bookmark: Bookmark;
  onEdit: () => void;
  onDelete?: () => void;
}

const SortableBookmarkListItem = ({ bookmark, onEdit, onDelete }: SortableBookmarkListItemProps) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: bookmark.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <div ref={setNodeRef} style={style} {...attributes}>
      <BookmarkListItem
        bookmark={bookmark}
        onEdit={onEdit}
        onDelete={onDelete}
        dragHandleListeners={listeners}
      />
    </div>
  );
};

export default SortableBookmarkListItem;
