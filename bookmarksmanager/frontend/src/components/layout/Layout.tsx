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
  const [isFiltersOpen, setIsFiltersOpen] = useState(false);

  return (
    <div className="flex h-screen bg-background">
      <aside className="w-64 border-r flex flex-col">
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
            'flex-1 grid transition-[grid-template-rows] duration-500 ease-in-out',
            isFiltersOpen ? 'grid-rows-[1fr]' : 'grid-rows-[0fr]'
          )}
        >
          <div className="overflow-hidden flex flex-col">
            <div className="flex-1">
              <Collections />
            </div>
            <div className="border-t">
              <Tags />
            </div>
          </div>
        </div>
      </aside>
      <div className="flex-1 flex flex-col">
        <Header />
        <main className="flex-1 p-8 overflow-y-auto">
          {children}
        </main>
      </div>
    </div>
  );
};

export default Layout;