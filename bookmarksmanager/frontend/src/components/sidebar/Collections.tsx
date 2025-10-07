import { ArchiveIcon, CodeIcon, DashboardIcon, DrawingPinIcon, PersonIcon, PlusIcon, VercelLogoIcon } from '@radix-ui/react-icons';
import { Link, useLoaderData, useRouter } from '@tanstack/react-router';
import React, { useEffect, useRef, useState } from 'react';

import { Button } from '../ui/button';
import { Collection } from '../../types';
import { Input } from '../ui/input';
import { t } from '../../lib/l10n';
import { useBookmarks } from '@/lib/BookmarkContext';

// Helper to get Nextcloud's request token
function getRequestToken() {
  if (typeof document === 'undefined') {
    return null;
  }
  // Try meta tag first
  const meta = document.querySelector('meta[name="requesttoken"]');
  if (meta) return meta.getAttribute('content');
  // Fallback: try <head data-requesttoken="...">
  const head = document.querySelector('head[data-requesttoken]');
  if (head) return head.getAttribute('data-requesttoken');
  return null;
}

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
  const allCount = bookmarks.length;

  const [isCreating, setIsCreating] = useState(false);
  const [newCollectionName, setNewCollectionName] = useState('');
  const [isHovered, setIsHovered] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const router = useRouter();

  useEffect(() => {
    if (isCreating) {
      inputRef.current?.focus();
    }
  }, [isCreating]);

  const handleCreateCollection = async () => {
    if (!newCollectionName.trim()) return;

    const requestToken = getRequestToken();
    if (!requestToken) {
      console.error('CSRF token not found!');
      return;
    }

    try {
      const response = await fetch('/apps/bookmarksmanager/api/v1/collections', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'requesttoken': requestToken,
        },
        body: JSON.stringify({ name: newCollectionName.trim() }),
      });

      if (response.ok) {
        setNewCollectionName('');
        setIsCreating(false);
        await router.invalidate();
      } else {
        console.error('Failed to create collection');
      }
    } catch (error) {
      console.error('Error creating collection:', error);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      handleCreateCollection();
    } else if (e.key === 'Escape') {
      setNewCollectionName('');
      setIsCreating(false);
    }
  };

  const handleBlur = () => {
    if (!newCollectionName.trim()) {
      setIsCreating(false);
    }
  };

  return (
    <div className="p-4">
      <div
        className="flex items-center justify-between mb-2 group"
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        <h2 className="text-lg font-semibold">{t('Collections')}</h2>
        <Button
          variant="ghost"
          size="icon"
          className="h-6 w-6 opacity-0 group-hover:opacity-100"
          onClick={() => setIsCreating(true)}
          title={t('Create a collection')}
        >
          <PlusIcon className="h-4 w-4" />
        </Button>
      </div>

      {isCreating && (
        <div className="mb-2">
          <Input
            ref={inputRef}
            type="text"
            placeholder={t('New collection name')}
            value={newCollectionName}
            onChange={(e) => setNewCollectionName(e.target.value)}
            onKeyDown={handleKeyDown}
            onBlur={handleBlur}
            className="h-8"
          />
        </div>
      )}

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