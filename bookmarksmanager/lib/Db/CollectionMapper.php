<?php

namespace OCA\BookmarksManager\Db;

use OCP\AppFramework\Db\QBMapper;
use OCP\IDBConnection;

class CollectionMapper extends QBMapper {

    public function __construct(IDBConnection $db) {
        parent::__construct($db, 'bookmarksmanager_collections', Collection::class);
    }

    public function find(int $id, string $userId): ?Collection {
        $qb = $this->db->getQueryBuilder();
        $qb->select('*')
           ->from($this->tableName)
           ->where($qb->expr()->eq('id', $qb->createNamedParameter($id, \PDO::PARAM_INT)))
           ->andWhere($qb->expr()->eq('user_id', $qb->createNamedParameter($userId)));

        return $this->findEntity($qb);
    }

    public function findAll(string $userId): array {
        $qb = $this->db->getQueryBuilder();
        $qb->select('*')
           ->from($this->tableName)
           ->where($qb->expr()->eq('user_id', $qb->createNamedParameter($userId)));

        return $this->findEntities($qb);
    }
}