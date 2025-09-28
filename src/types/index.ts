export interface Bookmark {
  id: string;
  url: string;
  title: string;
  description?: string;
  screenshotUrl?: string;
  collectionId: string;
  tags: string[];
}

export interface Collection {
  id: string;
  name: string;
  icon: string;
  parentId?: string;
}

export interface Tag {
  id: string;
  name: string;
}