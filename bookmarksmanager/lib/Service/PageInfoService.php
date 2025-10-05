<?php

namespace OCA\BookmarksManager\Service;

use DOMDocument;
use DOMXPath;

class PageInfoService {

    public function getPageInfo(string $url): array {
        $html = @file_get_contents($url);
        if ($html === false) {
            return ['title' => '', 'image' => ''];
        }

        $doc = new DOMDocument();
        @$doc->loadHTML($html);

        $title = $this->extractTitle($doc);
        $description = $this->extractDescription($doc);
        $image = $this->extractImage($doc, $url);

        return ['title' => $title, 'description' => $description, 'image' => $image];
    }

    private function extractDescription(DOMDocument $doc): string {
        $xpath = new DOMXPath($doc);
        $metaNodes = $xpath->query('//meta[@property="og:description"]');
        if ($metaNodes->length > 0) {
            return $metaNodes->item(0)->getAttribute('content');
        }

        $metaNodes = $xpath->query('//meta[@name="description"]');
        if ($metaNodes->length > 0) {
            return $metaNodes->item(0)->getAttribute('content');
        }

        return '';
    }

    private function extractTitle(DOMDocument $doc): string {
        $titleNodes = $doc->getElementsByTagName('title');
        if ($titleNodes->length > 0) {
            return $titleNodes->item(0)->textContent;
        }
        return '';
    }

    private function extractImage(DOMDocument $doc, string $baseUrl): string {
        $xpath = new DOMXPath($doc);
        $metaNodes = $xpath->query('//meta[@property="og:image"]');

        if ($metaNodes->length > 0) {
            $imageUrl = $metaNodes->item(0)->getAttribute('content');
            return $this->resolveUrl($imageUrl, $baseUrl);
        }

        // Fallback to find the first large image if no og:image is found
        $imageNodes = $doc->getElementsByTagName('img');
        if ($imageNodes->length > 0) {
            $firstImage = $imageNodes->item(0);
            if ($firstImage) {
                $imageUrl = $firstImage->getAttribute('src');
                return $this->resolveUrl($imageUrl, $baseUrl);
            }
        }

        return '';
    }

    private function resolveUrl(string $url, string $baseUrl): string {
        if (filter_var($url, FILTER_VALIDATE_URL)) {
            return $url;
        }

        $base = parse_url($baseUrl);
        $path = rtrim(dirname($base['path'] ?? ''), '/');

        if (strpos($url, '//') === 0) {
            return ($base['scheme'] ?? 'http') . ':' . $url;
        }

        if (strpos($url, '/') === 0) {
            return ($base['scheme'] ?? 'http') . '://' . ($base['host'] ?? '') . $url;
        }

        return ($base['scheme'] ?? 'http') . '://' . ($base['host'] ?? '') . $path . '/' . $url;
    }
}