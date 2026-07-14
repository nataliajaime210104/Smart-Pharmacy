import { useState } from 'react';

import type { User } from '../shared/types';

import Navbar from '../shared/components/Navbar';

import DoctorDashboardPage from '../modules/doctor/DoctorDashboardPage';
import RegisterPatientPage from '../modules/doctor/RegisterPatientPage';
import PatientRecordPage from '../modules/doctor/PatientRecordPage';
import PrescriptionsPage from '../modules/doctor/PrescriptionsPage';

import MedicinesPage from '../modules/pharmacy/MedicinesPage';
import InventoryPage from '../modules/pharmacy/InventoryPage';

import RolesPermissionsPage from '../modules/admin/RolesPermissionsPage';
import AiAssistantPage from '../modules/ai-assistant/AiAssistantPage';

import {
  Home,
  UserPlus,
  FileText,
  ClipboardList,
  Pill,
  Boxes,
  ShieldCheck,
  Bot,
} from 'lucide-react';

type AdminPage =
  | 'dashboard'
  | 'registerPatient'
  | 'record'
  | 'prescriptions'
  | 'medicines'
  | 'inventory'
  | 'roles'
  | 'assistant';

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
        return <DoctorDashboardPage />;

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

      case 'medicines':
        return <MedicinesPage />;

      case 'inventory':
        return <InventoryPage />;

      case 'roles':
        return <RolesPermissionsPage />;

      case 'assistant':
        return <AiAssistantPage />;

      default:
        return <DoctorDashboardPage />;
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

          <h2>Administrador Sistema</h2>
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
            Usuarios y roles
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

export default AdminLayout;