<?php

namespace OCA\BookmarksManager\Service;

use OCA\BookmarksManager\Service\BookmarkService;
use OCA\BookmarksManager\Service\CollectionService;
use OCP\IUserSession;

class ExportService {

    private BookmarkService $bookmarkService;
    private CollectionService $collectionService;
    private IUserSession $userSession;

    public function __construct(
        BookmarkService $bookmarkService,
        CollectionService $collectionService,
        IUserSession $userSession
    ) {
        $this->bookmarkService = $bookmarkService;
        $this->collectionService = $collectionService;
        $this->userSession = $userSession;
    }

    /**
     * Export bookmarks to Raindrop CSV format
     *
     * Format columns: id, title, note, excerpt, url, folder, tags, created, cover, highlights, favorite
     */
    public function exportToRaindrop(): string {
        $userId = $this->userSession->getUser()->getUID();

        // Get all bookmarks for the user
        $bookmarks = $this->bookmarkService->findAll($userId);

        // Build collection path cache
        $collectionPaths = $this->buildCollectionPathCache();

        // Create CSV in memory
        $output = fopen('php://temp', 'r+');

        // Write header
        fputcsv($output, [
            'id',
            'title',
            'note',
            'excerpt',
            'url',
            'folder',
            'tags',
            'created',
            'cover',
            'highlights',
            'favorite'
        ]);

        // Write bookmarks
        foreach ($bookmarks as $bookmark) {
            // Get folder path
            $folderPath = '';
            $collectionId = $bookmark->getCollectionId();
            if ($collectionId) {
                $folderPath = $collectionPaths[$collectionId] ?? '';
            }

            // Get tags
            $tagsStr = '';
            $tags = $bookmark->getTags();
            if (!empty($tags)) {
                $tagNames = array_map(function($tag) {
                    return $tag['name'] ?? '';
                }, $tags);
                $tagsStr = implode(', ', array_filter($tagNames));
            }

            // Format created date (ISO 8601 format)
            $created = '';
            // Note: createdAt might not be available on the Bookmark entity
            // If you have a created_at timestamp field, use appropriate getter

            // Write row
            fputcsv($output, [
                $bookmark->getId(),
                $bookmark->getTitle() ?? '',
                $bookmark->getDescription() ?? '',
                '', // excerpt - not used in our system
                $bookmark->getUrl() ?? '',
                $folderPath,
                $tagsStr,
                $created,
                $bookmark->getScreenshot() ?? '',
                '', // highlights - not used in our system
                '' // favorite - not used in our system
            ]);
        }

        // Get CSV content
        rewind($output);
        $csv = stream_get_contents($output);
        fclose($output);

        return $csv;
    }

    /**
     * Build a cache mapping collection IDs to their full paths
     * Example: collection with id 5 might map to "Work / Projects / 2024"
     */
    private function buildCollectionPathCache(): array {
        $userId = $this->userSession->getUser()->getUID();
        $collections = $this->collectionService->findAll($userId);

        $cache = [];

        // Build a map of id -> collection object
        $collectionsById = [];
        foreach ($collections as $collection) {
            $collectionsById[$collection->id] = $collection;
        }

        // Build paths
        foreach ($collections as $collection) {
            $path = $this->buildCollectionPath($collection, $collectionsById);
            $cache[$collection->id] = $path;
        }

        return $cache;
    }

    /**
     * Build the full path for a collection by walking up the parent chain
     */
    private function buildCollectionPath($collection, array $collectionsById): string {
        $parts = [$collection->name];
        $current = $collection;

        // Walk up the parent chain
        while ($current->parentId !== null && isset($collectionsById[$current->parentId])) {
            $current = $collectionsById[$current->parentId];
            array_unshift($parts, $current->name);
        }

        return implode(' / ', $parts);
    }
}
