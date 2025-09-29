<?php

namespace OCA\Bookmarks\Service;

use OCA\Bookmarks\Db\TagMapper;
use OCP\IUserSession;

class TagService {

    private TagMapper $mapper;
    private IUserSession $userSession;

    public function __construct(TagMapper $mapper, IUserSession $userSession) {
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

    public function create(string $name) {
        $userId = $this->userSession->getUser()->getUID();
        $tag = new \OCA\Bookmarks\Db\Tag();
        $tag->setUserId($userId);
        $tag->setName($name);
        return $this->mapper->insert($tag);
    }

    public function update(int $id, string $name) {
        $userId = $this->userSession->getUser()->getUID();
        $tag = $this->mapper->find($id, $userId);
        if ($tag === null) {
            throw new \Exception('Tag not found');
        }
        $tag->setName($name);
        return $this->mapper->update($tag);
    }

    public function delete(int $id) {
        $userId = $this->userSession->getUser()->getUID();
        $tag = $this->mapper->find($id, $userId);
        if ($tag === null) {
            throw new \Exception('Tag not found');
        }
        return $this->mapper->delete($tag);
    }
}