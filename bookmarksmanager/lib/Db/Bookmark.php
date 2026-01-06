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
    protected $favicon;
    protected $collectionId;
    protected $order;
    
    // Non-db properties
    public array $tags = [];
    public ?string $collectionName = null;
    public array $tagsWithNames = [];

    public function __construct() {
        $this->addType('collectionId', 'integer');
        $this->addType('order', 'integer');
    }

    public function setUserId(string $userId): void {
        $this->userId = $userId;
        $this->markFieldUpdated('userId');
    }

    public function getUserId(): string {
        return $this->userId;
    }

    public function setUrl(string $url): void {
        $this->url = $url;
        $this->markFieldUpdated('url');
    }

    public function getUrl(): string {
        return $this->url;
    }

    public function setTitle(string $title): void {
        $this->title = $title;
        $this->markFieldUpdated('title');
    }

    public function getTitle(): string {
        return $this->title;
    }

    public function setDescription(?string $description): void {
        $this->description = $description;
        $this->markFieldUpdated('description');
    }

    public function getDescription(): ?string {
        return $this->description;
    }

    public function setCollectionId(?int $collectionId): void {
        $this->collectionId = $collectionId;
        $this->markFieldUpdated('collectionId');
    }

    public function getCollectionId(): ?int {
        return $this->collectionId;
    }

    public function setScreenshot(?string $screenshot): void {
        $this->screenshot = $screenshot;
        $this->markFieldUpdated('screenshot');
    }

    public function getScreenshot(): ?string {
        return $this->screenshot;
    }

    public function setFavicon(?string $favicon): void {
        $this->favicon = $favicon;
        $this->markFieldUpdated('favicon');
    }

    public function getFavicon(): ?string {
        return $this->favicon;
    }

    public function setOrder(?int $order): void {
        $this->order = $order;
        $this->markFieldUpdated('order');
    }

    public function getOrder(): ?int {
        return $this->order;
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
            'collectionName' => $this->collectionName,
            'screenshot' => $this->screenshot,
            'favicon' => $this->favicon,
            'order' => $this->order,
            'tags' => $this->tagsWithNames,
        ];
    }
}
