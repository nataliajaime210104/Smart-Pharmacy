import { LogOut } from 'lucide-react';

import type { User } from '../types';
import UserAvatar from './UserAvatar';

interface Props {
  user: User;
  onLogout: () => void;
}

function Navbar({ user, onLogout }: Props) {
  return (
    <header className="navbar">
      <div>
        <h3>SmartPharmacy</h3>
      </div>

      <div className="navbar-actions">
        <div className="navbar-profile">
          <UserAvatar
            user={user}
            size="md"
          />

          <div className="navbar-profile-info">
            <strong>{user.name}</strong>
            <span>{user.role}</span>
          </div>
        </div>

        <button
          type="button"
          className="logout-button"
          onClick={onLogout}
        >
          <LogOut size={18} />
          Salir
        </button>
      </div>
    </header>
  );
}

export default Navbar;