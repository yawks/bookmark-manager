<?php

namespace OCA\BookmarksManager\Migration;

use Closure;
use OCP\DB\ISchemaWrapper;
use OCP\Migration\SimpleMigrationStep;
use OCP\Migration\IOutput;

class Version1000 extends SimpleMigrationStep {

    public function changeSchema(IOutput $output, Closure $schemaClosure, array $options) {
        /** @var ISchemaWrapper $schema */
        $schema = $schemaClosure();

        if (!$schema->hasTable('bookmarksmanager_collections')) {
            $table = $schema->createTable('bookmarksmanager_collections');
            $table->addColumn('id', 'integer', [
                'autoincrement' => true,
                'notnull' => true,
            ]);
            $table->addColumn('user_id', 'string', [
                'notnull' => true,
                'length' => 64,
            ]);
            $table->addColumn('name', 'string', [
                'notnull' => true,
                'length' => 255,
            ]);
            $table->addColumn('icon', 'string', [
                'notnull' => false,
                'length' => 255,
            ]);
            $table->addColumn('parent_id', 'integer', [
                'notnull' => false,
            ]);
            $table->setPrimaryKey(['id']);
            $table->addIndex(['user_id'], 'bkmgr_collections_user_id_idx');
        }

        if (!$schema->hasTable('bookmarksmanager_tags')) {
            $table = $schema->createTable('bookmarksmanager_tags');
            $table->addColumn('id', 'integer', [
                'autoincrement' => true,
                'notnull' => true,
            ]);
            $table->addColumn('user_id', 'string', [
                'notnull' => true,
                'length' => 64,
            ]);
            $table->addColumn('name', 'string', [
                'notnull' => true,
                'length' => 255,
            ]);
            $table->setPrimaryKey(['id']);
            $table->addIndex(['user_id'], 'bkmgr_tags_user_id_idx');
        }

        if (!$schema->hasTable('bookmarksmanager_bookmarks')) {
            $table = $schema->createTable('bookmarksmanager_bookmarks');
            $table->addColumn('id', 'integer', [
                'autoincrement' => true,
                'notnull' => true,
            ]);
            $table->addColumn('user_id', 'string', [
                'notnull' => true,
                'length' => 64,
            ]);
            $table->addColumn('url', 'string', [
                'notnull' => true,
                'length' => 4096,
            ]);
            $table->addColumn('title', 'string', [
                'notnull' => true,
                'length' => 255,
            ]);
            $table->addColumn('description', 'text', [
                'notnull' => false,
            ]);
            $table->addColumn('screenshot', 'string', [
                'notnull' => false,
                'length' => 255,
            ]);
            $table->addColumn('collection_id', 'integer', [
                'notnull' => false,
            ]);
            $table->setPrimaryKey(['id']);
            $table->addIndex(['user_id'], 'bkmgr_bookmarks_user_id_idx');
        }

        if (!$schema->hasTable('bookmarksmanager_bookmarks_tags')) {
            $table = $schema->createTable('bookmarksmanager_bookmarks_tags');
            $table->addColumn('bookmark_id', 'integer', [
                'notnull' => true,
            ]);
            $table->addColumn('tag_id', 'integer', [
                'notnull' => true,
            ]);
            $table->setPrimaryKey(['bookmark_id', 'tag_id']);
            $table->addForeignKeyConstraint($schema->getTable('bookmarksmanager_bookmarks'), ['bookmark_id'], ['id'], ['onDelete' => 'CASCADE'], 'bkmgr_bkm_fk');
            $table->addForeignKeyConstraint($schema->getTable('bookmarksmanager_tags'), ['tag_id'], ['id'], ['onDelete' => 'CASCADE'], 'bkmgr_tag_fk');
        }

        return $schema;
    }
}