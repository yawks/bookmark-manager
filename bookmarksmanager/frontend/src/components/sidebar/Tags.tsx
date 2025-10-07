import { Link, useLoaderData } from '@tanstack/react-router';

import React from 'react';
import { t } from '../../lib/l10n';
import { useBookmarks } from '@/lib/BookmarkContext';

const Tags = () => {
  const { tags } = useLoaderData({ from: '__root__' }) || { tags: [] };
  const allTags = tags || [];
  const { bookmarks: allBookmarks } = useBookmarks();

  // Returns the number of bookmarks for a given tag
  const getTagCount = (tagId: number) => {
    return allBookmarks.filter(bookmark => bookmark.tags.includes(tagId)).length;
  };

  return (
    <div className="p-4">
      <h2 className="text-lg font-semibold mb-4">{t('Tags')}</h2>
      <div className="space-y-2">
        {allTags.map(tag => (
          <Link
            key={tag.id}
            to="/tags/$tagId"
            params={{ tagId: String(tag.id) }}
            className="flex justify-between items-center text-sm p-2 hover:bg-accent rounded-md cursor-pointer text-foreground"
            activeProps={{ className: 'bg-accent' }}
          >
            <span># {tag.name}</span>
            <span className="bg-muted-foreground/20 text-muted-foreground rounded-full px-2 py-0.5 text-xs">
              {getTagCount(tag.id)}
            </span>
          </Link>
        ))}
      </div>
    </div>
  );
};

export default Tags;