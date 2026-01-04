<?php

namespace OCA\BookmarksManager\AppInfo;

use OCA\BookmarksManager\Controller\BookmarkController;
use OCA\BookmarksManager\Controller\CollectionController;
use OCA\BookmarksManager\Controller\PageController;
use OCA\BookmarksManager\Controller\TagController;
use OCA\BookmarksManager\Controller\PageInfoController;
use OCA\BookmarksManager\Controller\ImportController;
use OCA\BookmarksManager\Controller\LocaleController;
use OCA\BookmarksManager\Controller\ApiTokenController;
use OCA\BookmarksManager\Db\BookmarkMapper;
use OCA\BookmarksManager\Db\CollectionMapper;
use OCA\BookmarksManager\Db\TagMapper;
use OCA\BookmarksManager\Db\ApiTokenMapper;
use OCA\BookmarksManager\Service\BookmarkService;
use OCA\BookmarksManager\Service\CollectionService;
use OCA\BookmarksManager\Service\TagService;
use OCA\BookmarksManager\Service\PageInfoService;
use OCA\BookmarksManager\Service\ImportService;
use OCA\BookmarksManager\Service\ApiTokenService;
use OCP\AppFramework\App;
use OCP\AppFramework\Bootstrap\IBootContext;
use OCP\AppFramework\Bootstrap\IBootstrap;
use OCP\AppFramework\Bootstrap\IRegistrationContext;
use OCP\IDBConnection;
use OCP\IL10N;
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
                $c->get('Request'),
                $c->get(IL10N::class)
            );
        });

        $context->registerService('CollectionMapper', function ($c) {
            return new CollectionMapper($c->get(IDBConnection::class));
        });
        $context->registerService('CollectionService', function ($c) {
            return new CollectionService(
                $c->get('CollectionMapper'),
                $c->get(IUserSession::class),
                $c->get('BookmarkService')
            );
        });
        $context->registerService('CollectionController', function ($c) {
            return new CollectionController(
                $c->get('AppName'),
                $c->get('Request'),
                $c->get('CollectionService'),
                $c->get(IUserSession::class),
                $c->get('ApiTokenService')
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
                $c->get('TagService'),
                $c->get(IUserSession::class),
                $c->get('ApiTokenService')
            );
        });

        $context->registerService('BookmarkMapper', function ($c) {
            return new BookmarkMapper($c->get(IDBConnection::class));
        });
        $context->registerService('BookmarkService', function ($c) {
            return new BookmarkService(
                $c->get('BookmarkMapper'),
                $c->get(IUserSession::class),
                $c->get('TagService'),
                $c->get('CollectionMapper'),
                $c->get('TagMapper')
            );
        });
        $context->registerService('BookmarkController', function ($c) {
            return new BookmarkController(
                $c->get('AppName'),
                $c->get('Request'),
                $c->get('BookmarkService'),
                $c->get(IUserSession::class),
                $c->get('ApiTokenService')
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

        $context->registerService('ImportService', function ($c) {
            return new ImportService(
                $c->get('CollectionService'),
                $c->get('BookmarkService'),
                $c->get('TagService'),
                $c->get(IUserSession::class)
            );
        });
        $context->registerService('ImportController', function ($c) {
            return new ImportController(
                $c->get('AppName'),
                $c->get('Request'),
                $c->get('ImportService')
            );
        });

        $context->registerService('LocaleController', function ($c) {
            return new LocaleController(
                $c->get('AppName'),
                $c->get('Request')
            );
        });

        $context->registerService('ApiTokenMapper', function ($c) {
            return new ApiTokenMapper($c->get(IDBConnection::class));
        });
        $context->registerService('ApiTokenService', function ($c) {
            return new ApiTokenService(
                $c->get('ApiTokenMapper'),
                $c->get(IUserSession::class)
            );
        });
        $context->registerService('ApiTokenController', function ($c) {
            return new ApiTokenController(
                $c->get('AppName'),
                $c->get('Request'),
                $c->get('ApiTokenService')
            );
        });
    }

    public function boot(IBootContext $context): void {
        $navigationManager = \OC::$server->getNavigationManager();
        $navigationManager->add(function () {
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