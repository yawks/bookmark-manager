import { createRootRouteWithContext, Outlet } from '@tanstack/react-router'
import React from 'react'
import Layout from '../components/layout/Layout'
import { Collection, Tag, Bookmark } from '../types'

declare const OC: {
  requestToken?: string;
};

interface RouterContext {
  collections: Collection[]
  tags: Tag[]
  bookmarks: Bookmark[]
}

export const Route = createRootRouteWithContext<RouterContext>()({
  component: () => (
    <Layout>
      <Outlet />
    </Layout>
  ),
  loader: async () => {
    const fetchData = async <T,>(url: string): Promise<T[]> => {
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
        const result = await res.json();
        if (Array.isArray(result)) {
          return result as T[];
        }
        if (result && result.data && Array.isArray(result.data)) {
          return result.data as T[];
        }
        console.error(`Unexpected data format from ${url}:`, result);
        return [];
      } catch (e) {
        console.error(`Exception while fetching ${url}:`, e);
        return [];
      }
    };

    const [collections, tags, bookmarks] = await Promise.all([
      fetchData<Collection>('/apps/bookmarksmanager/api/v1/collections'),
      fetchData<Tag>('/apps/bookmarksmanager/api/v1/tags'),
      fetchData<Bookmark>('/apps/bookmarksmanager/api/v1/bookmarks'),
    ]);

    return { collections, tags, bookmarks };
  },
})