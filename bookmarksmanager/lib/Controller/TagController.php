<?php

namespace OCA\BookmarksManager\Controller;

use OCA\BookmarksManager\Service\TagService;
use OCP\AppFramework\Controller;
use OCP\AppFramework\Http\DataResponse;
use OCP\IRequest;

class TagController extends Controller {

    private TagService $service;

    public function __construct(string $appName, IRequest $request, TagService $service) {
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
    public function create(string $name): DataResponse {
        $tag = $this->service->create($name);
        return new DataResponse($tag);
    }

    /**
     * @NoAdminRequired
     */
    public function update(int $id, string $name): DataResponse {
        try {
            $tag = $this->service->update($id, $name);
            return new DataResponse($tag);
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