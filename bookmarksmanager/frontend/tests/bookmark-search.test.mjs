import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import test from 'node:test';
import ts from 'typescript';

const source = readFileSync(new URL('../src/lib/bookmark-search.ts', import.meta.url), 'utf8');
const { outputText } = ts.transpileModule(source, {
  compilerOptions: { module: ts.ModuleKind.ESNext, target: ts.ScriptTarget.ES2020 },
});
const { searchBookmarks } = await import(`data:text/javascript;base64,${Buffer.from(outputText).toString('base64')}`);

const collections = [{ id: 1, name: 'Personnel' }, { id: 2, name: 'Professionnel' }];
const bookmarks = [
  { id: 1, title: 'Été à Paris', url: 'https://voyages.example/paris', description: null, collectionId: 1, tags: [{ id: 1, name: 'Vacances' }] },
  { id: 2, title: 'Documentation', url: 'https://dev.example', description: 'Référence API', collectionId: 2, tags: [{ id: 2, name: 'Travail' }] },
  { id: 3, title: 'Autre séjour', url: 'https://hotel.example', description: '', collectionId: 1, tags: [] },
];
const ids = results => results.map(bookmark => bookmark.id);

test('an empty query preserves every supplied bookmark and its order', () => {
  assert.equal(searchBookmarks(bookmarks, ' \t ', collections), bookmarks);
});

test('title matching ignores case and accents', () => {
  assert.deepEqual(ids(searchBookmarks(bookmarks, 'ETE A PARIS')), [1]);
});

test('matches URLs, descriptions, tags and collection names', () => {
  for (const [query, expected] of [
    ['dev.example', [2]], ['reference', [2]], ['vacances', [1]],
    ['professionnel', [2]], ['personnel', [1, 3]],
  ]) {
    assert.deepEqual(ids(searchBookmarks(bookmarks, query, collections)), expected);
  }
});

test('every search word must match, even across different fields', () => {
  assert.deepEqual(ids(searchBookmarks(bookmarks, 'documentation travail API')), [2]);
  assert.deepEqual(ids(searchBookmarks(bookmarks, 'paris travail')), []);
});

test('never includes bookmarks outside the selected collection', () => {
  const selected = bookmarks.filter(bookmark => bookmark.collectionId === 1);
  assert.deepEqual(ids(searchBookmarks(selected, 'documentation', collections)), []);
  assert.deepEqual(ids(searchBookmarks(selected, 'sejour', collections)), [3]);
});

test('never includes bookmarks outside the selected tag', () => {
  const selected = bookmarks.filter(bookmark => bookmark.tags.some(tag => tag.id === 1));
  assert.deepEqual(ids(searchBookmarks(selected, 'API', collections)), []);
  assert.deepEqual(ids(searchBookmarks(selected, 'paris', collections)), [1]);
});

test('handles empty selections and searches with no matches', () => {
  assert.deepEqual(searchBookmarks([], 'paris', collections), []);
  assert.deepEqual(searchBookmarks(bookmarks, 'missing', collections), []);
});
