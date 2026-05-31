import Navbar from './Navbar';
import Sidebar from './Sidebar';

interface LayoutProps {
  children: React.ReactNode;
  currentPage: string;
  onNavigate: (page: any) => void;
  onLogout: () => void;
}

function Layout({ children, currentPage, onNavigate, onLogout }: LayoutProps) {
  return (
    <div className="app-layout">
      <Sidebar currentPage={currentPage} onNavigate={onNavigate} />
      <main className="main-content">
        <Navbar onLogout={onLogout} />
        <section className="page-content">{children}</section>
      </main>
    </div>
  );
}

export default Layout;