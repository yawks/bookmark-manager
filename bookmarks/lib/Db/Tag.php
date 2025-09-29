<?php

namespace OCA\Bookmarks\Db;

use OCP\AppFramework\Db\Entity;

class Tag extends Entity {
    public string $name;
    public string $userId;
}