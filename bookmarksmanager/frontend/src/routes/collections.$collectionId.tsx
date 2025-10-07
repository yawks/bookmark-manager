import { createFileRoute, useRouteContext } from '@tanstack/react-router'
import React from 'react'
import BookmarkList from '../components/bookmarks/BookmarkList'
import { AddBookmarkForm } from '../components/bookmarks/AddBookmarkForm'

export const Route = createFileRoute('/collections/$collectionId')({
  component: CollectionComponent,
})

function CollectionComponent() {
  const { collectionId } = Route.useParams()
  const { collections, bookmarks } = useRouteContext({ from: '__root__' }) || { collections: [], bookmarks: [] }

  const numericCollectionId = parseInt(collectionId, 10)
  const collection = collections.find(c => c.id === numericCollectionId)
  const collectionBookmarks = bookmarks.filter(b => b.collectionId === numericCollectionId)

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