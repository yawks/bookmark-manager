<?php
style('bookmarksmanager', 'style');
script('bookmarksmanager', 'main');
?>
<script nonce="<?php p(\OC::$server->getContentSecurityPolicyNonceManager()->getNonce()) ?>">
    // Initialize global objects for Nextcloud integration
    window.bookmarksManagerTranslations = <?php p(json_encode($_['translations'] ?? [])); ?>;
    window.OCA = window.OCA || {};
    window.OCA.BookmarksManager = window.OCA.BookmarksManager || {};
    
    // Diagnostic logging
    console.log('BookmarksManager: Template loaded');
    console.log('BookmarksManager: Translations available:', Object.keys(window.bookmarksManagerTranslations || {}).length);
    
    // Ensure container is ready when script loads
    document.addEventListener('DOMContentLoaded', function() {
        const container = document.getElementById('app-bookmarksmanager');
        if (!container) {
            console.error('BookmarksManager: Container element not found!');
        } else {
            console.log('BookmarksManager: Container found and ready');
        }
    });
</script>
<div id="app-content">
    <div id="app-bookmarksmanager" style="width: 100%; min-height: 100vh;"></div>
</div>