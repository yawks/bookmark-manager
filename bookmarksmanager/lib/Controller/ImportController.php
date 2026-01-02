<?php

namespace OCA\BookmarksManager\Controller;

use OCA\BookmarksManager\Service\ImportService;
use OCP\AppFramework\Controller;
use OCP\AppFramework\Http\DataResponse;
use OCP\AppFramework\Http\Attribute\NoAdminRequired;
use OCP\IRequest;

class ImportController extends Controller {

    private ImportService $importService;

    public function __construct(string $appName, IRequest $request, ImportService $importService) {
        parent::__construct($appName, $request);
        $this->importService = $importService;
    }

    #[NoAdminRequired]
    public function raindrop(): DataResponse {
        try {
            $file = $this->request->getUploadedFile('file');
            
            if (!$file || !isset($file['tmp_name'])) {
                return new DataResponse(['error' => 'No file uploaded'], 400);
            }

            $result = $this->importService->importFromRaindrop($file['tmp_name']);
            
            return new DataResponse([
                'success' => true,
                'imported' => $result['imported'],
                'skipped' => $result['skipped'] ?? 0,
                'collections_created' => $result['collections_created'],
                'errors' => $result['errors'] ?? 0,
                'error_messages' => $result['error_messages'] ?? [],
            ]);
        } catch (\Exception $e) {
            error_log("ImportController error: " . $e->getMessage());
            error_log("Exception trace: " . $e->getTraceAsString());
            return new DataResponse([
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString()
            ], 500);
        }
    }
}

