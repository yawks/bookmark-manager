import { createFileRoute, useLoaderData } from '@tanstack/react-router'

import { AddBookmarkForm } from '../components/bookmarks/AddBookmarkForm'
import BookmarkList from '../components/bookmarks/BookmarkList'
import React from 'react'

export const Route = createFileRoute('/tags/$tagId')({
  component: TagComponent,
})

function TagComponent() {
  const { tagId } = Route.useParams()
  const routeContext = useLoaderData({ from: '__root__' }) || {}
  const tags = routeContext.tags || []
  const bookmarks = routeContext.bookmarks || []

  const numericTagId = parseInt(tagId, 10)
  const tag = tags.find(t => t.id === numericTagId)
  const taggedBookmarks = bookmarks.filter(b => b.tags && b.tags.includes(numericTagId))

  return (
    <>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-semibold"># {tag?.name || 'Unknown tag'}</h1>
        <AddBookmarkForm />
      </div>
      <BookmarkList bookmarks={taggedBookmarks} />
    </>
  )
}