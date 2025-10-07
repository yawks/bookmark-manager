import { Bookmark, Collection, Tag } from '../types'
import { Outlet, createRootRouteWithContext, useLoaderData } from '@tanstack/react-router'

import { BookmarkProvider } from '../lib/BookmarkContext';
import Layout from '../components/layout/Layout'
import React from 'react'

// OC is provided globally by Nextcloud
declare global {
  // eslint-disable-next-line no-var
  var OC: any;
}

interface RouterContext {
  collections: Collection[];
  tags: Tag[];
  bookmarks: Bookmark[];
}

export const Route = createRootRouteWithContext<RouterContext>()({
  component: () => {
    // Get the loader data for the root route
    const { bookmarks } = useLoaderData({ from: '__root__' }) as RouterContext;
    return (
      <BookmarkProvider initialBookmarks={bookmarks}>
        <Layout>
          <Outlet />
        </Layout>
      </BookmarkProvider>
    );
  },
  loader: async () => {
    const fetchData = async (url: string): Promise<any[]> => {
      try {
        const headers: HeadersInit = {};
        if (typeof OC !== 'undefined' && OC.requestToken) {
          headers['requesttoken'] = OC.requestToken;
        }
        const res = await fetch(url, { headers });
        if (!res.ok) {
          console.error(`Failed to fetch ${url}: ${res.statusText}`);
          return [];
        }
        const data = await res.json();
        if (Array.isArray(data)) {
          return data;
        }
        if (data && data.data && Array.isArray(data.data)) {
          return data.data;
        }
        console.error(`Unexpected data format from ${url}:`, data);
        return [];
      } catch (e) {
        console.error(`Exception while fetching ${url}:`, e);
        return [];
      }
    };

    const [collections, tags, bookmarks] = await Promise.all([
      fetchData('/apps/bookmarksmanager/api/v1/collections'),
      fetchData('/apps/bookmarksmanager/api/v1/tags'),
      fetchData('/apps/bookmarksmanager/api/v1/bookmarks'),
    ]);
    console.log('[__root__ loader] collections:', collections);
    console.log('[__root__ loader] tags:', tags);
    console.log('[__root__ loader] bookmarks:', bookmarks);
    return { collections, tags, bookmarks };
  }
});