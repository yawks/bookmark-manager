// Context for the bookmark manager application
export interface RouterContext {
  collections: any[]
  tags: any[]
  bookmarks: any[]
}

export const defaultContext: RouterContext = {
  collections: [],
  tags: [],
  bookmarks: []
}