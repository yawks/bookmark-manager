<?php

namespace OCA\BookmarksManager\Controller;

use OCP\AppFramework\Controller;
use OCP\AppFramework\Http\TemplateResponse;
use OCP\IRequest;
use OCP\IL10N;
use OCP\Util;

class PageController extends Controller {

    private IL10N $l;

    public function __construct(string $appName, IRequest $request, IL10N $l) {
        parent::__construct($appName, $request);
        $this->l = $l;
    }

    /**
     * @NoAdminRequired
     * @NoCSRFRequired
     */
    public function index(): TemplateResponse {
        Util::addScript($this->appName, 'main', 'module');
        $params = [
            'translations' => [
                'Bookmarks' => $this->l->t('Bookmarks'),
                'Filters' => $this->l->t('Filters'),
                'Collections' => $this->l->t('Collections'),
                'All' => $this->l->t('All'),
                'Tags' => $this->l->t('Tags'),
                'Add Bookmark' => $this->l->t('Add Bookmark'),
                'Add a new bookmark' => $this->l->t('Add a new bookmark'),
                'Enter the details of the bookmark you want to add.' => $this->l->t('Enter the details of the bookmark you want to add.'),
                'URL' => $this->l->t('URL'),
                'https://example.com' => $this->l->t('https://example.com'),
                'Title' => $this->l->t('Title'),
                'Fetching title...' => $this->l->t('Fetching title...'),
                'A cool website' => $this->l->t('A cool website'),
                'Description' => $this->l->t('Description'),
                'A short description' => $this->l->t('A short description'),
                'Collection' => $this->l->t('Collection'),
                'Select a collection' => $this->l->t('Select a collection'),
                'Select tags...' => $this->l->t('Select tags...'),
                'No tags found.' => $this->l->t('No tags found.'),
                'Save bookmark' => $this->l->t('Save bookmark'),
            ]
        ];
        return new TemplateResponse($this->appName, 'main', $params, 'user');
    }
}