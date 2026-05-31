import { LogOut, Stethoscope } from 'lucide-react';

interface NavbarProps {
  onLogout: () => void;
}

function Navbar({ onLogout }: NavbarProps) {
  return (
    <header className="navbar">
      <div className="navbar-title">
        <div className="navbar-icon">
          <Stethoscope size={24} />
        </div>

        <div>
          <h2>Panel Médico</h2>
          <span>Hospital General / SmartPharmacy</span>
        </div>
      </div>

      <button className="logout-button" onClick={onLogout}>
        <LogOut size={18} />
        Cerrar sesión
      </button>
    </header>
  );
}

export default Navbar;