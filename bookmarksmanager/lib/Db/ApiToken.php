<?php

namespace OCA\BookmarksManager\Db;

use OCP\AppFramework\Db\Entity;
use JsonSerializable;

class ApiToken extends Entity implements JsonSerializable {
    protected $userId;
    protected $token;
    protected $createdAt;

    public function setUserId(string $userId): void {
        $this->userId = $userId;
        $this->markFieldUpdated('userId');
    }

    public function getUserId(): string {
        return $this->userId;
    }

    public function setToken(string $token): void {
        $this->token = $token;
        $this->markFieldUpdated('token');
    }

    public function getToken(): string {
        return $this->token;
    }

    public function setCreatedAt(int $createdAt): void {
        $this->createdAt = $createdAt;
        $this->markFieldUpdated('createdAt');
    }

    public function getCreatedAt(): int {
        return $this->createdAt;
    }

    public function jsonSerialize(): array {
        return [
            'id' => $this->id,
            'userId' => $this->userId,
            'token' => $this->token,
            'createdAt' => $this->createdAt,
        ];
    }
}

