import { createRootRouteWithContext, Outlet } from '@tanstack/react-router'
import React from 'react'
import Layout from '../components/layout/Layout'
import { ThemeProvider } from '../components/layout/ThemeProvider'
import { Collection, Tag, Bookmark } from '../types'

interface RouterContext {
  collections: Collection[]
  tags: Tag[]
  bookmarks: Bookmark[]
}

export const Route = createRootRouteWithContext<RouterContext>()({
  component: () => (
    <ThemeProvider
      attribute="class"
      defaultTheme="system"
      enableSystem
      disableTransitionOnChange
    >
      <Layout>
        <Outlet />
      </Layout>
    </ThemeProvider>
  ),
  loader: async () => {
    const fetchData = async (url: string): Promise<any[]> => {
      try {
        const res = await fetch(url);
        if (!res.ok) {
          console.error(`Failed to fetch ${url}: ${res.statusText}`);
          return [];
        }
        const data = await res.json();
        return Array.isArray(data) ? data : [];
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