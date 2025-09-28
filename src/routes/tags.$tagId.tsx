import { createFileRoute } from '@tanstack/react-router'
import React from 'react'
import BookmarkList from '../components/bookmarks/BookmarkList'
import { AddBookmarkForm } from '../components/bookmarks/AddBookmarkForm'
import { tags, bookmarks } from '../data/mock'

export const Route = createFileRoute('/tags/$tagId')({
  component: TagComponent,
})

function TagComponent() {
  const { tagId } = Route.useParams()
  const tag = tags.find(t => t.id === tagId)
  const taggedBookmarks = bookmarks.filter(b => b.tags.includes(tagId))

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