<?php

namespace OCA\BookmarksManager\Service;

use OCA\BookmarksManager\Service\CollectionService;
use OCA\BookmarksManager\Service\BookmarkService;
use OCA\BookmarksManager\Service\TagService;
use OCA\BookmarksManager\Service\PageInfoService;
use OCP\IUserSession;

class ImportService {

    private PageInfoService $pageInfoService;

    public function __construct(
        CollectionService $collectionService,
        BookmarkService $bookmarkService,
        TagService $tagService,
        IUserSession $userSession,
        PageInfoService $pageInfoService
    ) {
        $this->collectionService = $collectionService;
        $this->bookmarkService = $bookmarkService;
        $this->tagService = $tagService;
        $this->userSession = $userSession;
        $this->pageInfoService = $pageInfoService;
    }

    /**
     * Import bookmarks from a Raindrop CSV file
     * ...
     */
    public function importFromRaindrop(string $csvFilePath): array {
        // ... (existing code) ...
    
            $screenshot = $colIndices['cover'] !== null ? trim($row[$colIndices['cover']] ?? '') : null;
            
            // If screenshot is empty or looks strictly like a placeholder/invalid, try to fetch it
            if (empty($screenshot) && !empty($url)) {
                try {
                    $pageInfo = $this->pageInfoService->getPageInfo($url);
                    if (!empty($pageInfo['image'])) {
                        $screenshot = $pageInfo['image'];
                    }
                } catch (\Exception $e) {
                    error_log("Failed to fetch page info for $url: " . $e->getMessage());
                }
            }

            $tagsStr = $colIndices['tags'] !== null ? trim($row[$colIndices['tags']] ?? '') : '';
            $folderPath = $colIndices['folder'] !== null ? trim($row[$colIndices['folder']] ?? '') : '';

            // Parse tags
            $tags = [];
            if (!empty($tagsStr)) {
                // Tags might be comma-separated, space-separated, or in quotes
                // Remove quotes if present
                $tagsStr = trim($tagsStr, '"\'');
                // Split by comma first, then by space if no commas
                if (strpos($tagsStr, ',') !== false) {
                    $tagNames = array_map('trim', explode(',', $tagsStr));
                } else {
                    $tagNames = preg_split('/\s+/', $tagsStr, -1, PREG_SPLIT_NO_EMPTY);
                }
                foreach ($tagNames as $tagName) {
                    $tagName = trim($tagName);
                    if (!empty($tagName)) {
                        // Find or create tag
                        $tag = $this->findOrCreateTag($tagName);
                        if ($tag) {
                            $tags[] = $tag->id;
                        }
                    }
                }
            }

            // Handle collection/folder
            $collectionId = null;
            if (!empty($folderPath)) {
                $collectionId = $this->getOrCreateCollectionPath($folderPath, $collectionCache);
            }

            // Create bookmark
            try {
                error_log("Row $rowNumber: Attempting to create bookmark - URL: '$url', Title: '$title', CollectionId: " . ($collectionId ?? 'null') . ", Tags: " . count($tags));
                $this->bookmarkService->create(
                    $url,
                    $title,
                    $description,
                    $collectionId,
                    $tags,
                    $screenshot
                );
                $imported++;
                error_log("Row $rowNumber: Successfully imported bookmark");
            } catch (\Exception $e) {
                // Log error but continue with next bookmark
                $errorMsg = "Row $rowNumber: Error importing bookmark (URL: $url, Title: $title): " . $e->getMessage();
                error_log($errorMsg);
                error_log("Exception trace: " . $e->getTraceAsString());
                $errors[] = $errorMsg;
            }
        }

        fclose($handle);

        error_log("Import completed: $imported imported, $skipped skipped, " . count($collectionCache) . " collections created");
        if (!empty($errors)) {
            error_log("Import errors: " . implode('; ', array_slice($errors, 0, 10))); // Log first 10 errors
        }

        return [
            'imported' => $imported,
            'skipped' => $skipped,
            'collections_created' => count($collectionCache),
            'errors' => count($errors),
            'error_messages' => array_slice($errors, 0, 5), // Return first 5 errors
        ];
    }

    /**
     * Get or create a collection path (e.g., "folder / sub folder / sub sub folder")
     * Returns the ID of the deepest collection
     */
    private function getOrCreateCollectionPath(string $folderPath, array &$cache): ?int {
        // Normalize path separators
        $folderPath = preg_replace('/\s*\/\s*/', ' / ', $folderPath);
        $parts = array_map('trim', explode('/', $folderPath));
        $parts = array_filter($parts, function($p) { return !empty($p); });
        $parts = array_values($parts);

        if (empty($parts)) {
            return null;
        }

        // Build path incrementally
        $currentPath = '';
        $parentId = null;

        foreach ($parts as $part) {
            $currentPath = $currentPath === '' ? $part : $currentPath . ' / ' . $part;
            
            // Check cache first
            if (isset($cache[$currentPath])) {
                $parentId = $cache[$currentPath];
                continue;
            }

            // Find existing collection with this name and parent
            $collections = $this->collectionService->findAll();
            $existing = null;
            foreach ($collections as $coll) {
                if ($coll->name === $part && $coll->parentId === $parentId) {
                    $existing = $coll;
                    break;
                }
            }

            if ($existing) {
                $parentId = $existing->id;
            } else {
                // Create new collection
                $newCollection = $this->collectionService->create($part, null, $parentId);
                $parentId = $newCollection->id;
            }

            $cache[$currentPath] = $parentId;
        }

        return $parentId;
    }

    /**
     * Find or create a tag by name
     */
    private function findOrCreateTag(string $tagName) {
        $tags = $this->tagService->findAll();
        foreach ($tags as $tag) {
            if (strcasecmp($tag->name, $tagName) === 0) {
                return $tag;
            }
        }
        // Create new tag
        return $this->tagService->create($tagName);
    }
}

