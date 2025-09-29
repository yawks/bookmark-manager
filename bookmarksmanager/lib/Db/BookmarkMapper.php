<?php

namespace OCA\BookmarksManager\Db;

use OCP\AppFramework\Db\QBMapper;
use OCP\DB\QueryBuilder\IQueryBuilder;
use OCP\IDBConnection;

class BookmarkMapper extends QBMapper {

    public function __construct(IDBConnection $db) {
        parent::__construct($db, 'bookmarksmanager_bookmarks', Bookmark::class);
    }

    public function find(int $id, string $userId): ?Bookmark {
        $qb = $this->db->getQueryBuilder();
        $qb->select('*')
           ->from($this->tableName)
           ->where($qb->expr()->eq('id', $qb->createNamedParameter($id, \PDO::PARAM_INT)))
           ->andWhere($qb->expr()->eq('user_id', $qb->createNamedParameter($userId)));

        $bookmark = $this->findEntity($qb);

        if ($bookmark) {
            $bookmark->setTags($this->findTags($bookmark->getId()));
        }

        return $bookmark;
    }

    public function findAll(string $userId): array {
        $qb = $this->db->getQueryBuilder();
        $qb->select('*')
           ->from($this->tableName)
           ->where($qb->expr()->eq('user_id', $qb->createNamedParameter($userId)));

        $bookmarks = $this->findEntities($qb);

        if (!empty($bookmarks)) {
            $bookmarkIds = array_map(fn($b) => $b->getId(), $bookmarks);
            $tagsByBookmark = $this->findAllTags($bookmarkIds);

            foreach ($bookmarks as $bookmark) {
                if (isset($tagsByBookmark[$bookmark->getId()])) {
                    $bookmark->setTags($tagsByBookmark[$bookmark->getId()]);
                }
            }
        }

        return $bookmarks;
    }

    private function findTags(int $bookmarkId): array {
        $qb = $this->db->getQueryBuilder();
        $qb->select('tag_id')
            ->from('bookmarksmanager_bookmarks_tags')
            ->where($qb->expr()->eq('bookmark_id', $qb->createNamedParameter($bookmarkId, \PDO::PARAM_INT)));

        $result = $qb->execute();
        $tags = $result->fetchAll(\PDO::FETCH_COLUMN);
        return array_map('intval', $tags);
    }

    private function findAllTags(array $bookmarkIds): array {
        $qb = $this->db->getQueryBuilder();
        $qb->select('bookmark_id', 'tag_id')
           ->from('bookmarksmanager_bookmarks_tags')
           ->where($qb->expr()->in('bookmark_id', $qb->createNamedParameter($bookmarkIds, IQueryBuilder::PARAM_INT_ARRAY)));

        $result = $qb->execute();
        $tagsByBookmark = [];
        while ($row = $result->fetch()) {
            $tagsByBookmark[$row['bookmark_id']][] = (int)$row['tag_id'];
        }
        return $tagsByBookmark;
    }

    public function setTags(int $bookmarkId, array $tagIds): void {
        $qbDelete = $this->db->getQueryBuilder();
        $qbDelete->delete('bookmarksmanager_bookmarks_tags')
           ->where($qbDelete->expr()->eq('bookmark_id', $qbDelete->createNamedParameter($bookmarkId, \PDO::PARAM_INT)))
           ->execute();

        foreach ($tagIds as $tagId) {
            $qbInsert = $this->db->getQueryBuilder();
            $qbInsert->insert('bookmarksmanager_bookmarks_tags')
               ->values([
                   'bookmark_id' => $qbInsert->createNamedParameter($bookmarkId, \PDO::PARAM_INT),
                   'tag_id' => $qbInsert->createNamedParameter($tagId, \PDO::PARAM_INT)
               ])
               ->execute();
        }
    }
}