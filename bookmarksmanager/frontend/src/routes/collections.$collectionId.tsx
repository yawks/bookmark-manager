import { createFileRoute, useRouteContext, useRouterState } from '@tanstack/react-router'

import { AddBookmarkForm } from '../components/bookmarks/AddBookmarkForm'
import BookmarkList from '../components/bookmarks/BookmarkList'
import React from 'react'
import { t } from '../lib/l10n'

export const Route = createFileRoute('/collections/$collectionId')({
  component: CollectionComponent,
})

function CollectionComponent() {
  const { collectionId } = Route.useParams()
  const routeContext = useRouteContext({ from: '__root__' }) || {};
  const collections = routeContext.collections || [];
  const bookmarks = routeContext.bookmarks || [];
  const isLoading = useRouterState({ select: (s) => s.status === 'pending' })

  const numericCollectionId = parseInt(collectionId, 10)
  const collection = collections.find(c => c.id === numericCollectionId)

  if (!collection && !isLoading) {
    return <div>{t('Collection not found.')}</div>
  }

  const collectionBookmarks = bookmarks.filter(b => b.collectionId === numericCollectionId)

  return (
    <>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-semibold">{collection ? collection.name : t('Loading...')}</h1>
        <AddBookmarkForm />
      </div>
      <BookmarkList bookmarks={collectionBookmarks} isLoading={isLoading} />
    </>
  )
}