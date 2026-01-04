<?php

namespace OCA\BookmarksManager\Migration;

use Closure;
use OCP\DB\ISchemaWrapper;
use OCP\Migration\SimpleMigrationStep;
use OCP\Migration\IOutput;

class Version1002 extends SimpleMigrationStep {

    public function changeSchema(IOutput $output, Closure $schemaClosure, array $options) {
        /** @var ISchemaWrapper $schema */
        $schema = $schemaClosure();

        if (!$schema->hasTable('bkmr_api_tokens')) {
            $table = $schema->createTable('bkmr_api_tokens');
            $table->addColumn('id', 'integer', [
                'autoincrement' => true,
                'notnull' => true,
            ]);
            $table->addColumn('user_id', 'string', [
                'notnull' => true,
                'length' => 64,
            ]);
            $table->addColumn('token', 'string', [
                'notnull' => true,
                'length' => 128,
            ]);
            $table->addColumn('created_at', 'bigint', [
                'notnull' => true,
            ]);
            $table->setPrimaryKey(['id']);
            $table->addUniqueIndex(['token'], 'bkmr_api_tokens_token_idx');
            $table->addIndex(['user_id'], 'bkmr_api_tokens_user_id_idx');
        }

        return $schema;
    }
}

