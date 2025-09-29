import React from 'react';
import { useTranslation } from 'react-i18next';
import { Bookmark } from '../../types';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { useRouteContext } from '@tanstack/react-router';

interface BookmarkCardProps {
  bookmark: Bookmark;
  showCollection?: boolean;
  onClick: () => void;
}

const BookmarkCard = ({ bookmark, showCollection = false, onClick }: BookmarkCardProps) => {
  const { t } = useTranslation();
  const { collections, tags: allTags } = useRouteContext({ from: '__root__' });
  const domain = new URL(bookmark.url).hostname;

  const bookmarkTags = allTags.filter(tag => bookmark.tags.includes(tag.id));
  const collection = collections.find(c => c.id === bookmark.collectionId);

  return (
    <div onClick={onClick} className="cursor-pointer">
      <Card className="overflow-hidden flex flex-col h-full">
        <CardHeader className="p-0">
        {bookmark.screenshot ? (
          <img src={bookmark.screenshot} alt={bookmark.title} className="aspect-video w-full object-cover" />
        ) : (
          <div className="bg-muted aspect-video w-full flex items-center justify-center">
            <span className="text-muted-foreground text-sm">{t('bookmark.no_preview')}</span>
          </div>
        )}
      </CardHeader>
      <CardContent className="p-4 flex-grow">
        <CardTitle className="text-lg font-semibold">{bookmark.title}</CardTitle>
        <p className="text-sm text-muted-foreground mt-1">{bookmark.description}</p>
      </CardContent>
      <CardFooter className="p-4 pt-0 flex flex-col items-start gap-2">
        <div className="flex flex-wrap gap-1">
          {bookmarkTags.map(tag => (
            <span key={tag.id} className="text-xs bg-muted-foreground/20 text-muted-foreground rounded-full px-2 py-0.5">
              #{tag.name}
            </span>
          ))}
        </div>

        <div className="flex items-center space-x-2 text-xs text-muted-foreground w-full">
          <img
            src={`https://www.google.com/s2/favicons?domain=${domain}&sz=16`}
            alt={`${domain} favicon`}
            width={16}
            height={16}
            className="rounded"
          />
          <span>{domain}</span>
          {showCollection && collection && (
            <>
              <span className="mx-1">·</span>
              <span>{collection.name}</span>
            </>
          )}
        </div>
      </CardFooter>
    </Card>
    </div>
  );
};

export default BookmarkCard;