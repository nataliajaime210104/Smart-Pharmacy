import { useEffect, useRef, useState } from 'react';
import {
  ShieldCheck,
  UserCog,
  Stethoscope,
  Pill,
  HeartPulse,
  Save,
  RotateCcw,
  UserPlus,
  Pencil,
  UserX,
  X,
  ImagePlus,
} from 'lucide-react';

import type {
  User,
  UserFormData,
  UserRole,
  UserStatus,
} from '../../shared/types';

import UserAvatar from '../../shared/components/UserAvatar';

import {
  createUser,
  deactivateUser,
  getUsers,
  updateUser,
} from './services/users.service';

const emptyForm: UserFormData = {
  name: '',
  email: '',
  password: '',
  role: 'Paciente',
  status: 'Activo',
  patientAge: '',
  profilePhoto: null,
};

const roles: UserRole[] = [
  'Medico',
  'Paciente',
  'Administrador Farmacia',
  'Administrador Sistema',
];

const statuses: UserStatus[] = ['Activo', 'Inactivo'];

function RolesPermissionsPage() {
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const [users, setUsers] = useState<User[]>([]);
  const [formData, setFormData] = useState<UserFormData>(emptyForm);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [photoPreviewUrl, setPhotoPreviewUrl] = useState('');

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  async function loadUsers() {
    try {
      setLoading(true);
      setErrorMessage('');

      const data = await getUsers();
      setUsers(data);
    } catch {
      setErrorMessage('No fue posible cargar los usuarios.');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadUsers();
  }, []);

  const getRoleIcon = (role: string) => {
    if (role === 'Medico') return <Stethoscope size={16} />;
    if (role === 'Paciente') return <HeartPulse size={16} />;
    if (role === 'Administrador Farmacia') return <Pill size={16} />;

    return <UserCog size={16} />;
  };

  const getPermissions = (role: string) => {
    if (role === 'Medico') return 'Expedientes, Recetas, Seguimiento';
    if (role === 'Paciente') return 'Tratamientos, Calendario, Asistente IA';
    if (role === 'Administrador Farmacia') return 'Inventario, Reabastecimiento';

    return 'Usuarios, Roles, Auditoría y acceso total';
  };

  const handleChange = (
    field: keyof UserFormData,
    value: string | number
  ) => {
    setFormData((current) => ({
      ...current,
      [field]: value,
    }));
  };

  const clearFileInput = () => {
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }

    setPhotoPreviewUrl('');
  };

  const handleProfilePhotoChange = (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = event.target.files?.[0] ?? null;

    if (!file) {
      setFormData((current) => ({
        ...current,
        profilePhoto: null,
      }));

      setPhotoPreviewUrl('');
      return;
    }

    const allowedTypes = [
      'image/jpeg',
      'image/jpg',
      'image/png',
      'image/webp',
    ];

    const maxSize = 2 * 1024 * 1024;

    if (!allowedTypes.includes(file.type)) {
      setErrorMessage('La foto debe ser una imagen JPG, PNG o WEBP.');
      clearFileInput();

      setFormData((current) => ({
        ...current,
        profilePhoto: null,
      }));

      return;
    }

    if (file.size > maxSize) {
      setErrorMessage('La foto no debe pesar más de 2 MB.');
      clearFileInput();

      setFormData((current) => ({
        ...current,
        profilePhoto: null,
      }));

      return;
    }

    setErrorMessage('');

    setFormData((current) => ({
      ...current,
      profilePhoto: file,
    }));

    setPhotoPreviewUrl(URL.createObjectURL(file));
  };

  const openCreateForm = () => {
    setEditingUser(null);
    setFormData(emptyForm);
    setErrorMessage('');
    setSuccessMessage('');
    clearFileInput();
    setIsFormOpen(true);
  };

  const closeForm = () => {
    setFormData(emptyForm);
    setEditingUser(null);
    setErrorMessage('');
    setSuccessMessage('');
    clearFileInput();
    setIsFormOpen(false);
  };

  const handleEdit = (user: User) => {
    setEditingUser(user);

    setFormData({
      name: user.name,
      email: user.email,
      password: '',
      role: user.role,
      status: user.status,
      patientAge: user.patientAge ?? '',
      profilePhoto: null,
    });

    setErrorMessage('');
    setSuccessMessage('');
    clearFileInput();
    setIsFormOpen(true);

    window.scrollTo({
      top: 0,
      behavior: 'smooth',
    });
  };

  const buildDataToSave = (): UserFormData => {
    return {
      ...formData,
      patientAge:
        formData.role === 'Paciente' && formData.patientAge !== ''
          ? Number(formData.patientAge)
          : undefined,
    };
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    try {
      setSaving(true);
      setErrorMessage('');
      setSuccessMessage('');

      const dataToSave = buildDataToSave();

      if (editingUser) {
        await updateUser(editingUser.id, dataToSave);
        setSuccessMessage('Usuario actualizado correctamente.');
      } else {
        await createUser(dataToSave);
        setSuccessMessage('Usuario creado correctamente.');
      }

      await loadUsers();

      setTimeout(() => {
        closeForm();
      }, 700);
    } catch (error) {
      setErrorMessage(
        error instanceof Error
          ? error.message
          : 'No fue posible guardar el usuario.'
      );
    } finally {
      setSaving(false);
    }
  };

  const handleDeactivate = async (user: User) => {
    const confirmDeactivate = window.confirm(
      `¿Deseas desactivar al usuario ${user.name}?`
    );

    if (!confirmDeactivate) {
      return;
    }

    try {
      setErrorMessage('');
      setSuccessMessage('');

      await deactivateUser(user.id);
      setSuccessMessage('Usuario desactivado correctamente.');
      await loadUsers();
    } catch {
      setErrorMessage('No fue posible desactivar el usuario.');
    }
  };

  return (
    <div>
      <div className="page-header-with-action">
        <div className="page-title-row">
          <div className="page-icon">
            <ShieldCheck size={28} />
          </div>

          <div>
            <h1>Usuarios, Roles y Permisos</h1>
            <p className="page-description">
              Administración de cuentas del sistema, asignación de roles,
              edición de usuarios, foto de perfil y control de acceso por perfil.
            </p>
          </div>
        </div>

        <button type="button" onClick={openCreateForm}>
          <UserPlus size={18} />
          Nuevo usuario
        </button>
      </div>

      {errorMessage && !isFormOpen && (
        <div className="form-alert error">{errorMessage}</div>
      )}

      {successMessage && !isFormOpen && (
        <div className="form-alert success">{successMessage}</div>
      )}

      {isFormOpen && (
        <div className="form-drawer">
          <div className="form-drawer-header">
            <div className="section-heading">
              {editingUser ? <Pencil size={24} /> : <UserPlus size={24} />}
              <h3>{editingUser ? 'Editar usuario' : 'Registrar nuevo usuario'}</h3>
            </div>

            <button type="button" className="icon-close-button" onClick={closeForm}>
              <X size={20} />
            </button>
          </div>

          {errorMessage && (
            <div className="form-alert error">{errorMessage}</div>
          )}

          {successMessage && (
            <div className="form-alert success">{successMessage}</div>
          )}

          <form onSubmit={handleSubmit} className="user-form">
            <div className="form-drawer-grid">
              <div className="form-group">
                <label>Nombre completo</label>
                <input
                  type="text"
                  placeholder="Ejemplo: Dra. Natalia Jaime"
                  value={formData.name}
                  onChange={(event) => handleChange('name', event.target.value)}
                  required
                />
              </div>

              <div className="form-group">
                <label>Correo institucional</label>
                <input
                  type="email"
                  placeholder="usuario@hospital.com"
                  value={formData.email}
                  onChange={(event) => handleChange('email', event.target.value)}
                  required
                />
              </div>

              <div className="form-group form-full">
                <label>Foto de perfil</label>

                <div className="profile-photo-field">
                  <div className="profile-photo-preview">
                    {photoPreviewUrl ? (
                      <img
                        src={photoPreviewUrl}
                        alt="Vista previa"
                      />
                    ) : editingUser ? (
                      <UserAvatar
                        user={editingUser}
                        size="lg"
                      />
                    ) : (
                      <ImagePlus size={28} />
                    )}
                  </div>

                  <div className="profile-photo-input">
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/png,image/jpeg,image/jpg,image/webp"
                      onChange={handleProfilePhotoChange}
                    />

                    <p className="form-helper-text">
                      Formatos permitidos: JPG, PNG o WEBP. Tamaño máximo: 2 MB.
                    </p>

                    {formData.profilePhoto && (
                      <p className="form-helper-text">
                        Imagen seleccionada: {formData.profilePhoto.name}
                      </p>
                    )}

                    {editingUser?.profilePhotoUrl && !formData.profilePhoto && (
                      <p className="form-helper-text">
                        Si no seleccionas una nueva imagen, se conservará la foto actual.
                      </p>
                    )}
                  </div>
                </div>
              </div>

              <div className="form-group">
                <label>
                  Contraseña {editingUser && <span className="label-hint">(opcional)</span>}
                </label>
                <input
                  type="password"
                  placeholder={
                    editingUser
                      ? 'Dejar vacío para conservar la contraseña'
                      : 'Mínimo 8 caracteres'
                  }
                  value={formData.password ?? ''}
                  onChange={(event) => handleChange('password', event.target.value)}
                  required={!editingUser}
                />
              </div>

              {formData.role === 'Paciente' && (
                <div className="form-group">
                  <label>Edad del paciente</label>
                  <input
                    type="number"
                    min={0}
                    max={120}
                    placeholder="Ejemplo: 28"
                    value={formData.patientAge ?? ''}
                    onChange={(event) =>
                      handleChange(
                        'patientAge',
                        event.target.value === '' ? '' : Number(event.target.value)
                      )
                    }
                  />
                </div>
              )}

              <div className="form-row">
                <div className="form-group">
                  <label>Rol</label>
                  <select
                    value={formData.role}
                    onChange={(event) =>
                      handleChange('role', event.target.value as UserRole)
                    }
                  >
                    {roles.map((role) => (
                      <option key={role} value={role}>
                        {role}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="form-group">
                  <label>Estado</label>
                  <select
                    value={formData.status}
                    onChange={(event) =>
                      handleChange('status', event.target.value as UserStatus)
                    }
                  >
                    {statuses.map((status) => (
                      <option key={status} value={status}>
                        {status}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

            <div className="form-actions">
              <button type="submit" disabled={saving}>
                <Save size={18} />
                {saving
                  ? 'Guardando...'
                  : editingUser
                    ? 'Actualizar usuario'
                    : 'Crear usuario'}
              </button>

              <button type="button" className="secondary-button" onClick={closeForm}>
                <RotateCcw size={18} />
                Cancelar
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="compact-role-panel">
        <div className="section-heading">
          <ShieldCheck size={24} />
          <h3>Perfiles del sistema</h3>
        </div>

        <div className="compact-role-list">
          {roles.map((role) => (
            <div className="compact-role-item" key={role}>
              <span className="role-badge">
                {getRoleIcon(role)}
                {role}
              </span>
              <p>{getPermissions(role)}</p>
            </div>
          ))}
        </div>
      </div>

      {loading && (
        <div className="state-card">Cargando usuarios del sistema...</div>
      )}

      {!loading && (
        <div className="table-card users-table">
          <table>
            <thead>
              <tr>
                <th>Usuario</th>
                <th>Rol</th>
                <th>Estado</th>
                <th>Edad</th>
                <th>Permisos principales</th>
                <th>Acciones</th>
              </tr>
            </thead>

            <tbody>
              {users.map((user) => (
                <tr key={user.id}>
                  <td>
                    <div className="user-table-profile">
                      <UserAvatar
                        user={user}
                        size="sm"
                      />

                      <div>
                        <strong>{user.name}</strong>
                        <span>{user.email}</span>
                      </div>
                    </div>
                  </td>

                  <td>
                    <span className="role-badge">
                      {getRoleIcon(user.role)}
                      {user.role}
                    </span>
                  </td>

                  <td>
                    <span
                      className={
                        user.status === 'Activo'
                          ? 'status-badge'
                          : 'status-badge inactive'
                      }
                    >
                      {user.status}
                    </span>
                  </td>

                  <td>
                    {user.role === 'Paciente'
                      ? user.patientAge ?? 'Sin registrar'
                      : 'No aplica'}
                  </td>

                  <td>{getPermissions(user.role)}</td>

                  <td>
                    <div className="table-actions">
                      <button
                        type="button"
                        className="small-button"
                        onClick={() => handleEdit(user)}
                      >
                        <Pencil size={15} />
                        Editar
                      </button>

                      {user.status === 'Activo' && (
                        <button
                          type="button"
                          className="small-button danger"
                          onClick={() => handleDeactivate(user)}
                        >
                          <UserX size={15} />
                          Desactivar
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}

              {users.length === 0 && (
                <tr>
                  <td colSpan={6}>
                    No hay usuarios registrados.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

export default RolesPermissionsPage;