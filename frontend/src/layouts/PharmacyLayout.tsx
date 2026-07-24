import { useState } from 'react';

import type { User } from '../shared/types';

import Navbar from '../shared/components/Navbar';

import MedicinesPage from '../modules/pharmacy/MedicinesPage';
import InventoryPage from '../modules/pharmacy/InventoryPage';
import DashboardPage from '../modules/pharmacy/DashboardPage';

import {
  Home,
  Pill,
  Boxes,
} from 'lucide-react';

type PharmacyPage =
  | 'dashboard'
  | 'medicines'
  | 'inventory';

interface Props {
  user: User;
  onLogout: () => void;
}

function PharmacyLayout({ user, onLogout }: Props) {
  const [currentPage, setCurrentPage] =
    useState<PharmacyPage>('dashboard');

  const renderPage = () => {
    switch (currentPage) {

      case 'dashboard':
       case 'dashboard':
  return <DashboardPage user={user} />;

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

      <aside className="sidebar">

        <div className="brand">
          <img
            src="/assets/logo/smartpharmacy-logo.png"
            alt="SmartPharmacy"
          />

          <h2>Farmacia</h2>
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
              currentPage === 'medicines'
                ? 'active'
                : ''
            }
            onClick={() =>
              setCurrentPage('medicines')
            }
          >
            <Pill className="nav-icon" />
            Medicamentos
          </button>

          <button
            className={
              currentPage === 'inventory'
                ? 'active'
                : ''
            }
            onClick={() =>
              setCurrentPage('inventory')
            }
          >
            <Boxes className="nav-icon" />
            Inventario
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

export default PharmacyLayout;