import React from 'react';
import { translate } from '../../lib/l10n';
import { Link, useRouteContext } from '@tanstack/react-router';

const Tags = () => {
  const { tags, bookmarks } = useRouteContext({ from: '__root__' }) || { tags: [], bookmarks: [] };

  const allTags = tags || [];
  const allBookmarks = bookmarks || [];

  const getTagCount = (tagId: number) => {
    return allBookmarks.filter(bookmark => bookmark.tags.includes(tagId)).length;
  };

  return (
    <div className="p-4">
      <h2 className="text-lg font-semibold mb-4">{translate('Tags')}</h2>
      <div className="space-y-2">
        {allTags.map(tag => (
          <Link
            key={tag.id}
            to="/tags/$tagId"
            params={{ tagId: String(tag.id) }}
            className="flex justify-between items-center text-sm p-2 hover:bg-accent rounded-md cursor-pointer"
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