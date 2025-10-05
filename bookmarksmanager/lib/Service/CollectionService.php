<?php

namespace OCA\BookmarksManager\Service;

use OCA\BookmarksManager\Db\CollectionMapper;
use OCP\IUserSession;

class CollectionService {

    private CollectionMapper $mapper;
    private IUserSession $userSession;

    public function __construct(CollectionMapper $mapper, IUserSession $userSession) {
        $this->mapper = $mapper;
        $this->userSession = $userSession;
    }

    public function findAll(): array {
        $userId = $this->userSession->getUser()->getUID();
        return $this->mapper->findAll($userId);
    }

    public function find(int $id) {
        $userId = $this->userSession->getUser()->getUID();
        return $this->mapper->find($id, $userId);
    }

    public function create(string $name, ?string $icon, ?int $parentId) {
        $userId = $this->userSession->getUser()->getUID();
        $collection = new \OCA\BookmarksManager\Db\Collection();
        $collection->setUserId($userId);
        $collection->setName($name);
        $collection->setIcon($icon);
        $collection->setParentId($parentId);
        return $this->mapper->insert($collection);
    }

    public function update(int $id, string $name, ?string $icon, ?int $parentId) {
        $userId = $this->userSession->getUser()->getUID();
        $collection = $this->mapper->find($id, $userId);
        if ($collection === null) {
            throw new \Exception('Collection not found');
        }
        $collection->setName($name);
        $collection->setIcon($icon);
        $collection->setParentId($parentId);
        return $this->mapper->update($collection);
    }

    public function delete(int $id) {
        $userId = $this->userSession->getUser()->getUID();
        $collection = $this->mapper->find($id, $userId);
        if ($collection === null) {
            throw new \Exception('Collection not found');
        }
        return $this->mapper->delete($collection);
    }
}