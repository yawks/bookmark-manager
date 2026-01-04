<?php
namespace OCA\BookmarksManager\Service;

use OCA\BookmarksManager\Db\BookmarkMapper;
use OCA\BookmarksManager\Db\CollectionMapper;
use OCA\BookmarksManager\Db\TagMapper;
use OCA\BookmarksManager\Service\TagService;
use OCP\IUserSession;

class BookmarkService {

    private BookmarkMapper $mapper;
    private IUserSession $userSession;
    private TagService $tagService;
    private CollectionMapper $collectionMapper;
    private TagMapper $tagMapper;

    public function __construct(BookmarkMapper $mapper, IUserSession $userSession, TagService $tagService, CollectionMapper $collectionMapper, TagMapper $tagMapper) {
        $this->mapper = $mapper;
        $this->userSession = $userSession;
        $this->tagService = $tagService;
        $this->collectionMapper = $collectionMapper;
        $this->tagMapper = $tagMapper;
    }

    public function findAll(?string $userId = null, ?int $collectionId = null, ?array $tagsId = null): array {
        if ($userId === null) {
            $userId = $this->userSession->getUser()->getUID();
        }
        $bookmarks = $this->mapper->findAll($userId, $collectionId, $tagsId);
        return $this->enrichBookmarks($bookmarks, $userId);
    }

    public function find(int $id, ?string $userId = null) {
        if ($userId === null) {
            $userId = $this->userSession->getUser()->getUID();
        }
        $bookmark = $this->mapper->find($id, $userId);
        if ($bookmark) {
            $enriched = $this->enrichBookmarks([$bookmark], $userId);
            return $enriched[0] ?? $bookmark;
        }
        return $bookmark;
    }

    public function create(string $url, string $title, ?string $description, ?int $collectionId, array $tags = [], ?string $screenshot = null, ?string $favicon = null, ?string $userId = null) {
        if ($userId === null) {
            $userId = $this->userSession->getUser()->getUID();
        }

        $tagIds = [];
        foreach ($tags as $tag) {
            if (is_string($tag)) {
                $newTag = $this->tagService->create($tag, $userId);
                $tagIds[] = $newTag->getId();
            } else {
                $tagIds[] = $tag;
            }
        }

        $bookmark = new \OCA\BookmarksManager\Db\Bookmark();
        $bookmark->setUserId($userId);
        $bookmark->setUrl($url);
        $bookmark->setTitle($title);
        $bookmark->setDescription($description);
        $bookmark->setCollectionId($collectionId);
        $bookmark->setScreenshot($screenshot);
        $bookmark->setFavicon($favicon);

        $newBookmark = $this->mapper->insert($bookmark);
        
        $this->mapper->setTags($newBookmark->getId(), $tagIds);
        
        // Avoid dirty read by manually setting the tags we just saved and returning the object directly
        $newBookmark->setTags($tagIds);
        return $newBookmark;
    }

    public function update(int $id, string $url, string $title, ?string $description, ?int $collectionId, array $tags = [], ?string $screenshot = null, ?string $favicon = null, ?string $userId = null) {
        if ($userId === null) {
            $userId = $this->userSession->getUser()->getUID();
        }
        $bookmark = $this->mapper->find($id, $userId);
        if ($bookmark === null) {
            throw new \Exception('Bookmark not found');
        }
        $bookmark->setUrl($url);
        $bookmark->setTitle($title);
        $bookmark->setDescription($description);
        $bookmark->setCollectionId($collectionId);
        $bookmark->setScreenshot($screenshot);
        $bookmark->setFavicon($favicon);

        $updatedBookmark = $this->mapper->update($bookmark);
        $this->mapper->setTags($updatedBookmark->getId(), $tags);
        return $this->find($updatedBookmark->getId());
    }

    public function delete(int $id, ?string $userId = null) {
        if ($userId === null) {
            $userId = $this->userSession->getUser()->getUID();
        }
        $bookmark = $this->mapper->find($id, $userId);
        if ($bookmark === null) {
            throw new \Exception('Bookmark not found');
        }
    return $this->mapper->delete($bookmark);
    }

    /**
     * Delete all bookmarks from a given collection
     */
    public function deleteByCollectionId(int $collectionId): void {
        $this->mapper->deleteByCollectionId($collectionId);
    }

    /**
     * Enrich bookmarks with collection names and tag names
     */
    private function enrichBookmarks(array $bookmarks, string $userId): array {
        if (empty($bookmarks)) {
            return $bookmarks;
        }

        // Get all unique collection IDs
        $collectionIds = array_filter(array_map(fn($b) => $b->getCollectionId(), $bookmarks));
        $collections = [];
        if (!empty($collectionIds)) {
            $collectionsList = $this->collectionMapper->findAll($userId);
            foreach ($collectionsList as $collection) {
                $collections[$collection->getId()] = $collection->getName();
            }
        }

        // Get all unique tag IDs
        $allTagIds = [];
        foreach ($bookmarks as $bookmark) {
            $allTagIds = array_merge($allTagIds, $bookmark->getTags());
        }
        $allTagIds = array_unique($allTagIds);
        $tags = [];
        if (!empty($allTagIds)) {
            $tagsList = $this->tagMapper->findAll($userId);
            foreach ($tagsList as $tag) {
                if (in_array($tag->getId(), $allTagIds)) {
                    $tags[$tag->getId()] = $tag->getName();
                }
            }
        }

        // Enrich each bookmark
        foreach ($bookmarks as $bookmark) {
            // Set collection name
            if ($bookmark->getCollectionId() && isset($collections[$bookmark->getCollectionId()])) {
                $bookmark->collectionName = $collections[$bookmark->getCollectionId()];
            }

            // Set tags with names
            $tagsWithNames = [];
            foreach ($bookmark->getTags() as $tagId) {
                if (isset($tags[$tagId])) {
                    $tagsWithNames[] = [
                        'id' => $tagId,
                        'name' => $tags[$tagId]
                    ];
                }
            }
            $bookmark->tagsWithNames = $tagsWithNames;
        }

        return $bookmarks;
    }
}