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
import { saveAuthSession } from '../../shared/services/auth-storage';
import logoPharmacy from '../../assets/logo_pharmacy.png';

interface RegisterPageProps {
  onRegister: (user: UserType) => void;
  onShowLogin: () => void;
}

function RegisterPage({ onRegister, onShowLogin }: RegisterPageProps) {
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
        name: `${name.trim()} ${lastname.trim()}`.trim(),
        email,
        password,
        password_confirmation: confirmPassword,
      });

      saveAuthSession(response);
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
    <div className="login-page register-page">
      <div className="login-background-glow glow-one"></div>
      <div className="login-background-glow glow-two"></div>

      <div className="login-shell register-shell">
        <section className="register-hero">
          <div className="register-hero-content">
            <div className="login-hero-badge">
              <Hospital size={18} />
              Plataforma hospitalaria
            </div>

            <h1>Crear una nueva cuenta</h1>

            <p>
              Registra tus datos para acceder de forma segura al sistema
              SmartPharmacy.
            </p>

            <div className="register-hero-security">
              <ShieldCheck size={19} />
              <span>Información protegida y acceso administrado por perfiles.</span>
            </div>
          </div>

          <div className="register-illustration" aria-hidden="true">
            <img
              src={logoPharmacy}
              alt=""
              className="hero-image"
            />
          </div>
        </section>

        <section className="login-card register-card">
          <form className="register-form" onSubmit={handleRegister}>
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

            <div className="register-form-grid">
              <div className="form-group">
                <label htmlFor="register-name">Nombre</label>

                <div className="login-input-wrapper">
                  <User size={18} />
                  <input
                    id="register-name"
                    type="text"
                    value={name}
                    onChange={(event) => setName(event.target.value)}
                    placeholder="Juan"
                    autoComplete="given-name"
                    required
                  />
                </div>
              </div>

              <div className="form-group">
                <label htmlFor="register-lastname">Apellido</label>

                <div className="login-input-wrapper">
                  <User size={18} />
                  <input
                    id="register-lastname"
                    type="text"
                    value={lastname}
                    onChange={(event) => setLastname(event.target.value)}
                    placeholder="Pérez"
                    autoComplete="family-name"
                    required
                  />
                </div>
              </div>

              <div className="form-group register-field-full">
                <label htmlFor="register-email">Correo</label>

                <div className="login-input-wrapper">
                  <Mail size={18} />
                  <input
                    id="register-email"
                    type="email"
                    value={email}
                    onChange={(event) => setEmail(event.target.value)}
                    placeholder="usuario@hospital.com"
                    autoComplete="email"
                    required
                  />
                </div>
              </div>

              <div className="form-group">
                <label htmlFor="register-password">Contraseña</label>

                <div className="login-input-wrapper">
                  <LockKeyhole size={18} />
                  <input
                    id="register-password"
                    type="password"
                    value={password}
                    onChange={(event) => setPassword(event.target.value)}
                    placeholder="Mínimo 8 caracteres"
                    autoComplete="new-password"
                    minLength={8}
                    required
                  />
                </div>
              </div>

              <div className="form-group">
                <label htmlFor="register-password-confirmation">
                  Confirmar contraseña
                </label>

                <div className="login-input-wrapper">
                  <LockKeyhole size={18} />
                  <input
                    id="register-password-confirmation"
                    type="password"
                    value={confirmPassword}
                    onChange={(event) =>
                      setConfirmPassword(event.target.value)
                    }
                    placeholder="Repite tu contraseña"
                    autoComplete="new-password"
                    minLength={8}
                    required
                  />
                </div>
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
              <button
                type="button"
                className="link-button register-login-link"
                onClick={onShowLogin}
              >
                ¿Ya tienes cuenta? Inicia sesión
              </button>
            </div>
          </form>
        </section>
      </div>
    </div>
  );
}

export default RegisterPage;