<?php

namespace OCA\BookmarksManager\Controller;

use OCP\AppFramework\Controller;
use OCP\AppFramework\Http\DataResponse;
use OCP\AppFramework\Http\JSONResponse;
use OCP\AppFramework\Http\Attribute\NoAdminRequired;
use OCP\AppFramework\Http\Attribute\NoCSRFRequired;
use OCP\AppFramework\Http\Attribute\PublicPage;
use OCP\IRequest;

class LocaleController extends Controller {

    public function __construct(string $appName, IRequest $request) {
        parent::__construct($appName, $request);
    }

    #[NoAdminRequired]
    #[NoCSRFRequired]
    #[PublicPage]
    public function getLocale(string $locale): JSONResponse {
        // Strip .json extension if present to get the code
        $localeCode = preg_replace('/\.json$/', '', $locale);

        // Security: only allow alphanumeric locale names (2-3 chars usually, but let's allow a bit more for variants like fr_CA)
        if (!preg_match('/^[a-z0-9_]{2,10}$/i', $localeCode)) {
            return new JSONResponse(['error' => 'Invalid locale'], 400);
        }

        // Get the app directory
        $appPath = \OC::$server->getAppManager()->getAppPath('bookmarksmanager');
        $localeFile = $appPath . '/locales/' . basename($localeCode) . '.json';
        
        if (!file_exists($localeFile)) {
            // Fallback to English if locale file doesn't exist
            $localeFile = $appPath . '/locales/en.json';
        }
        
        if (file_exists($localeFile)) {
            $content = file_get_contents($localeFile);
            $data = json_decode($content, true);
            
            if ($data !== null) {
                // Set cache headers with cache-busting support
                $response = new JSONResponse($data);
                $response->addHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
                $response->addHeader('Pragma', 'no-cache');
                $response->addHeader('Expires', '0');
                return $response;
            }
        }
        
        return new JSONResponse(['error' => 'Locale file not found'], 404);
    }
}

