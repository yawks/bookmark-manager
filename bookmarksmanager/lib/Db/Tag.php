<?php

namespace OCA\BookmarksManager\Db;

use OCP\AppFramework\Db\Entity;

class Tag extends Entity {
    public string $name = '';
    public string $userId = '';
}