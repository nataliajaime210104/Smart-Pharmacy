-- Archivo convertido desde MySQL/HeidiSQL a PostgreSQL para Render

-- Fuente: SmartpharmacyDB(1).sql

-- Uso recomendado: ejecutar DESPUÉS de que Laravel haya creado las tablas con migraciones.

-- Importa solo tablas del sistema SmartPharmacy; omite tablas internas de Laravel como sessions, cache, jobs y migrations.



BEGIN;



-- Limpia datos existentes y reinicia IDs.

TRUNCATE TABLE "prescription_items", "prescriptions", "inventories", "patients", "medicines", "users" RESTART IDENTITY CASCADE;



-- Datos importados

INSERT INTO "users" ("id", "name", "email", "email_verified_at", "password", "role", "status", "remember_token", "created_at", "updated_at") VALUES
(1, 'Dra. Natalia Jaime', 'natalia@hospital.com', NULL, '$2y$12$HqDH1rWnweiqEdzGZdqDT.XZz31/L1CofKKF1JSCB7CLq8VRY17Lq', 'Medico', 'Activo', NULL, '2026-06-14 10:03:33', '2026-06-14 10:03:33'),
	(2, 'Sebastian Torres', 'sebastian@hospital.com', NULL, '$2y$12$Ik/YNoWyXT6N9rk5LaMlHuaqHTMl09hAWpx2Znyw7gjP2gsG0oNcG', 'Administrador Sistema', 'Activo', NULL, '2026-06-14 10:03:33', '2026-06-14 14:33:48'),
	(3, 'Alexa Martínez', 'alexa@hospital.com', NULL, '$2y$12$PNiBzSOvPr0dXQC5W8F8GeQ2ewBEZdklyQMgnA7WWEkYv8AdQCRsO', 'Paciente', 'Activo', NULL, '2026-06-14 10:03:34', '2026-06-21 11:23:12'),
	(4, 'Victor Gómez', 'victor@hospital.com', NULL, '$2y$12$0ZBTq3h9OhAzptSAGXpw.OokBLQfRLli0Yml53.kDAF7hXNqSfDdS', 'Administrador Farmacia', 'Activo', NULL, '2026-06-14 10:03:34', '2026-06-14 10:03:34'),
	(5, 'Lian Sebastian Gonzalez Diaz', 'chinogandalla2503@gmail.com', NULL, '$2y$12$ZA5goKdCoyysH0HylZkfRu9kUN4Ji0xtZulGbF3OlsCBp1A7LdLPO', 'Medico', 'Activo', NULL, '2026-06-14 14:36:46', '2026-06-14 14:36:46'),
	(6, 'Luis Alberto Garcia Mendoza', 'prueba@gmail.com', NULL, '$2y$12$V.d.QdFAfCSLMwuaU5eBU.b7OCj95N7Y4GuaWFwwaRmNTPc/Tn5/G', 'Paciente', 'Activo', NULL, '2026-06-21 10:32:03', '2026-06-21 10:32:03');

INSERT INTO "patients" ("id", "user_id", "record_number", "full_name", "birth_date", "age", "diagnosis", "allergies", "medical_conditions", "clinical_notes", "last_treatment", "created_at", "updated_at") VALUES
(1, NULL, 'EXP-2026-001', 'María Fernanda López', '1992-04-18', 34, 'Hipertensión arterial', 'Penicilina', 'asma y ataques epilepcticos', 'mucho cuidado con su cabeza', 'Losartán 50 mg cada 24 horas', '2026-06-14 10:03:34', '2026-06-22 09:47:43'),
	(2, NULL, 'EXP-2026-002', 'Carlos Alberto Ramírez', '1984-09-11', NULL, 'Diabetes tipo 2', 'Sin alergias registradas', NULL, NULL, 'Metformina 850 mg cada 12 horas', '2026-06-14 10:03:34', '2026-06-14 10:03:34'),
	(3, NULL, 'EXP-2026-003', 'Ana Sofía Hernández', '1998-01-24', NULL, 'Infección respiratoria', 'Ibuprofeno', NULL, NULL, 'Paracetamol 500 mg cada 8 horas', '2026-06-14 10:03:34', '2026-06-14 10:03:34'),
	(4, 6, 'EXP-2026-006', 'Luis Alberto Garcia Mendoza', NULL, NULL, 'Pendiente por registrar', 'Pendiente por registrar', NULL, NULL, 'Pendiente por registrar', '2026-06-21 10:32:03', '2026-06-21 10:32:03'),
	(7, 3, 'EXP-2026-007', 'Alexa Martínez', NULL, 22, 'Pendiente por registrar', 'Pendiente por registrar', NULL, NULL, 'Pendiente por registrar', '2026-06-21 11:50:09', '2026-06-21 11:50:09');

