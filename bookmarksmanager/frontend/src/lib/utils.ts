import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"
import type { Collection } from "../types"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/**
 * Reorder bookmarks via the API
 */
export async function reorderBookmarks(bookmarks: { id: number; order: number }[]): Promise<void> {
  const requestToken = (globalThis as any).OC?.requestToken || document.querySelector('head meta[name="requesttoken"]')?.getAttribute('content');
  if (!requestToken) {
    throw new Error('CSRF token missing');
  }

  const response = await fetch('/apps/bookmarksmanager/api/v1/bookmarks/reorder', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'requesttoken': requestToken,
    },
    body: JSON.stringify({ bookmarks }),
  });

  if (!response.ok) {
    throw new Error('Failed to reorder bookmarks');
  }
}

/**
 * Return the list of descendant collection ids (including the rootId)
 * by walking parentId relationships.
 */
export function getDescendantCollectionIds(collections: Collection[], rootId: number): number[] {
  const ids = new Set<number>([rootId])
  let added = true
  while (added) {
    added = false
    for (const c of collections) {
      if (c.parentId !== null && ids.has(c.parentId) && !ids.has(c.id)) {
        ids.add(c.id)
        added = true
      }
    }
  }
  return Array.from(ids)
}