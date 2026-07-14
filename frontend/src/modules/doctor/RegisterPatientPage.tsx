import { useState } from 'react';
import { Save, UserPlus, XCircle } from 'lucide-react';

import type { PatientRegistrationFormData } from '../../shared/types';
import { createPatientFromDoctor } from './services/patients.service';

const initialForm: PatientRegistrationFormData = {
  fullName: '',
  email: '',
  password: '',
  password_confirmation: '',
  age: '',
  diagnosis: '',
  allergies: '',
  medicalConditions: '',
  clinicalNotes: '',
  lastTreatment: '',
  profilePhoto: null,
};

function RegisterPatientPage() {
  const [form, setForm] = useState<PatientRegistrationFormData>(initialForm);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const updateField = (
    field: keyof PatientRegistrationFormData,
    value: string | number
  ) => {
    setForm((current) => ({
      ...current,
      [field]: value,
    }));
  };

  const resetForm = () => {
    setForm(initialForm);
    setError('');
    setSuccess('');
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();

    setError('');
    setSuccess('');

    if (form.password !== form.password_confirmation) {
      setError('La contraseña y la confirmación no coinciden.');
      return;
    }

    try {
      setSaving(true);

      await createPatientFromDoctor({
        ...form,
        age: form.age === '' ? '' : Number(form.age),
      });

      setSuccess('Paciente registrado correctamente. Ya puede iniciar sesión como paciente.');
      setForm(initialForm);
    } catch (error) {
      setError(
        error instanceof Error
          ? error.message
          : 'No fue posible registrar al paciente.'
      );
    } finally {
      setSaving(false);
    }
  };

  return (
    <div>
      <div className="page-title-row">
        <div className="page-icon">
          <UserPlus size={28} />
        </div>

        <div>
          <h1>Registrar paciente</h1>
          <p className="page-description">
            Alta de usuarios pacientes desde el panel médico. El rol se asigna
            automáticamente como Paciente y no puede modificarse desde este formulario.
          </p>
        </div>
      </div>

      {error && (
        <div className="form-alert error">
          {error}
        </div>
      )}

      {success && (
        <div className="form-alert success">
          {success}
        </div>
      )}

      <div className="form-drawer">
        <div className="form-drawer-header">
          <div className="section-heading">
            <UserPlus size={24} />
            <h3>Datos del usuario paciente</h3>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="user-form">
          <div className="form-drawer-grid">
            <div className="form-group">
              <label>Nombre completo</label>
              <input
                type="text"
                value={form.fullName}
                placeholder="Ejemplo: Andrea Pérez"
                onChange={(event) => updateField('fullName', event.target.value)}
                required
              />
            </div>

            <div className="form-group">
              <label>Correo electrónico</label>
              <input
                type="email"
                value={form.email}
                placeholder="paciente@correo.com"
                onChange={(event) => updateField('email', event.target.value)}
                required
              />
            </div>

            <div className="form-group">
              <label>Contraseña</label>
              <input
                type="password"
                value={form.password}
                placeholder="Mínimo 8 caracteres"
                onChange={(event) => updateField('password', event.target.value)}
                required
              />
            </div>

            <div className="form-group">
              <label>Confirmar contraseña</label>
              <input
                type="password"
                value={form.password_confirmation}
                placeholder="Repite la contraseña"
                onChange={(event) =>
                  updateField('password_confirmation', event.target.value)
                }
                required
              />
            </div>

            <div className="form-group">
              <label>Rol</label>
              <input
                type="text"
                value="Paciente"
                disabled
              />
            </div>

            <div className="form-group">
              <label>Edad</label>
              <input
                type="number"
                min={0}
                max={120}
                value={form.age}
                placeholder="Ejemplo: 35"
                onChange={(event) =>
                  updateField(
                    'age',
                    event.target.value === '' ? '' : Number(event.target.value)
                  )
                }
              />
            </div>

            <div className="form-group form-full">
              <label>Diagnóstico</label>
              <input
                type="text"
                value={form.diagnosis}
                placeholder="Ejemplo: Hipertensión, control general, infección respiratoria..."
                onChange={(event) => updateField('diagnosis', event.target.value)}
              />
            </div>

            <div className="form-group form-full">
              <label>Alergias</label>
              <textarea
                value={form.allergies}
                placeholder="Alergias conocidas del paciente"
                onChange={(event) => updateField('allergies', event.target.value)}
              />
            </div>

            <div className="form-group form-full">
              <label>Condiciones médicas</label>
              <textarea
                value={form.medicalConditions}
                placeholder="Padecimientos, antecedentes o condiciones relevantes"
                onChange={(event) =>
                  updateField('medicalConditions', event.target.value)
                }
              />
            </div>

            <div className="form-group form-full">
              <label>Notas clínicas</label>
              <textarea
                value={form.clinicalNotes}
                placeholder="Notas clínicas iniciales"
                onChange={(event) =>
                  updateField('clinicalNotes', event.target.value)
                }
              />
            </div>

            <div className="form-group form-full">
              <label>Último tratamiento</label>
              <textarea
                value={form.lastTreatment}
                placeholder="Tratamiento actual o último tratamiento indicado"
                onChange={(event) =>
                  updateField('lastTreatment', event.target.value)
                }
              />
            </div>
          </div>

          <div className="form-actions">
            <button type="submit" disabled={saving}>
              <Save size={18} />
              {saving ? 'Guardando...' : 'Registrar paciente'}
            </button>

            <button
              type="button"
              className="secondary-button"
              onClick={resetForm}
            >
              <XCircle size={18} />
              Limpiar formulario
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default RegisterPatientPage;