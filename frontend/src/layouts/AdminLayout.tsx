import { useState } from 'react';

import type { User } from '../shared/types';

import Navbar from '../shared/components/Navbar';
import PortalSidebar, { type PortalSidebarItem,} from '../shared/components/PortalSidebar';
import useDocumentTitle from '../shared/hooks/useDocumentTitle';

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

  const adminSidebarItems:
  PortalSidebarItem<AdminPage>[] = [
    {
      id: 'dashboard',
      label: 'Inicio',
      description: 'Resumen general',
      icon: Home,
    },
    {
      id: 'registerPatient',
      label: 'Registrar paciente',
      description: 'Alta de nuevos pacientes',
      icon: UserPlus,
    },
    {
      id: 'record',
      label: 'Expediente clínico',
      description: 'Consulta de historiales',
      icon: FileText,
    },
    {
      id: 'prescriptions',
      label: 'Recetas',
      description: 'Prescripción y seguimiento',
      icon: ClipboardList,
    },
    {
      id: 'medicines',
      label: 'Medicamentos',
      description: 'Catálogo farmacéutico',
      icon: Pill,
    },
    {
      id: 'inventory',
      label: 'Inventario',
      description: 'Existencias y lotes',
      icon: Boxes,
    },
    {
      id: 'roles',
      label: 'Usuarios y roles',
      description: 'Accesos y permisos',
      icon: ShieldCheck,
    },
    {
      id: 'assistant',
      label: 'Asistente IA',
      description: 'Apoyo inteligente',
      icon: Bot,
    },
  ];

const adminPageTitles: Record<AdminPage, string> = {
  dashboard: 'Inicio',
  registerPatient: 'Registrar paciente',
  record: 'Expediente clínico',
  prescriptions: 'Recetas',
  medicines: 'Medicamentos',
  inventory: 'Inventario',
  roles: 'Usuarios y roles',
  assistant: 'Asistente IA',
};

interface Props {
  user: User;
  onLogout: () => void;
}

function AdminLayout({ user, onLogout }: Props) {
  const [currentPage, setCurrentPage] = useState<AdminPage>('dashboard');

  useDocumentTitle(
    user.role || 'Administrador Sistema',
    adminPageTitles[currentPage],
  );

  const renderPage = () => {
    switch (currentPage) {
      case 'dashboard':
        return (
          <DoctorDashboardPage
            currentUser={user}
            onNavigate={(page) => setCurrentPage(page)}
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

      case 'medicines':
        return <MedicinesPage />;

      case 'inventory':
        return <InventoryPage />;

      case 'roles':
        return <RolesPermissionsPage />;

      case 'assistant':
        return <AiAssistantPage />;

      default:
        return (
          <DoctorDashboardPage
            currentUser={user}
            onNavigate={(page) => setCurrentPage(page)}
          />
        );
    }
  };

  return (
    <div className="app-layout">
      <PortalSidebar
        user={user}
        title="Superadministrador"
        eyebrow="SmartPharmacy"
        roleLabel="Superadministrador"
        currentPage={currentPage}
        items={adminSidebarItems}
        variant="admin"
        onNavigate={setCurrentPage}
      />

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