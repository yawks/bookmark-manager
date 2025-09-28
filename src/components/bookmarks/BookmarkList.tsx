import React from 'react';
import { bookmarks } from '../../data/mock';
import BookmarkCard from './BookmarkCard';

const BookmarkList = () => {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
      {bookmarks.map(bookmark => (
        <BookmarkCard key={bookmark.id} bookmark={bookmark} />
      ))}
    </div>
  );
};

export default BookmarkList;