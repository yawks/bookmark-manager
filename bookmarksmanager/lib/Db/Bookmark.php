<?php

namespace OCA\BookmarksManager\Db;

use OCP\AppFramework\Db\Entity;

class Bookmark extends Entity implements \JsonSerializable {
    public string $url;
    public string $title;
    public ?string $description;
    public ?string $screenshot;
    public ?int $collectionId;
    public string $userId;
    protected array $tags = [];

    public function __construct() {
        $this->addType('collection_id', 'integer');
    }

    public function getTags(): array {
        return $this->tags;
    }

    public function setTags(array $tags): void {
        $this->tags = $tags;
    }

    #[\ReturnTypeWillChange]
    public function jsonSerialize() {
        return [
            'id' => $this->id,
            'url' => $this->url,
            'title' => $this->title,
            'description' => $this->description,
            'screenshot' => $this->screenshot,
            'collectionId' => $this->collectionId,
            'userId' => $this->userId,
            'tags' => $this->tags,
        ];
    }
}