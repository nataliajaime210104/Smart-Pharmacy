import {
  useEffect,
  useMemo,
  useState,
} from 'react';

import {
  AlertTriangle,
  Boxes,
  CalendarDays,
  CheckCircle2,
  MapPin,
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
  InventoryFormData,
  InventoryItem,
  InventoryStatus,
  Medicine,
} from '../../shared/types';

import {
  createInventoryItem,
  deactivateInventoryItem,
  getInventory,
  getMedicines,
  updateInventoryItem,
} from './services/pharmacy.service';

const emptyForm: InventoryFormData = {
  medicineId: 0,
  lotNumber: '',
  stock: 0,
  minStock: 0,
  location: '',
  expirationDate: '',
  status: 'Activo',
};

const statuses: InventoryStatus[] = [
  'Activo',
  'Inactivo',
];

type StatusFilter =
  | 'Todos'
  | InventoryStatus;

type StockFilter =
  | 'Todos'
  | 'Correcto'
  | 'Bajo'
  | 'Sin existencias';

type ExpirationFilter =
  | 'Todas'
  | 'Vigente'
  | 'Próxima'
  | 'Caducado'
  | 'Sin fecha';

type ExpirationState =
  | 'vigente'
  | 'proxima'
  | 'caducado'
  | 'sin-fecha';

interface ExpirationInformation {
  state: ExpirationState;
  label: string;
  days: number | null;
}

function getExpirationInformation(
  expirationDate: string | null,
): ExpirationInformation {
  if (!expirationDate) {
    return {
      state: 'sin-fecha',
      label: 'Sin fecha',
      days: null,
    };
  }

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const expiration = new Date(
    `${expirationDate}T00:00:00`,
  );

  const difference =
    expiration.getTime() -
    today.getTime();

  const days = Math.round(
    difference / 86400000,
  );

  if (days < 0) {
    return {
      state: 'caducado',
      label: 'Caducado',
      days,
    };
  }

  if (days <= 30) {
    return {
      state: 'proxima',
      label:
        days === 0
          ? 'Caduca hoy'
          : `Caduca en ${days} días`,
      days,
    };
  }

  return {
    state: 'vigente',
    label: 'Vigente',
    days,
  };
}

function formatDate(
  date: string | null,
): string {
  if (!date) {
    return 'Sin especificar';
  }

  return new Intl.DateTimeFormat(
    'es-MX',
    {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    },
  ).format(
    new Date(`${date}T00:00:00`),
  );
}

