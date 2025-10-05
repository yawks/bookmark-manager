import { createFileRoute, useRouteContext } from '@tanstack/react-router'
import React from 'react'
import BookmarkList from '../components/bookmarks/BookmarkList'

export const Route = createFileRoute('/')({
  component: Index,
})

function Index() {
  const { bookmarks = [] } = useRouteContext({ from: '__root__' }) || {};

  return (
    <BookmarkList bookmarks={bookmarks} showCollection={true} />
  )
}