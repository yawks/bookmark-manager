import { ArchiveIcon, CodeIcon, DashboardIcon, DrawingPinIcon, PersonIcon, VercelLogoIcon } from '@radix-ui/react-icons';
import { Link, useLoaderData } from '@tanstack/react-router';

import { Collection } from '../../types';
import React from 'react';
import { t } from '../../lib/l10n';
import { useBookmarks } from '@/lib/BookmarkContext';

const iconMap: { [key: string]: React.ElementType } = {
  briefcase: ArchiveIcon,
  user: PersonIcon,
  figma: DrawingPinIcon,
  code: CodeIcon,
  'chef-hat': VercelLogoIcon, // Placeholder
};

const CollectionItem = ({ collection }: { collection: Collection }) => {
  const Icon = collection.icon ? iconMap[collection.icon] : VercelLogoIcon;
  const { bookmarks } = useBookmarks();
  // Returns the number of bookmarks in this collection
  const count = bookmarks.filter(b => b.collectionId === collection.id).length;
  return (
    <Link
      to="/collections/$collectionId"
      params={{ collectionId: String(collection.id) }}
      className="flex items-center space-x-2 p-2 hover:bg-accent rounded-md cursor-pointer text-foreground"
      activeProps={{ className: 'bg-accent' }}
    >
      <Icon className="h-4 w-4" />
      <span>{collection.name}</span>
      <span className="ml-auto bg-muted-foreground/20 text-muted-foreground rounded-full px-2 py-0.5 text-xs">{count}</span>
    </Link>
  );
};

const Collections = () => {
  const { collections } = useLoaderData({ from: '__root__' }) || { collections: [] };
  const allCollections = collections || [];
  const topLevelCollections = allCollections.filter(c => !c.parentId);

  const { bookmarks } = useBookmarks();
  // Returns the number of all bookmarks
  const allCount = bookmarks.length;
  return (
    <div className="p-4">
      <h2 className="text-lg font-semibold mb-4">{t('Collections')}</h2>
      <div className="space-y-1">
        <Link
          to="/"
          className="flex items-center space-x-2 p-2 hover:bg-accent rounded-md cursor-pointer text-foreground"
          activeProps={{ className: 'bg-accent' }}
        >
          <DashboardIcon className="h-4 w-4" />
          <span>{t('All')}</span>
          <span className="ml-auto bg-muted-foreground/20 text-muted-foreground rounded-full px-2 py-0.5 text-xs">{allCount}</span>
        </Link>
        {topLevelCollections.map(collection => (
          <div key={collection.id}>
            <CollectionItem collection={collection} />
            <div className="ml-4 mt-1 space-y-1">
              {allCollections.filter(c => c.parentId === collection.id).map(child => (
                <CollectionItem key={child.id} collection={child} />
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Collections;