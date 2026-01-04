<?php

namespace OCA\BookmarksManager\Service;

use OCA\BookmarksManager\Db\CollectionMapper;
use OCP\IUserSession;

class CollectionService {

    private CollectionMapper $mapper;
    private IUserSession $userSession;
    private \OCA\BookmarksManager\Service\BookmarkService $bookmarkService;

    public function __construct(CollectionMapper $mapper, IUserSession $userSession, \OCA\BookmarksManager\Service\BookmarkService $bookmarkService) {
        $this->mapper = $mapper;
        $this->userSession = $userSession;
        $this->bookmarkService = $bookmarkService;
    }

    public function findAll(?string $userId = null): array {
        if ($userId === null) {
            $userId = $this->userSession->getUser()->getUID();
        }
        return $this->mapper->findAll($userId);
    }

    public function find(int $id, ?string $userId = null) {
        if ($userId === null) {
            $userId = $this->userSession->getUser()->getUID();
        }
        return $this->mapper->find($id, $userId);
    }

    public function create(string $name, ?string $icon, ?int $parentId, ?string $userId = null) {
        if ($userId === null) {
            $userId = $this->userSession->getUser()->getUID();
        }
        $collection = new \OCA\BookmarksManager\Db\Collection();
        $collection->setUserId($userId);
        $collection->setName($name);
        $collection->setIcon($icon);
        $collection->setParentId($parentId);
        return $this->mapper->insert($collection);
    }

    public function update(int $id, string $name, ?string $icon, ?int $parentId, ?string $userId = null) {
        if ($userId === null) {
            $userId = $this->userSession->getUser()->getUID();
        }
        $collection = $this->mapper->find($id, $userId);
        if ($collection === null) {
            throw new \Exception('Collection not found');
        }
        $collection->setName($name);
        $collection->setIcon($icon);
        $collection->setParentId($parentId);
        return $this->mapper->update($collection);
    }

    public function delete(int $id, ?string $userId = null) {
        if ($userId === null) {
            $userId = $this->userSession->getUser()->getUID();
        }
        $collection = $this->mapper->find($id, $userId);
        if ($collection === null) {
            throw new \Exception('Collection not found');
        }
        // Delete all bookmarks in this collection first
        $this->bookmarkService->deleteByCollectionId($id);
        return $this->mapper->delete($collection);
    }
}