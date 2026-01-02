import Collections from '../sidebar/Collections';
import Header from './Header';
import React from 'react';
import SettingsButton from '../sidebar/SettingsButton';
import Tags from '../sidebar/Tags';

const Layout = ({ children }: { children: React.ReactNode }) => {
  return (
    <div className="flex h-full bg-background">
      <aside className="w-64 border-r flex flex-col min-h-0" style={{ backgroundColor: 'var(--color-background-dark, #f5f5f5)', color: 'var(--color-main-text, #000)' }}>
        <div className="flex-1 overflow-y-auto">
          <Collections />
          <div className="border-t">
            <Tags />
          </div>
        </div>
        <SettingsButton />
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