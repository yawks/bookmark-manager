import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import Collections from '../sidebar/Collections';
import Tags from '../sidebar/Tags';
import Header from './Header';
import { Button } from '@/components/ui/button';
import { ChevronDownIcon, ChevronUpIcon } from '@radix-ui/react-icons';
import { cn } from '@/lib/utils';

const Layout = ({ children }: { children: React.ReactNode }) => {
  const { t } = useTranslation();
  const [isFiltersOpen, setIsFiltersOpen] = useState(true);

  return (
    <div className="flex h-full bg-background">
      <aside className="w-64 border-r flex flex-col min-h-0">
        <div className="p-4 border-b">
          <Button
            variant="link"
            onClick={() => setIsFiltersOpen(!isFiltersOpen)}
            className="w-full justify-between p-0 text-foreground hover:no-underline"
          >
            <span className="text-lg font-semibold">{t('sidebar.filters', 'Filters')}</span>
            {isFiltersOpen ? <ChevronUpIcon className="h-5 w-5" /> : <ChevronDownIcon className="h-5 w-5" />}
          </Button>
        </div>
        <div
          className={cn(
            'flex-1 grid transition-all duration-300 ease-in-out',
            isFiltersOpen ? 'grid-rows-[1fr] opacity-100' : 'grid-rows-[0fr] opacity-0'
          )}
        >
          <div className="overflow-y-auto">
            <Collections />
            <div className="border-t">
              <Tags />
            </div>
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