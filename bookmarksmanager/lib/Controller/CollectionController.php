<?php

namespace OCA\BookmarksManager\Controller;

use OCA\BookmarksManager\Service\CollectionService;
use OCP\AppFramework\Controller;
use OCP\AppFramework\Http\DataResponse;
use OCP\IRequest;

class CollectionController extends Controller {

    private CollectionService $service;

    public function __construct(string $appName, IRequest $request, CollectionService $service) {
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
    public function create(string $name, ?string $icon, ?int $parentId): DataResponse {
        $collection = $this->service->create($name, $icon, $parentId);
        return new DataResponse($collection);
    }

    /**
     * @NoAdminRequired
     */
    public function update(int $id, string $name, ?string $icon, ?int $parentId): DataResponse {
        try {
            $collection = $this->service->update($id, $name, $icon, $parentId);
            return new DataResponse($collection);
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