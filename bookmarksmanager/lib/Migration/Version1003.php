<?php

namespace OCA\BookmarksManager\Migration;

use Closure;
use Doctrine\DBAL\Types\Type;
use OCP\DB\ISchemaWrapper;
use OCP\Migration\IOutput;
use OCP\Migration\SimpleMigrationStep;

class Version1003 extends SimpleMigrationStep {
    public function changeSchema(IOutput $output, Closure $schemaClosure, array $options) {
        /** @var ISchemaWrapper $schema */
        $schema = $schemaClosure();

        if ($schema->hasTable('bkmr_bookmarks')) {
            $table = $schema->getTable('bkmr_bookmarks');
            if ($table->hasColumn('favicon')) {
                $column = $table->getColumn('favicon');
                $column->setType(Type::getType('text'));
                $column->setLength(16777215);
            }
        }

        return $schema;
    }
}
