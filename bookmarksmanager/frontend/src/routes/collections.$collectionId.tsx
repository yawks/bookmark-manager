import { createFileRoute, useRouterState } from '@tanstack/react-router'

import { AddBookmarkForm } from '../components/bookmarks/AddBookmarkForm'
import BookmarkList from '../components/bookmarks/BookmarkList'
import React from 'react'
import { Route as RootRoute } from './__root'
import { getDescendantCollectionIds } from '../lib/utils'
import { t } from '../lib/l10n'

export const Route = createFileRoute('/collections/$collectionId')({
  component: CollectionComponent,
})

function CollectionComponent() {
  const { collectionId } = Route.useParams()
  const rootLoaderData = RootRoute.useLoaderData({ shouldThrow: false }) || {};
  const collections = rootLoaderData.collections || [];
  const bookmarks = rootLoaderData.bookmarks || [];
  const isLoading = useRouterState({ select: (s) => s.status === 'pending' })

  const numericCollectionId = Number(collectionId)
  const collection = collections.find(c => Number(c.id) === numericCollectionId)

  if (!collection && !isLoading) {
    return <div>{t('Collection not found.')}</div>
  }

  const descendantIds = new Set(getDescendantCollectionIds(collections, numericCollectionId))
  const collectionBookmarks = bookmarks.filter(b => b.collectionId !== null && descendantIds.has(Number(b.collectionId)))

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