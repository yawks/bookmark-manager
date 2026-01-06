<?php

return [
    'routes' => [
        // Main page
        ['name' => 'page#index', 'url' => '/', 'verb' => 'GET'],

        // Bookmarks
        ['name' => 'bookmark#index', 'url' => '/api/v1/bookmarks', 'verb' => 'GET'],
        ['name' => 'bookmark#create', 'url' => '/api/v1/bookmarks', 'verb' => 'POST'],
        ['name' => 'bookmark#update', 'url' => '/api/v1/bookmarks/{id}', 'verb' => 'PUT'],
        ['name' => 'bookmark#destroy', 'url' => '/api/v1/bookmarks/{id}', 'verb' => 'DELETE'],
        ['name' => 'bookmark#reorder', 'url' => '/api/v1/bookmarks/reorder', 'verb' => 'POST'],

        // Collections
        ['name' => 'collection#index', 'url' => '/api/v1/collections', 'verb' => 'GET'],
        ['name' => 'collection#create', 'url' => '/api/v1/collections', 'verb' => 'POST'],
        ['name' => 'collection#update', 'url' => '/api/v1/collections/{id}', 'verb' => 'PUT'],
        ['name' => 'collection#destroy', 'url' => '/api/v1/collections/{id}', 'verb' => 'DELETE'],

        // Tags
        ['name' => 'tag#index', 'url' => '/api/v1/tags', 'verb' => 'GET'],
        ['name' => 'tag#create', 'url' => '/api/v1/tags', 'verb' => 'POST'],
        ['name' => 'tag#update', 'url' => '/api/v1/tags/{id}', 'verb' => 'PUT'],
        ['name' => 'tag#destroy', 'url' => '/api/v1/tags/{id}', 'verb' => 'DELETE'],

        // Page Info
        ['name' => 'page_info#getPageInfo', 'url' => '/api/v1/page-info', 'verb' => 'GET'],

        // Import
        ['name' => 'import#raindrop', 'url' => '/api/v1/import/raindrop', 'verb' => 'POST'],

        // Locales
        ['name' => 'locale#getLocale', 'url' => '/locales/{locale}', 'verb' => 'GET'],

        // API Tokens
        ['name' => 'api_token#generate', 'url' => '/api/v1/token/generate', 'verb' => 'POST'],
        ['name' => 'api_token#get', 'url' => '/api/v1/token', 'verb' => 'GET'],
        ['name' => 'api_token#revoke', 'url' => '/api/v1/token/revoke', 'verb' => 'POST'],
    ]
];