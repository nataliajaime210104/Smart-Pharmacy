import { useEffect, useState } from 'react';
import {
  Download,
  FileHeart,
  FileText,
  Pencil,
  Pill,
  RotateCcw,
  Save,
  Search,
  ShieldCheck,
  UserRound,
  X,
} from 'lucide-react';

import type { Patient, PatientClinicalFormData } from '../../shared/types';
import {
  getPatients,
  updatePatientClinicalData,
} from './services/patients.service';

function PatientRecordPage() {
  const [search, setSearch] = useState('');
  const [patients, setPatients] = useState<Patient[]>([]);
  const [selectedPatient, setSelectedPatient] = useState<Patient | null>(null);

  const [isClinicalFormOpen, setIsClinicalFormOpen] = useState(false);
  const [clinicalForm, setClinicalForm] = useState<PatientClinicalFormData>({
    age: '',
    clinicalDiagnosis: '',
    allergies: '',
    medicalConditions: '',
    clinicalNotes: '',
  });

  const [loading, setLoading] = useState(true);
  const [savingClinicalData, setSavingClinicalData] = useState(false);

  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  useEffect(() => {
    async function loadPatients() {
      try {
        setLoading(true);
        setErrorMessage('');
        setSuccessMessage('');

        const data = await getPatients();

        setPatients(data);
        setSelectedPatient(data[0] ?? null);
      } catch {
        setErrorMessage('No fue posible cargar los expedientes clínicos.');
      } finally {
        setLoading(false);
      }
    }

    loadPatients();
  }, []);

  const filteredPatients = patients.filter((patient) =>
    patient.name.toLowerCase().includes(search.toLowerCase()) ||
    patient.recordNumber.toLowerCase().includes(search.toLowerCase())
  );

  const totalPrescriptions = selectedPatient?.prescriptions?.length ?? 0;

  const signedPrescriptions =
    selectedPatient?.prescriptions?.filter(
      (prescription) => prescription.status === 'Firmada'
    ).length ?? 0;

  const lastPrescription = selectedPatient?.prescriptions?.[0];

  const openPdf = (url: string | null) => {
    if (!url) {
      return;
    }

    window.open(url, '_blank');
  };

  const handleSelectPatient = (patient: Patient) => {
    setSelectedPatient(patient);
    setIsClinicalFormOpen(false);
    setErrorMessage('');
    setSuccessMessage('');
  };

  const openClinicalForm = () => {
    if (!selectedPatient) {
      return;
    }

    setClinicalForm({
      age: selectedPatient.age ?? '',
      clinicalDiagnosis: selectedPatient.clinicalDiagnosis ?? '',
      allergies: selectedPatient.allergies ?? '',
      medicalConditions: selectedPatient.medicalConditions ?? '',
      clinicalNotes: selectedPatient.clinicalNotes ?? '',
    });

    setErrorMessage('');
    setSuccessMessage('');
    setIsClinicalFormOpen(true);
  };

  const closeClinicalForm = () => {
    setIsClinicalFormOpen(false);
    setErrorMessage('');
    setSuccessMessage('');
  };

  const handleClinicalChange = (
    field: keyof PatientClinicalFormData,
    value: string | number
  ) => {
    setClinicalForm((current) => ({
      ...current,
      [field]: value,
    }));
  };

  const handleClinicalSubmit = async (
    event: React.FormEvent<HTMLFormElement>
  ) => {
    event.preventDefault();

    if (!selectedPatient) {
      return;
    }

    try {
      setSavingClinicalData(true);
      setErrorMessage('');
      setSuccessMessage('');

      const updatedPatient = await updatePatientClinicalData(
        selectedPatient.id,
        clinicalForm
      );

      setPatients((current) =>
        current.map((patient) =>
          patient.id === updatedPatient.id ? updatedPatient : patient
        )
      );

      setSelectedPatient(updatedPatient);
      setIsClinicalFormOpen(false);
      setSuccessMessage('Datos clínicos actualizados correctamente.');
    } catch (error) {
      setErrorMessage(
        error instanceof Error
          ? error.message
          : 'No fue posible actualizar los datos clínicos.'
      );
    } finally {
      setSavingClinicalData(false);
    }
  };

  const getStatusClassName = (status: string) => {
    if (status === 'Firmada' || status === 'Dispensada') {
      return 'status-badge';
    }

    return 'status-badge warning';
  };

  return (
    <div>
      <div className="page-title-row">
        <div className="page-icon">
          <FileHeart size={28} />
        </div>
        <div>
          <h1>Recetas Electrónicas</h1>
        </div>
      </div>

      <div className="search-box icon-input">
        <Search size={18} />
        <input
          type="text"
          placeholder="Buscar por nombre o número de expediente"
          value={search}
          onChange={(event) => setSearch(event.target.value)}
        />
      </div>

      {loading && (
        <div className="state-card">Cargando expedientes clínicos...</div>
      )}

      {errorMessage && !isClinicalFormOpen && (
        <div className="state-card error">{errorMessage}</div>
      )}

      {successMessage && !isClinicalFormOpen && (
        <div className="form-alert success">{successMessage}</div>
      )}

      {!loading && !errorMessage && (
        <div className="clinical-layout">
          <div className="table-card clinical-patient-list">
            <table>
              <thead>
                <tr>
                  <th>Expediente</th>
                  <th>Paciente</th>
                  <th>Edad</th>
                  <th>Recetas</th>
                </tr>
              </thead>

              <tbody>
                {filteredPatients.map((patient) => (
                  <tr
                    key={patient.id}
                    className={
                      selectedPatient?.id === patient.id ? 'selected-row' : ''
                    }
                    onClick={() => handleSelectPatient(patient)}
                  >
                    <td>{patient.recordNumber}</td>

                    <td>
                      <div className="table-user">
                        <div className="table-avatar">
                          <UserRound size={16} />
                        </div>
                        {patient.name}
                      </div>
                    </td>

                    <td>{patient.age ?? 'N/A'}</td>
                    <td>{patient.prescriptions?.length ?? 0}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {selectedPatient && (
            <div className="clinical-detail-panel">
              <div className="clinical-header-card">
                <div>
                  <span className="clinical-label">Expediente</span>
                  <h2>{selectedPatient.recordNumber}</h2>
                  <p>{selectedPatient.name}</p>

                  {selectedPatient.email && (
                    <span className="clinical-email">
                      {selectedPatient.email}
                    </span>
                  )}

                  <div style={{ marginTop: 16 }}>
                    <button
                      type="button"
                      className="small-button button-purple"
                      onClick={openClinicalForm}
                    >
                      <Pencil size={15} />
                      Editar datos clínicos
                    </button>
                  </div>
                </div>

                <div className="clinical-avatar">
                  <UserRound size={36} />
                </div>
              </div>

              {isClinicalFormOpen && (
                <div className="form-drawer clinical-edit-form">
                  <div className="form-drawer-header">
                    <div className="section-heading">
                      <Pencil size={24} />
                      <h3>Actualizar datos clínicos</h3>
                    </div>

                    <button
                      type="button"
                      className="icon-close-button"
                      onClick={closeClinicalForm}
                    >
                      <X size={20} />
                    </button>
                  </div>

                  {errorMessage && (
                    <div className="form-alert error">{errorMessage}</div>
                  )}

                  <form onSubmit={handleClinicalSubmit} className="user-form">
                    <div className="form-drawer-grid">
                      <div className="form-group">
                        <label>Edad</label>
                        <input
                          type="number"
                          min={0}
                          max={120}
                          placeholder="Ejemplo: 28"
                          value={clinicalForm.age}
                          onChange={(event) =>
                            handleClinicalChange(
                              'age',
                              event.target.value === ''
                                ? ''
                                : Number(event.target.value)
                            )
                          }
                        />
                      </div>

                      <div className="form-group">
                        <label>Condición médica principal</label>
                        <input
                          type="text"
                          placeholder="Ejemplo: Diabetes tipo 2, hipertensión, asma"
                          value={clinicalForm.clinicalDiagnosis}
                          onChange={(event) =>
                            handleClinicalChange(
                              'clinicalDiagnosis',
                              event.target.value
                            )
                          }
                        />
                      </div>

                      <div className="form-group form-full">
                        <label>Alergias registradas</label>
                        <textarea
                          placeholder="Ejemplo: Penicilina, ibuprofeno, látex, mariscos"
                          value={clinicalForm.allergies}
                          onChange={(event) =>
                            handleClinicalChange(
                              'allergies',
                              event.target.value
                            )
                          }
                        />
                      </div>

                      <div className="form-group form-full">
                        <label>Padecimientos / condiciones médicas</label>
                        <textarea
                          placeholder="Ejemplo: Hipertensión arterial, diabetes, asma, epilepsia"
                          value={clinicalForm.medicalConditions}
                          onChange={(event) =>
                            handleClinicalChange(
                              'medicalConditions',
                              event.target.value
                            )
                          }
                        />
                      </div>

                      <div className="form-group form-full">
                        <label>Notas clínicas generales</label>
                        <textarea
                          placeholder="Observaciones generales del expediente clínico"
                          value={clinicalForm.clinicalNotes}
                          onChange={(event) =>
                            handleClinicalChange(
                              'clinicalNotes',
                              event.target.value
                            )
                          }
                        />
                      </div>
                    </div>

                    <div className="form-actions">
                      <button
                        type="submit"
                        className="button-green"
                        disabled={savingClinicalData}
                      >
                        <Save size={18} />
                        {savingClinicalData
                          ? 'Guardando...'
                          : 'Guardar datos clínicos'}
                      </button>

                      <button
                        type="button"
                        className="secondary-button button-gray"
                        onClick={closeClinicalForm}
                      >
                        <RotateCcw size={18} />
                        Cancelar
                      </button>
                    </div>
                  </form>
                </div>
              )}

              <div className="cards-grid clinical-summary-grid">
                <div className="info-card">
                  <div className="card-icon blue">
                    <UserRound size={24} />
                  </div>
                  <h3>Edad</h3>
                  <strong>{selectedPatient.age ?? 'N/A'}</strong>
                  <span>Dato asociado al expediente clínico.</span>
                </div>

                <div className="info-card">
                  <div className="card-icon green">
                    <FileText size={24} />
                  </div>
                  <h3>Recetas</h3>
                  <strong>{totalPrescriptions}</strong>
                  <span>Recetas electrónicas registradas.</span>
                </div>

                <div className="info-card">
                  <div className="card-icon purple">
                    <ShieldCheck size={24} />
                  </div>
                  <h3>Firmadas</h3>
                  <strong>{signedPrescriptions}</strong>
                  <span>Recetas con firma digital.</span>
                </div>
              </div>

              <div className="clinical-info-grid">
                <div className="clinical-info-card">
                  <span>Condición médica principal</span>
                  <strong>
                    {selectedPatient.clinicalDiagnosis ||
                      'Pendiente por registrarse'}
                  </strong>
                </div>

                <div className="clinical-info-card">
                  <span>Diagnóstico de consulta más reciente</span>
                  <strong>
                    {selectedPatient.latestConsultationDiagnosis ||
                      'Sin receta registrada'}
                  </strong>
                </div>

                <div className="clinical-info-card">
                  <span>Alergias registradas</span>
                  <strong>
                    {selectedPatient.allergies ||
                      'Pendiente por registrarse'}
                  </strong>
                </div>

                <div className="clinical-info-card">
                  <span>Padecimientos / condiciones médicas</span>
                  <strong>
                    {selectedPatient.medicalConditions ||
                      'Sin condiciones registradas'}
                  </strong>
                </div>

                <div className="clinical-info-card">
                  <span>Notas clínicas generales</span>
                  <strong>
                    {selectedPatient.clinicalNotes ||
                      'Sin notas registradas'}
                  </strong>
                </div>

                <div className="clinical-info-card">
                  <span>Tratamiento indicado más reciente</span>
                  <strong>
                    {selectedPatient.lastTreatment ||
                      'Sin tratamiento registrado'}
                  </strong>
                </div>

                <div className="clinical-info-card">
                  <span>Última receta</span>
                  <strong>{lastPrescription?.folio ?? 'Sin recetas'}</strong>
                </div>
              </div>

              <div className="panel-card clinical-history-card">
                <div className="section-heading">
                  <FileText size={24} />
                  <h3>Historial de recetas electrónicas</h3>
                </div>

                {totalPrescriptions === 0 && (
                  <div className="state-card">
                    Este paciente todavía no tiene recetas electrónicas registradas.
                  </div>
                )}

                {selectedPatient.prescriptions?.map((prescription) => (
                  <div
                    className="clinical-prescription-card"
                    key={prescription.id}
                  >
                    <div className="clinical-prescription-header">
                      <div>
                        <h4>{prescription.folio}</h4>
                        <p>
                          Médico: {prescription.doctorName ?? 'N/A'} / Fecha:{' '}
                          {prescription.createdAt ?? 'N/A'}
                        </p>
                      </div>

                      <span className={getStatusClassName(prescription.status)}>
                        {prescription.status}
                      </span>
                    </div>

                    <div className="clinical-prescription-meta">
                      <div>
                        <span>Diagnóstico de consulta</span>
                        <strong>{prescription.diagnosis ?? 'N/A'}</strong>
                      </div>

                      <div>
                        <span>Código de verificación</span>
                        <strong>{prescription.verificationCode ?? 'N/A'}</strong>
                      </div>

                      <div>
                        <span>Firma</span>
                        <strong>
                          {prescription.signatureHash
                            ? `${prescription.signatureHash.slice(0, 16)}...`
                            : 'Sin firma'}
                        </strong>
                      </div>
                    </div>

                    <div className="clinical-medicines-list">
                      <div className="section-heading compact">
                        <Pill size={18} />
                        <h4>Medicamentos indicados</h4>
                      </div>

                      {prescription.items.map((item) => (
                        <div className="clinical-medicine-item" key={item.id}>
                          <div>
                            <strong>
                              {item.medicineCode} - {item.medicineName}
                            </strong>

                            <span>
                              Cantidad: {item.quantity} / Dosis:{' '}
                              {item.dosage ?? 'N/A'} / Frecuencia:{' '}
                              {item.frequency ?? 'N/A'} / Duración:{' '}
                              {item.duration ?? 'N/A'}
                            </span>
                          </div>

                          <p>
                            {item.instructions ??
                              'Sin indicaciones específicas'}
                          </p>
                        </div>
                      ))}
                    </div>

                    {prescription.pdfUrl && (
                      <button
                        type="button"
                        className="small-button button-blue"
                        onClick={() => openPdf(prescription.pdfUrl)}
                      >
                        <Download size={15} />
                        Ver PDF
                      </button>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default PatientRecordPage;