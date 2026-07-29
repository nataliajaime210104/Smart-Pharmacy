import { useEffect, useState } from 'react';

import type { User } from './shared/types';

import LoginPage from './modules/auth/LoginPage';
import RegisterPage from './modules/auth/RegisterPage';
import { getAuthenticatedUser, logout } from './modules/auth/services/auth.service';

import DoctorLayout from './layouts/DoctorLayout';
import AdminLayout from './layouts/AdminLayout';
import PharmacyLayout from './layouts/PharmacyLayout';
import PatientLayout from './layouts/PatientLayout';
import {
  clearAuthSession,
  getAuthToken,
  getStoredUser,
  updateStoredUser,
} from './shared/services/auth-storage';
import { disconnectRealtime } from './shared/services/realtime';
import { disablePushNotifications } from './modules/notifications/push-notifications';

function App() {
  const [currentUser, setCurrentUser] = useState<User | null>(() => getStoredUser());
  const [authPage, setAuthPage] = useState<'login' | 'register'>('login');
  const [checkingSession, setCheckingSession] = useState(Boolean(getAuthToken()));

  useEffect(() => {
    if (!getAuthToken()) {
      setCheckingSession(false);
      return;
    }

    void getAuthenticatedUser()
      .then((response) => {
        setCurrentUser(response.data);
        updateStoredUser(response.data);
      })
      .catch(() => {
        clearAuthSession();
        setCurrentUser(null);
      })
      .finally(() => setCheckingSession(false));
  }, []);

  useEffect(() => {
    if (currentUser) {
      return;
    }

    const moduleName = authPage === 'login' ? 'Iniciar sesión' : 'Registro';
    document.title = `Smart Pharmacy | ${moduleName}`;
  }, [currentUser, authPage]);

  const handleLogin = (user: User) => {
    setCurrentUser(user);
  };

  const handleCurrentUserUpdated = (user: User) => {
    setCurrentUser(user);
    updateStoredUser(user);
  };

  const handleLogout = () => {
    void disablePushNotifications()
      .catch(() => undefined)
      .then(() => logout().catch(() => undefined))
      .finally(() => {
        disconnectRealtime();
        clearAuthSession();
        setCurrentUser(null);
        window.history.replaceState({}, '', '/');
      });
  };

  if (checkingSession) {
    return (
      <div className="session-loading-screen">
        <img src="/assets/logo/smartpharmacy-logo.png" alt="SmartPharmacy" />
        <strong>Restaurando sesión...</strong>
      </div>
    );
  }

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
      return <DoctorLayout user={currentUser} onLogout={handleLogout} />;

    case 'Administrador Sistema':
      return (
        <AdminLayout
          user={currentUser}
          onLogout={handleLogout}
          onCurrentUserUpdated={handleCurrentUserUpdated}
        />
      );

    case 'Administrador Farmacia':
      return <PharmacyLayout user={currentUser} onLogout={handleLogout} />;

    case 'Paciente':
      return <PatientLayout user={currentUser} onLogout={handleLogout} />;

    default:
      return <DoctorLayout user={currentUser} onLogout={handleLogout} />;
  }
}

export default App;
