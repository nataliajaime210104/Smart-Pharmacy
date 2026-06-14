import {
  Home,
  FileText,
  Bot,
  ShieldCheck,
  Pill,
  Boxes,
} from 'lucide-react';

type Page =
  | 'dashboard'
  | 'record'
  | 'assistant'
  | 'roles'
  | 'medicines'
  | 'inventory';

interface SidebarProps {
  currentPage: Page;
  onNavigate: (page: Page) => void;
}

function Sidebar({ currentPage, onNavigate }: SidebarProps) {
  return (
    <aside className="sidebar">
      <div className="brand">
        <img src="/assets/logo/smartpharmacy-logo.png" alt="SmartPharmacy" />
        <h2>Farmacia inteligente</h2>
      </div>

      <nav>
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
          className={currentPage === 'assistant' ? 'active' : ''}
          onClick={() => onNavigate('assistant')}
        >
          <Bot className="nav-icon" />
          Asistente IA
        </button>

        <button
          className={currentPage === 'roles' ? 'active' : ''}
          onClick={() => onNavigate('roles')}
        >
          <ShieldCheck className="nav-icon" />
          Roles y permisos
        </button>

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
      </nav>
    </aside>
  );
}

export default Sidebar;