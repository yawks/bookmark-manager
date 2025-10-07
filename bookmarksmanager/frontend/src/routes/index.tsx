import { createFileRoute, useLoaderData } from '@tanstack/react-router'

import { Bookmark } from '../types'
import BookmarkList from '../components/bookmarks/BookmarkList'
import React from 'react'

export const Route = createFileRoute('/')({
  component: Index,
})

function Index() {
  const { bookmarks = [] } = useLoaderData({ from: '__root__' }) || {};
  console.log('[Index route] bookmarks:', bookmarks);
  return (
    <BookmarkList bookmarks={bookmarks} showCollection={true} />
  )
}