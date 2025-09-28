import React from 'react';
import { useTranslation } from 'react-i18next';
import { Bookmark } from '../../types';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';

const BookmarkCard = ({ bookmark }: { bookmark: Bookmark }) => {
  const { t } = useTranslation();
  const domain = new URL(bookmark.url).hostname;

  return (
    <Card className="overflow-hidden">
      <CardHeader className="p-0">
        <div className="bg-muted aspect-video w-full flex items-center justify-center">
          <span className="text-muted-foreground text-sm">{t('bookmark.screenshot')}</span>
        </div>
      </CardHeader>
      <CardContent className="p-4">
        <CardTitle className="text-lg font-semibold">{bookmark.title}</CardTitle>
        <p className="text-sm text-muted-foreground mt-1">{bookmark.description}</p>
      </CardContent>
      <CardFooter className="p-4 pt-0">
        <div className="flex items-center space-x-2 text-xs text-muted-foreground">
          <img
            src={`https://www.google.com/s2/favicons?domain=${domain}&sz=16`}
            alt={`${domain} favicon`}
            width={16}
            height={16}
            className="rounded"
          />
          <span>{domain}</span>
        </div>
      </CardFooter>
    </Card>
  );
};

export default BookmarkCard;