import {
  ShieldCheck,
  UserRound,
  UserCog,
  Stethoscope,
  Pill,
  HeartPulse,
} from 'lucide-react';
import { usersMock } from '../../mocks/users.mock';

function RolesPermissionsPage() {
  const getRoleIcon = (role: string) => {
    if (role === 'Medico') return <Stethoscope size={16} />;
    if (role === 'Paciente') return <HeartPulse size={16} />;
    if (role === 'Administrador Farmacia') return <Pill size={16} />;
    return <UserCog size={16} />;
  };

  return (
    <div>
      <div className="page-title-row">
        <div className="page-icon">
          <ShieldCheck size={28} />
        </div>

        <div>
          <h1>Roles y Permisos</h1>
          <p className="page-description">
            HU-17: Control de acceso por perfil para proteger la información médica y operativa.
          </p>
        </div>
      </div>

      <div className="table-card">
        <table>
          <thead>
            <tr>
              <th>Usuario</th>
              <th>Correo</th>
              <th>Rol</th>
              <th>Estado</th>
              <th>Permisos principales</th>
            </tr>
          </thead>

          <tbody>
            {usersMock.map((user) => (
              <tr key={user.id}>
                <td>
                  <div className="table-user">
                    <div className="table-avatar">
                      <UserRound size={16} />
                    </div>
                    {user.name}
                  </div>
                </td>
                <td>{user.email}</td>
                <td>
                  <span className="role-badge">
                    {getRoleIcon(user.role)}
                    {user.role}
                  </span>
                </td>
                <td>
                  <span className="status-badge">{user.status}</span>
                </td>
                <td>
                  {user.role === 'Medico' && 'Expedientes, Recetas, Seguimiento'}
                  {user.role === 'Paciente' && 'Tratamientos, Calendario, Asistente IA'}
                  {user.role === 'Administrador Farmacia' && 'Inventario, Reabastecimiento'}
                  {user.role === 'Administrador Sistema' && 'Usuarios, Roles, Auditoría'}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default RolesPermissionsPage;