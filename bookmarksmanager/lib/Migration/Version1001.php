<?php

namespace OCA\BookmarksManager\Migration;

use Closure;
use OCP\DB\ISchemaWrapper;
use OCP\Migration\SimpleMigrationStep;
use OCP\Migration\IOutput;

class Version1001 extends SimpleMigrationStep {

    public function changeSchema(IOutput $output, Closure $schemaClosure, array $options) {
        /** @var ISchemaWrapper $schema */
        $schema = $schemaClosure();

        if ($schema->hasTable('bkmr_bookmarks')) {
            $table = $schema->getTable('bkmr_bookmarks');
            if (!$table->hasColumn('favicon')) {
                $table->addColumn('favicon', 'string', [
                    'notnull' => false,
                    'length' => 255,
                ]);
            }
        }

        return $schema;
    }
}
