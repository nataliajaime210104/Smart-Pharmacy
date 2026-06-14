import { useEffect, useState } from 'react';
import {
  AlertTriangle,
  Boxes,
  Pencil,
  Plus,
  RotateCcw,
  Save,
  Search,
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
  getLowStockInventory,
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

const statuses: InventoryStatus[] = ['Activo', 'Inactivo'];

function InventoryPage() {
  const [inventory, setInventory] = useState<InventoryItem[]>([]);
  const [lowStock, setLowStock] = useState<InventoryItem[]>([]);
  const [medicines, setMedicines] = useState<Medicine[]>([]);

  const [formData, setFormData] = useState<InventoryFormData>(emptyForm);
  const [editingItem, setEditingItem] = useState<InventoryItem | null>(null);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [search, setSearch] = useState('');

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  async function loadData() {
    try {
      setLoading(true);
      setErrorMessage('');

      const [inventoryData, lowStockData, medicinesData] = await Promise.all([
        getInventory(),
        getLowStockInventory(),
        getMedicines(),
      ]);

      setInventory(inventoryData);
      setLowStock(lowStockData);
      setMedicines(medicinesData.filter((medicine) => medicine.status === 'Activo'));
    } catch {
      setErrorMessage('No fue posible cargar el inventario.');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadData();
  }, []);

  const filteredInventory = inventory.filter((item) =>
    item.medicineName.toLowerCase().includes(search.toLowerCase()) ||
    item.medicineCode.toLowerCase().includes(search.toLowerCase()) ||
    (item.lotNumber ?? '').toLowerCase().includes(search.toLowerCase())
  );

  const openCreateForm = () => {
    setEditingItem(null);
    setFormData({
      ...emptyForm,
      medicineId: medicines[0]?.id ?? 0,
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

  const handleEdit = (item: InventoryItem) => {
    setEditingItem(item);
    setFormData({
      medicineId: item.medicineId,
      lotNumber: item.lotNumber ?? '',
      stock: item.stock,
      minStock: item.minStock,
      location: item.location ?? '',
      expirationDate: item.expirationDate ?? '',
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

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!formData.medicineId) {
      setErrorMessage('Selecciona un medicamento.');
      return;
    }

    try {
      setSaving(true);
      setErrorMessage('');
      setSuccessMessage('');

      if (editingItem) {
        await updateInventoryItem(editingItem.id, formData);
        setSuccessMessage('Inventario actualizado correctamente.');
      } else {
        await createInventoryItem(formData);
        setSuccessMessage('Inventario registrado correctamente.');
      }

      await loadData();

      setTimeout(() => {
        closeForm();
      }, 700);
    } catch (error) {
      setErrorMessage(
        error instanceof Error
          ? error.message
          : 'No fue posible guardar el inventario.'
      );
    } finally {
      setSaving(false);
    }
  };

  const handleDeactivate = async (item: InventoryItem) => {
    const confirmDeactivate = window.confirm(
      `¿Deseas desactivar el inventario de ${item.medicineName}?`
    );

    if (!confirmDeactivate) {
      return;
    }

    try {
      setErrorMessage('');
      setSuccessMessage('');

      await deactivateInventoryItem(item.id);
      setSuccessMessage('Inventario desactivado correctamente.');
      await loadData();
    } catch {
      setErrorMessage('No fue posible desactivar el inventario.');
    }
  };

  return (
    <div>
      <div className="page-header-with-action">
        <div className="page-title-row">
          <div className="page-icon">
            <Boxes size={28} />
          </div>

          <div>
            <h1>Inventario</h1>
            <p className="page-description">
              Control de stock por medicamento, lote, ubicación y fecha de caducidad.
              Este módulo prepara la verificación automática para recetas electrónicas.
            </p>
          </div>
        </div>

        <button type="button" onClick={openCreateForm}>
          <Plus size={18} />
          Nuevo inventario
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
              {editingItem ? <Pencil size={24} /> : <Plus size={24} />}
              <h3>{editingItem ? 'Editar inventario' : 'Registrar inventario'}</h3>
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
                <label>Medicamento</label>
                <select
                  value={formData.medicineId}
                  onChange={(event) =>
                    setFormData((current) => ({
                      ...current,
                      medicineId: Number(event.target.value),
                    }))
                  }
                >
                  <option value={0}>Selecciona un medicamento</option>

                  {medicines.map((medicine) => (
                    <option key={medicine.id} value={medicine.id}>
                      {medicine.code} - {medicine.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label>Lote</label>
                <input
                  type="text"
                  placeholder="Ejemplo: LOTE-2026-A"
                  value={formData.lotNumber}
                  onChange={(event) =>
                    setFormData((current) => ({
                      ...current,
                      lotNumber: event.target.value,
                    }))
                  }
                />
              </div>

              <div className="form-group">
                <label>Stock actual</label>
                <input
                  type="number"
                  min={0}
                  value={formData.stock}
                  onChange={(event) =>
                    setFormData((current) => ({
                      ...current,
                      stock: Number(event.target.value),
                    }))
                  }
                />
              </div>

              <div className="form-group">
                <label>Stock mínimo</label>
                <input
                  type="number"
                  min={0}
                  value={formData.minStock}
                  onChange={(event) =>
                    setFormData((current) => ({
                      ...current,
                      minStock: Number(event.target.value),
                    }))
                  }
                />
              </div>

              <div className="form-group">
                <label>Ubicación</label>
                <input
                  type="text"
                  placeholder="Ejemplo: Quiosco A, Farmacia central"
                  value={formData.location}
                  onChange={(event) =>
                    setFormData((current) => ({
                      ...current,
                      location: event.target.value,
                    }))
                  }
                />
              </div>

              <div className="form-group">
                <label>Fecha de caducidad</label>
                <input
                  type="date"
                  value={formData.expirationDate}
                  onChange={(event) =>
                    setFormData((current) => ({
                      ...current,
                      expirationDate: event.target.value,
                    }))
                  }
                />
              </div>

              <div className="form-group">
                <label>Estado</label>
                <select
                  value={formData.status}
                  onChange={(event) =>
                    setFormData((current) => ({
                      ...current,
                      status: event.target.value as InventoryStatus,
                    }))
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

            <div className="form-actions">
              <button type="submit" disabled={saving}>
                <Save size={18} />
                {saving
                  ? 'Guardando...'
                  : editingItem
                    ? 'Actualizar inventario'
                    : 'Crear inventario'}
              </button>

              <button type="button" className="secondary-button" onClick={closeForm}>
                <RotateCcw size={18} />
                Cancelar
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="cards-grid inventory-summary-grid">
        <div className="info-card">
          <div className="card-icon blue">
            <Boxes size={26} />
          </div>
          <h3>Registros de inventario</h3>
          <strong>{inventory.length}</strong>
          <span>Lotes y ubicaciones registrados.</span>
        </div>

        <div className="info-card">
          <div className="card-icon orange">
            <AlertTriangle size={26} />
          </div>
          <h3>Alertas de bajo inventario</h3>
          <strong>{lowStock.length}</strong>
          <span>Medicamentos en o debajo del mínimo.</span>
        </div>
      </div>

      <div className="search-box icon-input">
        <Search size={18} />
        <input
          type="text"
          placeholder="Buscar por medicamento, código o lote"
          value={search}
          onChange={(event) => setSearch(event.target.value)}
        />
      </div>

      {loading && (
        <div className="state-card">Cargando inventario...</div>
      )}

      {!loading && (
        <div className="table-card users-table">
          <table>
            <thead>
              <tr>
                <th>Código</th>
                <th>Medicamento</th>
                <th>Lote</th>
                <th>Stock</th>
                <th>Mínimo</th>
                <th>Ubicación</th>
                <th>Caducidad</th>
                <th>Estado</th>
                <th>Alerta</th>
                <th>Acciones</th>
              </tr>
            </thead>

            <tbody>
              {filteredInventory.map((item) => (
                <tr key={item.id}>
                  <td>{item.medicineCode}</td>
                  <td>{item.medicineName}</td>
                  <td>{item.lotNumber || 'N/A'}</td>
                  <td>{item.stock}</td>
                  <td>{item.minStock}</td>
                  <td>{item.location || 'N/A'}</td>
                  <td>{item.expirationDate || 'N/A'}</td>

                  <td>
                    <span
                      className={
                        item.status === 'Activo'
                          ? 'status-badge'
                          : 'status-badge inactive'
                      }
                    >
                      {item.status}
                    </span>
                  </td>

                  <td>
                    {item.isLowStock ? (
                      <span className="status-badge warning">
                        Bajo stock
                      </span>
                    ) : (
                      <span className="status-badge">
                        Correcto
                      </span>
                    )}
                  </td>

                  <td>
                    <div className="table-actions">
                      <button
                        type="button"
                        className="small-button"
                        onClick={() => handleEdit(item)}
                      >
                        <Pencil size={15} />
                        Editar
                      </button>

                      {item.status === 'Activo' && (
                        <button
                          type="button"
                          className="small-button danger"
                          onClick={() => handleDeactivate(item)}
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

export default InventoryPage;