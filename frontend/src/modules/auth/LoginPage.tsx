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

interface LoginPageProps {
  onLogin: () => void;
}

function LoginPage({ onLogin }: LoginPageProps) {
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
          <div className="login-card-header">
            <img
              className="login-logo"
              src="/assets/logo/smartpharmacy-logo.png"
              alt="SmartPharmacy"
            />

            <h2>Bienvenido</h2>
            <p>Inicia sesión para acceder al panel médico.</p>
          </div>

          <div className="form-group">
            <label>Correo institucional</label>

            <div className="login-input-wrapper">
              <Mail size={18} />
              <input type="email" placeholder="medico@hospital.com" />
            </div>
          </div>

          <div className="form-group">
            <label>Contraseña</label>

            <div className="login-input-wrapper">
              <LockKeyhole size={18} />
              <input type="password" placeholder="********" />
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
          </div>

          <button className="login-submit-button" onClick={onLogin}>
            Iniciar sesión
            <ArrowRight size={18} />
          </button>

          <div className="login-demo-note">
            <ShieldCheck size={17} />
            <span>Maquetado HU-01: Autenticación segura del médico</span>
          </div>
        </section>
      </div>
    </div>
  );
}

export default LoginPage;