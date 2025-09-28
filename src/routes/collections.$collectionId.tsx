import { createFileRoute } from '@tanstack/react-router'
import React from 'react'
import BookmarkList from '../components/bookmarks/BookmarkList'
import { AddBookmarkForm } from '../components/bookmarks/AddBookmarkForm'
import { collections, bookmarks } from '../data/mock'

export const Route = createFileRoute('/collections/$collectionId')({
  component: CollectionComponent,
})

function CollectionComponent() {
  const { collectionId } = Route.useParams()
  const collection = collections.find(c => c.id === collectionId)
  const collectionBookmarks = bookmarks.filter(b => b.collectionId === collectionId)

  return (
    <>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-semibold">{collection?.name}</h1>
        <AddBookmarkForm />
      </div>
      <BookmarkList bookmarks={collectionBookmarks} />
    </>
  )
}