import './index.css'

import { RouterProvider, createRouter } from '@tanstack/react-router'

import ReactDOM from 'react-dom/client'
import type { RouterContext } from './lib/context'
import { StrictMode } from 'react'
import { BookmarkProvider } from './lib/BookmarkContext'
import { initI18n } from './lib/i18n'
// Import the generated route tree
import { routeTree } from './routeTree.gen'

// Create a new router instance
const router = createRouter({
  routeTree,
  basepath: '/apps/bookmarksmanager',
  context: {} as RouterContext,
})

// Register the router instance for type safety
declare module '@tanstack/react-router' {
  interface Register {
    router: typeof router
  }
}

// Initialization function for Nextcloud
function initializeApp() {
  // Ensure we don't conflict with Nextcloud's initialization
  const initializeWhenReady = async () => {
    try {
      const rootElement = document.getElementById('app-bookmarksmanager')

      if (!rootElement) {
        console.error('BookmarksManager: Container element not found')
        return
      }

      // Clear any existing content to avoid conflicts
      rootElement.innerHTML = ''

      // Initialize i18n BEFORE fetching data and rendering
      await initI18n()

      // Get initial bookmarks from the router loader data
      // We need to fetch the loader data for the root route
      // This is a workaround since TanStack Router doesn't expose a direct API for this outside of a route
      // We'll fetch the data manually for initial state
      fetch('/apps/bookmarksmanager/api/v1/bookmarks', {
        headers: {
          ...(window.OC?.requestToken ? { 'requesttoken': window.OC.requestToken } : {})
        }
      })
        .then(async (res) => {
          if (!res.ok) return [];
          const data = await res.json();
          if (Array.isArray(data)) return data;
          if (data && data.data && Array.isArray(data.data)) return data.data;
          return [];
        })
        .then((initialBookmarks) => {
          const root = ReactDOM.createRoot(rootElement)
          root.render(
            <StrictMode>
              <BookmarkProvider initialBookmarks={initialBookmarks}>
                <RouterProvider router={router} />
              </BookmarkProvider>
            </StrictMode>,
          )
        })
        .catch(() => {
          const root = ReactDOM.createRoot(rootElement)
          root.render(
            <StrictMode>
              <BookmarkProvider initialBookmarks={[]}>
                <RouterProvider router={router} />
              </BookmarkProvider>
            </StrictMode>,
          )
        })

      console.log('BookmarksManager: Application initialized successfully')
    } catch (error) {
      console.error('BookmarksManager: Failed to initialize application:', error)
    }
  }

  // Wait for both DOM and Nextcloud to be ready
  const checkNextcloudReady = () => {
    // Check if Nextcloud's OCA object exists
    if (typeof (window as any).OCA !== 'undefined') {
      initializeWhenReady()
    } else {
      // Wait a bit more for Nextcloud to initialize
      setTimeout(checkNextcloudReady, 100)
    }
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', checkNextcloudReady)
  } else {
    checkNextcloudReady()
  }
}

// Initialize the application
initializeApp()