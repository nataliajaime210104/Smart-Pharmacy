import { useEffect, useState } from 'react';
import { Search, FileHeart, UserRound } from 'lucide-react';

import type { Patient } from '../../shared/types';
import { getPatients } from './services/patients.service';

function PatientRecordPage() {
  const [search, setSearch] = useState('');
  const [patients, setPatients] = useState<Patient[]>([]);
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState('');

  useEffect(() => {
    async function loadPatients() {
      try {
        setLoading(true);
        setErrorMessage('');

        const data = await getPatients();

        setPatients(data);
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

  return (
    <div>
      <div className="page-title-row">
        <div className="page-icon">
          <FileHeart size={28} />
        </div>

        <div>
          <h1>Expediente Clínico Digital</h1>
          <p className="page-description">
            HU-02: Consulta del historial clínico del paciente desde MySQL.
          </p>
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

      {errorMessage && (
        <div className="state-card error">{errorMessage}</div>
      )}

      {!loading && !errorMessage && (
        <div className="table-card">
          <table>
            <thead>
              <tr>
                <th>Expediente</th>
                <th>Paciente</th>
                <th>Edad</th>
                <th>Diagnóstico</th>
                <th>Alergias</th>
                <th>Último tratamiento</th>
              </tr>
            </thead>

            <tbody>
              {filteredPatients.map((patient) => (
                <tr key={patient.id}>
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
                  <td>{patient.diagnosis}</td>
                  <td>{patient.allergies}</td>
                  <td>{patient.lastTreatment}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

export default PatientRecordPage;