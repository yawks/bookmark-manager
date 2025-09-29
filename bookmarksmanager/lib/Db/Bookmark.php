<?php

namespace OCA\BookmarksManager\Db;

use OCP\AppFramework\Db\Entity;

class Bookmark extends Entity {
    public string $url;
    public string $title;
    public ?string $description;
    public ?string $screenshot;
    public ?int $collectionId;
    public string $userId;
    public array $tags = [];

    public function __construct() {
        $this->addType('collection_id', 'integer');
    }
}