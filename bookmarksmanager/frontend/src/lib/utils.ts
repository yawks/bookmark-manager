import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"
import type { Collection } from "../types"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
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