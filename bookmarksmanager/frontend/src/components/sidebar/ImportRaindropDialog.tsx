import React, { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '../ui/dialog';
import { Button } from '../ui/button';
import { t } from '../../lib/l10n';
import { useRouter } from '@tanstack/react-router';

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

interface ImportRaindropDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const ImportRaindropDialog: React.FC<ImportRaindropDialogProps> = ({
  open,
  onOpenChange,
}) => {
  const [file, setFile] = useState<File | null>(null);
  const [isImporting, setIsImporting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      if (selectedFile.type === 'text/csv' || selectedFile.name.endsWith('.csv')) {
        setFile(selectedFile);
        setError(null);
      } else {
        setError(t('settings.import_error_invalid_file'));
        setFile(null);
      }
    }
  };

  const handleImport = async () => {
    if (!file) return;

    setIsImporting(true);
    setError(null);

    const requestToken = getRequestToken();
    if (!requestToken) {
      setError(t('settings.import_error_token'));
      setIsImporting(false);
      return;
    }

    try {
      const formData = new FormData();
      formData.append('file', file);

      const response = await fetch('/apps/bookmarksmanager/api/v1/import/raindrop', {
        method: 'POST',
        headers: {
          'requesttoken': requestToken,
        },
        body: formData,
      });

      if (response.ok) {
        const result = await response.json();
        // Show success/error message
        if (result.imported !== undefined) {
          const message = `Import completed: ${result.imported} bookmarks imported, ${result.skipped || 0} skipped, ${result.collections_created || 0} collections created`;
          console.log(message);
          if (result.errors > 0) {
            console.warn(`Import had ${result.errors} errors:`, result.error_messages);
            setError(`${message}. ${result.errors} errors occurred. Check console for details.`);
          } else if (result.imported === 0) {
            setError('No bookmarks were imported. Please check the CSV format and try again.');
          } else {
            setFile(null);
            onOpenChange(false);
            await router.invalidate();
          }
        } else {
          setFile(null);
          onOpenChange(false);
          await router.invalidate();
        }
      } else {
        const errorData = await response.json().catch(() => ({ error: 'Unknown error' }));
        const errorMessage = errorData.error || errorData.message || t('settings.import_error_failed');
        setError(errorMessage);
        console.error('Import error:', errorData);
      }
    } catch (err) {
      setError(t('settings.import_error_failed'));
      console.error('Import error:', err);
    } finally {
      setIsImporting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{t('settings.import_from_raindrop')}</DialogTitle>
          <DialogDescription>
            {t('settings.import_description')}
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4">
          <div>
            <input
              type="file"
              accept=".csv"
              onChange={handleFileChange}
              className="block w-full text-sm text-muted-foreground
                file:mr-4 file:py-2 file:px-4
                file:rounded-md file:border-0
                file:text-sm file:font-semibold
                file:bg-primary file:text-primary-foreground
                hover:file:bg-primary/90
                cursor-pointer"
            />
            {file && (
              <p className="mt-2 text-sm text-muted-foreground">
                {t('settings.selected_file')}: {file.name}
              </p>
            )}
          </div>
          {error && (
            <div className="text-sm text-destructive">
              {error}
            </div>
          )}
        </div>
        <DialogFooter>
          <Button variant="ghost" onClick={() => onOpenChange(false)}>
            {t('collection.cancel')}
          </Button>
          <Button onClick={handleImport} disabled={!file || isImporting}>
            {isImporting ? t('settings.importing') : t('settings.import')}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default ImportRaindropDialog;

