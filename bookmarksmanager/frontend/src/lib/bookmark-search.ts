import type { Bookmark, Collection } from '../types';

function normalize(value: string): string {
  return value.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase();
}

// Filter only the bookmarks supplied by the current collection/tag route.
export function searchBookmarks(bookmarks: Bookmark[], query: string, collections: Collection[] = []): Bookmark[] {
  const terms = normalize(query).trim().split(/\s+/).filter(Boolean);
  if (terms.length === 0) return bookmarks;

  const collectionNames = new Map(collections.map(collection => [collection.id, collection.name]));
  return bookmarks.filter(bookmark => {
    const text = normalize([
      bookmark.title,
      bookmark.description || '',
      bookmark.url,
      ...bookmark.tags.map(tag => tag.name),
      collectionNames.get(bookmark.collectionId ?? -1) || '',
    ].join(' '));
    return terms.every(term => text.includes(term));
  });
}
