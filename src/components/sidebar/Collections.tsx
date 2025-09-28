import React from 'react';
import { useTranslation } from 'react-i18next';
import { collections } from '../../data/mock';
import { Collection } from '../../types';
import { ArchiveIcon, PersonIcon, DrawingPinIcon, CodeIcon, VercelLogoIcon } from '@radix-ui/react-icons'; // Example icons

const iconMap: { [key: string]: React.ElementType } = {
  briefcase: ArchiveIcon,
  user: PersonIcon,
  figma: DrawingPinIcon,
  code: CodeIcon,
  'chef-hat': VercelLogoIcon, // Placeholder
};

const CollectionItem = ({ collection }: { collection: Collection }) => {
  const Icon = iconMap[collection.icon] || VercelLogoIcon;
  return (
    <div className="flex items-center space-x-2 p-2 hover:bg-accent rounded-md cursor-pointer">
      <Icon className="h-4 w-4" />
      <span>{collection.name}</span>
    </div>
  );
};

const Collections = () => {
  const { t } = useTranslation();
  const topLevelCollections = collections.filter(c => !c.parentId);

  return (
    <div className="p-4">
      <h2 className="text-lg font-semibold mb-4">{t('sidebar.collections')}</h2>
      <div className="space-y-1">
        {topLevelCollections.map(collection => (
          <div key={collection.id}>
            <CollectionItem collection={collection} />
            <div className="ml-4">
              {collections.filter(c => c.parentId === collection.id).map(child => (
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