import './index.css'

import { RouterProvider, createRouter } from '@tanstack/react-router'

import ReactDOM from 'react-dom/client'
import { StrictMode } from 'react'
import { defaultContext } from './lib/context'
// Import the generated route tree
import { routeTree } from './routeTree.gen'

// Create a new router instance
const router = createRouter({
  routeTree,
  basepath: '/apps/bookmarksmanager',
  context: defaultContext,
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
  const initializeWhenReady = () => {
    try {
      const rootElement = document.getElementById('app-bookmarksmanager')
      
      if (!rootElement) {
        console.error('BookmarksManager: Container element not found')
        return
      }
      
      // Clear any existing content to avoid conflicts
      rootElement.innerHTML = ''
      
      const root = ReactDOM.createRoot(rootElement)
      root.render(
        <StrictMode>
          <RouterProvider router={router} />
        </StrictMode>,
      )
      
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