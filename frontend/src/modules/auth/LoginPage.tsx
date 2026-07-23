import { useState } from 'react';
import {
  ArrowRight,
  Bot,
  Fingerprint,
  Hospital,
  LockKeyhole,
  Mail,
  Pill,
  ShieldCheck,
} from 'lucide-react';

import type { User } from '../../shared/types';
import { login } from './services/auth.service';

interface LoginPageProps {
  onLogin: (user: User) => void;
  onShowRegister: () => void;
}

function LoginPage({ onLogin,  onShowRegister, }: LoginPageProps) {
  const [email, setEmail] = useState('natalia@hospital.com');
  const [password, setPassword] = useState('12345678');
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const handleLogin = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    try {
      setLoading(true);
      setErrorMessage('');

      const response = await login(email, password);

      onLogin(response.user);
    } catch (error) {
      setErrorMessage(
        error instanceof Error
          ? error.message
          : 'No fue posible iniciar sesión.'
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
        <section className="login-hero">
          <div className="login-hero-badge">
            <Hospital size={18} />
            Plataforma hospitalaria
          </div>

          <h1>Farmacia inteligente para gestión médica segura</h1>

          <p>
            SmartPharmacy integra expedientes clínicos, recetas electrónicas,
            validación biométrica, inventario y asistencia inteligente para mejorar
            la entrega de medicamentos.
          </p>

          <div className="login-feature-grid">
            <div className="login-feature-card">
              <div className="login-feature-icon blue">
                <Pill size={22} />
              </div>
              <div>
                <strong>Recetas digitales</strong>
                <span>Prescripción médica controlada</span>
              </div>
            </div>

            <div className="login-feature-card">
              <div className="login-feature-icon green">
                <Fingerprint size={22} />
              </div>
              <div>
                <strong>Validación biométrica</strong>
                <span>Entrega segura al paciente</span>
              </div>
            </div>

            <div className="login-feature-card">
              <div className="login-feature-icon purple">
                <Bot size={22} />
              </div>
              <div>
                <strong>Asistente IA</strong>
                <span>Apoyo preventivo al paciente</span>
              </div>
            </div>

            <div className="login-feature-card">
              <div className="login-feature-icon orange">
                <ShieldCheck size={22} />
              </div>
              <div>
                <strong>Roles y permisos</strong>
                <span>Acceso protegido por perfil</span>
              </div>
            </div>
          </div>
        </section>

        <section className="login-card">
          <form onSubmit={handleLogin}>
            <div className="login-card-header">
              <img
                className="login-logo"
                src="/assets/logo/smartpharmacy-logo.png"
                alt="SmartPharmacy"
              />

              <h2>Bienvenido</h2>
              <p>Inicia sesión para acceder al panel médico.</p>
            </div>

            {errorMessage && (
              <div className="login-error">
                {errorMessage}
              </div>
            )}

            <div className="form-group">
              <label>Correo institucional</label>

              <div className="login-input-wrapper">
                <Mail size={18} />
                <input
                  type="email"
                  placeholder="medico@hospital.com"
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                />
              </div>
            </div>

            <div className="form-group">
              <label>Contraseña</label>

              <div className="login-input-wrapper">
                <LockKeyhole size={18} />
                <input
                  type="password"
                  placeholder="********"
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                />
              </div>
            </div>

            <div className="login-options">
              <label className="remember-option">
                <input type="checkbox" />
                Recordar sesión
              </label>

              <button type="button" className="link-button">
                Recuperar acceso
              </button>

              <button
                type="button"
                className="link-button"
                onClick={onShowRegister}
              >
                Crear cuenta
              </button>

   
                
            </div>

            

           


            

            <button className="login-submit-button" type="submit" disabled={loading}>
              {loading ? 'Validando...' : 'Iniciar sesión'}
              <ArrowRight size={18} />
            </button>
          </form>
        </section>
      </div>
    </div>
  );
}

export default LoginPage;