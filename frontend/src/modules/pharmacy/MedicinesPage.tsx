import { useEffect, useState } from 'react';
import {
  ClipboardList,
  Pencil,
  Pill,
  Plus,
  RotateCcw,
  Save,
  Search,
  X,
} from 'lucide-react';

import type { Medicine, MedicineFormData, MedicineStatus } from '../../shared/types';
import {
  createMedicine,
  deactivateMedicine,
  getMedicines,
  updateMedicine,
} from './services/pharmacy.service';

const emptyForm: MedicineFormData = {
  code: '',
  name: '',
  presentation: '',
  concentration: '',
  unit: '',
  description: '',
  status: 'Activo',
};

const statuses: MedicineStatus[] = ['Activo', 'Inactivo'];

function MedicinesPage() {
  const [medicines, setMedicines] = useState<Medicine[]>([]);
  const [formData, setFormData] = useState<MedicineFormData>(emptyForm);
  const [editingMedicine, setEditingMedicine] = useState<Medicine | null>(null);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [search, setSearch] = useState('');

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  async function loadMedicines() {
    try {
      setLoading(true);
      setErrorMessage('');

      const data = await getMedicines();

      setMedicines(data);
    } catch {
      setErrorMessage('No fue posible cargar los medicamentos.');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadMedicines();
  }, []);

  const filteredMedicines = medicines.filter((medicine) =>
    medicine.name.toLowerCase().includes(search.toLowerCase()) ||
    medicine.code.toLowerCase().includes(search.toLowerCase())
  );

  const handleChange = (field: keyof MedicineFormData, value: string) => {
    setFormData((current) => ({
      ...current,
      [field]: value,
    }));
  };

  const openCreateForm = () => {
    setEditingMedicine(null);
    setFormData(emptyForm);
    setErrorMessage('');
    setSuccessMessage('');
    setIsFormOpen(true);
  };

  const closeForm = () => {
    setEditingMedicine(null);
    setFormData(emptyForm);
    setErrorMessage('');
    setSuccessMessage('');
    setIsFormOpen(false);
  };

  const handleEdit = (medicine: Medicine) => {
    setEditingMedicine(medicine);
    setFormData({
      code: medicine.code,
      name: medicine.name,
      presentation: medicine.presentation ?? '',
      concentration: medicine.concentration ?? '',
      unit: medicine.unit ?? '',
      description: medicine.description ?? '',
      status: medicine.status,
    });

    setErrorMessage('');
    setSuccessMessage('');
    setIsFormOpen(true);

    window.scrollTo({
      top: 0,
      behavior: 'smooth',
    });
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    try {
      setSaving(true);
      setErrorMessage('');
      setSuccessMessage('');

      if (editingMedicine) {
        await updateMedicine(editingMedicine.id, formData);
        setSuccessMessage('Medicamento actualizado correctamente.');
      } else {
        await createMedicine(formData);
        setSuccessMessage('Medicamento creado correctamente.');
      }

      await loadMedicines();

      setTimeout(() => {
        closeForm();
      }, 700);
    } catch (error) {
      setErrorMessage(
        error instanceof Error
          ? error.message
          : 'No fue posible guardar el medicamento.'
      );
    } finally {
      setSaving(false);
    }
  };

  const handleDeactivate = async (medicine: Medicine) => {
    const confirmDeactivate = window.confirm(
      `¿Deseas desactivar el medicamento ${medicine.name}?`
    );

    if (!confirmDeactivate) {
      return;
    }

    try {
      setErrorMessage('');
      setSuccessMessage('');

      await deactivateMedicine(medicine.id);
      setSuccessMessage('Medicamento desactivado correctamente.');
      await loadMedicines();
    } catch {
      setErrorMessage('No fue posible desactivar el medicamento.');
    }
  };

  return (
    <div>
      <div className="page-header-with-action">
        <div className="page-title-row">
          <div className="page-icon">
            <Pill size={28} />
          </div>

          <div>
            <h1>Medicamentos</h1>
            <p className="page-description">
              Catálogo base de medicamentos disponibles para recetas electrónicas,
              inventario y dispensación inteligente.
            </p>
          </div>
        </div>

        <button type="button" onClick={openCreateForm}>
          <Plus size={18} />
          Nuevo medicamento
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
              {editingMedicine ? <Pencil size={24} /> : <Plus size={24} />}
              <h3>{editingMedicine ? 'Editar medicamento' : 'Registrar medicamento'}</h3>
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
                <label>Código</label>
                <input
                  type="text"
                  placeholder="Ejemplo: MED-001"
                  value={formData.code}
                  onChange={(event) => handleChange('code', event.target.value)}
                />
              </div>

              <div className="form-group">
                <label>Nombre del medicamento</label>
                <input
                  type="text"
                  placeholder="Ejemplo: Paracetamol"
                  value={formData.name}
                  onChange={(event) => handleChange('name', event.target.value)}
                />
              </div>

              <div className="form-group">
                <label>Presentación</label>
                <input
                  type="text"
                  placeholder="Ejemplo: Tabletas, cápsulas, jarabe"
                  value={formData.presentation}
                  onChange={(event) => handleChange('presentation', event.target.value)}
                />
              </div>

              <div className="form-group">
                <label>Concentración</label>
                <input
                  type="text"
                  placeholder="Ejemplo: 500 mg"
                  value={formData.concentration}
                  onChange={(event) => handleChange('concentration', event.target.value)}
                />
              </div>

              <div className="form-group">
                <label>Unidad</label>
                <input
                  type="text"
                  placeholder="Ejemplo: pieza, caja, frasco"
                  value={formData.unit}
                  onChange={(event) => handleChange('unit', event.target.value)}
                />
              </div>

              <div className="form-group">
                <label>Estado</label>
                <select
                  value={formData.status}
                  onChange={(event) =>
                    handleChange('status', event.target.value as MedicineStatus)
                  }
                >
                  {statuses.map((status) => (
                    <option key={status} value={status}>
                      {status}
                    </option>
                  ))}
                </select>
              </div>

              <div className="form-group form-full">
                <label>Descripción</label>
                <textarea
                  placeholder="Uso general, observaciones o indicaciones del medicamento"
                  value={formData.description}
                  onChange={(event) => handleChange('description', event.target.value)}
                />
              </div>
            </div>

            <div className="form-actions">
              <button type="submit" disabled={saving}>
                <Save size={18} />
                {saving
                  ? 'Guardando...'
                  : editingMedicine
                    ? 'Actualizar medicamento'
                    : 'Crear medicamento'}
              </button>

              <button type="button" className="secondary-button" onClick={closeForm}>
                <RotateCcw size={18} />
                Cancelar
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="search-box icon-input">
        <Search size={18} />
        <input
          type="text"
          placeholder="Buscar por código o nombre"
          value={search}
          onChange={(event) => setSearch(event.target.value)}
        />
      </div>

      {loading && (
        <div className="state-card">Cargando medicamentos...</div>
      )}

      {!loading && (
        <div className="table-card users-table">
          <table>
            <thead>
              <tr>
                <th>Código</th>
                <th>Medicamento</th>
                <th>Presentación</th>
                <th>Concentración</th>
                <th>Stock total</th>
                <th>Estado</th>
                <th>Acciones</th>
              </tr>
            </thead>

            <tbody>
              {filteredMedicines.map((medicine) => (
                <tr key={medicine.id}>
                  <td>{medicine.code}</td>

                  <td>
                    <div className="table-user">
                      <div className="table-avatar">
                        <ClipboardList size={16} />
                      </div>
                      {medicine.name}
                    </div>
                  </td>

                  <td>{medicine.presentation || 'N/A'}</td>
                  <td>{medicine.concentration || 'N/A'}</td>
                  <td>{medicine.totalStock}</td>

                  <td>
                    <span
                      className={
                        medicine.status === 'Activo'
                          ? 'status-badge'
                          : 'status-badge inactive'
                      }
                    >
                      {medicine.status}
                    </span>
                  </td>

                  <td>
                    <div className="table-actions">
                      <button
                        type="button"
                        className="small-button"
                        onClick={() => handleEdit(medicine)}
                      >
                        <Pencil size={15} />
                        Editar
                      </button>

                      {medicine.status === 'Activo' && (
                        <button
                          type="button"
                          className="small-button danger"
                          onClick={() => handleDeactivate(medicine)}
                        >
                          Desactivar
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

export default MedicinesPage;