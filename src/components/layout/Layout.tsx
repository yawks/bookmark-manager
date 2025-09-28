import React from 'react';
import Collections from '../sidebar/Collections';
import Tags from '../sidebar/Tags';
import Header from './Header';

const Layout = ({ children }: { children: React.ReactNode }) => {
  return (
    <div className="flex h-screen bg-background">
      <aside className="w-64 border-r flex flex-col">
        <div className="flex-1">
          <Collections />
        </div>
        <div className="border-t">
          <Tags />
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