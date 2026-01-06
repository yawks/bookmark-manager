<?php

namespace OCA\BookmarksManager\Controller;

use OCA\BookmarksManager\Controller\AuthenticatedControllerTrait;
use OCA\BookmarksManager\Service\ApiTokenService;
use OCA\BookmarksManager\Service\BookmarkService;
use OCP\AppFramework\Controller;
use OCP\AppFramework\Http\Attribute\NoAdminRequired;
use OCP\AppFramework\Http\Attribute\NoCSRFRequired;
use OCP\AppFramework\Http\Attribute\PublicPage;
use OCP\AppFramework\Http\DataResponse;
use OCP\IRequest;
use OCP\IUserSession;

class BookmarkController extends Controller {
    use AuthenticatedControllerTrait;

    private BookmarkService $service;
    private IUserSession $userSession;
    private ApiTokenService $apiTokenService;

    public function __construct(string $appName, IRequest $request, BookmarkService $service, IUserSession $userSession, ApiTokenService $apiTokenService) {
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

        // Get filter parameters
        $collectionId = $this->request->getParam('collectionId');
        $tagsIdParam = $this->request->getParam('tagsId');

        // Parse collectionId
        $collectionId = $collectionId !== null ? (int)$collectionId : null;
        if ($collectionId !== null && $collectionId <= 0) {
            $collectionId = null;
        }

        // Parse tagsId (can be comma-separated string or array)
        $tagsId = null;
        if ($tagsIdParam !== null) {
            if (is_string($tagsIdParam)) {
                // Handle comma-separated string
                $tagsId = array_filter(array_map('intval', explode(',', $tagsIdParam)));
            } elseif (is_array($tagsIdParam)) {
                // Handle array
                $tagsId = array_filter(array_map('intval', $tagsIdParam));
            }
            if (empty($tagsId)) {
                $tagsId = null;
            }
        }

        return new DataResponse($this->service->findAll($userId, $collectionId, $tagsId));
    }

    #[NoAdminRequired]
    #[NoCSRFRequired]
    #[PublicPage]
    public function create(string $url, string $title, ?string $description, ?int $collectionId, array $tags = [], ?string $screenshot = null, ?string $favicon = null): DataResponse {
        $userId = $this->getAuthenticatedUserId($this->userSession, $this->apiTokenService, $this->request);
        if ($userId === null) {
            return new DataResponse(['error' => 'Unauthorized'], 401);
        }
        $bookmark = $this->service->create($url, $title, $description, $collectionId, $tags, $screenshot, $favicon, $userId);
        return new DataResponse($bookmark);
    }

    #[NoAdminRequired]
    #[NoCSRFRequired]
    #[PublicPage]
    public function update(int $id, string $url, string $title, ?string $description, ?int $collectionId, array $tags = [], ?string $screenshot = null, ?string $favicon = null): DataResponse {
        $userId = $this->getAuthenticatedUserId($this->userSession, $this->apiTokenService, $this->request);
        if ($userId === null) {
            return new DataResponse(['error' => 'Unauthorized'], 401);
        }
        try {
            $bookmark = $this->service->update($id, $url, $title, $description, $collectionId, $tags, $screenshot, $favicon, $userId);
            return new DataResponse($bookmark);
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

    #[NoAdminRequired]
    #[NoCSRFRequired]
    #[PublicPage]
    public function reorder(array $bookmarks): DataResponse {
        $userId = $this->getAuthenticatedUserId($this->userSession, $this->apiTokenService, $this->request);
        if ($userId === null) {
            return new DataResponse(['error' => 'Unauthorized'], 401);
        }
        try {
            $this->service->reorder($bookmarks, $userId);
            return new DataResponse(['success' => true]);
        } catch (\Exception $e) {
            return new DataResponse(['error' => $e->getMessage()], 400);
        }
    }
}
