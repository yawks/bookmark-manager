import React, { useState } from 'react';
import { Settings } from 'lucide-react';
import { Popover, PopoverContent, PopoverTrigger } from '../ui/popover';
import { Button } from '../ui/button';
import { t } from '../../lib/l10n';
import ImportRaindropDialog from './ImportRaindropDialog';
import ApiTokenDialog from './ApiTokenDialog';

// Helper to get Nextcloud's request token
function getRequestToken() {
  if (typeof document === 'undefined') {
    return null;
  }
  const meta = document.querySelector('meta[name="requesttoken"]');
  if (meta) return meta.getAttribute('content');
  const head = document.querySelector('head[data-requesttoken]');
  if (head) return head.getAttribute('data-requesttoken');
  return null;
}

const SettingsButton = () => {
  const [popoverOpen, setPopoverOpen] = useState(false);
  const [importDialogOpen, setImportDialogOpen] = useState(false);
  const [apiTokenDialogOpen, setApiTokenDialogOpen] = useState(false);

  return (
    <>
      <div className="p-4 border-t">
        <Popover open={popoverOpen} onOpenChange={setPopoverOpen}>
          <PopoverTrigger asChild>
            <Button
              variant="ghost"
              className="w-full justify-start"
              onClick={() => setPopoverOpen(true)}
            >
              <Settings className="h-4 w-4 mr-2" />
              {t('settings.title')}
            </Button>
          </PopoverTrigger>
          <PopoverContent align="start" side="right" className="w-56">
            <div className="space-y-1">
              <button
                className="w-full text-left px-2 py-1.5 text-sm rounded-md hover:bg-accent"
                onClick={() => {
                  setPopoverOpen(false);
                  setImportDialogOpen(true);
                }}
              >
                {t('settings.import_from_raindrop')}
              </button>
              <button
                className="w-full text-left px-2 py-1.5 text-sm rounded-md hover:bg-accent"
                onClick={() => {
                  setPopoverOpen(false);
                  setApiTokenDialogOpen(true);
                }}
              >
                {t('settings.api_token.title')}
              </button>
              <button
                className="w-full text-left px-2 py-1.5 text-sm rounded-md hover:bg-accent"
                onClick={async () => {
                  setPopoverOpen(false);
                  const requestToken = getRequestToken();
                  if (!requestToken) {
                    console.error('CSRF token not found');
                    return;
                  }

                  try {
                    const response = await fetch('/apps/bookmarksmanager/api/v1/export/raindrop', {
                      method: 'GET',
                      headers: {
                        'requesttoken': requestToken,
                      },
                    });

                    if (response.ok) {
                      // Get the CSV content and create a download
                      const blob = await response.blob();
                      const url = URL.createObjectURL(blob);
                      const a = document.createElement('a');
                      a.href = url;
                      a.download = `bookmarks_export_${new Date().toISOString().split('T')[0]}.csv`;
                      document.body.appendChild(a);
                      a.click();
                      a.remove();
                      URL.revokeObjectURL(url);
                    } else {
                      console.error('Export failed:', await response.text());
                    }
                  } catch (error) {
                    console.error('Export error:', error);
                  }
                }}
              >
                {t('settings.export_to_raindrop')}
              </button>
            </div>
          </PopoverContent>
        </Popover>
      </div>
      <ImportRaindropDialog open={importDialogOpen} onOpenChange={setImportDialogOpen} />
      <ApiTokenDialog open={apiTokenDialogOpen} onOpenChange={setApiTokenDialogOpen} />
    </>
  );
};

export default SettingsButton;

