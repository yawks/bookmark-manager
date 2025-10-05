<?php

namespace OCA\BookmarksManager\Controller;

use OCA\BookmarksManager\Service\BookmarkService;
use OCP\AppFramework\Controller;
use OCP\AppFramework\Http\DataResponse;
use OCP\IRequest;

class BookmarkController extends Controller {

    private BookmarkService $service;

    public function __construct(string $appName, IRequest $request, BookmarkService $service) {
        parent::__construct($appName, $request);
        $this->service = $service;
    }

    /**
     * @NoAdminRequired
     * @NoCSRFRequired
     */
    public function index(): DataResponse {
        return new DataResponse($this->service->findAll());
    }

    /**
     * @NoAdminRequired
     */
    public function create(string $url, string $title, ?string $description, ?int $collectionId, array $tags = [], ?string $screenshot = null): DataResponse {
        try {
            $bookmark = $this->service->create($url, $title, $description, $collectionId, $tags, $screenshot);
            return new DataResponse($bookmark);
        } catch (\Exception $e) {
            return new DataResponse(['error' => 'Failed to create bookmark: ' . $e->getMessage()], 500);
        }
    }

    /**
     * @NoAdminRequired
     */
    public function update(int $id, string $url, string $title, ?string $description, ?int $collectionId, array $tags = [], ?string $screenshot = null): DataResponse {
        try {
            $bookmark = $this->service->update($id, $url, $title, $description, $collectionId, $tags, $screenshot);
            return new DataResponse($bookmark);
        } catch (\Exception $e) {
            return new DataResponse(['error' => $e->getMessage()], 404);
        }
    }

    /**
     * @NoAdminRequired
     */
    public function destroy(int $id): DataResponse {
        try {
            $this->service->delete($id);
            return new DataResponse(null, 204);
        } catch (\Exception $e) {
            return new DataResponse(['error' => $e->getMessage()], 404);
        }
    }
}