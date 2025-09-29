import React from 'react';
import { useTranslation } from 'react-i18next';
import { Collection } from '../../types';
import { ArchiveIcon, PersonIcon, DrawingPinIcon, CodeIcon, VercelLogoIcon, DashboardIcon } from '@radix-ui/react-icons';
import { Link, useRouteContext } from '@tanstack/react-router';

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
  const { t } = useTranslation();
  const { collections } = useRouteContext({ from: '__root__' }) || { collections: [] };
  const allCollections = collections || [];
  const topLevelCollections = allCollections.filter(c => !c.parentId);

  return (
    <div className="p-4">
      <h2 className="text-lg font-semibold mb-4">{t('sidebar.collections')}</h2>
      <div className="space-y-1">
        <Link
          to="/"
          className="flex items-center space-x-2 p-2 hover:bg-accent rounded-md cursor-pointer"
          activeProps={{ className: 'bg-accent' }}
        >
          <DashboardIcon className="h-4 w-4" />
          <span>{t('app.all')}</span>
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