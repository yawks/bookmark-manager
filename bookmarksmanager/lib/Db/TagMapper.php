<?php

namespace OCA\BookmarksManager\Db;

use OCP\AppFramework\Db\QBMapper;
use OCP\IDBConnection;

class TagMapper extends QBMapper {

    public function __construct(IDBConnection $db) {
        parent::__construct($db, 'bkmr_tags', Tag::class);
    }

    public function find(int $id, string $userId): ?Tag {
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