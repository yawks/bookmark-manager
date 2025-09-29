<?php

namespace OCA\Bookmarks\Controller;

use OCA\Bookmarks\Service\PageInfoService;
use OCP\AppFramework\Controller;
use OCP\AppFramework\Http\DataResponse;
use OCP\IRequest;

class PageInfoController extends Controller {

    private PageInfoService $service;

    public function __construct(string $appName, IRequest $request, PageInfoService $service) {
        parent::__construct($appName, $request);
        $this->service = $service;
    }

    /**
     * @NoAdminRequired
     * @NoCSRFRequired
     */
    public function getPageInfo(string $url): DataResponse {
        $info = $this->service->getPageInfo($url);
        return new DataResponse($info);
    }
}