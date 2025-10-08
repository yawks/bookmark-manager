import React from 'react';
import { t } from '../../lib/l10n';
import { Collection } from '../../types';
import { ArchiveIcon, PersonIcon, DrawingPinIcon, CodeIcon, VercelLogoIcon, DashboardIcon } from '@radix-ui/react-icons';
import { Link, useRouteContext } from '@tanstack/react-router';
import { EmptyState } from '../layout/EmptyState';

const iconMap: { [key: string]: React.ElementType } = {
  briefcase: ArchiveIcon,
  user: PersonIcon,
  figma: DrawingPinIcon,
  code: CodeIcon,
  'chef-hat': VercelLogoIcon, // Placeholder
};

const CollectionItem = ({ collection }: { collection: Collection }) => {
  const Icon = collection.icon ? iconMap[collection.icon] : VercelLogoIcon;
  return (
    <Link
      to="/collections/$collectionId"
      params={{ collectionId: String(collection.id) }}
      className="flex items-center space-x-2 p-2 hover:bg-accent rounded-md cursor-pointer"
      activeProps={{ className: 'bg-accent' }}
    >
      <Icon className="h-4 w-4" />
      <span>{collection.name}</span>
    </Link>
  );
};

const Collections = () => {
  const { collections } = useRouteContext({ from: '__root__' }) || { collections: [] };
  const allCollections = collections || [];
  const topLevelCollections = allCollections.filter(c => !c.parentId);

  return (
    <div className="p-4">
      <h2 className="text-lg font-semibold mb-4">{t('Collections')}</h2>
      <div className="space-y-1">
        <Link
          to="/"
          className="flex items-center space-x-2 p-2 hover:bg-accent rounded-md cursor-pointer"
          activeProps={{ className: 'bg-accent' }}
          search={{}}
          params={{}}
        >
          <DashboardIcon className="h-4 w-4" />
          <span>{t('All Bookmarks')}</span>
        </Link>
        {topLevelCollections.length === 0 ? (
          <div className="px-2 py-4">
             <EmptyState
                icon={<ArchiveIcon className="w-8 h-8" />}
                title={t('No Collections')}
                description={t('Collections will appear here.')}
                className="p-4 text-xs"
             />
          </div>
        ) : (
          topLevelCollections.map(collection => (
            <div key={collection.id}>
              <CollectionItem collection={collection} />
              <div className="ml-4 mt-1 space-y-1">
                {allCollections.filter(c => c.parentId === collection.id).map(child => (
                  <CollectionItem key={child.id} collection={child} />
                ))}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default Collections;