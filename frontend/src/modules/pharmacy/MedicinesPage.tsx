import { useEffect, useMemo, useState } from 'react';

import {
  AlertTriangle,
  CheckCircle2,
  ClipboardList,
  PackageOpen,
  Pencil,
  Pill,
  Plus,
  RefreshCcw,
  RotateCcw,
  Save,
  Search,
  SlidersHorizontal,
  X,
} from 'lucide-react';

import type {
  Medicine,
  MedicineFormData,
  MedicineStatus,
} from '../../shared/types';

import {
  createMedicine,
  deactivateMedicine,
  getMedicineCatalogs,
  getMedicines,
  updateMedicine,
} from './services/pharmacy.service';

import type {
  MedicineCatalogs,
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

const emptyCatalogs: MedicineCatalogs = {
  presentations: [],
  concentrations: [],
  units: [],
};

const statuses: MedicineStatus[] = [
  'Activo',
  'Inactivo',
];

type StatusFilter =
  | 'Todos'
  | MedicineStatus;

function MedicinesPage() {
  const [medicines, setMedicines] =
    useState<Medicine[]>([]);

  const [catalogs, setCatalogs] =
    useState<MedicineCatalogs>(emptyCatalogs);

  const [formData, setFormData] =
    useState<MedicineFormData>(emptyForm);

  const [editingMedicine, setEditingMedicine] =
    useState<Medicine | null>(null);

  const [isFormOpen, setIsFormOpen] =
    useState(false);

  const [search, setSearch] =
    useState('');

  const [statusFilter, setStatusFilter] =
    useState<StatusFilter>('Todos');

  const [
    presentationFilter,
    setPresentationFilter,
  ] = useState('Todas');

  const [loading, setLoading] =
    useState(true);

  const [saving, setSaving] =
    useState(false);

  const [errorMessage, setErrorMessage] =
    useState('');

  const [successMessage, setSuccessMessage] =
    useState('');

  async function loadData() {
    try {
      setLoading(true);
      setErrorMessage('');

      const [
        medicinesData,
        catalogsData,
      ] = await Promise.all([
        getMedicines(),
        getMedicineCatalogs(),
      ]);

      setMedicines(medicinesData);
      setCatalogs(catalogsData);
    } catch {
      setErrorMessage(
        'No fue posible cargar los medicamentos y sus catálogos.',
      );
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadData();
  }, []);

  const statistics = useMemo(() => {
    const activeMedicines = medicines.filter(
      (medicine) =>
        medicine.status === 'Activo',
    );

    return {
      total: medicines.length,

      active: activeMedicines.length,

      withoutStock: activeMedicines.filter(
        (medicine) =>
          medicine.totalStock <= 0,
      ).length,

      lowStock: activeMedicines.filter(
        (medicine) =>
          medicine.totalStock > 0 &&
          medicine.totalStock <=
            medicine.totalMinStock,
      ).length,
    };
  }, [medicines]);

  const filteredMedicines = useMemo(() => {
    const normalizedSearch =
      search.trim().toLowerCase();

    return medicines
      .filter((medicine) => {
        const matchesSearch =
          !normalizedSearch ||
          medicine.name
            .toLowerCase()
            .includes(normalizedSearch) ||
          medicine.code
            .toLowerCase()
            .includes(normalizedSearch) ||
          (medicine.presentation ?? '')
            .toLowerCase()
            .includes(normalizedSearch) ||
          (medicine.concentration ?? '')
            .toLowerCase()
            .includes(normalizedSearch);

        const matchesStatus =
          statusFilter === 'Todos' ||
          medicine.status === statusFilter;

        const matchesPresentation =
          presentationFilter === 'Todas' ||
          medicine.presentation ===
            presentationFilter;

        return (
          matchesSearch &&
          matchesStatus &&
          matchesPresentation
        );
      })
      .sort((first, second) =>
        first.name.localeCompare(
          second.name,
          'es',
        ),
      );
  }, [
    medicines,
    search,
    statusFilter,
    presentationFilter,
  ]);

  const handleChange = (
    field: keyof MedicineFormData,
    value: string,
  ) => {
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

  const resetFilters = () => {
    setSearch('');
    setStatusFilter('Todos');
    setPresentationFilter('Todas');
  };

  const handleEdit = (
    medicine: Medicine,
  ) => {
    setEditingMedicine(medicine);

    setFormData({
      code: medicine.code,
      name: medicine.name,
      presentation:
        medicine.presentation ?? '',
      concentration:
        medicine.concentration ?? '',
      unit: medicine.unit ?? '',
      description:
        medicine.description ?? '',
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

  const handleSubmit = async (
    event: React.FormEvent<HTMLFormElement>,
  ) => {
    event.preventDefault();

    try {
      setSaving(true);
      setErrorMessage('');
      setSuccessMessage('');

      if (editingMedicine) {
        await updateMedicine(
          editingMedicine.id,
          formData,
        );

        setSuccessMessage(
          'Medicamento actualizado correctamente.',
        );
      } else {
        await createMedicine(formData);

        setSuccessMessage(
          'Medicamento creado correctamente.',
        );
      }

      await loadData();

      window.setTimeout(() => {
        closeForm();
      }, 700);
    } catch (error) {
      setErrorMessage(
        error instanceof Error
          ? error.message
          : 'No fue posible guardar el medicamento.',
      );
    } finally {
      setSaving(false);
    }
  };

  const handleDeactivate = async (
    medicine: Medicine,
  ) => {
    const confirmDeactivate =
      window.confirm(
        `¿Deseas desactivar el medicamento ${medicine.name}?`,
      );

    if (!confirmDeactivate) {
      return;
    }

    try {
      setErrorMessage('');
      setSuccessMessage('');

      await deactivateMedicine(
        medicine.id,
      );

      setSuccessMessage(
        'Medicamento desactivado correctamente.',
      );

      await loadData();
    } catch {
      setErrorMessage(
        'No fue posible desactivar el medicamento.',
      );
    }
  };

  return (
    <div className="pharmacy-module-page">
      <section className="pharmacy-module-hero">
        <div className="pharmacy-module-heading">
          <div className="pharmacy-module-icon">
            <Pill size={30} />
          </div>

          <div>
            <span className="pharmacy-module-eyebrow">
              Catálogo farmacéutico
            </span>

            <h1>Medicamentos</h1>

            <p>
              Administra la información base
              utilizada en recetas, inventario
              y dispensación de medicamentos.
            </p>
          </div>
        </div>

        <button
          type="button"
          className="pharmacy-primary-button"
          onClick={openCreateForm}
        >
          <Plus size={19} />
          Nuevo medicamento
        </button>
      </section>

      <section className="pharmacy-summary-grid">
        <article className="pharmacy-summary-card">
          <div className="pharmacy-summary-icon blue">
            <ClipboardList size={22} />
          </div>

          <div>
            <span>
              Medicamentos registrados
            </span>

            <strong>
              {statistics.total}
            </strong>
          </div>
        </article>

        <article className="pharmacy-summary-card">
          <div className="pharmacy-summary-icon green">
            <CheckCircle2 size={22} />
          </div>

          <div>
            <span>
              Medicamentos activos
            </span>

            <strong>
              {statistics.active}
            </strong>
          </div>
        </article>

        <article className="pharmacy-summary-card">
          <div className="pharmacy-summary-icon amber">
            <AlertTriangle size={22} />
          </div>

          <div>
            <span>Con stock bajo</span>

            <strong>
              {statistics.lowStock}
            </strong>
          </div>
        </article>

        <article className="pharmacy-summary-card">
          <div className="pharmacy-summary-icon red">
            <PackageOpen size={22} />
          </div>

          <div>
            <span>Sin existencias</span>

            <strong>
              {statistics.withoutStock}
            </strong>
          </div>
        </article>
      </section>

      {errorMessage && !isFormOpen && (
        <div className="form-alert error">
          {errorMessage}
        </div>
      )}

      {successMessage && !isFormOpen && (
        <div className="form-alert success">
          {successMessage}
        </div>
      )}

      {isFormOpen && (
        <section className="pharmacy-form-panel">
          <div className="pharmacy-form-panel-header">
            <div className="section-heading">
              {editingMedicine ? (
                <Pencil size={23} />
              ) : (
                <Plus size={23} />
              )}

              <div>
                <h3>
                  {editingMedicine
                    ? 'Editar medicamento'
                    : 'Registrar medicamento'}
                </h3>

                <p>
                  Completa los datos generales
                  del medicamento.
                </p>
              </div>
            </div>

            <button
              type="button"
              className="icon-close-button"
              onClick={closeForm}
              aria-label="Cerrar formulario"
            >
              <X size={20} />
            </button>
          </div>

          {errorMessage && (
            <div className="form-alert error">
              {errorMessage}
            </div>
          )}

          {successMessage && (
            <div className="form-alert success">
              {successMessage}
            </div>
          )}

          <form
            onSubmit={handleSubmit}
            className="pharmacy-form"
          >
            <div className="pharmacy-form-grid">
              <div className="form-group">
                <label htmlFor="medicine-code">
                  Código
                </label>

                <input
                  id="medicine-code"
                  type="text"
                  placeholder="Ejemplo: MED-001"
                  value={formData.code}
                  onChange={(event) =>
                    handleChange(
                      'code',
                      event.target.value,
                    )
                  }
                  required
                />
              </div>

              <div className="form-group">
                <label htmlFor="medicine-name">
                  Nombre del medicamento
                </label>

                <input
                  id="medicine-name"
                  type="text"
                  placeholder="Ejemplo: Paracetamol"
                  value={formData.name}
                  onChange={(event) =>
                    handleChange(
                      'name',
                      event.target.value,
                    )
                  }
                  required
                />
              </div>

              <div className="form-group">
                <label htmlFor="medicine-presentation">
                  Presentación
                </label>

                <select
                  id="medicine-presentation"
                  value={formData.presentation}
                  onChange={(event) =>
                    handleChange(
                      'presentation',
                      event.target.value,
                    )
                  }
                >
                  <option value="">
                    Selecciona una presentación
                  </option>

                  {catalogs.presentations.map(
                    (presentation) => (
                      <option
                        key={presentation}
                        value={presentation}
                      >
                        {presentation}
                      </option>
                    ),
                  )}
                </select>
              </div>

              <div className="form-group">
                <label htmlFor="medicine-concentration">
                  Concentración
                </label>

                <select
                  id="medicine-concentration"
                  value={formData.concentration}
                  onChange={(event) =>
                    handleChange(
                      'concentration',
                      event.target.value,
                    )
                  }
                >
                  <option value="">
                    Selecciona una concentración
                  </option>

                  {catalogs.concentrations.map(
                    (concentration) => (
                      <option
                        key={concentration}
                        value={concentration}
                      >
                        {concentration}
                      </option>
                    ),
                  )}
                </select>
              </div>

              <div className="form-group">
                <label htmlFor="medicine-unit">
                  Unidad
                </label>

                <select
                  id="medicine-unit"
                  value={formData.unit}
                  onChange={(event) =>
                    handleChange(
                      'unit',
                      event.target.value,
                    )
                  }
                >
                  <option value="">
                    Selecciona una unidad
                  </option>

                  {catalogs.units.map(
                    (unit) => (
                      <option
                        key={unit}
                        value={unit}
                      >
                        {unit}
                      </option>
                    ),
                  )}
                </select>
              </div>

              <div className="form-group">
                <label htmlFor="medicine-status">
                  Estado
                </label>

                <select
                  id="medicine-status"
                  value={formData.status}
                  onChange={(event) =>
                    handleChange(
                      'status',
                      event.target
                        .value as MedicineStatus,
                    )
                  }
                >
                  {statuses.map((status) => (
                    <option
                      key={status}
                      value={status}
                    >
                      {status}
                    </option>
                  ))}
                </select>
              </div>

              <div className="form-group form-full">
                <label htmlFor="medicine-description">
                  Descripción
                </label>

                <textarea
                  id="medicine-description"
                  placeholder="Agrega indicaciones generales, observaciones o información útil del medicamento."
                  value={formData.description}
                  onChange={(event) =>
                    handleChange(
                      'description',
                      event.target.value,
                    )
                  }
                  rows={4}
                />
              </div>
            </div>

            <div className="form-actions">
              <button
                type="submit"
                disabled={saving}
              >
                <Save size={18} />

                {saving
                  ? 'Guardando...'
                  : editingMedicine
                    ? 'Actualizar medicamento'
                    : 'Crear medicamento'}
              </button>

              <button
                type="button"
                className="secondary-button"
                onClick={closeForm}
                disabled={saving}
              >
                <RotateCcw size={18} />
                Cancelar
              </button>
            </div>
          </form>
        </section>
      )}

      <section className="pharmacy-list-panel">
        <div className="pharmacy-list-panel-header">
          <div>
            <span className="pharmacy-module-eyebrow">
              Consulta y administración
            </span>

            <h2>
              Listado de medicamentos
            </h2>

            <p>
              Mostrando{' '}
              {filteredMedicines.length}{' '}
              de {medicines.length} registros.
            </p>
          </div>

          <button
            type="button"
            className="pharmacy-refresh-button"
            onClick={loadData}
            disabled={loading}
          >
            <RefreshCcw size={17} />
            Actualizar
          </button>
        </div>

        <div className="pharmacy-filter-bar">
          <div className="pharmacy-search-control">
            <Search size={18} />

            <input
              type="text"
              placeholder="Buscar por código, nombre, presentación o concentración"
              value={search}
              onChange={(event) =>
                setSearch(event.target.value)
              }
            />
          </div>

          <div className="pharmacy-filter-control">
            <SlidersHorizontal size={17} />

            <select
              value={statusFilter}
              onChange={(event) =>
                setStatusFilter(
                  event.target
                    .value as StatusFilter,
                )
              }
              aria-label="Filtrar por estado"
            >
              <option value="Todos">
                Todos los estados
              </option>

              {statuses.map((status) => (
                <option
                  key={status}
                  value={status}
                >
                  {status}
                </option>
              ))}
            </select>
          </div>

          <div className="pharmacy-filter-control">
            <Pill size={17} />

            <select
              value={presentationFilter}
              onChange={(event) =>
                setPresentationFilter(
                  event.target.value,
                )
              }
              aria-label="Filtrar por presentación"
            >
              <option value="Todas">
                Todas las presentaciones
              </option>

              {catalogs.presentations.map(
                (presentation) => (
                  <option
                    key={presentation}
                    value={presentation}
                  >
                    {presentation}
                  </option>
                ),
              )}
            </select>
          </div>

          <button
            type="button"
            className="pharmacy-clear-filters"
            onClick={resetFilters}
          >
            <RotateCcw size={17} />
            Limpiar
          </button>
        </div>

        {loading && (
          <div className="state-card">
            Cargando medicamentos...
          </div>
        )}

        {!loading &&
          filteredMedicines.length === 0 && (
            <div className="pharmacy-empty-state">
              <PackageOpen size={38} />

              <h3>
                No se encontraron medicamentos
              </h3>

              <p>
                Ajusta los filtros o registra
                un medicamento nuevo.
              </p>
            </div>
          )}

        {!loading &&
          filteredMedicines.length > 0 && (
            <div className="pharmacy-table-wrapper">
              <table className="pharmacy-data-table">
                <thead>
                  <tr>
                    <th>Medicamento</th>
                    <th>Presentación</th>
                    <th>Unidad</th>
                    <th>Existencias</th>
                    <th>Estado</th>
                    <th>Acciones</th>
                  </tr>
                </thead>

                <tbody>
                  {filteredMedicines.map(
                    (medicine) => {
                      const isWithoutStock =
                        medicine.totalStock <= 0;

                      const isLowStock =
                        medicine.totalStock > 0 &&
                        medicine.totalStock <=
                          medicine.totalMinStock;

                      return (
                        <tr key={medicine.id}>
                          <td>
                            <div className="pharmacy-medicine-cell">
                              <div className="pharmacy-table-icon">
                                <Pill size={18} />
                              </div>

                              <div>
                                <strong>
                                  {medicine.name}
                                </strong>

                                <span>
                                  {medicine.code}
                                </span>

                                {medicine.concentration && (
                                  <small>
                                    {
                                      medicine.concentration
                                    }
                                  </small>
                                )}
                              </div>
                            </div>
                          </td>

                          <td>
                            {medicine.presentation ||
                              'Sin especificar'}
                          </td>

                          <td>
                            {medicine.unit ||
                              'Sin especificar'}
                          </td>

                          <td>
                            <div className="pharmacy-stock-cell">
                              <strong>
                                {
                                  medicine.totalStock
                                }
                              </strong>

                              <span>
                                Mínimo:{' '}
                                {
                                  medicine.totalMinStock
                                }
                              </span>

                              {isWithoutStock && (
                                <small className="stock-alert danger">
                                  Sin existencias
                                </small>
                              )}

                              {isLowStock && (
                                <small className="stock-alert warning">
                                  Stock bajo
                                </small>
                              )}
                            </div>
                          </td>

                          <td>
                            <span
                              className={
                                medicine.status ===
                                'Activo'
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
                                onClick={() =>
                                  handleEdit(
                                    medicine,
                                  )
                                }
                              >
                                <Pencil size={15} />
                                Editar
                              </button>

                              {medicine.status ===
                                'Activo' && (
                                <button
                                  type="button"
                                  className="small-button danger"
                                  onClick={() =>
                                    handleDeactivate(
                                      medicine,
                                    )
                                  }
                                >
                                  Desactivar
                                </button>
                              )}
                            </div>
                          </td>
                        </tr>
                      );
                    },
                  )}
                </tbody>
              </table>
            </div>
          )}
      </section>
    </div>
  );
}

export default MedicinesPage;