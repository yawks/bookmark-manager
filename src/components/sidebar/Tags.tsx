import React from 'react';
import { useTranslation } from 'react-i18next';
import { tags, bookmarks } from '../../data/mock';
import { Link } from '@tanstack/react-router';

const Tags = () => {
  const { t } = useTranslation();

  const getTagCount = (tagId: string) => {
    return bookmarks.filter(bookmark => bookmark.tags.includes(tagId)).length;
  };

  return (
    <div className="p-4">
      <h2 className="text-lg font-semibold mb-4">{t('sidebar.tags')}</h2>
      <div className="space-y-2">
        {tags.map(tag => (
          <Link
            key={tag.id}
            to="/tags/$tagId"
            params={{ tagId: tag.id }}
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