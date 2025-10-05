import { createRootRouteWithContext, Outlet } from '@tanstack/react-router'
import React from 'react'
import Layout from '../components/layout/Layout'
import { Collection, Tag, Bookmark } from '../types'

declare const OC: any;

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

    return { collections, tags, bookmarks };
  },
})