import { ArchiveIcon, CodeIcon, DashboardIcon, DotsHorizontalIcon, DrawingPinIcon, PersonIcon, PlusIcon, VercelLogoIcon } from '@radix-ui/react-icons';
import { Bookmark, Collection } from '../../types';
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '../ui/dialog';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '../ui/dropdown-menu';
import { Link, useLoaderData, useRouter } from '@tanstack/react-router';
import React, { useEffect, useRef, useState } from 'react';

import { Button } from '../ui/button';
import { getDescendantCollectionIds } from '../../lib/utils'
import { t } from '../../lib/l10n';

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

const iconMap = {
  briefcase: ArchiveIcon,
  user: PersonIcon,
  figma: DrawingPinIcon,
  code: CodeIcon,
  'chef-hat': VercelLogoIcon,
};

interface CollectionItemProps {
  collection: Collection;
  bookmarks: Bookmark[];
  allCollections: Collection[];
  onRename: (collection: Collection) => void;
  onDelete: (collection: Collection) => void;
  onCreateNested: (collection: Collection) => void;
}

const CollectionItem: React.FC<CollectionItemProps> = ({
  collection,
  bookmarks,
  allCollections,
  onRename,
  onDelete,
  onCreateNested,
}) => {
  const iconKey = collection.icon as keyof typeof iconMap;
  const Icon = collection.icon && iconMap[iconKey] ? iconMap[iconKey] : VercelLogoIcon;
  const descendantIds = new Set(getDescendantCollectionIds(allCollections, collection.id))
  const count = bookmarks.filter((b: Bookmark) => b.collectionId !== null && descendantIds.has(Number(b.collectionId))).length;
  const [menuOpen, setMenuOpen] = useState(false);
  return (
    <div className="relative group flex items-center">
      <Link
        to="/collections/$collectionId"
        params={{ collectionId: String(collection.id) }}
        className="flex items-center space-x-2 p-2 hover:bg-accent rounded-md cursor-pointer text-foreground flex-1"
        activeProps={{ className: 'bg-accent' }}
      >
        <Icon className="h-4 w-4" />
        <span>{collection.name}</span>
        <span className="ml-auto bg-muted-foreground/20 text-muted-foreground rounded-full px-2 py-0.5 text-xs">{count}</span>
      </Link>
      <DropdownMenu open={menuOpen} onOpenChange={setMenuOpen}>
        <DropdownMenuTrigger asChild>
          <button
            className="ml-2 p-1 rounded hover:bg-accent opacity-0 group-hover:opacity-100 focus:opacity-100 transition-opacity"
            tabIndex={0}
            aria-label="Collection menu"
            onClick={e => { e.stopPropagation(); e.preventDefault(); setMenuOpen(v => !v); }}
          >
            <DotsHorizontalIcon className="h-4 w-4" />
          </button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuItem onSelect={() => { setMenuOpen(false); onRename(collection); }}>{t('collection.rename')}</DropdownMenuItem>
          <DropdownMenuItem onSelect={() => { setMenuOpen(false); onDelete(collection); }}>{t('collection.delete')}</DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem onSelect={() => { setMenuOpen(false); onCreateNested(collection); }}>{t('collection.create_nested_collection')}</DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
};

const Collections = () => {
  const { collections } = useLoaderData({ from: '__root__' }) || { collections: [] };
  const allCollections = collections || [];
  const topLevelCollections = allCollections.filter(c => !c.parentId);

  const { bookmarks } = useLoaderData({ from: '__root__' }) || { bookmarks: [] };
  const allCount = bookmarks.length;

  const [isCreating, setIsCreating] = useState(false);
  const [newCollectionName, setNewCollectionName] = useState('');
  const [renameDialogOpen, setRenameDialogOpen] = useState(false);
  const [collectionToRename, setCollectionToRename] = useState<Collection | null>(null);
  const [renameValue, setRenameValue] = useState('');
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [collectionToDelete, setCollectionToDelete] = useState<Collection | null>(null);
  const [creatingNestedFor, setCreatingNestedFor] = useState<number | null>(null);
  const [nestedCollectionName, setNestedCollectionName] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);
  const nestedInputRef = useRef<HTMLInputElement>(null);
  const router = useRouter();

  useEffect(() => {
    if (isCreating && inputRef.current) {
      inputRef.current.focus();
    }
  });

  useEffect(() => {
    if (creatingNestedFor !== null && nestedInputRef.current) {
      nestedInputRef.current.focus();
    }
  }, [creatingNestedFor]);

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
    if (e.key === 'Escape') {
      setNewCollectionName('');
      setIsCreating(false);
    }
  };

  const handleBlur = () => {
    if (!newCollectionName.trim()) {
      setIsCreating(false);
    }
  };

  const handleRename = (collection: Collection) => {
    setCollectionToRename(collection);
    setRenameValue(collection.name);
    setRenameDialogOpen(true);
  };

  const handleRenameSubmit = async () => {
    if (!collectionToRename || !renameValue.trim()) return;

    const requestToken = getRequestToken();
    if (!requestToken) {
      console.error('CSRF token not found!');
      return;
    }

    try {
      const response = await fetch(`/apps/bookmarksmanager/api/v1/collections/${collectionToRename.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'requesttoken': requestToken,
        },
        body: JSON.stringify({ name: renameValue.trim() }),
      });

      if (response.ok) {
        setRenameDialogOpen(false);
        setCollectionToRename(null);
        setRenameValue('');
        await router.invalidate();
      } else {
        console.error('Failed to rename collection');
      }
    } catch (error) {
      console.error('Error renaming collection:', error);
    }
  };

  const handleDelete = (collection: Collection) => {
    setCollectionToDelete(collection);
    setDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!collectionToDelete) return;

    const requestToken = getRequestToken();
    if (!requestToken) {
      console.error('CSRF token not found!');
      return;
    }

    try {
      const response = await fetch(`/apps/bookmarksmanager/api/v1/collections/${collectionToDelete.id}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          'requesttoken': requestToken,
        },
      });

      if (response.ok) {
        setDeleteDialogOpen(false);
        setCollectionToDelete(null);
        await router.invalidate();
      } else {
        console.error('Failed to delete collection');
      }
    } catch (error) {
      console.error('Error deleting collection:', error);
    }
  };

  const handleCreateNested = (collection: Collection) => {
    setCreatingNestedFor(collection.id);
    setNestedCollectionName('');
  };

  const handleCreateNestedSubmit = async () => {
    if (creatingNestedFor === null || !nestedCollectionName.trim()) return;

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
        body: JSON.stringify({ 
          name: nestedCollectionName.trim(),
          parentId: creatingNestedFor 
        }),
      });

      if (response.ok) {
        setCreatingNestedFor(null);
        setNestedCollectionName('');
        await router.invalidate();
      } else {
        console.error('Failed to create nested collection');
      }
    } catch (error) {
      console.error('Error creating nested collection:', error);
    }
  };

  const handleNestedKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      handleCreateNestedSubmit();
    } else if (e.key === 'Escape') {
      setCreatingNestedFor(null);
      setNestedCollectionName('');
    }
  };

  const handleNestedBlur = () => {
    if (!nestedCollectionName.trim()) {
      setCreatingNestedFor(null);
    }
  };

  return (
    <div className="p-4">
      <div
        className="flex items-center justify-between mb-2 group"
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
        <form
          className="mb-2"
          onSubmit={e => { e.preventDefault(); handleCreateCollection(); }}
        >
          <input
            ref={inputRef}
            type="text"
            placeholder={t('New collection name')}
            value={newCollectionName}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setNewCollectionName(e.target.value)}
            onKeyDown={handleKeyDown}
            onBlur={handleBlur}
            className="h-8 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
            autoFocus
          />
        </form>
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
            <CollectionItem
              collection={collection}
              bookmarks={bookmarks}
              allCollections={allCollections}
              onRename={handleRename}
              onDelete={handleDelete}
              onCreateNested={handleCreateNested}
            />
            {creatingNestedFor === collection.id && (
              <div className="ml-4 mt-1 mb-2">
                <input
                  ref={nestedInputRef}
                  type="text"
                  placeholder={t('collection.new_nested_collection_name')}
                  value={nestedCollectionName}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => setNestedCollectionName(e.target.value)}
                  onKeyDown={handleNestedKeyDown}
                  onBlur={handleNestedBlur}
                  className="h-8 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                />
              </div>
            )}
            <div className="ml-4 mt-1 space-y-1">
              {allCollections.filter(c => c.parentId === collection.id).map(child => (
                <CollectionItem
                  key={child.id}
                  collection={child}
                  bookmarks={bookmarks}
                  allCollections={allCollections}
                  onRename={handleRename}
                  onDelete={handleDelete}
                  onCreateNested={handleCreateNested}
                />
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* Rename Dialog */}
      <Dialog open={renameDialogOpen} onOpenChange={setRenameDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{t('collection.rename_collection')}</DialogTitle>
            <DialogDescription>
              {t('collection.enter_new_name')}
            </DialogDescription>
          </DialogHeader>
          <input
            type="text"
            value={renameValue}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setRenameValue(e.target.value)}
            onKeyDown={(e: React.KeyboardEvent<HTMLInputElement>) => {
              if (e.key === 'Enter') handleRenameSubmit();
            }}
            className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
            placeholder={t('collection.collection_name')}
            autoFocus
          />
          <DialogFooter>
            <Button variant="ghost" onClick={() => setRenameDialogOpen(false)}>
              {t('collection.cancel')}
            </Button>
            <Button onClick={handleRenameSubmit}>
              {t('collection.rename')}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{t('collection.delete_collection')}</DialogTitle>
            <DialogDescription>
              {t('collection.confirm_delete')}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="ghost" onClick={() => setDeleteDialogOpen(false)}>
              {t('collection.cancel')}
            </Button>
            <Button variant="destructive" onClick={handleDeleteConfirm}>
              {t('collection.delete')}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Collections;