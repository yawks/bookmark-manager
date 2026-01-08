<?php

namespace OCA\BookmarksManager\Controller;

use OCA\BookmarksManager\Service\ExportService;
use OCP\AppFramework\Controller;
use OCP\AppFramework\Http\DataDownloadResponse;
use OCP\AppFramework\Http\DataResponse;
use OCP\AppFramework\Http\Attribute\NoAdminRequired;
use OCP\IRequest;

class ExportController extends Controller {

    private ExportService $exportService;

    public function __construct(string $appName, IRequest $request, ExportService $exportService) {
        parent::__construct($appName, $request);
        $this->exportService = $exportService;
    }

    /**
     * Export bookmarks to Raindrop CSV format
     */
    #[NoAdminRequired]
    public function raindrop(): DataDownloadResponse|DataResponse {
        try {
            $csv = $this->exportService->exportToRaindrop();

            // Generate filename with timestamp
            $filename = 'bookmarks_export_' . date('Y-m-d_His') . '.csv';

            return new DataDownloadResponse($csv, $filename, 'text/csv');
        } catch (\Exception $e) {
            error_log("ExportController error: " . $e->getMessage());
            error_log("Exception trace: " . $e->getTraceAsString());
            return new DataResponse([
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString()
            ], 500);
        }
    }
}
