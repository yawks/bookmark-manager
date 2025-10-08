import React from 'react';
import { t } from '../../lib/l10n';
import { Link, useRouteContext } from '@tanstack/react-router';
import { EmptyState } from '../layout/EmptyState';
import { TagIcon } from 'lucide-react';

const Tags = () => {
  const { tags, bookmarks } = useRouteContext({ from: '__root__' }) || { tags: [], bookmarks: [] };

  const allTags = tags || [];
  const allBookmarks = bookmarks || [];

  const getTagCount = (tagId: number) => {
    return allBookmarks.filter(bookmark => bookmark.tags.includes(tagId)).length;
  };

  return (
    <div className="p-4">
      <h2 className="text-lg font-semibold mb-4">{t('Tags')}</h2>
      <div className="space-y-2">
        {allTags.length === 0 ? (
          <EmptyState
            icon={<TagIcon className="w-8 h-8" />}
            title={t('No Tags')}
            description={t('Tags you add to bookmarks will appear here.')}
            className="p-4 text-xs"
          />
        ) : (
          allTags.map(tag => (
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
          ))
        )}
      </div>
    </div>
  );
};

export default Tags;