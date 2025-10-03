<?php

namespace OCA\BookmarksManager\Controller;

use OCP\AppFramework\Controller;
use OCP\AppFramework\Http\TemplateResponse;
use OCP\IRequest;
use OCP\IScriptManager;

class PageController extends Controller {

    private IScriptManager $scriptManager;

    public function __construct(string $appName, IRequest $request, IScriptManager $scriptManager) {
        parent::__construct($appName, $request);
        $this->scriptManager = $scriptManager;
    }

    public function registerScripts(): void {
        $this->scriptManager->addScript($this->appName, 'main', ['type' => 'module']);
    }

    /**
     * @NoAdminRequired
     * @NoCSRFRequired
     */
    public function index(): TemplateResponse {
        return new TemplateResponse($this->appName, 'main', [], 'user');
    }
}