<?php

namespace OCA\BookmarksManager\Controller;

use OCA\BookmarksManager\Service\ApiTokenService;
use OCP\IUserSession;

trait AuthenticatedControllerTrait {

    /**
     * Get the user ID from either the session or API token
     * Returns null if no authentication is found
     */
    protected function getAuthenticatedUserId(IUserSession $userSession, ApiTokenService $apiTokenService, $request): ?string {
        // First, try to get user from session (normal Nextcloud authentication)
        $user = $userSession->getUser();
        if ($user) {
            return $user->getUID();
        }

        // If no session, try to get token from headers
        $token = null;
        $authHeader = $request->getHeader('Authorization');
        if ($authHeader && preg_match('/Bearer\s+(.*)$/i', $authHeader, $matches)) {
            $token = $matches[1];
        } else {
            // Try X-API-Key header as fallback
            $token = $request->getHeader('X-API-Key');
        }

        if ($token) {
            $userId = $apiTokenService->validateToken($token);
            if ($userId) {
                return $userId;
            }
        }

        return null;
    }
}

