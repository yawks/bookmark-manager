import { DotsHorizontalIcon } from '@radix-ui/react-icons';
import { Tag } from '../../types';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '../ui/dialog';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '../ui/dropdown-menu';
import { Link, useLoaderData, useRouter } from '@tanstack/react-router';
import React, { useState } from 'react';
import { Button } from '../ui/button';
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

interface TagItemProps {
  tag: Tag;
  bookmarkCount: number;
  onRename: (tag: Tag) => void;
  onDelete: (tag: Tag) => void;
}

const TagItem: React.FC<TagItemProps> = ({
  tag,
  bookmarkCount,
  onRename,
  onDelete,
}) => {
  const [menuOpen, setMenuOpen] = useState(false);
  return (
    <div className="relative group flex items-center">
      <Link
        to="/tags/$tagId"
        params={{ tagId: String(tag.id) }}
        className="flex items-center justify-between text-sm p-2 hover:bg-accent rounded-md cursor-pointer text-foreground flex-1"
        activeProps={{ className: 'bg-accent' }}
      >
        <span># {tag.name}</span>
        <span className="bg-muted-foreground/20 text-muted-foreground rounded-full px-2 py-0.5 text-xs">
          {bookmarkCount}
        </span>
      </Link>
      <DropdownMenu open={menuOpen} onOpenChange={setMenuOpen}>
        <DropdownMenuTrigger asChild>
          <button
            className="ml-2 p-1 rounded hover:bg-accent opacity-0 group-hover:opacity-100 focus:opacity-100 transition-opacity"
            tabIndex={0}
            aria-label="Tag menu"
            onClick={e => { e.stopPropagation(); e.preventDefault(); setMenuOpen(v => !v); }}
          >
            <DotsHorizontalIcon className="h-4 w-4" />
          </button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuItem onSelect={() => { setMenuOpen(false); onRename(tag); }}>{t('tag.rename')}</DropdownMenuItem>
          <DropdownMenuItem onSelect={() => { setMenuOpen(false); onDelete(tag); }}>{t('tag.delete')}</DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
};

const Tags = () => {
  const { tags } = useLoaderData({ from: '__root__' }) || { tags: [] };
  const allTags = tags || [];
  const { bookmarks: allBookmarks } = useLoaderData({ from: '__root__' }) || { bookmarks: [] };
  const router = useRouter();

  const [renameDialogOpen, setRenameDialogOpen] = useState(false);
  const [tagToRename, setTagToRename] = useState<Tag | null>(null);
  const [renameValue, setRenameValue] = useState('');
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [tagToDelete, setTagToDelete] = useState<Tag | null>(null);

  // Returns the number of bookmarks for a given tag
  const getTagCount = (tagId: number) => {
    return allBookmarks.filter(bookmark => bookmark.tags.some(t => t.id === tagId)).length;
  };

  // Get the count of bookmarks that use the tag to delete
  const getBookmarkCountForTag = (tagId: number) => {
    return allBookmarks.filter(bookmark => bookmark.tags.some(t => t.id === tagId)).length;
  };

  const handleRename = (tag: Tag) => {
    setTagToRename(tag);
    setRenameValue(tag.name);
    setRenameDialogOpen(true);
  };

  const handleRenameSubmit = async () => {
    if (!tagToRename || !renameValue.trim()) return;

    const requestToken = getRequestToken();
    if (!requestToken) {
      console.error('CSRF token not found!');
      return;
    }

    try {
      const response = await fetch(`/apps/bookmarksmanager/api/v1/tags/${tagToRename.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'requesttoken': requestToken,
        },
        body: JSON.stringify({ name: renameValue.trim() }),
      });

      if (response.ok) {
        setRenameDialogOpen(false);
        setTagToRename(null);
        setRenameValue('');
        await router.invalidate();
      } else {
        console.error('Failed to rename tag');
      }
    } catch (error) {
      console.error('Error renaming tag:', error);
    }
  };

  const handleDelete = (tag: Tag) => {
    setTagToDelete(tag);
    setDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!tagToDelete) return;

    const requestToken = getRequestToken();
    if (!requestToken) {
      console.error('CSRF token not found!');
      return;
    }

    try {
      const response = await fetch(`/apps/bookmarksmanager/api/v1/tags/${tagToDelete.id}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          'requesttoken': requestToken,
        },
      });

      if (response.ok) {
        setDeleteDialogOpen(false);
        setTagToDelete(null);
        await router.invalidate();
      } else {
        console.error('Failed to delete tag');
      }
    } catch (error) {
      console.error('Error deleting tag:', error);
    }
  };

  return (
    <div className="p-4">
      <h2 className="text-lg font-semibold mb-4">{t('Tags')}</h2>
      <div className="space-y-2">
        {allTags.map(tag => (
          <TagItem
            key={tag.id}
            tag={tag}
            bookmarkCount={getTagCount(tag.id)}
            onRename={handleRename}
            onDelete={handleDelete}
          />
        ))}
      </div>

      {/* Rename Dialog */}
      <Dialog open={renameDialogOpen} onOpenChange={setRenameDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{t('tag.rename_tag')}</DialogTitle>
            <DialogDescription>
              {t('tag.enter_new_name')}
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
            placeholder={t('tag.tag_name')}
            autoFocus
          />
          <DialogFooter>
            <Button variant="ghost" onClick={() => setRenameDialogOpen(false)}>
              {t('tag.cancel')}
            </Button>
            <Button onClick={handleRenameSubmit}>
              {t('tag.rename')}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{t('tag.delete_tag')}</DialogTitle>
            <DialogDescription>
              {tagToDelete && getBookmarkCountForTag(tagToDelete.id) > 0
                ? t('tag.confirm_delete_with_bookmarks').replace('{{count}}', String(getBookmarkCountForTag(tagToDelete.id)))
                : t('tag.confirm_delete')}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="ghost" onClick={() => setDeleteDialogOpen(false)}>
              {t('tag.cancel')}
            </Button>
            <Button variant="destructive" onClick={handleDeleteConfirm}>
              {t('tag.delete')}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Tags;