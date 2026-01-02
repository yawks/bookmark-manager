<?php
style('bookmarksmanager', 'style');
script('bookmarksmanager', 'main');
// Load build-id.js if it exists for cache-busting
if (file_exists(__DIR__ . '/../js/build-id.js')) {
    echo '<script src="' . \OC::$server->getURLGenerator()->linkTo('bookmarksmanager', 'js/build-id.js') . '"></script>';
}
?>
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <meta name="requesttoken" content="<?php p($_['requesttoken'] ?? OC\Util::callRegister()); ?>">
</head>
<body>
<script nonce="<?php p(\OC::$server->getContentSecurityPolicyNonceManager()->getNonce()) ?>">
    // Initialize global objects for Nextcloud integration
    window.bookmarksManagerTranslations = <?php echo json_encode($_['translations'] ?? []); ?>;
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
</body>
</html>