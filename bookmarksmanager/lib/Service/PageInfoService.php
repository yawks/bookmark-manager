<?php

namespace OCA\BookmarksManager\Service;

use DOMDocument;
use DOMXPath;

class PageInfoService {

    public function getPageInfo(string $url): array {
        $html = @file_get_contents($url);
        if ($html === false) {
            return ['title' => '', 'image' => '', 'favicon' => ''];
        }

        $doc = new DOMDocument();
        @$doc->loadHTML($html);

        $title = $this->extractTitle($doc);
        $image = $this->extractImage($doc, $url);
        $favicon = $this->extractFavicon($doc, $url);

        return ['title' => $title, 'image' => $image, 'favicon' => $favicon];
    }

    private function extractTitle(DOMDocument $doc): string {
        $titleNodes = $doc->getElementsByTagName('title');
        if ($titleNodes->length > 0) {
            return $titleNodes->item(0)->textContent;
        }
        return '';
    }

    private function extractFavicon(DOMDocument $doc, string $baseUrl): string {
        $xpath = new DOMXPath($doc);
        
        // 1. Try Apple Touch Icon
        $linkNodes = $xpath->query('//link[@rel="apple-touch-icon"]');
        if ($linkNodes->length > 0) {
            $imageUrl = $linkNodes->item(0)->getAttribute('href');
            if (!empty($imageUrl)) {
                return $this->resolveUrl($imageUrl, $baseUrl);
            }
        }

        // 2. Try standard Icon
        $linkNodes = $xpath->query('//link[@rel="icon" or @rel="shortcut icon"]');
        if ($linkNodes->length > 0) {
            $imageUrl = $linkNodes->item(0)->getAttribute('href');
            if (!empty($imageUrl)) {
                return $this->resolveUrl($imageUrl, $baseUrl);
            }
        }
        
        // 3. Fallback to /favicon.ico
        $base = parse_url($baseUrl);
        return ($base['scheme'] ?? 'http') . '://' . ($base['host'] ?? '') . '/favicon.ico';
    }

    private function extractImage(DOMDocument $doc, string $baseUrl): string {
        $xpath = new DOMXPath($doc);
        // 1. Try Open Graph image
        $metaNodes = $xpath->query('//meta[@property="og:image"]');
        if ($metaNodes->length > 0) {
            $imageUrl = $metaNodes->item(0)->getAttribute('content');
            if (!empty($imageUrl)) {
                return $this->resolveUrl($imageUrl, $baseUrl);
            }
        }

        // 2. Fallback to find the first large image
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