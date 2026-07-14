import { useState } from 'react';

import type { User } from '../shared/types';

import Navbar from '../shared/components/Navbar';
import UserAvatar from '../shared/components/UserAvatar';

import MyPrescriptionsPage from '../modules/patient/MyPrescriptionsPage';

import {
  Home,
  ClipboardList,
} from 'lucide-react';

type PatientPage =
  | 'dashboard'
  | 'prescriptions';

interface Props {
  user: User;
  onLogout: () => void;
}

function PatientLayout({ user, onLogout }: Props) {
  const [currentPage, setCurrentPage] =
    useState<PatientPage>('dashboard');

  const renderPage = () => {
    switch (currentPage) {
      case 'dashboard':
        return (
          <div>
            <div className="welcome-profile-card">
              <UserAvatar
                user={user}
                size="xl"
              />

              <div>
                <h1>Bienvenido, {user.name}</h1>

                <p>
                  Desde este portal podrás consultar tus recetas médicas
                  emitidas por tu médico, revisar medicamentos indicados y
                  abrir tu PDF cuando la receta esté firmada.
                </p>

                <div className="welcome-profile-meta">
                  <span className="welcome-profile-badge">
                    {user.role}
                  </span>

                  <span className="welcome-profile-badge success">
                    {user.status}
                  </span>
                </div>
              </div>
            </div>

            <div className="patient-summary-grid">
              <div className="patient-summary-card">
                <div>
                  <span>Portal del paciente</span>
                  <strong>Activo</strong>
                </div>
              </div>

              <div className="patient-summary-card">
                <div>
                  <span>Recetas médicas</span>
                  <strong>Consulta</strong>
                </div>
              </div>
            </div>
          </div>
        );

      case 'prescriptions':
        return (
          <MyPrescriptionsPage
            currentUser={user}
          />
        );

      default:
        return (
          <div className="page-card">
            <h1>Bienvenido</h1>

            <p>
              Hola <strong>{user.name}</strong>.
            </p>
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

          <h2>Paciente</h2>
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
              currentPage === 'prescriptions'
                ? 'active'
                : ''
            }
            onClick={() =>
              setCurrentPage('prescriptions')
            }
          >
            <ClipboardList className="nav-icon" />
            Mis recetas
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

export default PatientLayout;