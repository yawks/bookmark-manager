import React, { createContext, useContext, useState } from 'react';

import { Bookmark } from '../types';

interface BookmarkContextType {
  bookmarks: Bookmark[];
  setBookmarks: React.Dispatch<React.SetStateAction<Bookmark[]>>;
}

const BookmarkContext = createContext<BookmarkContextType | undefined>(undefined);

export const useBookmarks = () => {
  const context = useContext(BookmarkContext);
  if (!context) {
    throw new Error('useBookmarks must be used within a BookmarkProvider');
  }
  return context;
};

export const BookmarkProvider = ({ initialBookmarks, children }: { initialBookmarks: Bookmark[]; children: React.ReactNode }) => {
  // Holds the global list of bookmarks and the setter
  const [bookmarks, setBookmarks] = useState<Bookmark[]>(initialBookmarks);
  return (
    <BookmarkContext.Provider value={{ bookmarks, setBookmarks }}>
      {children}
    </BookmarkContext.Provider>
  );
};
