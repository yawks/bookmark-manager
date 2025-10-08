import { Skeleton } from '@/components/ui/skeleton';
import React from 'react';

const BookmarkListItemSkeleton = () => {
  return (
    <div className="flex items-center justify-between p-3 border-b last:border-b-0">
      <div className="flex items-center space-x-4">
        <Skeleton className="h-16 w-16 rounded" />
        <div className="flex flex-col space-y-2">
          <Skeleton className="h-4 w-48" />
          <Skeleton className="h-3 w-32" />
        </div>
      </div>
      <div className="flex items-center space-x-2">
        <Skeleton className="h-5 w-16 rounded-full" />
        <Skeleton className="h-5 w-20 rounded-full" />
      </div>
    </div>
  );
};

export default BookmarkListItemSkeleton;