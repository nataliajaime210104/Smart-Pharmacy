import { useState } from 'react';
import LoginPage from './modules/auth/LoginPage';
import Layout from './shared/components/Layout';
import DoctorDashboardPage from './modules/doctor/DoctorDashboardPage';
import PatientRecordPage from './modules/doctor/PatientRecordPage';
import AiAssistantPage from './modules/ai-assistant/AiAssistantPage';
import RolesPermissionsPage from './modules/admin/RolesPermissionsPage';

type Page = 'dashboard' | 'record' | 'assistant' | 'roles';

function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [currentPage, setCurrentPage] = useState<Page>('dashboard');

  if (!isLoggedIn) {
    return <LoginPage onLogin={() => setIsLoggedIn(true)} />;
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
      default:
        return <DoctorDashboardPage />;
    }
  };

  return (
    <Layout
      currentPage={currentPage}
      onNavigate={setCurrentPage}
      onLogout={() => setIsLoggedIn(false)}
    >
      {renderPage()}
    </Layout>
  );
}

export default App;