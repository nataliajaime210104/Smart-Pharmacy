import { useState } from 'react';

import type { User } from '../shared/types';

import Navbar from '../shared/components/Navbar';
import RolesPermissionsPage from '../modules/admin/RolesPermissionsPage';

import {
  Home,
  ShieldCheck,
} from 'lucide-react';

type AdminPage =
  | 'dashboard'
  | 'roles';

interface Props {
  user: User;
  onLogout: () => void;
}

function AdminLayout({ user, onLogout }: Props) {
  const [currentPage, setCurrentPage] =
    useState<AdminPage>('dashboard');

  const renderPage = () => {
    switch (currentPage) {

      case 'dashboard':
        return (
          <div className="page-card">
            <h1>Panel del Administrador</h1>

            <p>
              Bienvenido <strong>{user.name}</strong>.
            </p>

            <p>
              Desde este panel podrás administrar el sistema,
              usuarios, roles y permisos.
            </p>
          </div>
        );

      case 'roles':
        return <RolesPermissionsPage />;

      default:
        return (
          <div className="page-card">
            <h1>Panel del Administrador</h1>
          </div>
        );
    }
  };

  return (
    <div className="app-layout">

      <aside className="sidebar">

        <div className="brand">
          <img
            src="/assets/logo/smartpharmacy-logo.png"
            alt="SmartPharmacy"
          />

          <h2>Administrador</h2>
        </div>

        <nav>

          <button
            className={
              currentPage === 'dashboard'
                ? 'active'
                : ''
            }
            onClick={() =>
              setCurrentPage('dashboard')
            }
          >
            <Home className="nav-icon" />
            Inicio
          </button>

          <button
            className={
              currentPage === 'roles'
                ? 'active'
                : ''
            }
            onClick={() =>
              setCurrentPage('roles')
            }
          >
            <ShieldCheck className="nav-icon" />
            Roles y permisos
          </button>

        </nav>

      </aside>

      <main className="main-content">

        <Navbar
          user={user}
          onLogout={onLogout}
        />

        <section className="page-content">
          {renderPage()}
        </section>

      </main>

    </div>
  );
}

export default AdminLayout;