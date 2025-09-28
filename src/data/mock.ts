import { Collection, Tag, Bookmark } from '../types';

export const collections: Collection[] = [
  { id: '1', name: 'Work', icon: 'briefcase' },
  { id: '2', name: 'Personal', icon: 'user' },
  { id: '3', name: 'Design', icon: 'figma', parentId: '1' },
  { id: '4', name: 'Programming', icon: 'code', parentId: '1' },
  { id: '5', name: 'Recipes', icon: 'chef-hat', parentId: '2' },
];

export const tags: Tag[] = [
  { id: '1', name: 'react' },
  { id: '2', name: 'typescript' },
  { id: '3', name: 'inspiration' },
  { id: '4', name: 'article' },
];

export const bookmarks: Bookmark[] = [
  {
    id: '1',
    url: 'https://react.dev',
    title: 'React Official Website',
    collectionId: '4',
    tags: ['1', '2', '4'],
  },
  {
    id: '2',
    url: 'https://www.figma.com',
    title: 'Figma',
    description: 'The collaborative interface design tool.',
    collectionId: '3',
    tags: ['3'],
  },
  {
    id: '3',
    url: 'https://www.allrecipes.com/recipe/23600/worlds-best-lasagna/',
    title: "World's Best Lasagna",
    collectionId: '5',
    tags: [],
  },
];