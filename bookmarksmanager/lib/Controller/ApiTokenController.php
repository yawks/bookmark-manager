<?php

namespace OCA\BookmarksManager\Controller;

use OCA\BookmarksManager\Service\ApiTokenService;
use OCP\AppFramework\Controller;
use OCP\AppFramework\Http\Attribute\NoAdminRequired;
use OCP\AppFramework\Http\DataResponse;
use OCP\IRequest;

class ApiTokenController extends Controller {

    private ApiTokenService $service;

    public function __construct(string $appName, IRequest $request, ApiTokenService $service) {
        parent::__construct($appName, $request);
        $this->service = $service;
    }

    #[NoAdminRequired]
    public function generate(): DataResponse {
        try {
            $token = $this->service->generateToken();
            return new DataResponse([
                'token' => $token->getToken(),
                'createdAt' => $token->getCreatedAt(),
            ]);
        } catch (\Exception $e) {
            return new DataResponse(['error' => $e->getMessage()], 500);
        }
    }

    #[NoAdminRequired]
    public function get(): DataResponse {
        $token = $this->service->getToken();
        if ($token) {
            return new DataResponse([
                'token' => $token->getToken(),
                'createdAt' => $token->getCreatedAt(),
            ]);
        }
        return new DataResponse(null, 404);
    }

    #[NoAdminRequired]
    public function revoke(): DataResponse {
        try {
            $this->service->revokeToken();
            return new DataResponse(['success' => true]);
        } catch (\Exception $e) {
            return new DataResponse(['error' => $e->getMessage()], 500);
        }
    }
}

