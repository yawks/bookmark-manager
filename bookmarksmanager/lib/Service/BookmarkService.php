<?php

namespace OCA\BookmarksManager\Service;

use OCA\BookmarksManager\Db\BookmarkMapper;
use OCP\IUserSession;

class BookmarkService {

    private BookmarkMapper $mapper;
    private IUserSession $userSession;
    private TagService $tagService;

    public function __construct(BookmarkMapper $mapper, IUserSession $userSession, TagService $tagService) {
        $this->mapper = $mapper;
        $this->userSession = $userSession;
        $this->tagService = $tagService;
    }

    public function findAll(): array {
        $userId = $this->userSession->getUser()->getUID();
        return $this->mapper->findAll($userId);
    }

    public function find(int $id) {
        $userId = $this->userSession->getUser()->getUID();
        return $this->mapper->find($id, $userId);
    }

    public function create(string $url, string $title, ?string $description, ?int $collectionId, array $tags = [], ?string $screenshot = null) {
        $userId = $this->userSession->getUser()->getUID();

        $tagIds = [];
        foreach ($tags as $tag) {
            if (is_string($tag)) {
                $newTag = $this->tagService->create($tag);
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

        $newBookmark = $this->mapper->insert($bookmark);
        $this->mapper->setTags($newBookmark->getId(), $tagIds);

        return $this->find($newBookmark->getId());
    }

    public function update(int $id, string $url, string $title, ?string $description, ?int $collectionId, array $tags = [], ?string $screenshot = null) {
        $userId = $this->userSession->getUser()->getUID();
        $bookmark = $this->mapper->find($id, $userId);
        if ($bookmark === null) {
            throw new \Exception('Bookmark not found');
        }
        $bookmark->setUrl($url);
        $bookmark->setTitle($title);
        $bookmark->setDescription($description);
        $bookmark->setCollectionId($collectionId);
        $bookmark->setScreenshot($screenshot);

        $updatedBookmark = $this->mapper->update($bookmark);
        $this->mapper->setTags($updatedBookmark->getId(), $tags);

        return $this->find($updatedBookmark->getId());
    }

    public function delete(int $id) {
        $userId = $this->userSession->getUser()->getUID();
        $bookmark = $this->mapper->find($id, $userId);
        if ($bookmark === null) {
            throw new \Exception('Bookmark not found');
        }
        return $this->mapper->delete($bookmark);
    }
}