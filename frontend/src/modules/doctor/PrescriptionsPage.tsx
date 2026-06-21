import { useEffect, useRef, useState } from 'react';
import type { FormEvent } from 'react';
import {
  AlertTriangle,
  CheckCircle,
  Download,
  Eraser,
  FileText,
  PenLine,
  Pill,
  Plus,
  RotateCcw,
  Save,
  Search,
  Signature,
  Trash2,
  UserRound,
  X,
} from 'lucide-react';

import type {
  Medicine,
  Patient,
  Prescription,
  PrescriptionFormData,
  PrescriptionItemFormData,
  StockCheckItem,
  User,
} from '../../shared/types';

import { getPatients } from './services/patients.service';
import { getMedicines } from '../pharmacy/services/pharmacy.service';

import {
  checkPrescriptionStock,
  createPrescription,
  getPrescriptionPdfUrl,
  getPrescriptions,
  signPrescription,
} from './services/prescriptions.service';

interface PrescriptionsPageProps {
  currentUser: User;
}

const emptyItem: PrescriptionItemFormData = {
  medicineId: 0,
  quantity: 1,
  dosage: '',
  frequency: '',
  duration: '',
  instructions: '',
};

function createEmptyForm(doctorId: number): PrescriptionFormData {
  return {
    patientId: 0,
    doctorId,
    diagnosis: '',
    notes: '',
    items: [{ ...emptyItem }],
  };
}

