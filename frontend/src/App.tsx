import { useEffect, useState } from 'react';

import type { User } from './shared/types';

import LoginPage from './modules/auth/LoginPage';
import RegisterPage from './modules/auth/RegisterPage';

import DoctorLayout from './layouts/DoctorLayout';
import AdminLayout from './layouts/AdminLayout';
import PharmacyLayout from './layouts/PharmacyLayout';
import PatientLayout from './layouts/PatientLayout';

function App() {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [authPage, setAuthPage] = useState<'login' | 'register'>('login');

  useEffect(() => {
  if (currentUser) {
    return;
  }

  const moduleName = authPage === 'login' ? 'Iniciar sesión' : 'Registro';
  document.title = `Smart Pharmacy | ${moduleName}`; }, [currentUser, authPage]);

  const handleLogin = (user: User) => {
    setCurrentUser(user);
  };

  if (!currentUser) {
    return authPage === 'login' ? (
      <LoginPage
        onLogin={handleLogin}
        onShowRegister={() => setAuthPage('register')}
      />
    ) : (
      <RegisterPage
        onRegister={handleLogin}
        onShowLogin={() => setAuthPage('login')}
      />
    );
  }

  switch (currentUser.role) {
    case 'Medico':
      return (
        <DoctorLayout
          user={currentUser}
          onLogout={() => setCurrentUser(null)}
        />
      );

    case 'Administrador Sistema':
      return (
        <AdminLayout
          user={currentUser}
          onLogout={() => setCurrentUser(null)}
        />
      );

    case 'Administrador Farmacia':
      return (
        <PharmacyLayout
          user={currentUser}
          onLogout={() => setCurrentUser(null)}
        />
      );

    case 'Paciente':
      return (
        <PatientLayout
          user={currentUser}
          onLogout={() => setCurrentUser(null)}
        />
      );

    default:
      return (
        <DoctorLayout
          user={currentUser}
          onLogout={() => setCurrentUser(null)}
        />
      );
  }
}

export default App;