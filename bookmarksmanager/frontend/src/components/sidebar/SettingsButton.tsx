import React, { useState } from 'react';
import { Settings } from 'lucide-react';
import { Popover, PopoverContent, PopoverTrigger } from '../ui/popover';
import { Button } from '../ui/button';
import { t } from '../../lib/l10n';
import ImportRaindropDialog from './ImportRaindropDialog';
import ApiTokenDialog from './ApiTokenDialog';

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

