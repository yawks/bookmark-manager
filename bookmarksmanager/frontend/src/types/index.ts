export interface Bookmark {
  id: number;
  url: string;
  title: string;
  description: string | null;
  screenshot: string | null;
  favicon: string | null;
  collectionId: number | null;
  tags: number[];
}

export interface Collection {
  id: number;
  name: string;
  icon: string | null;
  parentId: number | null;
}

export interface Tag {
  id: number;
  name: string;
}