INSERT INTO "medicines" ("id", "code", "name", "presentation", "concentration", "unit", "description", "status", "created_at", "updated_at") VALUES
(1, '123456ADSA', 'Ibuprofeno', 'inyecciones', '1200 mg', 'pieza', 'Prueba para guardar', 'Activo', '2026-06-14 15:42:22', '2026-06-14 15:42:22');

INSERT INTO "inventories" ("id", "medicine_id", "lot_number", "stock", "min_stock", "location", "expiration_date", "status", "created_at", "updated_at") VALUES
(1, 1, '2026-B', 28, 80, 'deeler de la esquina', '2026-06-30', 'Activo', '2026-06-14 15:43:31', '2026-06-22 10:27:16');

INSERT INTO "prescriptions" ("id", "folio", "patient_id", "doctor_id", "diagnosis", "notes", "status", "signed_at", "signed_by_name", "signature_hash", "verification_code", "signature_image_path", "created_at", "updated_at") VALUES
(1, 'RX-20260621043519-IM1W', 4, 1, 'Infección fuerte en la garganta con posible infección estomacal', 'Reposo por 20 dias', 'Dispensada', '2026-06-21 10:35:31', NULL, '6e26a28eb450e70791079c98434a07d7dc6027bff163dc86552c821f77694de5', NULL, NULL, '2026-06-21 10:35:19', '2026-06-22 10:27:16'),
	(2, 'RX-20260621055229-MODK', 7, 1, 'prueba', 'prueba', 'Dispensada', '2026-06-21 11:52:48', 'Dra. Natalia Jaime', '8606c813781ffbb9b2c219fcbdf81445d7e649ce5e20ef44cbb291442c9d5e86', 'SP-D35754B59F', 'signatures/prescription-2-20260621055248.png', '2026-06-21 11:52:29', '2026-06-22 10:27:14');

INSERT INTO "prescription_items" ("id", "prescription_id", "medicine_id", "quantity", "dosage", "frequency", "duration", "instructions", "created_at", "updated_at") VALUES
(1, 1, 1, 6, '2 tabletas', 'cada 6 horas', '7 dias', 'No tomar con refresco', '2026-06-21 10:35:19', '2026-06-21 10:35:19'),
	(2, 1, 1, 5, '1', '1', '7', NULL, '2026-06-21 10:35:19', '2026-06-21 10:35:19'),
	(3, 2, 1, 1, NULL, '2', NULL, 'prueba', '2026-06-21 11:52:29', '2026-06-21 11:52:29');



-- Ajusta secuencias para que los próximos IDs continúen después del máximo importado.

SELECT setval(pg_get_serial_sequence('"users"', 'id'), COALESCE((SELECT MAX("id") FROM "users"), 1), (SELECT COUNT(*) > 0 FROM "users"));

SELECT setval(pg_get_serial_sequence('"patients"', 'id'), COALESCE((SELECT MAX("id") FROM "patients"), 1), (SELECT COUNT(*) > 0 FROM "patients"));

SELECT setval(pg_get_serial_sequence('"medicines"', 'id'), COALESCE((SELECT MAX("id") FROM "medicines"), 1), (SELECT COUNT(*) > 0 FROM "medicines"));

SELECT setval(pg_get_serial_sequence('"inventories"', 'id'), COALESCE((SELECT MAX("id") FROM "inventories"), 1), (SELECT COUNT(*) > 0 FROM "inventories"));

SELECT setval(pg_get_serial_sequence('"prescriptions"', 'id'), COALESCE((SELECT MAX("id") FROM "prescriptions"), 1), (SELECT COUNT(*) > 0 FROM "prescriptions"));

SELECT setval(pg_get_serial_sequence('"prescription_items"', 'id'), COALESCE((SELECT MAX("id") FROM "prescription_items"), 1), (SELECT COUNT(*) > 0 FROM "prescription_items"));



COMMIT;