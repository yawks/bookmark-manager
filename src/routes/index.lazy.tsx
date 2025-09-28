import { createLazyFileRoute } from '@tanstack/react-router'
import React from 'react'
import BookmarkList from '../components/bookmarks/BookmarkList'
import { AddBookmarkForm } from '../components/bookmarks/AddBookmarkForm'
import { useTranslation } from 'react-i18next'
import { bookmarks } from '../data/mock'

export const Route = createLazyFileRoute('/')({
  component: Index,
})

function Index() {
  const { t } = useTranslation()
  return (
    <>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-semibold">{t('app.all_bookmarks')}</h1>
        <AddBookmarkForm />
      </div>
      <BookmarkList bookmarks={bookmarks} showCollection={true} />
    </>
  )
}