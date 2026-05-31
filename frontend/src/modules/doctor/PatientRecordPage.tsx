import { useState } from 'react';
import { Search, FileHeart, UserRound } from 'lucide-react';
import { patientsMock } from '../../mocks/patients.mock';

function PatientRecordPage() {
  const [search, setSearch] = useState('');

  const filteredPatients = patientsMock.filter((patient) =>
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
            HU-02: Consulta del historial clínico del paciente.
          </p>
        </div>
      </div>

      <div className="search-box icon-input">
        <Search size={18} />
        <input
          type="text"
          placeholder="Buscar por nombre o número de expediente"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

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
                <td>{patient.age}</td>
                <td>{patient.diagnosis}</td>
                <td>{patient.allergies}</td>
                <td>{patient.lastTreatment}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default PatientRecordPage;