function InventoryPage() {
  const [inventory, setInventory] =
    useState<InventoryItem[]>([]);

  const [medicines, setMedicines] =
    useState<Medicine[]>([]);

  const [formData, setFormData] =
    useState<InventoryFormData>(
      emptyForm,
    );

  const [editingItem, setEditingItem] =
    useState<InventoryItem | null>(
      null,
    );

  const [isFormOpen, setIsFormOpen] =
    useState(false);

  const [search, setSearch] =
    useState('');

  const [statusFilter, setStatusFilter] =
    useState<StatusFilter>('Todos');

  const [stockFilter, setStockFilter] =
    useState<StockFilter>('Todos');

  const [
    expirationFilter,
    setExpirationFilter,
  ] = useState<ExpirationFilter>(
    'Todas',
  );

  const [loading, setLoading] =
    useState(true);

  const [saving, setSaving] =
    useState(false);

  const [
    errorMessage,
    setErrorMessage,
  ] = useState('');

  const [
    successMessage,
    setSuccessMessage,
  ] = useState('');

  async function loadData() {
    try {
      setLoading(true);
      setErrorMessage('');

      const [
        inventoryData,
        medicinesData,
      ] = await Promise.all([
        getInventory(),
        getMedicines(),
      ]);

      setInventory(inventoryData);
      setMedicines(medicinesData);
    } catch {
      setErrorMessage(
        'No fue posible cargar el inventario.',
      );
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadData();
  }, []);

  const statistics = useMemo(() => {
    const activeInventory =
      inventory.filter(
        (item) =>
          item.status === 'Activo',
      );

    const totalStock =
      activeInventory.reduce(
        (total, item) =>
          total + item.stock,
        0,
      );

    const lowStock =
      activeInventory.filter(
        (item) =>
          item.stock > 0 &&
          item.isLowStock,
      ).length;

    const withoutStock =
      activeInventory.filter(
        (item) => item.stock <= 0,
      ).length;

    const expiringSoon =
      activeInventory.filter(
        (item) =>
          getExpirationInformation(
            item.expirationDate,
          ).state === 'proxima',
      ).length;

    const expired =
      activeInventory.filter(
        (item) =>
          getExpirationInformation(
            item.expirationDate,
          ).state === 'caducado',
      ).length;

    return {
      records: inventory.length,
      totalStock,
      lowStock,
      withoutStock,
      expiringSoon,
      expired,
    };
  }, [inventory]);

  const selectedMedicine =
    useMemo(
      () =>
        medicines.find(
          (medicine) =>
            medicine.id ===
            formData.medicineId,
        ) ?? null,
      [
        medicines,
        formData.medicineId,
      ],
    );

  const selectableMedicines =
    useMemo(
      () =>
        medicines
          .filter(
            (medicine) =>
              medicine.status ===
                'Activo' ||
              medicine.id ===
                formData.medicineId,
          )
          .sort((first, second) =>
            first.name.localeCompare(
              second.name,
              'es',
            ),
          ),
      [
        medicines,
        formData.medicineId,
      ],
    );

  const filteredInventory =
    useMemo(() => {
      const normalizedSearch =
        search.trim().toLowerCase();

      return inventory
        .filter((item) => {
          const expiration =
            getExpirationInformation(
              item.expirationDate,
            );

          const matchesSearch =
            !normalizedSearch ||
            item.medicineName
              .toLowerCase()
              .includes(
                normalizedSearch,
              ) ||
            item.medicineCode
              .toLowerCase()
              .includes(
                normalizedSearch,
              ) ||
            (
              item.lotNumber ?? ''
            )
              .toLowerCase()
              .includes(
                normalizedSearch,
              ) ||
            (
              item.location ?? ''
            )
              .toLowerCase()
              .includes(
                normalizedSearch,
              );

          const matchesStatus =
            statusFilter === 'Todos' ||
            item.status ===
              statusFilter;

          const matchesStock =
            stockFilter === 'Todos' ||
            (
              stockFilter ===
                'Sin existencias' &&
              item.stock <= 0
            ) ||
            (
              stockFilter ===
                'Bajo' &&
              item.stock > 0 &&
              item.isLowStock
            ) ||
            (
              stockFilter ===
                'Correcto' &&
              item.stock >
                item.minStock
            );

          const matchesExpiration =
            expirationFilter ===
              'Todas' ||
            (
              expirationFilter ===
                'Vigente' &&
              expiration.state ===
                'vigente'
            ) ||
            (
              expirationFilter ===
                'Próxima' &&
              expiration.state ===
                'proxima'
            ) ||
            (
              expirationFilter ===
                'Caducado' &&
              expiration.state ===
                'caducado'
            ) ||
            (
              expirationFilter ===
                'Sin fecha' &&
              expiration.state ===
                'sin-fecha'
            );

          return (
            matchesSearch &&
            matchesStatus &&
            matchesStock &&
            matchesExpiration
          );
        })
        .sort((first, second) =>
          first.medicineName.localeCompare(
            second.medicineName,
            'es',
          ),
        );
    }, [
      inventory,
      search,
      statusFilter,
      stockFilter,
      expirationFilter,
    ]);

  const openCreateForm = () => {
    const firstActiveMedicine =
      medicines.find(
        (medicine) =>
          medicine.status === 'Activo',
      );

    setEditingItem(null);

    setFormData({
      ...emptyForm,
      medicineId:
        firstActiveMedicine?.id ?? 0,
    });

    setErrorMessage('');
    setSuccessMessage('');
    setIsFormOpen(true);
  };

  const closeForm = () => {
    setEditingItem(null);
    setFormData(emptyForm);
    setErrorMessage('');
    setSuccessMessage('');
    setIsFormOpen(false);
  };

  const resetFilters = () => {
    setSearch('');
    setStatusFilter('Todos');
    setStockFilter('Todos');
    setExpirationFilter('Todas');
  };

  const handleEdit = (
    item: InventoryItem,
  ) => {
    setEditingItem(item);

    setFormData({
      medicineId: item.medicineId,
      lotNumber:
        item.lotNumber ?? '',
      stock: item.stock,
      minStock: item.minStock,
      location:
        item.location ?? '',
      expirationDate:
        item.expirationDate ?? '',
      status: item.status,
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

    if (!formData.medicineId) {
      setErrorMessage(
        'Selecciona un medicamento.',
      );

      return;
    }

    if (
      formData.stock < 0 ||
      formData.minStock < 0
    ) {
      setErrorMessage(
        'Las existencias no pueden contener valores negativos.',
      );

      return;
    }

    try {
      setSaving(true);
      setErrorMessage('');
      setSuccessMessage('');

      if (editingItem) {
        await updateInventoryItem(
          editingItem.id,
          formData,
        );

        setSuccessMessage(
          'Inventario actualizado correctamente.',
        );
      } else {
        await createInventoryItem(
          formData,
        );

        setSuccessMessage(
          'Inventario registrado correctamente.',
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
          : 'No fue posible guardar el inventario.',
      );
    } finally {
      setSaving(false);
    }
  };

  const handleDeactivate = async (
    item: InventoryItem,
  ) => {
    const confirmDeactivate =
      window.confirm(
        `¿Deseas desactivar el inventario de ${item.medicineName}?`,
      );

    if (!confirmDeactivate) {
      return;
    }

    try {
      setErrorMessage('');
      setSuccessMessage('');

      await deactivateInventoryItem(
        item.id,
      );

      setSuccessMessage(
        'Inventario desactivado correctamente.',
      );

      await loadData();
    } catch {
      setErrorMessage(
        'No fue posible desactivar el inventario.',
      );
    }
  };

  return (
    <div className="pharmacy-module-page">
      <section className="pharmacy-module-hero">
        <div className="pharmacy-module-heading">
          <div className="pharmacy-module-icon">
            <Boxes size={30} />
          </div>

          <div>
            <span className="pharmacy-module-eyebrow">
              Control de existencias
            </span>

            <h1>Inventario</h1>

            <p>
              Controla existencias, lotes,
              ubicaciones, mínimos y fechas
              de caducidad de los medicamentos.
            </p>
          </div>
        </div>

        <button
          type="button"
          className="pharmacy-primary-button"
          onClick={openCreateForm}
        >
          <Plus size={19} />
          Nuevo inventario
        </button>
      </section>

      <section className="pharmacy-summary-grid">
        <article className="pharmacy-summary-card">
          <div className="pharmacy-summary-icon blue">
            <Boxes size={22} />
          </div>

          <div>
            <span>
              Unidades disponibles
            </span>

            <strong>
              {statistics.totalStock}
            </strong>

            <small>
              En {statistics.records}{' '}
              registros
            </small>
          </div>
        </article>

        <article className="pharmacy-summary-card">
          <div className="pharmacy-summary-icon amber">
            <AlertTriangle size={22} />
          </div>

          <div>
            <span>Stock bajo</span>

            <strong>
              {statistics.lowStock}
            </strong>

            <small>
              Debajo o igual al mínimo
            </small>
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

            <small>
              Requieren abastecimiento
            </small>
          </div>
        </article>

        <article className="pharmacy-summary-card">
          <div className="pharmacy-summary-icon purple">
            <CalendarDays size={22} />
          </div>

          <div>
            <span>
              Próximos a caducar
            </span>

            <strong>
              {statistics.expiringSoon}
            </strong>

            <small>
              {statistics.expired > 0
                ? `${statistics.expired} caducados`
                : 'Dentro de 30 días'}
            </small>
          </div>
        </article>
      </section>

      {errorMessage &&
        !isFormOpen && (
          <div className="form-alert error">
            {errorMessage}
          </div>
        )}

      {successMessage &&
        !isFormOpen && (
          <div className="form-alert success">
            {successMessage}
          </div>
        )}

      {isFormOpen && (
        <section className="pharmacy-form-panel">
          <div className="pharmacy-form-panel-header">
            <div className="section-heading">
              {editingItem ? (
                <Pencil size={23} />
              ) : (
                <Plus size={23} />
              )}

              <div>
                <h3>
                  {editingItem
                    ? 'Editar inventario'
                    : 'Registrar inventario'}
                </h3>

                <p>
                  Registra un lote, sus
                  existencias y ubicación.
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
              <div className="form-group form-full">
                <label htmlFor="inventory-medicine">
                  Medicamento
                </label>

                <select
                  id="inventory-medicine"
                  value={
                    formData.medicineId
                  }
                  onChange={(event) =>
                    setFormData(
                      (current) => ({
                        ...current,
                        medicineId:
                          Number(
                            event.target
                              .value,
                          ),
                      }),
                    )
                  }
                  required
                >
                  <option value={0}>
                    Selecciona un medicamento
                  </option>

                  {selectableMedicines.map(
                    (medicine) => (
                      <option
                        key={medicine.id}
                        value={medicine.id}
                        disabled={
                          medicine.status ===
                            'Inactivo' &&
                          medicine.id !==
                            formData.medicineId
                        }
                      >
                        {medicine.code} -{' '}
                        {medicine.name}
                        {medicine.concentration
                          ? ` · ${medicine.concentration}`
                          : ''}
                        {medicine.status ===
                        'Inactivo'
                          ? ' (Inactivo)'
                          : ''}
                      </option>
                    ),
                  )}
                </select>
              </div>

              {selectedMedicine && (
                <div className="pharmacy-selected-medicine form-full">
                  <div className="pharmacy-table-icon">
                    <Pill size={19} />
                  </div>

                  <div>
                    <strong>
                      {
                        selectedMedicine.name
                      }
                    </strong>

                    <span>
                      {
                        selectedMedicine.code
                      }
                      {' · '}
                      {selectedMedicine.presentation ||
                        'Sin presentación'}
                      {' · '}
                      {selectedMedicine.concentration ||
                        'Sin concentración'}
                    </span>
                  </div>
                </div>
              )}

              <div className="form-group">
                <label htmlFor="inventory-lot">
                  Número de lote
                </label>

                <input
                  id="inventory-lot"
                  type="text"
                  placeholder="Ejemplo: LOTE-2026-A"
                  value={
                    formData.lotNumber
                  }
                  onChange={(event) =>
                    setFormData(
                      (current) => ({
                        ...current,
                        lotNumber:
                          event.target
                            .value,
                      }),
                    )
                  }
                />
              </div>

              <div className="form-group">
                <label htmlFor="inventory-location">
                  Ubicación
                </label>

                <input
                  id="inventory-location"
                  type="text"
                  placeholder="Ejemplo: Estante A-03"
                  value={
                    formData.location
                  }
                  onChange={(event) =>
                    setFormData(
                      (current) => ({
                        ...current,
                        location:
                          event.target
                            .value,
                      }),
                    )
                  }
                />
              </div>

              <div className="form-group">
                <label htmlFor="inventory-stock">
                  Stock actual
                </label>

                <input
                  id="inventory-stock"
                  type="number"
                  min={0}
                  value={formData.stock}
                  onChange={(event) =>
                    setFormData(
                      (current) => ({
                        ...current,
                        stock: Number(
                          event.target
                            .value,
                        ),
                      }),
                    )
                  }
                  required
                />
              </div>

              <div className="form-group">
                <label htmlFor="inventory-min-stock">
                  Stock mínimo
                </label>

                <input
                  id="inventory-min-stock"
                  type="number"
                  min={0}
                  value={
                    formData.minStock
                  }
                  onChange={(event) =>
                    setFormData(
                      (current) => ({
                        ...current,
                        minStock:
                          Number(
                            event.target
                              .value,
                          ),
                      }),
                    )
                  }
                  required
                />
              </div>

              <div className="form-group">
                <label htmlFor="inventory-expiration">
                  Fecha de caducidad
                </label>

                <input
                  id="inventory-expiration"
                  type="date"
                  value={
                    formData.expirationDate
                  }
                  onChange={(event) =>
                    setFormData(
                      (current) => ({
                        ...current,
                        expirationDate:
                          event.target
                            .value,
                      }),
                    )
                  }
                />
              </div>

              <div className="form-group">
                <label htmlFor="inventory-status">
                  Estado
                </label>

                <select
                  id="inventory-status"
                  value={
                    formData.status
                  }
                  onChange={(event) =>
                    setFormData(
                      (current) => ({
                        ...current,
                        status:
                          event.target
                            .value as InventoryStatus,
                      }),
                    )
                  }
                >
                  {statuses.map(
                    (status) => (
                      <option
                        key={status}
                        value={status}
                      >
                        {status}
                      </option>
                    ),
                  )}
                </select>
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
                  : editingItem
                    ? 'Actualizar inventario'
                    : 'Crear inventario'}
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
              Seguimiento por lote
            </span>

            <h2>
              Existencias registradas
            </h2>

            <p>
              Mostrando{' '}
              {filteredInventory.length}{' '}
              de {inventory.length}{' '}
              registros.
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
              placeholder="Buscar medicamento, código, lote o ubicación"
              value={search}
              onChange={(event) =>
                setSearch(
                  event.target.value,
                )
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

              {statuses.map(
                (status) => (
                  <option
                    key={status}
                    value={status}
                  >
                    {status}
                  </option>
                ),
              )}
            </select>
          </div>

          <div className="pharmacy-filter-control">
            <Boxes size={17} />

            <select
              value={stockFilter}
              onChange={(event) =>
                setStockFilter(
                  event.target
                    .value as StockFilter,
                )
              }
              aria-label="Filtrar por existencias"
            >
              <option value="Todos">
                Todas las existencias
              </option>

              <option value="Correcto">
                Stock correcto
              </option>

              <option value="Bajo">
                Stock bajo
              </option>

              <option value="Sin existencias">
                Sin existencias
              </option>
            </select>
          </div>

          <div className="pharmacy-filter-control">
            <CalendarDays size={17} />

            <select
              value={expirationFilter}
              onChange={(event) =>
                setExpirationFilter(
                  event.target
                    .value as ExpirationFilter,
                )
              }
              aria-label="Filtrar por caducidad"
            >
              <option value="Todas">
                Todas las caducidades
              </option>

              <option value="Vigente">
                Vigentes
              </option>

              <option value="Próxima">
                Próximas a caducar
              </option>

              <option value="Caducado">
                Caducadas
              </option>

              <option value="Sin fecha">
                Sin fecha
              </option>
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
            Cargando inventario...
          </div>
        )}

        {!loading &&
          filteredInventory.length ===
            0 && (
            <div className="pharmacy-empty-state">
              <PackageOpen size={38} />

              <h3>
                No se encontraron registros
              </h3>

              <p>
                Ajusta los filtros o agrega
                un nuevo registro de
                inventario.
              </p>
            </div>
          )}

        {!loading &&
          filteredInventory.length >
            0 && (
            <div className="pharmacy-table-wrapper">
              <table className="pharmacy-data-table">
                <thead>
                  <tr>
                    <th>Medicamento</th>
                    <th>Lote y ubicación</th>
                    <th>Existencias</th>
                    <th>Caducidad</th>
                    <th>Estado</th>
                    <th>Acciones</th>
                  </tr>
                </thead>

                <tbody>
                  {filteredInventory.map(
                    (item) => {
                      const expiration =
                        getExpirationInformation(
                          item.expirationDate,
                        );

                      const withoutStock =
                        item.stock <= 0;

                      const lowStock =
                        item.stock > 0 &&
                        item.isLowStock;

                      return (
                        <tr key={item.id}>
                          <td>
                            <div className="pharmacy-medicine-cell">
                              <div className="pharmacy-table-icon">
                                <Pill size={18} />
                              </div>

                              <div>
                                <strong>
                                  {
                                    item.medicineName
                                  }
                                </strong>

                                <span>
                                  {
                                    item.medicineCode
                                  }
                                </span>
                              </div>
                            </div>
                          </td>

                          <td>
                            <div className="pharmacy-detail-cell">
                              <strong>
                                {item.lotNumber ||
                                  'Sin lote'}
                              </strong>

                              <span>
                                <MapPin
                                  size={14}
                                />

                                {item.location ||
                                  'Sin ubicación'}
                              </span>
                            </div>
                          </td>

                          <td>
                            <div className="pharmacy-stock-cell">
                              <strong>
                                {item.stock}
                              </strong>

                              <span>
                                Mínimo:{' '}
                                {item.minStock}
                              </span>

                              {withoutStock && (
                                <small className="stock-alert danger">
                                  Sin existencias
                                </small>
                              )}

                              {lowStock && (
                                <small className="stock-alert warning">
                                  Stock bajo
                                </small>
                              )}

                              {!withoutStock &&
                                !lowStock && (
                                  <small className="stock-alert success">
                                    <CheckCircle2
                                      size={13}
                                    />
                                    Correcto
                                  </small>
                                )}
                            </div>
                          </td>

                          <td>
                            <div className="pharmacy-expiration-cell">
                              <strong>
                                {formatDate(
                                  item.expirationDate,
                                )}
                              </strong>

                              <span
                                className={`expiration-badge ${expiration.state}`}
                              >
                                {
                                  expiration.label
                                }
                              </span>
                            </div>
                          </td>

                          <td>
                            <span
                              className={
                                item.status ===
                                'Activo'
                                  ? 'status-badge'
                                  : 'status-badge inactive'
                              }
                            >
                              {item.status}
                            </span>
                          </td>

                          <td>
                            <div className="table-actions">
                              <button
                                type="button"
                                className="small-button"
                                onClick={() =>
                                  handleEdit(
                                    item,
                                  )
                                }
                              >
                                <Pencil
                                  size={15}
                                />
                                Editar
                              </button>

                              {item.status ===
                                'Activo' && (
                                <button
                                  type="button"
                                  className="small-button danger"
                                  onClick={() =>
                                    handleDeactivate(
                                      item,
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

export default InventoryPage;