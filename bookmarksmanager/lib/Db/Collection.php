<?php

namespace OCA\BookmarksManager\Db;

use OCP\AppFramework\Db\Entity;

class Collection extends Entity {
    public string $name = '';
    public ?string $icon = null;
    public ?int $parentId = null;
    public string $userId = '';

    public function __construct() {
        $this->addType('parent_id', 'integer');
    }
}