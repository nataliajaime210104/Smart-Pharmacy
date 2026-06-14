import type { ReactNode } from 'react';
import type { User } from '../types';

import Navbar from './Navbar';
import Sidebar from './Sidebar';

interface LayoutProps {
  children: ReactNode;
  currentPage: string;
  onNavigate: (page: any) => void;
  onLogout: () => void;
  user: User;
}

function Layout({ children, currentPage, onNavigate, onLogout, user }: LayoutProps) {
  return (
    <div className="app-layout">
      <Sidebar currentPage={currentPage} onNavigate={onNavigate} />

      <main className="main-content">
        <Navbar onLogout={onLogout} user={user} />
        <section className="page-content">{children}</section>
      </main>
    </div>
  );
}

export default Layout;