<?php

namespace OCA\BookmarksManager\AppInfo;

use OCA\BookmarksManager\Controller\BookmarkController;
use OCA\BookmarksManager\Controller\CollectionController;
use OCA\BookmarksManager\Controller\PageController;
use OCA\BookmarksManager\Controller\TagController;
use OCA\BookmarksManager\Controller\PageInfoController;
use OCA\BookmarksManager\Db\BookmarkMapper;
use OCA\BookmarksManager\Db\CollectionMapper;
use OCA\BookmarksManager\Db\TagMapper;
use OCA\BookmarksManager\Service\BookmarkService;
use OCA\BookmarksManager\Service\CollectionService;
use OCA\BookmarksManager\Service\TagService;
use OCA\BookmarksManager\Service\PageInfoService;
use OCP\AppFramework\App;
use OCP\AppFramework\Bootstrap\IBootContext;
use OCP\AppFramework\Bootstrap\IBootstrap;
use OCP\AppFramework\Bootstrap\IRegistrationContext;
use OCP\IDBConnection;
use OCP\INavigationManager;
use OCP\IUserSession;

class Application extends App implements IBootstrap {

    public const APP_ID = 'bookmarksmanager';

    public function __construct(array $urlParams = []) {
        parent::__construct(self::APP_ID, $urlParams);
    }

    public function register(IRegistrationContext $context): void {
        $context->registerService('PageController', function ($c) {
            return new PageController(
                $c->get('AppName'),
                $c->get('Request')
            );
        });

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
        $context->get(INavigationManager::class)->add(function () {
            $urlGenerator = \OC::$server->getURLGenerator();
            return [
                'id' => self::APP_ID,
                'order' => 10,
                'href' => $urlGenerator->linkToRoute(self::APP_ID . '.page.index'),
                'icon' => $urlGenerator->imagePath(self::APP_ID, 'app.svg'),
                'name' => \OC::$server->getL10N(self::APP_ID)->t('Bookmarks Manager'),
            ];
        });
    }

}