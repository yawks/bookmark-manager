import { createFileRoute, useRouteContext } from '@tanstack/react-router'
import React from 'react'
import BookmarkList from '../components/bookmarks/BookmarkList'
import { AddBookmarkForm } from '../components/bookmarks/AddBookmarkForm'

export const Route = createFileRoute('/tags/$tagId')({
  component: TagComponent,
})

function TagComponent() {
  const { tagId } = Route.useParams()
  const { tags, bookmarks } = useRouteContext({ from: '__root__' })

  const numericTagId = parseInt(tagId, 10)
  const tag = tags.find(t => t.id === numericTagId)
  const taggedBookmarks = bookmarks.filter(b => b.tags.includes(numericTagId))

  return (
    <>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-semibold"># {tag?.name}</h1>
        <AddBookmarkForm />
      </div>
      <BookmarkList bookmarks={taggedBookmarks} />
    </>
  )
}