<?php

return [
    'routes' => [
        // Bookmarks
        ['name' => 'bookmark#index', 'url' => '/api/v1/bookmarks', 'verb' => 'GET'],
        ['name' => 'bookmark#create', 'url' => '/api/v1/bookmarks', 'verb' => 'POST'],
        ['name' => 'bookmark#update', 'url' => '/api/v1/bookmarks/{id}', 'verb' => 'PUT'],
        ['name' => 'bookmark#destroy', 'url' => '/api/v1/bookmarks/{id}', 'verb' => 'DELETE'],

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
    ]
];