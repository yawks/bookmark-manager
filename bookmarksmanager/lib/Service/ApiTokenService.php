<?php

namespace OCA\BookmarksManager\Service;

use OCA\BookmarksManager\Db\ApiToken;
use OCA\BookmarksManager\Db\ApiTokenMapper;
use OCP\IUserSession;

class ApiTokenService {

    private ApiTokenMapper $mapper;
    private IUserSession $userSession;

    public function __construct(ApiTokenMapper $mapper, IUserSession $userSession) {
        $this->mapper = $mapper;
        $this->userSession = $userSession;
    }

    /**
     * Generate a new API token for the current user
     */
    public function generateToken(): ApiToken {
        $user = $this->userSession->getUser();
        if (!$user) {
            throw new \Exception('User not authenticated');
        }

        $userId = $user->getUID();

        // Delete existing token if any
        $existing = $this->mapper->findByUserId($userId);
        if ($existing) {
            $this->mapper->delete($existing);
        }

        // Generate new token
        $token = bin2hex(random_bytes(32)); // 64 character hex string

        $apiToken = new ApiToken();
        $apiToken->setUserId($userId);
        $apiToken->setToken($token);
        $apiToken->setCreatedAt(time());

        return $this->mapper->insert($apiToken);
    }

    /**
     * Get the API token for the current user
     */
    public function getToken(): ?ApiToken {
        $user = $this->userSession->getUser();
        if (!$user) {
            return null;
        }

        return $this->mapper->findByUserId($user->getUID());
    }

    /**
     * Revoke the API token for the current user
     */
    public function revokeToken(): void {
        $user = $this->userSession->getUser();
        if (!$user) {
            throw new \Exception('User not authenticated');
        }

        $this->mapper->deleteByUserId($user->getUID());
    }

    /**
     * Validate a token and return the associated user ID
     */
    public function validateToken(string $token): ?string {
        $apiToken = $this->mapper->findByToken($token);
        if ($apiToken) {
            return $apiToken->getUserId();
        }
        return null;
    }
}

