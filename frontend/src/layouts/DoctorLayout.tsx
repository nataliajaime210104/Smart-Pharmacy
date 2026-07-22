import { useState } from 'react';

import type { User } from '../shared/types';

import Navbar from '../shared/components/Navbar';
import PortalSidebar, { type PortalSidebarItem, } from '../shared/components/PortalSidebar';
import useDocumentTitle from '../shared/hooks/useDocumentTitle';

import DoctorDashboardPage from '../modules/doctor/DoctorDashboardPage';
import PatientRecordPage from '../modules/doctor/PatientRecordPage';
import PrescriptionsPage from '../modules/doctor/PrescriptionsPage';
import AiAssistantPage from '../modules/ai-assistant/AiAssistantPage';
import RegisterPatientPage from '../modules/doctor/RegisterPatientPage';
import MedicationHistoryPage from '../modules/doctor/MedicationHistoryPage';

import {
  Home,
  UserPlus,
  FileText,
  ClipboardList,
  Bot,
  ChartNoAxesCombined,
} from 'lucide-react';

type DoctorPage =
  | 'dashboard'
  | 'registerPatient'
  | 'record'
  | 'prescriptions'
  | 'medicationHistory'
  | 'assistant';

  const doctorSidebarItems:
  PortalSidebarItem<DoctorPage>[] = [
    {
      id: 'dashboard',
      label: 'Inicio',
      description: 'Resumen de actividad',
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
      description: 'Historial y seguimiento',
      icon: FileText,
    },
    {
      id: 'prescriptions',
      label: 'Recetas',
      description: 'Prescripción médica',
      icon: ClipboardList,
    },
    {
      id: 'medicationHistory',
      label: 'Historial de medicamentos',
      description: 'Adherencia terapéutica',
      icon: ChartNoAxesCombined,
    },
    {
      id: 'assistant',
      label: 'Asistente IA',
      description: 'Apoyo clínico inteligente',
      icon: Bot,
    },
  ];

const doctorPageTitles: Record<DoctorPage, string> = {
  dashboard: 'Inicio',
  registerPatient: 'Registrar paciente',
  record: 'Expediente clínico',
  prescriptions: 'Recetas',
  medicationHistory: 'Historial de medicamentos',
  assistant: 'Asistente IA',
};

interface Props {
  user: User;
  onLogout: () => void;
}

function DoctorLayout({ user, onLogout }: Props) {
  const [currentPage, setCurrentPage] = useState<DoctorPage>('dashboard');

  useDocumentTitle(
    user.role || 'Medico',
    doctorPageTitles[currentPage],
  );

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

      case 'medicationHistory':
        return <MedicationHistoryPage currentUser={user} />;

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
      <PortalSidebar
        user={user}
        title="Panel Médico"
        eyebrow="SmartPharmacy"
        roleLabel="Médico"
        currentPage={currentPage}
        items={doctorSidebarItems}
        variant="doctor"
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

export default DoctorLayout;