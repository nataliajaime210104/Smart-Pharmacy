import {
  Home,
  FileText,
  Bot,
  ShieldCheck,
  Pill,
  Boxes,
  ClipboardList,
} from 'lucide-react';

import type { User } from '../types';

type Page =
  | 'dashboard'
  | 'record'
  | 'assistant'
  | 'roles'
  | 'medicines'
  | 'inventory'
  | 'prescriptions';

interface SidebarProps {
  currentPage: Page;
  onNavigate: (page: Page) => void;
  user: User;
}

function Sidebar({ currentPage, onNavigate, user }: SidebarProps) {
  return (
    <aside className="sidebar">
      <div className="brand">
        <img
          src="/assets/logo/smartpharmacy-logo.png"
          alt="SmartPharmacy"
        />
        <h2>Farmacia inteligente</h2>
      </div>

      <nav>

        {/* ================= MÉDICO ================= */}
        {user.role === 'Medico' && (
          <>
            <button
              className={currentPage === 'dashboard' ? 'active' : ''}
              onClick={() => onNavigate('dashboard')}
            >
              <Home className="nav-icon" />
              Inicio
            </button>

            <button
              className={currentPage === 'record' ? 'active' : ''}
              onClick={() => onNavigate('record')}
            >
              <FileText className="nav-icon" />
              Expediente clínico
            </button>

            <button
              className={currentPage === 'prescriptions' ? 'active' : ''}
              onClick={() => onNavigate('prescriptions')}
            >
              <ClipboardList className="nav-icon" />
              Recetas
            </button>

            <button
              className={currentPage === 'assistant' ? 'active' : ''}
              onClick={() => onNavigate('assistant')}
            >
              <Bot className="nav-icon" />
              Asistente IA
            </button>
          </>
        )}

        {/* ================= ADMINISTRADOR SISTEMA ================= */}
        {user.role === 'Administrador Sistema' && (
          <>
            <button
              className={currentPage === 'roles' ? 'active' : ''}
              onClick={() => onNavigate('roles')}
            >
              <ShieldCheck className="nav-icon" />
              Roles y permisos
            </button>
          </>
        )}

        {/* ================= ADMINISTRADOR FARMACIA ================= */}
        {user.role === 'Administrador Farmacia' && (
          <>
            <button
              className={currentPage === 'medicines' ? 'active' : ''}
              onClick={() => onNavigate('medicines')}
            >
              <Pill className="nav-icon" />
              Medicamentos
            </button>

            <button
              className={currentPage === 'inventory' ? 'active' : ''}
              onClick={() => onNavigate('inventory')}
            >
              <Boxes className="nav-icon" />
              Inventario
            </button>
          </>
        )}

        {/* ================= PACIENTE ================= */}
        {user.role === 'Paciente' && (
          <>
            <button
              className={currentPage === 'prescriptions' ? 'active' : ''}
              onClick={() => onNavigate('prescriptions')}
            >
              <ClipboardList className="nav-icon" />
              Mis recetas
            </button>
          </>
        )}

      </nav>
    </aside>
  );
}

export default Sidebar;