<?php

namespace OCA\BookmarksManager\Db;

use OCP\AppFramework\Db\Entity;
use JsonSerializable;

class Bookmark extends Entity implements JsonSerializable {
    protected $userId;
    protected $url;
    protected $title;
    protected $description;
    protected $screenshot;
    protected $collectionId;
    
    // Non-db property
    public array $tags = [];

    public function __construct() {
        $this->addType('collectionId', 'integer');
    }

    public function setUserId(string $userId): void {
        $this->userId = $userId;
    }

    public function getUserId(): string {
        return $this->userId;
    }

    public function setUrl(string $url): void {
        $this->url = $url;
    }

    public function getUrl(): string {
        return $this->url;
    }

    public function setTitle(string $title): void {
        $this->title = $title;
    }

    public function getTitle(): string {
        return $this->title;
    }

    public function setDescription(?string $description): void {
        $this->description = $description;
    }

    public function getDescription(): ?string {
        return $this->description;
    }

    public function setCollectionId(?int $collectionId): void {
        $this->collectionId = $collectionId;
    }

    public function getCollectionId(): ?int {
        return $this->collectionId;
    }

    public function setScreenshot(?string $screenshot): void {
        $this->screenshot = $screenshot;
    }

    public function getScreenshot(): ?string {
        return $this->screenshot;
    }

    public function setTags(array $tags): void {
        $this->tags = $tags;
    }

    public function getTags(): array {
        return $this->tags;
    }

    public function jsonSerialize(): array {
        return [
            'id' => $this->id,
            'userId' => $this->userId,
            'url' => $this->url,
            'title' => $this->title,
            'description' => $this->description,
            'collectionId' => $this->collectionId,
            'screenshot' => $this->screenshot,
            'tags' => $this->tags,
        ];
    }
}