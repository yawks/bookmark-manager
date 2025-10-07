import React, { Suspense, useEffect } from "react";

import { AddBookmarkForm } from "./components/bookmarks/AddBookmarkForm";
import BookmarkList from "./components/bookmarks/BookmarkList";
import Layout from "./components/layout/Layout";
import { useTranslation } from "react-i18next";

function App() {
  const { t } = useTranslation();

  // Nextcloud-specific initialization
  useEffect(() => {
    // Add necessary CSS classes for Nextcloud integration
    const appElement = document.getElementById('app-bookmarksmanager') || 
                      document.getElementById('root');
    
    if (appElement) {
      appElement.classList.add('bookmark-manager-app');
      
      // Detect Nextcloud theme
      const isDark = document.body.getAttribute('data-theme-dark') !== null ||
                    document.documentElement.getAttribute('data-theme-dark') !== null ||
                    document.body.classList.contains('theme--dark');
      
      if (isDark) {
        appElement.setAttribute('data-theme', 'dark');
      }
    }

    // Listen for Nextcloud theme changes
    const observer = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        if (mutation.type === 'attributes' && 
            (mutation.attributeName === 'data-theme-dark' || 
             mutation.attributeName === 'class')) {
          const isDark = document.body.getAttribute('data-theme-dark') !== null ||
                        document.documentElement.getAttribute('data-theme-dark') !== null ||
                        document.body.classList.contains('theme--dark');
          
          if (appElement) {
            appElement.setAttribute('data-theme', isDark ? 'dark' : 'light');
          }
        }
      });
    });

    observer.observe(document.body, {
      attributes: true,
      attributeFilter: ['data-theme-dark', 'class']
    });

    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ['data-theme-dark', 'class']
    });

    return () => observer.disconnect();
  }, []);

  return (
    <Suspense fallback={
      <div className="flex items-center justify-center min-h-32">
        <div className="text-muted-foreground">Loading...</div>
      </div>
    }>
  <div id="app-bookmarksmanager-content" className="p-4 min-h-screen">
        <Layout>
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-2xl font-semibold text-foreground">
              {t('app.all_bookmarks')}
            </h1>
            <AddBookmarkForm />
          </div>
          <BookmarkList bookmarks={[]} showCollection={true} />
        </Layout>
      </div>
    </Suspense>
  );
}

export default App;