function PrescriptionsPage({ currentUser }: PrescriptionsPageProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  const [prescriptions, setPrescriptions] = useState<Prescription[]>([]);
  const [patients, setPatients] = useState<Patient[]>([]);
  const [medicines, setMedicines] = useState<Medicine[]>([]);

  const [formData, setFormData] = useState<PrescriptionFormData>(
    createEmptyForm(currentUser.id)
  );

  const [isFormOpen, setIsFormOpen] = useState(false);
  const [stockResult, setStockResult] = useState<StockCheckItem[]>([]);
  const [search, setSearch] = useState('');

  const [isSignatureOpen, setIsSignatureOpen] = useState(false);
  const [selectedPrescription, setSelectedPrescription] =
    useState<Prescription | null>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [hasSignature, setHasSignature] = useState(false);
  const [signing, setSigning] = useState(false);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  async function loadData() {
    try {
      setLoading(true);
      setErrorMessage('');

      const patientsData = await getPatients();
      setPatients(patientsData);

      const medicinesData = await getMedicines();
      setMedicines(
        medicinesData.filter((medicine) => medicine.status === 'Activo')
      );

      const prescriptionsData = await getPrescriptions();
      setPrescriptions(prescriptionsData);
    } catch (error) {
      setErrorMessage(
        error instanceof Error
          ? error.message
          : 'No fue posible cargar la información de recetas.'
      );
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadData();
  }, []);

  const filteredPrescriptions = prescriptions.filter((prescription) =>
    prescription.folio.toLowerCase().includes(search.toLowerCase()) ||
    prescription.patientName.toLowerCase().includes(search.toLowerCase()) ||
    prescription.status.toLowerCase().includes(search.toLowerCase())
  );

  const openCreateForm = () => {
    setFormData(createEmptyForm(currentUser.id));
    setStockResult([]);
    setErrorMessage('');
    setSuccessMessage('');
    setIsFormOpen(true);
  };

  const closeForm = () => {
    setFormData(createEmptyForm(currentUser.id));
    setStockResult([]);
    setErrorMessage('');
    setSuccessMessage('');
    setIsFormOpen(false);
  };

  const handleGeneralChange = (
    field: keyof Omit<PrescriptionFormData, 'items'>,
    value: string | number
  ) => {
    setFormData((current) => ({
      ...current,
      [field]: value,
    }));
  };

  const handleItemChange = (
    index: number,
    field: keyof PrescriptionItemFormData,
    value: string | number
  ) => {
    setFormData((current) => ({
      ...current,
      items: current.items.map((item, itemIndex) =>
        itemIndex === index
          ? {
              ...item,
              [field]: value,
            }
          : item
      ),
    }));

    setStockResult([]);
  };

  const addItem = () => {
    setFormData((current) => ({
      ...current,
      items: [...current.items, { ...emptyItem }],
    }));
  };

  const removeItem = (index: number) => {
    setFormData((current) => ({
      ...current,
      items: current.items.filter((_, itemIndex) => itemIndex !== index),
    }));

    setStockResult([]);
  };

  const getMedicineAvailableStock = (medicineId: number) => {
    const medicine = medicines.find((item) => item.id === medicineId);

    return medicine?.totalStock ?? 0;
  };

  const handleCheckStock = async () => {
    try {
      setErrorMessage('');
      setSuccessMessage('');

      const result = await checkPrescriptionStock(formData);

      setStockResult(result.data);

      if (result.canCreate) {
        setSuccessMessage('Inventario suficiente para generar la receta.');
      } else {
        setErrorMessage('Hay medicamentos sin inventario suficiente.');
      }
    } catch (error) {
      setErrorMessage(
        error instanceof Error
          ? error.message
          : 'No fue posible verificar inventario.'
      );
    }
  };

  const validateForm = () => {
    if (!formData.patientId) {
      setErrorMessage('Selecciona un paciente.');
      return false;
    }

    const hasInvalidItem = formData.items.some(
      (item) => !item.medicineId || item.quantity < 1
    );

    if (hasInvalidItem) {
      setErrorMessage(
        'Cada medicamento debe tener medicamento seleccionado y cantidad mayor a cero.'
      );
      return false;
    }

    return true;
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!validateForm()) {
      return;
    }

    try {
      setSaving(true);
      setErrorMessage('');
      setSuccessMessage('');

      const stockValidation = await checkPrescriptionStock(formData);
      setStockResult(stockValidation.data);

      if (!stockValidation.canCreate) {
        setErrorMessage(
          'No se puede crear la receta porque no hay inventario suficiente.'
        );
        return;
      }

      await createPrescription(formData);
      await loadData();

      setIsFormOpen(false);
      setFormData(createEmptyForm(currentUser.id));
      setStockResult([]);
      setSuccessMessage('Receta electrónica creada correctamente.');
    } catch (error) {
      setErrorMessage(
        error instanceof Error
          ? error.message
          : 'No fue posible guardar la receta electrónica.'
      );
    } finally {
      setSaving(false);
    }
  };

  const prepareSignatureCanvas = () => {
    setTimeout(() => {
      const canvas = canvasRef.current;

      if (!canvas) {
        return;
      }

      const context = canvas.getContext('2d');

      if (!context) {
        return;
      }

      context.lineWidth = 3;
      context.lineCap = 'round';
      context.lineJoin = 'round';
      context.strokeStyle = '#0f172a';
    }, 100);
  };

  const openSignaturePad = (prescription: Prescription) => {
    setSelectedPrescription(prescription);
    setHasSignature(false);
    setErrorMessage('');
    setSuccessMessage('');
    setIsSignatureOpen(true);
    prepareSignatureCanvas();
  };

  const closeSignaturePad = () => {
    setSelectedPrescription(null);
    setIsSignatureOpen(false);
    setIsDrawing(false);
    setHasSignature(false);
  };

  const getCanvasPoint = (event: React.PointerEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;

    if (!canvas) {
      return {
        x: 0,
        y: 0,
      };
    }

    const rect = canvas.getBoundingClientRect();

    return {
      x: (event.clientX - rect.left) * (canvas.width / rect.width),
      y: (event.clientY - rect.top) * (canvas.height / rect.height),
    };
  };

  const startDrawing = (event: React.PointerEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    const context = canvas?.getContext('2d');

    if (!canvas || !context) {
      return;
    }

    const point = getCanvasPoint(event);

    context.beginPath();
    context.moveTo(point.x, point.y);

    setIsDrawing(true);
    setHasSignature(true);
  };

  const drawSignature = (event: React.PointerEvent<HTMLCanvasElement>) => {
    if (!isDrawing) {
      return;
    }

    const canvas = canvasRef.current;
    const context = canvas?.getContext('2d');

    if (!canvas || !context) {
      return;
    }

    const point = getCanvasPoint(event);

    context.lineTo(point.x, point.y);
    context.stroke();
  };

  const stopDrawing = () => {
    setIsDrawing(false);
  };

  const clearSignature = () => {
    const canvas = canvasRef.current;
    const context = canvas?.getContext('2d');

    if (!canvas || !context) {
      return;
    }

    context.clearRect(0, 0, canvas.width, canvas.height);
    setHasSignature(false);
  };

  const exportSignatureDataUrl = () => {
    const canvas = canvasRef.current;

    if (!canvas) {
      return '';
    }

    const cleanCanvas = document.createElement('canvas');
    cleanCanvas.width = canvas.width;
    cleanCanvas.height = canvas.height;

    const context = cleanCanvas.getContext('2d');

    if (!context) {
      return '';
    }

    context.fillStyle = '#ffffff';
    context.fillRect(0, 0, cleanCanvas.width, cleanCanvas.height);
    context.drawImage(canvas, 0, 0);

    return cleanCanvas.toDataURL('image/png');
  };

  const handleSubmitSignature = async () => {
    if (!selectedPrescription) {
      return;
    }

    if (!hasSignature) {
      setErrorMessage('Debes dibujar la firma antes de continuar.');
      return;
    }

    try {
      setSigning(true);
      setErrorMessage('');
      setSuccessMessage('');

      const signatureDataUrl = exportSignatureDataUrl();

      await signPrescription(
        selectedPrescription.id,
        signatureDataUrl,
        currentUser.name
      );

      await loadData();

      setSuccessMessage('Receta firmada digitalmente correctamente.');
      closeSignaturePad();

      window.open(getPrescriptionPdfUrl(selectedPrescription.id), '_blank');
    } catch (error) {
      setErrorMessage(
        error instanceof Error
          ? error.message
          : 'No fue posible firmar la receta.'
      );
    } finally {
      setSigning(false);
    }
  };

  const openPrescriptionPdf = (prescription: Prescription) => {
    window.open(getPrescriptionPdfUrl(prescription.id), '_blank');
  };

  return (
    <div>
      <div className="page-header-with-action">
        <div className="page-title-row">
          <div className="page-icon">
            <FileText size={28} />
          </div>

          <div>
            <h1>Recetas Electrónicas</h1>
            <p className="page-description">
              HU-03, HU-04 y HU-05: generación de recetas electrónicas,
              firma digital con trazo manual, PDF y verificación de inventario
              antes de emitir la receta.
            </p>
          </div>
        </div>

        <button type="button" onClick={openCreateForm}>
          <Plus size={18} />
          Nueva receta
        </button>
      </div>

      {errorMessage && !isFormOpen && !isSignatureOpen && (
        <div className="form-alert error">{errorMessage}</div>
      )}

      {successMessage && !isFormOpen && !isSignatureOpen && (
        <div className="form-alert success">{successMessage}</div>
      )}

      {isFormOpen && (
        <div className="form-drawer">
          <div className="form-drawer-header">
            <div className="section-heading">
              <FileText size={24} />
              <h3>Crear receta electrónica</h3>
            </div>

            <button
              type="button"
              className="icon-close-button"
              onClick={closeForm}
            >
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
                <label>Paciente</label>
                <select
                  value={formData.patientId}
                  onChange={(event) =>
                    handleGeneralChange('patientId', Number(event.target.value))
                  }
                >
                  <option value={0}>Selecciona un paciente</option>

                  {patients.map((patient) => (
                    <option key={patient.id} value={patient.id}>
                      {patient.recordNumber} - {patient.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label>Médico responsable</label>
                <input type="text" value={currentUser.name} disabled />
              </div>

              <div className="form-group form-full">
                <label>Diagnóstico</label>
                <input
                  type="text"
                  placeholder="Ejemplo: Infección respiratoria"
                  value={formData.diagnosis}
                  onChange={(event) =>
                    handleGeneralChange('diagnosis', event.target.value)
                  }
                />
              </div>

              <div className="form-group form-full">
                <label>Notas generales</label>
                <textarea
                  placeholder="Observaciones médicas generales de la receta"
                  value={formData.notes}
                  onChange={(event) =>
                    handleGeneralChange('notes', event.target.value)
                  }
                />
              </div>
            </div>

            <div className="prescription-items-section">
              <div className="section-heading">
                <Pill size={22} />
                <h3>Medicamentos recetados</h3>
              </div>

              {formData.items.map((item, index) => {
                const availableStock = getMedicineAvailableStock(item.medicineId);
                const hasLowStock =
                  item.medicineId > 0 && item.quantity > availableStock;

                return (
                  <div className="prescription-item-card" key={`item-${index}`}>
                    <div className="prescription-item-header">
                      <strong>Medicamento #{index + 1}</strong>

                      {formData.items.length > 1 && (
                        <button
                          type="button"
                          className="small-button danger"
                          onClick={() => removeItem(index)}
                        >
                          <Trash2 size={15} />
                          Quitar
                        </button>
                      )}
                    </div>

                    <div className="form-drawer-grid">
                      <div className="form-group">
                        <label>Medicamento</label>
                        <select
                          value={item.medicineId}
                          onChange={(event) =>
                            handleItemChange(
                              index,
                              'medicineId',
                              Number(event.target.value)
                            )
                          }
                        >
                          <option value={0}>Selecciona un medicamento</option>

                          {medicines.map((medicine) => (
                            <option key={medicine.id} value={medicine.id}>
                              {medicine.code} - {medicine.name} / Stock:{' '}
                              {medicine.totalStock}
                            </option>
                          ))}
                        </select>
                      </div>

                      <div className="form-group">
                        <label>Cantidad</label>
                        <input
                          type="number"
                          min={1}
                          value={item.quantity}
                          onChange={(event) =>
                            handleItemChange(
                              index,
                              'quantity',
                              Number(event.target.value)
                            )
                          }
                        />
                      </div>

                      <div className="form-group">
                        <label>Dosis</label>
                        <input
                          type="text"
                          placeholder="Ejemplo: 1 tableta"
                          value={item.dosage}
                          onChange={(event) =>
                            handleItemChange(index, 'dosage', event.target.value)
                          }
                        />
                      </div>

                      <div className="form-group">
                        <label>Frecuencia</label>
                        <input
                          type="text"
                          placeholder="Ejemplo: Cada 8 horas"
                          value={item.frequency}
                          onChange={(event) =>
                            handleItemChange(
                              index,
                              'frequency',
                              event.target.value
                            )
                          }
                        />
                      </div>

                      <div className="form-group">
                        <label>Duración</label>
                        <input
                          type="text"
                          placeholder="Ejemplo: 5 días"
                          value={item.duration}
                          onChange={(event) =>
                            handleItemChange(index, 'duration', event.target.value)
                          }
                        />
                      </div>

                      <div className="form-group">
                        <label>Inventario disponible</label>
                        <div
                          className={
                            hasLowStock
                              ? 'stock-inline-card danger'
                              : 'stock-inline-card'
                          }
                        >
                          {item.medicineId
                            ? `${availableStock} unidades disponibles`
                            : 'Selecciona medicamento'}
                        </div>
                      </div>

                      <div className="form-group form-full">
                        <label>Indicaciones</label>
                        <textarea
                          placeholder="Indicaciones específicas para el paciente"
                          value={item.instructions}
                          onChange={(event) =>
                            handleItemChange(
                              index,
                              'instructions',
                              event.target.value
                            )
                          }
                        />
                      </div>
                    </div>
                  </div>
                );
              })}

              <button
                type="button"
                className="secondary-button"
                onClick={addItem}
              >
                <Plus size={18} />
                Agregar otro medicamento
              </button>
            </div>

            {stockResult.length > 0 && (
              <div className="stock-result-panel">
                <div className="section-heading">
                  <AlertTriangle size={22} />
                  <h3>Resultado de verificación de inventario</h3>
                </div>

                <div className="stock-result-list">
                  {stockResult.map((item) => (
                    <div
                      className={
                        item.isAvailable
                          ? 'stock-result-item'
                          : 'stock-result-item danger'
                      }
                      key={item.medicineId}
                    >
                      {item.isAvailable ? (
                        <CheckCircle size={18} />
                      ) : (
                        <AlertTriangle size={18} />
                      )}

                      <span>
                        {item.medicineName}: solicitado{' '}
                        {item.requestedQuantity}, disponible{' '}
                        {item.availableStock}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="form-actions">
              <button
                type="button"
                className="secondary-button"
                onClick={handleCheckStock}
              >
                <AlertTriangle size={18} />
                Verificar inventario
              </button>

              <button type="submit" disabled={saving}>
                <Save size={18} />
                {saving ? 'Guardando...' : 'Crear receta'}
              </button>

              <button
                type="button"
                className="secondary-button"
                onClick={closeForm}
              >
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
          placeholder="Buscar por folio, paciente o estado"
          value={search}
          onChange={(event) => setSearch(event.target.value)}
        />
      </div>

      {loading && (
        <div className="state-card">Cargando recetas electrónicas...</div>
      )}

      {!loading && (
        <div className="table-card users-table">
          <table>
            <thead>
              <tr>
                <th>Folio</th>
                <th>Paciente</th>
                <th>Médico</th>
                <th>Medicamentos</th>
                <th>Estado</th>
                <th>Firma</th>
                <th>Código</th>
                <th>Fecha</th>
                <th>Acciones</th>
              </tr>
            </thead>

            <tbody>
              {filteredPrescriptions.map((prescription) => (
                <tr key={prescription.id}>
                  <td>{prescription.folio}</td>

                  <td>
                    <div className="table-user">
                      <div className="table-avatar">
                        <UserRound size={16} />
                      </div>
                      {prescription.patientName}
                    </div>
                  </td>

                  <td>{prescription.doctorName}</td>

                  <td>
                    {prescription.items.map((item) => (
                      <div key={item.id}>
                        {item.medicineName} x {item.quantity}
                      </div>
                    ))}
                  </td>

                  <td>
                    <span
                      className={
                        prescription.status === 'Firmada'
                          ? 'status-badge'
                          : 'status-badge warning'
                      }
                    >
                      {prescription.status}
                    </span>
                  </td>

                  <td>
                    {prescription.signatureHash ? (
                      <span className="signature-hash">
                        {prescription.signatureHash.slice(0, 14)}...
                      </span>
                    ) : (
                      'Sin firma'
                    )}
                  </td>

                  <td>{prescription.verificationCode ?? 'N/A'}</td>

                  <td>{prescription.createdAt || 'N/A'}</td>

                  <td>
                    <div className="table-actions">
                      {prescription.status === 'Borrador' && (
                        <button
                          type="button"
                          className="small-button"
                          onClick={() => openSignaturePad(prescription)}
                        >
                          <PenLine size={15} />
                          Firmar
                        </button>
                      )}

                      {prescription.status === 'Firmada' && (
                        <button
                          type="button"
                          className="small-button"
                          onClick={() => openPrescriptionPdf(prescription)}
                        >
                          <Download size={15} />
                          PDF
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

      {isSignatureOpen && selectedPrescription && (
        <div className="signature-modal-overlay">
          <div className="signature-modal-card">
            <div className="form-drawer-header">
              <div className="section-heading">
                <Signature size={24} />
                <h3>Firmar receta electrónica</h3>
              </div>

              <button
                type="button"
                className="icon-close-button"
                onClick={closeSignaturePad}
              >
                <X size={20} />
              </button>
            </div>

            {errorMessage && (
              <div className="form-alert error">{errorMessage}</div>
            )}

            <div className="signature-prescription-summary">
              <p>
                <strong>Folio:</strong> {selectedPrescription.folio}
              </p>

              <p>
                <strong>Paciente:</strong> {selectedPrescription.patientName}
              </p>

              <p>
                <strong>Médico:</strong> {currentUser.name}
              </p>
            </div>

            <div className="signature-canvas-wrapper">
              <canvas
                ref={canvasRef}
                width={900}
                height={280}
                className="signature-canvas"
                onPointerDown={startDrawing}
                onPointerMove={drawSignature}
                onPointerUp={stopDrawing}
                onPointerLeave={stopDrawing}
                onPointerCancel={stopDrawing}
              />
            </div>

            <p className="signature-help-text">
              Dibuja la firma dentro del recuadro. Al confirmar, se generará el
              hash, el código de verificación y el PDF de la receta.
            </p>

            <div className="form-actions">
              <button
                type="button"
                className="secondary-button"
                onClick={clearSignature}
              >
                <Eraser size={18} />
                Limpiar firma
              </button>

              <button
                type="button"
                disabled={signing}
                onClick={handleSubmitSignature}
              >
                <Signature size={18} />
                {signing ? 'Firmando...' : 'Confirmar firma'}
              </button>

              <button
                type="button"
                className="secondary-button"
                onClick={closeSignaturePad}
              >
                <RotateCcw size={18} />
                Cancelar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default PrescriptionsPage;