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
    const [collectionsRes, tagsRes, bookmarksRes] = await Promise.all([
      fetch('/apps/bookmarks/api/v1/collections'),
      fetch('/apps/bookmarks/api/v1/tags'),
      fetch('/apps/bookmarks/api/v1/bookmarks'),
    ])
    const collections = await collectionsRes.json()
    const tags = await tagsRes.json()
    const bookmarks = await bookmarksRes.json()
    return { collections, tags, bookmarks }
  },
})