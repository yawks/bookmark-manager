import React from 'react';
import { t } from '../../lib/l10n';

const EmptyState = () => {
  return (
    <div className="flex flex-col items-center justify-center h-full p-8 text-center bg-background rounded-lg border-2 border-dashed border-border">
      <div className="max-w-md mx-auto">
        <h2 className="text-2xl font-semibold text-foreground mb-2">{t('Welcome to your Bookmark Manager')}</h2>
        <p className="text-muted-foreground mb-6">
          {t("It looks like you don't have any bookmarks yet. Let's get started!")}
        </p>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-left mb-6">
          <div className="border border-border rounded-lg p-4">
            <h3 className="font-semibold mb-2">{t('1. Add a bookmark')}</h3>
            <p className="text-sm text-muted-foreground">{t('Click the "Add Bookmark" button to save your first link.')}</p>
          </div>
          <div className="border border-border rounded-lg p-4">
            <h3 className="font-semibold mb-2">{t('2. Organize with Collections')}</h3>
            <p className="text-sm text-muted-foreground">{t('Group related bookmarks into collections for easy access.')}</p>
          </div>
          <div className="border border-border rounded-lg p-4">
            <h3 className="font-semibold mb-2">{t('3. Use Tags')}</h3>
            <p className="text-sm text-muted-foreground">{t('Add tags to your bookmarks to find them quickly.')}</p>
          </div>
        </div>

        <div className="bg-muted/40 p-6 rounded-lg">
            <h3 className="font-semibold text-foreground mb-4">{t('Your bookmarks will appear here')}</h3>
            <div className="space-y-3">
                <div className="flex items-center space-x-3">
                    <div className="h-10 w-16 bg-muted rounded"></div>
                    <div className="flex-1 space-y-1">
                        <div className="h-4 bg-muted rounded w-3/4"></div>
                        <div className="h-3 bg-muted rounded w-1/2"></div>
                    </div>
                </div>
                <div className="flex items-center space-x-3">
                    <div className="h-10 w-16 bg-muted rounded"></div>
                    <div className="flex-1 space-y-1">
                        <div className="h-4 bg-muted rounded w-3/4"></div>
                        <div className="h-3 bg-muted rounded w-1/2"></div>
                    </div>
                </div>
            </div>
        </div>
      </div>
    </div>
  );
};

export default EmptyState;