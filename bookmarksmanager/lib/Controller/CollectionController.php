<?php

namespace OCA\BookmarksManager\Controller;

use OCA\BookmarksManager\Controller\AuthenticatedControllerTrait;
use OCA\BookmarksManager\Service\ApiTokenService;
use OCA\BookmarksManager\Service\CollectionService;
use OCP\AppFramework\Controller;
use OCP\AppFramework\Http\Attribute\NoAdminRequired;
use OCP\AppFramework\Http\Attribute\NoCSRFRequired;
use OCP\AppFramework\Http\Attribute\PublicPage;
use OCP\AppFramework\Http\DataResponse;
use OCP\IRequest;
use OCP\IUserSession;

class CollectionController extends Controller {
    use AuthenticatedControllerTrait;

    private CollectionService $service;
    private IUserSession $userSession;
    private ApiTokenService $apiTokenService;

    public function __construct(string $appName, IRequest $request, CollectionService $service, IUserSession $userSession, ApiTokenService $apiTokenService) {
        parent::__construct($appName, $request);
        $this->service = $service;
        $this->userSession = $userSession;
        $this->apiTokenService = $apiTokenService;
    }

    #[NoAdminRequired]
    #[NoCSRFRequired]
    #[PublicPage]
    public function index(): DataResponse {
        $userId = $this->getAuthenticatedUserId($this->userSession, $this->apiTokenService, $this->request);
        if ($userId === null) {
            return new DataResponse(['error' => 'Unauthorized'], 401);
        }
        return new DataResponse($this->service->findAll($userId));
    }

    #[NoAdminRequired]
    #[NoCSRFRequired]
    #[PublicPage]
    public function create(string $name, ?string $icon, ?int $parentId): DataResponse {
        $userId = $this->getAuthenticatedUserId($this->userSession, $this->apiTokenService, $this->request);
        if ($userId === null) {
            return new DataResponse(['error' => 'Unauthorized'], 401);
        }
        $collection = $this->service->create($name, $icon, $parentId, $userId);
        return new DataResponse($collection);
    }

    #[NoAdminRequired]
    #[NoCSRFRequired]
    #[PublicPage]
    public function update(int $id, string $name, ?string $icon, ?int $parentId): DataResponse {
        $userId = $this->getAuthenticatedUserId($this->userSession, $this->apiTokenService, $this->request);
        if ($userId === null) {
            return new DataResponse(['error' => 'Unauthorized'], 401);
        }
        try {
            $collection = $this->service->update($id, $name, $icon, $parentId, $userId);
            return new DataResponse($collection);
        } catch (\Exception $e) {
            return new DataResponse(['error' => $e->getMessage()], 404);
        }
    }

    #[NoAdminRequired]
    #[NoCSRFRequired]
    #[PublicPage]
    public function destroy(int $id): DataResponse {
        $userId = $this->getAuthenticatedUserId($this->userSession, $this->apiTokenService, $this->request);
        if ($userId === null) {
            return new DataResponse(['error' => 'Unauthorized'], 401);
        }
        try {
            $this->service->delete($id, $userId);
            return new DataResponse(null, 204);
        } catch (\Exception $e) {
            return new DataResponse(['error' => $e->getMessage()], 404);
        }
    }
}