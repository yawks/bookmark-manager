import React from 'react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import BookmarkCard from './BookmarkCard';
import { Bookmark } from '../../types';

interface SortableBookmarkCardProps {
  bookmark: Bookmark;
  showCollection?: boolean;
  onEdit: () => void;
  onDelete?: () => void;
}

const SortableBookmarkCard = ({ bookmark, showCollection, onEdit, onDelete }: SortableBookmarkCardProps) => {
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
      <BookmarkCard
        bookmark={bookmark}
        showCollection={showCollection}
        onEdit={onEdit}
        onDelete={onDelete}
        dragHandleListeners={listeners}
      />
    </div>
  );
};

export default SortableBookmarkCard;
