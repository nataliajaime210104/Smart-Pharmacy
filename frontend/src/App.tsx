import { useState } from 'react';
import type { User } from './shared/types';

import LoginPage from './modules/auth/LoginPage';
import Layout from './shared/components/Layout';
import DoctorDashboardPage from './modules/doctor/DoctorDashboardPage';
import PatientRecordPage from './modules/doctor/PatientRecordPage';
import AiAssistantPage from './modules/ai-assistant/AiAssistantPage';
import RolesPermissionsPage from './modules/admin/RolesPermissionsPage';
import MedicinesPage from './modules/pharmacy/MedicinesPage';
import InventoryPage from './modules/pharmacy/InventoryPage';

type Page =
  | 'dashboard'
  | 'record'
  | 'assistant'
  | 'roles'
  | 'medicines'
  | 'inventory';

function App() {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [currentPage, setCurrentPage] = useState<Page>('dashboard');

  if (!currentUser) {
    return <LoginPage onLogin={setCurrentUser} />;
  }

  const renderPage = () => {
    switch (currentPage) {
      case 'dashboard':
        return <DoctorDashboardPage />;

      case 'record':
        return <PatientRecordPage />;

      case 'assistant':
        return <AiAssistantPage />;

      case 'roles':
        return <RolesPermissionsPage />;

      case 'medicines':
        return <MedicinesPage />;

      case 'inventory':
        return <InventoryPage />;

      default:
        return <DoctorDashboardPage />;
    }
  };

  return (
    <Layout
      currentPage={currentPage}
      onNavigate={setCurrentPage}
      onLogout={() => setCurrentUser(null)}
      user={currentUser}
    >
      {renderPage()}
    </Layout>
  );
}

export default App;