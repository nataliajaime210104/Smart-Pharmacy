## SmartPharmacy

SmartPharmacy es una aplicación web integral para la gestión médica y dispensación inteligente de medicamentos en un entorno hospitalario. El proyecto tiene como objetivo automatizar el proceso de prescripción, entrega y seguimiento de medicamentos, reduciendo errores humanos y mejorando el control de tratamientos de los pacientes.

## Pila tecnológica

* Frontend: React, HTML5, CSS3, JavaScript y TypeScript.
* Backend: Laravel con PHP 8.3.
* Base de datos: MySQL.
* Inteligencia Artificial: OpenAI API para asistente virtual.
* IoT: Arduino o Raspberry Pi para simulación del quiosco dispensador.
* Seguridad: JWT, control de roles y permisos.
* Control de versiones: Git y GitHub.

## Tipo de desarrollo

En esta etapa el proyecto se trabajará como maquetado funcional. Se generará la estructura del sistema, pantallas principales, documentación, archivo de base de datos y simulaciones visuales, pero no se almacenarán registros reales ni se desplegará en servidor.

## Organización por Sprints

El proyecto se desarrollará en 4 sprints de 2 semanas cada uno.

| Sprint   | Fechas                  | Historias de usuario              | Objetivo principal                                                                  |
| -------- | ----------------------- | --------------------------------- | ----------------------------------------------------------------------------------- |
| Sprint 1 | 01/06/2026 - 14/06/2026 | HU-01, HU-02, HU-14, HU-15, HU-17 | Base del sistema, login, expediente médico, asistente virtual y roles               |
| Sprint 2 | 15/06/2026 - 28/06/2026 | HU-03, HU-04, HU-05, HU-16, HU-18 | Recetas electrónicas, firma digital, inventario, usuarios y auditoría               |
| Sprint 3 | 29/06/2026 - 12/07/2026 | HU-06, HU-07, HU-08, HU-09, HU-10 | Quiosco dispensador, biometría, recetas pendientes, dispensación e inventario       |
| Sprint 4 | 13/07/2026 - 26/07/2026 | HU-11, HU-12, HU-13, HU-19, HU-20 | Portal del paciente, calendario, recordatorios, alertas y adherencia al tratamiento |

## Estrategia de ramas

El repositorio se organiza mediante una rama principal y ramas individuales para cada integrante del equipo. Cada integrante trabajará sus avances en su propia rama y posteriormente los cambios podrán integrarse a la rama principal.

### Ramas del repositorio

| Rama      | Responsable     | Uso                                                           |
| --------- | --------------- | ------------------------------------------------------------- |
| master    | Equipo completo | Rama principal del proyecto y versión estable del repositorio |
| Alexa     | Alexa           | Desarrollo de actividades asignadas a la integrante Alexa     |
| Natalia   | Natalia         | Desarrollo de actividades asignadas a la integrante Natalia   |
| Sebastian | Sebastian       | Desarrollo de actividades asignadas al integrante Sebastian   |
| Uriel     | Uriel           | Desarrollo de actividades asignadas al integrante Uriel       |
| Victor    | Victor          | Desarrollo de actividades asignadas al integrante Victor      |
| kiyoshi   | Kiyoshi         | Desarrollo de actividades asignadas al integrante Kiyoshi     |

## Forma de trabajo con ramas

Cada integrante deberá realizar sus cambios dentro de su rama correspondiente. Al finalizar sus avances, deberá subirlos al repositorio para que puedan ser revisados e integrados al proyecto general.

Flujo de trabajo recomendado:

```txt
master
│
├── Alexa
├── Natalia
├── Sebastian
├── Uriel
├── Victor
└── kiyoshi
```

## Relación entre ramas y sprints

Aunque las ramas están organizadas por integrante, el avance del proyecto se dividirá por sprints. Cada integrante trabajará dentro de su propia rama las historias de usuario asignadas para cada sprint.

| Sprint   | Integrantes     | Actividad general                                                                            |
| -------- | --------------- | -------------------------------------------------------------------------------------------- |
| Sprint 1 | Equipo completo | Desarrollo de la base del sistema, login, expediente médico, asistente virtual y roles       |
| Sprint 2 | Equipo completo | Desarrollo de recetas electrónicas, firma digital, inventario, usuarios y auditoría          |
| Sprint 3 | Equipo completo | Desarrollo del quiosco dispensador, biometría, recetas pendientes, dispensación e inventario |
| Sprint 4 | Equipo completo | Desarrollo del portal del paciente, calendario, recordatorios, alertas y seguimiento         |

## Estructura del repositorio

```txt
Smart-Pharmacy/
│
├── database/
│   └── smartpharmacy_schema.sql
│
├── frontend/
│   └── src/
│       ├── modules/
│       │   ├── auth/
│       │   ├── doctor/
│       │   ├── patient/
│       │   ├── pharmacy/
│       │   ├── kiosk/
│       │   ├── admin/
│       │   └── ai-assistant/
│       │
│       ├── mocks/
│       └── shared/
│
├── backend/
├── iot/
└── ai/

## Objetivo del repositorio

Este repositorio tiene como finalidad organizar el desarrollo del proyecto SmartPharmacy, permitiendo que cada integrante trabaje en su propia rama y que el avance general se documente por medio de sprints, historias de usuario, estructura del sistema y maquetado funcional.
