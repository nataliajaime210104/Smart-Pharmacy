import { useState } from 'react';
import {
  ArrowRight,
  Hospital,
  Mail,
  LockKeyhole,
  User,
  ShieldCheck,
} from 'lucide-react';

import type { User as UserType } from '../../shared/types';
import { register } from './services/auth.service';

interface RegisterPageProps {
  onRegister: (user: UserType) => void;
  onShowLogin: () => void;
}

function RegisterPage({ onRegister,   onShowLogin, }: RegisterPageProps) {
  const [name, setName] = useState('');
  const [lastname, setLastname] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const handleRegister = async (
    event: React.FormEvent<HTMLFormElement>
  ) => {
    event.preventDefault();

    if (password !== confirmPassword) {
      setErrorMessage('Las contraseñas no coinciden.');
      return;
    }

    try {
      setLoading(true);
      setErrorMessage('');

      const response = await register({
    name,
    email,
    password,
    password_confirmation: confirmPassword,
});

      onRegister(response.user);
    } catch (error) {
      setErrorMessage(
        error instanceof Error
          ? error.message
          : 'No fue posible crear la cuenta.'
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-page">
      <div className="login-background-glow glow-one"></div>
      <div className="login-background-glow glow-two"></div>

      <div className="login-shell">
        

        <section className="register-hero">
            <img
                src="/Smart-Pharmacy/frontend/src/assets/logo_pharmacy.png"
                
                className="hero-image"
            />
          <div className="login-hero-badge">
            <Hospital size={18} />
            Plataforma hospitalaria
          </div>

          <h1>Crear una nueva cuenta</h1>

          <p>
            Registra un nuevo usuario para acceder al sistema SmartPharmacy.
          </p>
        </section>

        <section className="login-card">
          <form onSubmit={handleRegister}>

            <div className="login-card-header">
              <img
                className="login-logo"
                src="/assets/logo/smartpharmacy-logo.png"
                alt="SmartPharmacy"
              />

              <h2>Crear cuenta</h2>
              <p>Completa la información para registrarte.</p>
            </div>

            {errorMessage && (
              <div className="login-error">
                {errorMessage}
              </div>
            )}

            <div className="form-group">
              <label>Nombre</label>

              <div className="login-input-wrapper">
                <User size={18} />
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Juan"
                />
              </div>
            </div>

            <div className="form-group">
              <label>Apellido</label>

              <div className="login-input-wrapper">
                <User size={18} />
                <input
                  type="text"
                  value={lastname}
                  onChange={(e) => setLastname(e.target.value)}
                  placeholder="Pérez"
                />
              </div>
            </div>

            <div className="form-group">
              <label>Correo</label>

              <div className="login-input-wrapper">
                <Mail size={18} />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="usuario@hospital.com"
                />
              </div>
            </div>

            <div className="form-group">
              <label>Contraseña</label>

              <div className="login-input-wrapper">
                <LockKeyhole size={18} />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
              </div>
            </div>

            <div className="form-group">
              <label>Confirmar contraseña</label>

              <div className="login-input-wrapper">
                <LockKeyhole size={18} />
                <input
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                />
              </div>
            </div>

            <button
              className="login-submit-button"
              type="submit"
              disabled={loading}
            >
              {loading ? 'Creando cuenta...' : 'Crear cuenta'}
              <ArrowRight size={18} />
            </button>

            <div className="login-demo-note">
              <ShieldCheck size={17} />
              <span>Los datos serán almacenados en Laravel y MySQL.</span>
            </div>

            <div className="login-options">
                <center>
                <button
                    type="button"
                    className="link-button"
                    onClick={onShowLogin}
                >
                    ¿Ya tienes cuenta? Inicia sesión
                </button>
                </center>
            </div>

          </form>
        </section>

      </div>
    </div>
  );
}

export default RegisterPage;