<?php
style('bookmarksmanager', 'style');
?>
<script nonce="<?php p(\OC::$server->getContentSecurityPolicyNonceManager()->getNonce()) ?>">
    window.bookmarksManagerTranslations = <?php p(json_encode($_['translations'] ?? [])); ?>;
</script>
<div id="app-content">
    <div id="root" style="width: 100%;"></div>
</div>