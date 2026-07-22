import {
  useCallback,
  useEffect,
  useMemo,
  useState,
} from 'react';

import type {
  InventoryItem,
  Medicine,
  User,
} from '../../shared/types';

import '../../styles/pharmacy-dashboard.css';

import {
  getInventory,
  getMedicines,
} from './services/pharmacy.service';

import {
  AlertCircle,
  AlertTriangle,
  ArrowRight,
  BarChart3,
  Boxes,
  CalendarClock,
  CalendarDays,
  CheckCircle2,
  ClipboardList,
  PackageCheck,
  PackageOpen,
  Pill,
  Plus,
  RefreshCcw,
  ShieldCheck,
  Sparkles,
  TrendingUp,
} from 'lucide-react';

import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';

type PharmacyDestination =
  | 'medicines'
  | 'inventory';

interface Props {
  user: User;

  onNavigate?: (
    page: PharmacyDestination,
  ) => void;
}

interface ExpirationInformation {
  state:
    | 'vigente'
    | 'proxima'
    | 'caducado'
    | 'sin-fecha';

  days: number | null;
}

const DAY_IN_MILLISECONDS =
  24 * 60 * 60 * 1000;

function getExpirationInformation(
  expirationDate: string | null,
): ExpirationInformation {
  if (!expirationDate) {
    return {
      state: 'sin-fecha',
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
    difference /
      DAY_IN_MILLISECONDS,
  );

  if (days < 0) {
    return {
      state: 'caducado',
      days,
    };
  }

  if (days <= 30) {
    return {
      state: 'proxima',
      days,
    };
  }

  return {
    state: 'vigente',
    days,
  };
}

function formatExpirationDate(
  expirationDate: string | null,
) {
  if (!expirationDate) {
    return 'Sin fecha';
  }

  return new Intl.DateTimeFormat(
    'es-MX',
    {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    },
  ).format(
    new Date(
      `${expirationDate}T00:00:00`,
    ),
  );
}

function getCurrentDateLabel() {
  const formattedDate =
    new Intl.DateTimeFormat(
      'es-MX',
      {
        weekday: 'long',
        day: 'numeric',
        month: 'long',
        year: 'numeric',
      },
    ).format(new Date());

  return (
    formattedDate.charAt(0).toUpperCase() +
    formattedDate.slice(1)
  );
}

function getFirstName(
  fullName: string,
) {
  return (
    fullName.trim().split(' ')[0] ||
    fullName
  );
}

function DashboardPage({
  user,
  onNavigate,
}: Props) {
  const [
    inventory,
    setInventory,
  ] = useState<InventoryItem[]>([]);

  const [
    medicines,
    setMedicines,
  ] = useState<Medicine[]>([]);

  const [
    loading,
    setLoading,
  ] = useState(true);

  const [
    refreshing,
    setRefreshing,
  ] = useState(false);

  const [
    errorMessage,
    setErrorMessage,
  ] = useState('');

  const loadDashboard =
    useCallback(
      async (
        isRefresh = false,
      ) => {
        try {
          if (isRefresh) {
            setRefreshing(true);
          } else {
            setLoading(true);
          }

          setErrorMessage('');

          const [
            inventoryData,
            medicinesData,
          ] = await Promise.all([
            getInventory(),
            getMedicines(),
          ]);

          setInventory(
            inventoryData,
          );

          setMedicines(
            medicinesData,
          );
        } catch {
          setErrorMessage(
            'No fue posible cargar la información del panel de farmacia.',
          );
        } finally {
          setLoading(false);
          setRefreshing(false);
        }
      },
      [],
    );

  useEffect(() => {
    void loadDashboard();
  }, [loadDashboard]);

  const activeInventory =
    useMemo(
      () =>
        inventory.filter(
          (item) =>
            item.status ===
            'Activo',
        ),
      [inventory],
    );

  const activeMedicines =
    useMemo(
      () =>
        medicines.filter(
          (medicine) =>
            medicine.status ===
            'Activo',
        ),
      [medicines],
    );

  const statistics =
    useMemo(() => {
      const totalStock =
        activeInventory.reduce(
          (total, item) =>
            total + item.stock,
          0,
        );

      const withoutStock =
        activeInventory.filter(
          (item) =>
            item.stock <= 0,
        );

      const lowStock =
        activeInventory.filter(
          (item) =>
            item.stock > 0 &&
            item.isLowStock,
        );

      const expiringSoon =
        activeInventory.filter(
          (item) =>
            getExpirationInformation(
              item.expirationDate,
            ).state ===
            'proxima',
        );

      const expired =
        activeInventory.filter(
          (item) =>
            getExpirationInformation(
              item.expirationDate,
            ).state ===
            'caducado',
        );

      const healthyInventory =
        activeInventory.filter(
          (item) =>
            item.stock >
              item.minStock &&
            getExpirationInformation(
              item.expirationDate,
            ).state !==
              'caducado',
        );

      return {
        totalStock,
        withoutStock:
          withoutStock.length,
        lowStock:
          lowStock.length,
        expiringSoon:
          expiringSoon.length,
        expired:
          expired.length,
        healthy:
          healthyInventory.length,
        activeInventory:
          activeInventory.length,
      };
    }, [activeInventory]);

  const stockStatusData =
    useMemo(
      () => [
        {
          name: 'Correcto',
          value:
            statistics.healthy,
          color: '#22c55e',
        },
        {
          name: 'Stock bajo',
          value:
            statistics.lowStock,
          color: '#f59e0b',
        },
        {
          name: 'Sin existencias',
          value:
            statistics.withoutStock,
          color: '#ef4444',
        },
      ],
      [statistics],
    );

  const stockByMedicine =
    useMemo(
      () =>
        [...activeInventory]
          .sort(
            (
              first,
              second,
            ) =>
              second.stock -
              first.stock,
          )
          .slice(0, 7)
          .map((item) => ({
            name:
              item.medicineName
                .length > 17
                ? `${item.medicineName.slice(
                    0,
                    17,
                  )}…`
                : item.medicineName,

            stock: item.stock,

            minimo:
              item.minStock,
          })),
      [activeInventory],
    );

  const criticalInventory =
    useMemo(
      () =>
        activeInventory
          .filter(
            (item) =>
              item.stock <=
              item.minStock,
          )
          .sort(
            (
              first,
              second,
            ) => {
              if (
                first.stock ===
                second.stock
              ) {
                return (
                  first.medicineName.localeCompare(
                    second.medicineName,
                    'es',
                  )
                );
              }

              return (
                first.stock -
                second.stock
              );
            },
          )
          .slice(0, 6),
      [activeInventory],
    );

  const upcomingExpirations =
    useMemo(
      () =>
        activeInventory
          .filter((item) => {
            const information =
              getExpirationInformation(
                item.expirationDate,
              );

            return (
              information.state ===
                'proxima' ||
              information.state ===
                'caducado'
            );
          })
          .sort(
            (
              first,
              second,
            ) => {
              const firstDate =
                first.expirationDate
                  ? new Date(
                      `${first.expirationDate}T00:00:00`,
                    ).getTime()
                  : Number.MAX_SAFE_INTEGER;

              const secondDate =
                second.expirationDate
                  ? new Date(
                      `${second.expirationDate}T00:00:00`,
                    ).getTime()
                  : Number.MAX_SAFE_INTEGER;

              return (
                firstDate -
                secondDate
              );
            },
          )
          .slice(0, 5),
      [activeInventory],
    );

  const inventoryHealth =
    statistics.activeInventory > 0
      ? Math.round(
          (statistics.healthy /
            statistics.activeInventory) *
            100,
        )
      : 0;

  const currentDate =
    getCurrentDateLabel();

  if (loading) {
    return (
      <div className="pharmacy-dashboard-loading">
        <div className="pharmacy-dashboard-loader">
          <RefreshCcw size={28} />
        </div>

        <h2>
          Preparando tu panel
        </h2>

        <p>
          Consultando medicamentos,
          existencias y alertas.
        </p>
      </div>
    );
  }

  return (
    <div className="pharmacy-dashboard">
      <section className="pharmacy-dashboard-hero">
        <div className="pharmacy-dashboard-hero-content">
          <div className="pharmacy-dashboard-hero-label">
            <Sparkles size={15} />

            Panel operativo de farmacia
          </div>

          <h1>
            Control central de
            inventario
          </h1>

          <p className="pharmacy-dashboard-greeting">
            Hola,{' '}
            <strong>
              {getFirstName(user.name)}
            </strong>
            . Aquí tienes el estado
            actual de medicamentos,
            existencias y caducidades.
          </p>

          <div className="pharmacy-dashboard-date">
            <CalendarDays
              size={17}
            />

            {currentDate}
          </div>

          <div className="pharmacy-dashboard-hero-actions">
            <button
              type="button"
              className="pharmacy-dashboard-primary-action"
              onClick={() =>
                onNavigate?.(
                  'medicines',
                )
              }
            >
              <Plus size={18} />

              Registrar medicamento
            </button>

            <button
              type="button"
              className="pharmacy-dashboard-secondary-action"
              onClick={() =>
                onNavigate?.(
                  'inventory',
                )
              }
            >
              <Boxes size={18} />

              Gestionar inventario
            </button>
          </div>
        </div>

        <div className="pharmacy-dashboard-hero-summary">
          <div className="pharmacy-dashboard-health-icon">
            <ShieldCheck
              size={34}
            />
          </div>

          <span>
            Salud del inventario
          </span>

          <strong>
            {inventoryHealth}%
          </strong>

          <div className="pharmacy-dashboard-health-bar">
            <span
              style={{
                width: `${inventoryHealth}%`,
              }}
            />
          </div>

          <small>
            {statistics.healthy} de{' '}
            {
              statistics.activeInventory
            }{' '}
            registros en condiciones
            correctas
          </small>
        </div>
      </section>

      {errorMessage && (
        <div className="pharmacy-dashboard-alert">
          <AlertCircle size={19} />

          <span>
            {errorMessage}
          </span>

          <button
            type="button"
            onClick={() =>
              void loadDashboard()
            }
          >
            Reintentar
          </button>
        </div>
      )}

      <section className="pharmacy-dashboard-metrics">
        <article className="pharmacy-dashboard-metric blue">
          <div className="pharmacy-dashboard-metric-top">
            <div className="pharmacy-dashboard-metric-icon">
              <Pill size={23} />
            </div>

            <span className="pharmacy-dashboard-metric-tag">
              Catálogo
            </span>
          </div>

          <strong>
            {medicines.length}
          </strong>

          <h3>
            Medicamentos
          </h3>

          <p>
            {activeMedicines.length}{' '}
            activos en el sistema
          </p>
        </article>

        <article className="pharmacy-dashboard-metric green">
          <div className="pharmacy-dashboard-metric-top">
            <div className="pharmacy-dashboard-metric-icon">
              <Boxes size={23} />
            </div>

            <span className="pharmacy-dashboard-metric-tag">
              Disponible
            </span>
          </div>

          <strong>
            {statistics.totalStock}
          </strong>

          <h3>
            Stock total
          </h3>

          <p>
            Unidades disponibles
            actualmente
          </p>
        </article>

        <article className="pharmacy-dashboard-metric amber">
          <div className="pharmacy-dashboard-metric-top">
            <div className="pharmacy-dashboard-metric-icon">
              <AlertTriangle
                size={23}
              />
            </div>

            <span className="pharmacy-dashboard-metric-tag">
              Atención
            </span>
          </div>

          <strong>
            {statistics.lowStock}
          </strong>

          <h3>
            Stock bajo
          </h3>

          <p>
            Registros debajo del
            mínimo
          </p>
        </article>

        <article className="pharmacy-dashboard-metric red">
          <div className="pharmacy-dashboard-metric-top">
            <div className="pharmacy-dashboard-metric-icon">
              <PackageOpen
                size={23}
              />
            </div>

            <span className="pharmacy-dashboard-metric-tag">
              Crítico
            </span>
          </div>

          <strong>
            {statistics.withoutStock}
          </strong>

          <h3>
            Sin existencias
          </h3>

          <p>
            Requieren abastecimiento
          </p>
        </article>

        <article className="pharmacy-dashboard-metric purple">
          <div className="pharmacy-dashboard-metric-top">
            <div className="pharmacy-dashboard-metric-icon">
              <CalendarClock
                size={23}
              />
            </div>

            <span className="pharmacy-dashboard-metric-tag">
              30 días
            </span>
          </div>

          <strong>
            {statistics.expiringSoon}
          </strong>

          <h3>
            Próximos a caducar
          </h3>

          <p>
            {statistics.expired > 0
              ? `${statistics.expired} ya caducados`
              : 'Sin productos caducados'}
          </p>
        </article>
      </section>

      <section className="pharmacy-dashboard-analytics-grid">
        <article className="pharmacy-dashboard-panel pharmacy-dashboard-stock-chart">
          <div className="pharmacy-dashboard-panel-header">
            <div>
              <span className="pharmacy-dashboard-panel-icon blue">
                <BarChart3
                  size={20}
                />
              </span>

              <div>
                <h2>
                  Existencias por
                  medicamento
                </h2>

                <p>
                  Medicamentos con mayor
                  cantidad disponible
                </p>
              </div>
            </div>

            <button
              type="button"
              className="pharmacy-dashboard-link-button"
              onClick={() =>
                onNavigate?.(
                  'inventory',
                )
              }
            >
              Ver inventario

              <ArrowRight
                size={16}
              />
            </button>
          </div>

          {stockByMedicine.length >
          0 ? (
            <div className="pharmacy-dashboard-chart">
              <ResponsiveContainer
                width="100%"
                height="100%"
              >
                <BarChart
                  data={
                    stockByMedicine
                  }
                  margin={{
                    top: 15,
                    right: 10,
                    left: -20,
                    bottom: 5,
                  }}
                >
                  <CartesianGrid
                    strokeDasharray="4 4"
                    vertical={false}
                    stroke="#e2e8f0"
                  />

                  <XAxis
                    dataKey="name"
                    tick={{
                      fill: '#64748b',
                      fontSize: 11,
                    }}
                    axisLine={false}
                    tickLine={false}
                  />

                  <YAxis
                    allowDecimals={
                      false
                    }
                    tick={{
                      fill: '#64748b',
                      fontSize: 11,
                    }}
                    axisLine={false}
                    tickLine={false}
                  />

                  <Tooltip
                    cursor={{
                      fill: 'rgba(59, 130, 246, 0.06)',
                    }}
                    contentStyle={{
                      borderRadius: 14,
                      border:
                        '1px solid #dbe5f0',
                      boxShadow:
                        '0 12px 28px rgba(15, 23, 42, 0.12)',
                    }}
                  />

                  <Bar
                    dataKey="stock"
                    name="Stock actual"
                    fill="#3b82f6"
                    radius={[
                      8,
                      8,
                      0,
                      0,
                    ]}
                    maxBarSize={52}
                  />

                  <Bar
                    dataKey="minimo"
                    name="Stock mínimo"
                    fill="#cbd5e1"
                    radius={[
                      8,
                      8,
                      0,
                      0,
                    ]}
                    maxBarSize={26}
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <div className="pharmacy-dashboard-empty-chart">
              <PackageOpen
                size={35}
              />

              <strong>
                Sin existencias
                registradas
              </strong>

              <span>
                Agrega información al
                inventario para visualizar
                la gráfica.
              </span>
            </div>
          )}
        </article>

        <article className="pharmacy-dashboard-panel pharmacy-dashboard-status-panel">
          <div className="pharmacy-dashboard-panel-header">
            <div>
              <span className="pharmacy-dashboard-panel-icon green">
                <PackageCheck
                  size={20}
                />
              </span>

              <div>
                <h2>
                  Estado operativo
                </h2>

                <p>
                  Distribución del
                  inventario activo
                </p>
              </div>
            </div>
          </div>

          <div className="pharmacy-dashboard-status-content">
            <div className="pharmacy-dashboard-donut">
              <ResponsiveContainer
                width="100%"
                height="100%"
              >
                <PieChart>
                  <Pie
                    data={
                      stockStatusData
                    }
                    dataKey="value"
                    nameKey="name"
                    innerRadius={63}
                    outerRadius={88}
                    paddingAngle={4}
                    stroke="none"
                  >
                    {stockStatusData.map(
                      (item) => (
                        <Cell
                          key={
                            item.name
                          }
                          fill={
                            item.color
                          }
                        />
                      ),
                    )}
                  </Pie>

                  <Tooltip
                    contentStyle={{
                      borderRadius: 14,
                      border:
                        '1px solid #dbe5f0',
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>

              <div className="pharmacy-dashboard-donut-center">
                <strong>
                  {
                    statistics.activeInventory
                  }
                </strong>

                <span>
                  Registros
                </span>
              </div>
            </div>

            <div className="pharmacy-dashboard-status-list">
              {stockStatusData.map(
                (item) => (
                  <div
                    key={item.name}
                    className="pharmacy-dashboard-status-item"
                  >
                    <span
                      className="pharmacy-dashboard-status-dot"
                      style={{
                        backgroundColor:
                          item.color,
                      }}
                    />

                    <div>
                      <span>
                        {item.name}
                      </span>

                      <strong>
                        {item.value}
                      </strong>
                    </div>
                  </div>
                ),
              )}
            </div>
          </div>
        </article>
      </section>

      <section className="pharmacy-dashboard-information-grid">
        <article className="pharmacy-dashboard-panel">
          <div className="pharmacy-dashboard-panel-header">
            <div>
              <span className="pharmacy-dashboard-panel-icon amber">
                <AlertTriangle
                  size={20}
                />
              </span>

              <div>
                <h2>
                  Inventario crítico
                </h2>

                <p>
                  Productos que necesitan
                  abastecimiento
                </p>
              </div>
            </div>

            <button
              type="button"
              className="pharmacy-dashboard-link-button"
              onClick={() =>
                onNavigate?.(
                  'inventory',
                )
              }
            >
              Administrar

              <ArrowRight
                size={16}
              />
            </button>
          </div>

          {criticalInventory.length >
          0 ? (
            <div className="pharmacy-dashboard-table-wrapper">
              <table className="pharmacy-dashboard-table">
                <thead>
                  <tr>
                    <th>
                      Medicamento
                    </th>

                    <th>
                      Existencias
                    </th>

                    <th>
                      Mínimo
                    </th>

                    <th>
                      Estado
                    </th>
                  </tr>
                </thead>

                <tbody>
                  {criticalInventory.map(
                    (item) => (
                      <tr key={item.id}>
                        <td>
                          <div className="pharmacy-dashboard-medicine-cell">
                            <span>
                              <Pill
                                size={17}
                              />
                            </span>

                            <div>
                              <strong>
                                {
                                  item.medicineName
                                }
                              </strong>

                              <small>
                                {
                                  item.medicineCode
                                }
                              </small>
                            </div>
                          </div>
                        </td>

                        <td>
                          <strong className="pharmacy-dashboard-stock-number">
                            {
                              item.stock
                            }
                          </strong>
                        </td>

                        <td>
                          {
                            item.minStock
                          }
                        </td>

                        <td>
                          <span
                            className={
                              item.stock <=
                              0
                                ? 'pharmacy-dashboard-stock-status danger'
                                : 'pharmacy-dashboard-stock-status warning'
                            }
                          >
                            {item.stock <=
                            0
                              ? 'Sin stock'
                              : 'Stock bajo'}
                          </span>
                        </td>
                      </tr>
                    ),
                  )}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="pharmacy-dashboard-positive-state">
              <CheckCircle2
                size={36}
              />

              <strong>
                Inventario en buenas
                condiciones
              </strong>

              <span>
                No hay medicamentos
                debajo del mínimo
                establecido.
              </span>
            </div>
          )}
        </article>

        <article className="pharmacy-dashboard-panel">
          <div className="pharmacy-dashboard-panel-header">
            <div>
              <span className="pharmacy-dashboard-panel-icon purple">
                <CalendarClock
                  size={20}
                />
              </span>

              <div>
                <h2>
                  Caducidades próximas
                </h2>

                <p>
                  Vencimientos dentro de
                  los siguientes 30 días
                </p>
              </div>
            </div>
          </div>

          {upcomingExpirations.length >
          0 ? (
            <div className="pharmacy-dashboard-expiration-list">
              {upcomingExpirations.map(
                (item) => {
                  const expiration =
                    getExpirationInformation(
                      item.expirationDate,
                    );

                  return (
                    <div
                      key={item.id}
                      className="pharmacy-dashboard-expiration-item"
                    >
                      <div className="pharmacy-dashboard-expiration-icon">
                        <CalendarDays
                          size={19}
                        />
                      </div>

                      <div className="pharmacy-dashboard-expiration-info">
                        <strong>
                          {
                            item.medicineName
                          }
                        </strong>

                        <span>
                          {item.lotNumber
                            ? `Lote ${item.lotNumber}`
                            : 'Sin lote registrado'}
                        </span>
                      </div>

                      <div className="pharmacy-dashboard-expiration-date">
                        <strong>
                          {formatExpirationDate(
                            item.expirationDate,
                          )}
                        </strong>

                        <span
                          className={
                            expiration.state ===
                            'caducado'
                              ? 'expired'
                              : 'upcoming'
                          }
                        >
                          {expiration.state ===
                          'caducado'
                            ? 'Caducado'
                            : expiration.days ===
                                0
                              ? 'Caduca hoy'
                              : `${expiration.days} días`}
                        </span>
                      </div>
                    </div>
                  );
                },
              )}
            </div>
          ) : (
            <div className="pharmacy-dashboard-positive-state compact">
              <CheckCircle2
                size={34}
              />

              <strong>
                Sin caducidades
                próximas
              </strong>

              <span>
                No hay productos por
                caducar en los siguientes
                30 días.
              </span>
            </div>
          )}
        </article>
      </section>

      <section className="pharmacy-dashboard-quick-actions">
        <div className="pharmacy-dashboard-quick-heading">
          <span>
            <TrendingUp size={18} />
          </span>

          <div>
            <h2>
              Acciones rápidas
            </h2>

            <p>
              Accede a las operaciones
              principales de farmacia.
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={() =>
            onNavigate?.(
              'medicines',
            )
          }
        >
          <span className="blue">
            <ClipboardList
              size={20}
            />
          </span>

          <div>
            <strong>
              Catálogo de medicamentos
            </strong>

            <small>
              Registrar, consultar o
              actualizar medicamentos
            </small>
          </div>

          <ArrowRight
            size={18}
          />
        </button>

        <button
          type="button"
          onClick={() =>
            onNavigate?.(
              'inventory',
            )
          }
        >
          <span className="green">
            <Boxes size={20} />
          </span>

          <div>
            <strong>
              Control de inventario
            </strong>

            <small>
              Administrar lotes,
              existencias y caducidades
            </small>
          </div>

          <ArrowRight
            size={18}
          />
        </button>

        <button
          type="button"
          className="pharmacy-dashboard-refresh-action"
          onClick={() =>
            void loadDashboard(true)
          }
          disabled={refreshing}
        >
          <span className="gray">
            <RefreshCcw
              size={20}
              className={
                refreshing
                  ? 'rotating'
                  : ''
              }
            />
          </span>

          <div>
            <strong>
              Actualizar información
            </strong>

            <small>
              Consultar nuevamente los
              datos del sistema
            </small>
          </div>

          <ArrowRight
            size={18}
          />
        </button>
      </section>
    </div>
  );
}

export default DashboardPage;