import { useState } from 'react';

import type { User } from '../shared/types';

import Navbar from '../shared/components/Navbar';

import DoctorDashboardPage from '../modules/doctor/DoctorDashboardPage';
import PatientRecordPage from '../modules/doctor/PatientRecordPage';
import PrescriptionsPage from '../modules/doctor/PrescriptionsPage';
import AiAssistantPage from '../modules/ai-assistant/AiAssistantPage';
import RegisterPatientPage from '../modules/doctor/RegisterPatientPage';

import {
  Home,
  UserPlus,
  FileText,
  ClipboardList,
  Bot,
} from 'lucide-react';

type DoctorPage =
  | 'dashboard'
  | 'registerPatient'
  | 'record'
  | 'prescriptions'
  | 'assistant';

interface Props {
  user: User;
  onLogout: () => void;
}

function DoctorLayout({ user, onLogout }: Props) {
  const [currentPage, setCurrentPage] =
    useState<DoctorPage>('dashboard');

  const renderPage = () => {
    switch (currentPage) {
      case 'dashboard':
        return (
          <DoctorDashboardPage
            currentUser={user}
            onNavigate={setCurrentPage}
          />
        );

      case 'registerPatient':
        return <RegisterPatientPage />;

      case 'record':
        return <PatientRecordPage />;

      case 'prescriptions':
        return (
          <PrescriptionsPage
            currentUser={user}
          />
        );

      case 'assistant':
        return <AiAssistantPage />;

      default:
        return (
          <DoctorDashboardPage
            currentUser={user}
            onNavigate={setCurrentPage}
          />
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

          <h2>Panel Médico</h2>
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
              currentPage === 'registerPatient'
                ? 'active'
                : ''
            }
            onClick={() =>
              setCurrentPage('registerPatient')
            }
          >
            <UserPlus className="nav-icon" />
            Registrar paciente
          </button>

          <button
            className={
              currentPage === 'record'
                ? 'active'
                : ''
            }
            onClick={() =>
              setCurrentPage('record')
            }
          >
            <FileText className="nav-icon" />
            Expediente clínico
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
            Recetas
          </button>

          <button
            className={
              currentPage === 'assistant'
                ? 'active'
                : ''
            }
            onClick={() =>
              setCurrentPage('assistant')
            }
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

export default DoctorLayout;