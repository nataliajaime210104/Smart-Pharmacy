import {
  Users,
  ClipboardList,
  CalendarCheck,
  TriangleAlert,
} from 'lucide-react';

function DoctorDashboardPage() {
  return (
    <div>
      <div className="page-title-row">
        <div className="page-icon">
          <Users size={28} />
        </div>

        <div>
          <h1>Dashboard Médico</h1>
          <p className="page-description">
            Vista general del módulo médico para consultar expedientes, tratamientos y actividad reciente.
          </p>
        </div>
      </div>

      <div className="cards-grid">
        <div className="info-card">
          <div className="card-icon blue">
            <Users size={26} />
          </div>
          <h3>Pacientes registrados</h3>
          <strong>128</strong>
          <span>Pacientes activos en el sistema</span>
        </div>

        <div className="info-card">
          <div className="card-icon green">
            <ClipboardList size={26} />
          </div>
          <h3>Recetas pendientes</h3>
          <strong>24</strong>
          <span>Recetas en proceso de validación</span>
        </div>

        <div className="info-card">
          <div className="card-icon purple">
            <CalendarCheck size={26} />
          </div>
          <h3>Consultas del día</h3>
          <strong>16</strong>
          <span>Atenciones médicas programadas</span>
        </div>

        <div className="info-card">
          <div className="card-icon orange">
            <TriangleAlert size={26} />
          </div>
          <h3>Alertas médicas</h3>
          <strong>5</strong>
          <span>Tratamientos con seguimiento requerido</span>
        </div>
      </div>
    </div>
  );
}

export default DoctorDashboardPage;