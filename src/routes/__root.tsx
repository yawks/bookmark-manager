import { createRootRoute, Outlet } from '@tanstack/react-router'
import React from 'react'
import Layout from '../components/layout/Layout'
import { ThemeProvider } from '../components/layout/ThemeProvider'

export const Route = createRootRoute({
  component: () => (
    <ThemeProvider
      attribute="class"
      defaultTheme="system"
      enableSystem
      disableTransitionOnChange
    >
      <Layout>
        <Outlet />
      </Layout>
    </ThemeProvider>
  ),
})