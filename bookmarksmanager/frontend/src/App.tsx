import React, { Suspense } from "react";
import BookmarkList from "./components/bookmarks/BookmarkList";

function App() {
  return (
    <Suspense fallback="loading">
      <BookmarkList />
    </Suspense>
  );
}

export default App;