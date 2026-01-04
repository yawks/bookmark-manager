<?php

namespace OCA\BookmarksManager\Db;

use OCP\AppFramework\Db\QBMapper;
use OCP\IDBConnection;

class ApiTokenMapper extends QBMapper {

    public function __construct(IDBConnection $db) {
        parent::__construct($db, 'bkmr_api_tokens', ApiToken::class);
    }

    public function findByToken(string $token): ?ApiToken {
        $qb = $this->db->getQueryBuilder();
        $qb->select('*')
           ->from($this->tableName)
           ->where($qb->expr()->eq('token', $qb->createNamedParameter($token)));

        try {
            return $this->findEntity($qb);
        } catch (\OCP\AppFramework\Db\DoesNotExistException $e) {
            return null;
        }
    }

    public function findByUserId(string $userId): ?ApiToken {
        $qb = $this->db->getQueryBuilder();
        $qb->select('*')
           ->from($this->tableName)
           ->where($qb->expr()->eq('user_id', $qb->createNamedParameter($userId)));

        try {
            return $this->findEntity($qb);
        } catch (\OCP\AppFramework\Db\DoesNotExistException $e) {
            return null;
        }
    }

    public function deleteByUserId(string $userId): void {
        $qb = $this->db->getQueryBuilder();
        $qb->delete($this->tableName)
           ->where($qb->expr()->eq('user_id', $qb->createNamedParameter($userId)))
           ->execute();
    }
}

