import { useState } from 'react';

import type { User } from '../shared/types';
import useDocumentTitle from '../shared/hooks/useDocumentTitle';

import Navbar from '../shared/components/Navbar';

import MedicinesPage from '../modules/pharmacy/MedicinesPage';
import InventoryPage from '../modules/pharmacy/InventoryPage';
import DashboardPage from '../modules/pharmacy/DashboardPage';

import {
  Activity,
  Boxes,
  ChevronRight,
  Home,
  Pill,
} from 'lucide-react';

type PharmacyPage =
  | 'dashboard'
  | 'medicines'
  | 'inventory';

const pharmacyPageTitles: Record<PharmacyPage, string> = {
  dashboard: 'Inicio',
  medicines: 'Medicamentos',
  inventory: 'Inventario',
};

interface Props {
  user: User;
  onLogout: () => void;
}

function PharmacyLayout({ user, onLogout }: Props) {
  const [currentPage, setCurrentPage] =
    useState<PharmacyPage>('dashboard');

  useDocumentTitle(
    user.role || 'Farmacia',
    pharmacyPageTitles[currentPage],
  );

  const renderPage = () => {
    switch (currentPage) {
      case 'dashboard':
        return (
          <DashboardPage
            user={user}
            onNavigate={(page) =>
              setCurrentPage(page)
            }
          />
        );

      case 'medicines':
        return <MedicinesPage />;

      case 'inventory':
        return <InventoryPage />;

      default:
        return (
          <div className="page-card">
            <h1>Panel de Farmacia</h1>
          </div>
        );
    }
  };

  return (
    <div className="app-layout">
      <aside className="sidebar pharmacy-sidebar">
        <div className="brand pharmacy-sidebar-brand">
          <div className="pharmacy-sidebar-logo">
            <img
              src="/assets/logo/smartpharmacy-logo.png"
              alt="SmartPharmacy"
            />
          </div>

          <div className="pharmacy-sidebar-brand-copy">
            <span>SmartPharmacy</span>
            <h2>Farmacia</h2>
          </div>
        </div>

        <div className="pharmacy-sidebar-divider" />

        <span className="pharmacy-sidebar-section-title">
          Panel principal
        </span>

        <nav className="pharmacy-sidebar-nav">
          <button
            type="button"
            className={
              currentPage === 'dashboard'
                ? 'active'
                : ''
            }
            onClick={() =>
              setCurrentPage('dashboard')
            }
          >
            <span className="pharmacy-sidebar-nav-icon">
              <Home size={20} />
            </span>

            <span className="pharmacy-sidebar-nav-copy">
              <strong>Inicio</strong>
              <small>Resumen operativo</small>
            </span>

            <ChevronRight
              className="pharmacy-sidebar-nav-arrow"
              size={17}
            />
          </button>

          <button
            type="button"
            className={
              currentPage === 'medicines'
                ? 'active'
                : ''
            }
            onClick={() =>
              setCurrentPage('medicines')
            }
          >
            <span className="pharmacy-sidebar-nav-icon">
              <Pill size={20} />
            </span>

            <span className="pharmacy-sidebar-nav-copy">
              <strong>Medicamentos</strong>
              <small>Catálogo farmacéutico</small>
            </span>

            <ChevronRight
              className="pharmacy-sidebar-nav-arrow"
              size={17}
            />
          </button>

          <button
            type="button"
            className={
              currentPage === 'inventory'
                ? 'active'
                : ''
            }
            onClick={() =>
              setCurrentPage('inventory')
            }
          >
            <span className="pharmacy-sidebar-nav-icon">
              <Boxes size={20} />
            </span>

            <span className="pharmacy-sidebar-nav-copy">
              <strong>Inventario</strong>
              <small>Existencias y lotes</small>
            </span>

            <ChevronRight
              className="pharmacy-sidebar-nav-arrow"
              size={17}
            />
          </button>
        </nav>

        <div className="pharmacy-sidebar-spacer" />

        <div className="pharmacy-sidebar-status">
          <span className="pharmacy-sidebar-status-icon">
            <Activity size={19} />
          </span>

          <div>
            <strong>Sistema operativo</strong>
            <span>
              <i />
              Servicios disponibles
            </span>
          </div>
        </div>

        <div className="pharmacy-sidebar-user">
          <div className="pharmacy-sidebar-user-avatar">
            {user.name
              .split(' ')
              .slice(0, 2)
              .map((part) => part.charAt(0))
              .join('')
              .toUpperCase()}
          </div>

          <div>
            <strong>{user.name}</strong>
            <span>Administrador de farmacia</span>
          </div>
        </div>
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

export default PharmacyLayout;