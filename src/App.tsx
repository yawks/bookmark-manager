import React, { Suspense } from "react";
import { useTranslation } from "react-i18next";
import Layout from "./components/layout/Layout";
import BookmarkList from "./components/bookmarks/BookmarkList";
import { AddBookmarkForm } from "./components/bookmarks/AddBookmarkForm";

function App() {
  const { t } = useTranslation();

  return (
    <Suspense fallback="loading">
      <Layout>
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-semibold">{t('app.all_bookmarks')}</h1>
          <AddBookmarkForm />
        </div>
        <BookmarkList />
      </Layout>
    </Suspense>
  );
}

export default App;