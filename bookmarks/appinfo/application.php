<?php

namespace OCA\Bookmarks\AppInfo;

use OCA\Bookmarks\Controller\BookmarkController;
use OCA\Bookmarks\Controller\CollectionController;
use OCA\Bookmarks\Controller\TagController;
use OCA\Bookmarks\Db\BookmarkMapper;
use OCA\Bookmarks\Db\CollectionMapper;
use OCA\Bookmarks\Db\TagMapper;
use OCA\Bookmarks\Service\BookmarkService;
use OCA\Bookmarks\Service\CollectionService;
use OCA\Bookmarks\Service\TagService;
use OCP\AppFramework\App;
use OCP\AppFramework\Bootstrap\IBootContext;
use OCP\AppFramework\Bootstrap\IBootstrap;
use OCA\Bookmarks\Controller\PageInfoController;
use OCA\Bookmarks\Service\PageInfoService;
use OCP\AppFramework\Bootstrap\IRegistrationContext;
use OCP\IDBConnection;
use OCP\IUserSession;

class Application extends App implements IBootstrap {

    public const APP_ID = 'bookmarks';

    public function __construct(array $urlParams = []) {
        parent::__construct(self::APP_ID, $urlParams);
    }

    public function register(IRegistrationContext $context): void {
        $context->registerService('CollectionMapper', function ($c) {
            return new CollectionMapper($c->get(IDBConnection::class));
        });
        $context->registerService('CollectionService', function ($c) {
            return new CollectionService(
                $c->get('CollectionMapper'),
                $c->get(IUserSession::class)
            );
        });
        $context->registerService('CollectionController', function ($c) {
            return new CollectionController(
                $c->get('AppName'),
                $c->get('Request'),
                $c->get('CollectionService')
            );
        });

        $context->registerService('TagMapper', function ($c) {
            return new TagMapper($c->get(IDBConnection::class));
        });
        $context->registerService('TagService', function ($c) {
            return new TagService(
                $c->get('TagMapper'),
                $c->get(IUserSession::class)
            );
        });
        $context->registerService('TagController', function ($c) {
            return new TagController(
                $c->get('AppName'),
                $c->get('Request'),
                $c->get('TagService')
            );
        });

        $context->registerService('BookmarkMapper', function ($c) {
            return new BookmarkMapper($c->get(IDBConnection::class));
        });
        $context->registerService('BookmarkService', function ($c) {
            return new BookmarkService(
                $c->get('BookmarkMapper'),
                $c->get(IUserSession::class)
            );
        });
        $context->registerService('BookmarkController', function ($c) {
            return new BookmarkController(
                $c->get('AppName'),
                $c->get('Request'),
                $c->get('BookmarkService')
            );
        });

        $context->registerService('PageInfoService', function ($c) {
            return new PageInfoService();
        });
        $context->registerService('PageInfoController', function ($c) {
            return new PageInfoController(
                $c->get('AppName'),
                $c->get('Request'),
                $c->get('PageInfoService')
            );
        });
    }

    public function boot(IBootContext $context): void {
        // Run any code that needs to be executed when the app is enabled
    }

}