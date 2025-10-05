// Diagnostic script for Nextcloud integration issues
window.BookmarksManagerDiagnostic = {
  checkNextcloudEnvironment: function() {
    console.log('=== Bookmarks Manager Diagnostic ===');
    
    // Check Nextcloud environment
    console.log('1. Nextcloud Environment:');
    console.log('   - OCA object:', typeof window.OCA, window.OCA ? 'Available' : 'Missing');
    console.log('   - jQuery:', typeof window.$, window.$ ? `Version: ${window.$.fn?.jquery || 'Unknown'}` : 'Missing');
    console.log('   - Document ready state:', document.readyState);
    
    // Check container elements
    console.log('2. Container Elements:');
    const container = document.getElementById('app-bookmarksmanager');
    console.log('   - app-bookmarksmanager:', container ? 'Found' : 'Missing');
    if (container) {
      console.log('   - Container dimensions:', container.offsetWidth, 'x', container.offsetHeight);
      console.log('   - Container innerHTML length:', container.innerHTML.length);
    }
    
    // Check CSS variables
    console.log('3. CSS Variables:');
    const computedStyle = getComputedStyle(document.documentElement);
    const ncVars = ['--color-main-background', '--color-primary', '--color-main-text'];
    ncVars.forEach(varName => {
      const value = computedStyle.getPropertyValue(varName);
      console.log(`   - ${varName}:`, value || 'Not set');
    });
    
    // Check for conflicts
    console.log('4. Potential Conflicts:');
    console.log('   - React on window:', typeof window.React);
    console.log('   - ReactDOM on window:', typeof window.ReactDOM);
    console.log('   - Vue on window:', typeof window.Vue);
    
    console.log('=== End Diagnostic ===');
  },
  
  fixCommonIssues: function() {
    console.log('Attempting to fix common issues...');
    
    // Ensure container exists
    if (!document.getElementById('app-bookmarksmanager')) {
      const appContent = document.getElementById('app-content');
      if (appContent) {
        const container = document.createElement('div');
        container.id = 'app-bookmarksmanager';
        container.style.width = '100%';
        container.style.minHeight = '100vh';
        appContent.appendChild(container);
        console.log('Created missing container element');
      }
    }
    
    // Clear any conflicting React instances
    if (window.React && window.React !== React) {
      console.log('Potential React version conflict detected');
    }
  }
};

// Auto-run diagnostic
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => {
    setTimeout(() => window.BookmarksManagerDiagnostic.checkNextcloudEnvironment(), 1000);
  });
} else {
  setTimeout(() => window.BookmarksManagerDiagnostic.checkNextcloudEnvironment(), 1000);
}