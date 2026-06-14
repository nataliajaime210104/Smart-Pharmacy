import { LogOut, Stethoscope } from 'lucide-react';
import type { User } from '../types';

interface NavbarProps {
  onLogout: () => void;
  user: User;
}

function Navbar({ onLogout, user }: NavbarProps) {
  return (
    <header className="navbar">
      <div className="navbar-title">
        <div className="navbar-icon">
          <Stethoscope size={24} />
        </div>

        <div>
          <h2>Panel Médico</h2>
          <span>
            {user.name} / {user.role}
          </span>
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