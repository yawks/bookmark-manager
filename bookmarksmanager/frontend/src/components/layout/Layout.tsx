import { ChevronDownIcon, ChevronUpIcon } from '@radix-ui/react-icons';
import React, { useState } from 'react';

import { Button } from '@/components/ui/button';
import Collections from '../sidebar/Collections';
import Header from './Header';
import Tags from '../sidebar/Tags';
import { cn } from '@/lib/utils';
import { t } from '../../lib/l10n';

const Layout = ({ children }: { children: React.ReactNode }) => {
  const [isFiltersOpen, setIsFiltersOpen] = useState(true);

  return (
    <div className="flex h-full bg-background">
      <aside className="w-64 border-r flex flex-col min-h-0" style={{ backgroundColor: 'var(--color-background-dark, #f5f5f5)', color: 'var(--color-main-text, #000)' }}>
        <div className="p-4 border-b">
          <Button
            variant="link"
            onClick={() => setIsFiltersOpen(!isFiltersOpen)}
            className="w-full justify-between p-0 text-foreground hover:no-underline"
          >
            <span className="text-lg font-semibold">{t('Filters')}</span>
            {isFiltersOpen ? <ChevronUpIcon className="h-5 w-5" /> : <ChevronDownIcon className="h-5 w-5" />}
          </Button>
        </div>
        <div className={cn('flex-1 overflow-y-auto', !isFiltersOpen && 'hidden')}>
          <Collections />
          <div className="border-t">
            <Tags />
          </div>
        </div>
      </aside>
      <div className="flex-1 flex flex-col min-h-0">
        <Header />
        <main className="flex-1 overflow-y-auto p-6">
          {children}
        </main>
      </div>
    </div>
  );
};

export default Layout;