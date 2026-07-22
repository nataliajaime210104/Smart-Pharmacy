import { useState } from 'react';

import type { User } from '../shared/types';
import useDocumentTitle from '../shared/hooks/useDocumentTitle';

import Navbar from '../shared/components/Navbar';
import UserAvatar from '../shared/components/UserAvatar';

import MedicalAssistantPage from '../modules/patient/MedicalAssistantPage';
import MyPrescriptionsPage from '../modules/patient/MyPrescriptionsPage';
import MySchedulesPage from '../modules/patient/MySchedulesPage';

import {
  Bot,
  ClipboardList,
  Clock3,
  Home,
} from 'lucide-react';

type PatientPage =
  | 'dashboard'
  | 'prescriptions'
  | 'schedules'
  | 'assistant';

  const patientPageTitles: Record<PatientPage, string> = {
    dashboard: 'Inicio',
    prescriptions: 'Mis recetas',
    schedules: 'Mis horarios',
    assistant: 'Asistente IA',
  };

interface Props {
  user: User;
  onLogout: () => void;
}

function PatientLayout({ user, onLogout }: Props) {
  const [currentPage, setCurrentPage] = useState<PatientPage>('dashboard');

  useDocumentTitle(
    user.role || 'Paciente',
    patientPageTitles[currentPage],
  );

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
                  Desde este portal podrás consultar tus recetas médicas,
                  revisar tus horarios de medicamentos y usar el asistente
                  de salud con la información registrada en tu expediente.
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

              <div className="patient-summary-card">
                <div>
                  <span>Horarios de medicamentos</span>
                  <strong>Seguimiento</strong>
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

      case 'schedules':
        return <MySchedulesPage user={user} />;

      case 'assistant':
        return <MedicalAssistantPage user={user} />;

      default:
        return null;
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
            className={currentPage === 'dashboard' ? 'active' : ''}
            onClick={() => setCurrentPage('dashboard')}
          >
            <Home className="nav-icon" />
            Inicio
          </button>

          <button
            className={currentPage === 'prescriptions' ? 'active' : ''}
            onClick={() => setCurrentPage('prescriptions')}
          >
            <ClipboardList className="nav-icon" />
            Mis recetas
          </button>

          <button
            className={currentPage === 'schedules' ? 'active' : ''}
            onClick={() => setCurrentPage('schedules')}
          >
            <Clock3 className="nav-icon" />
            Mis horarios
          </button>

          <button
            className={currentPage === 'assistant' ? 'active' : ''}
            onClick={() => setCurrentPage('assistant')}
          >
            <Bot className="nav-icon" />
            Asistente IA
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
