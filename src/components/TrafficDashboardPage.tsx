import { useEffect, useMemo, useState } from "react";
import "../styles/TrafficPage.css";
import { useTraffic } from "../di/container";

interface CompanyPoint {
  name: string;
  popularity: number;
  machineTransactions: number;
}

interface PeriodEntry {
  period: string;
  companies: CompanyPoint[];
  revenue: number;
}

const MONTH_COUNT = 6;

function buildRecentMonths() {
  const now = new Date();
  const months: { key: string; label: string; start: Date }[] = [];

  for (let offset = MONTH_COUNT - 1; offset >= 0; offset -= 1) {
    const monthStart = new Date(now.getFullYear(), now.getMonth() - offset, 1);
    const key = `${monthStart.getFullYear()}-${String(monthStart.getMonth() + 1).padStart(2, "0")}`;
    const label = monthStart.toLocaleString("en-US", { month: "long" });

    months.push({ key, label, start: monthStart });
  }

  return months;
}

function monthKeyFromDate(value: string) {
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) {
    return null;
  }

  return `${parsed.getFullYear()}-${String(parsed.getMonth() + 1).padStart(2, "0")}`;
}

function formatCompactNumber(value: number): string {
  return new Intl.NumberFormat("en-US", {
    notation: "compact",
    maximumFractionDigits: 1,
  }).format(value);
}

function formatCurrency(value: number): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(value);
}

function TrafficDashboardPage() {
  const [periodData, setPeriodData] = useState<PeriodEntry[]>([]);
  const [managedLocations, setManagedLocations] = useState(0);
  const [locationOptions, setLocationOptions] = useState<
    { id: number; name: string }[]
  >([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedPeriod, setSelectedPeriod] = useState("");
  const [selectedLocationId, setSelectedLocationId] = useState("all");
  const { getTrafficDashboardSeed } = useTraffic();

  useEffect(() => {
    let ignore = false;

    const fetchTrafficData = async () => {
      try {
        const months = buildRecentMonths();
        const monthKeys = new Set(months.map((month) => month.key));

        const firstMonthStart = months[0]?.start ?? new Date();
        const seed = await getTrafficDashboardSeed(
          firstMonthStart.toISOString(),
        );
        const managedLocationIds = seed.managedLocations.map(
          (location) => location.id,
        );
        const locationNames = seed.managedLocations.map(
          (location) => location.name,
        );
        const locationNameById = new Map(
          seed.managedLocations.map((location) => [location.id, location.name]),
        );

        if (!ignore) {
          setManagedLocations(seed.managedLocations.length);
          setLocationOptions(seed.managedLocations);

          if (
            selectedLocationId !== "all" &&
            !seed.managedLocations.some(
              (location) => String(location.id) === selectedLocationId,
            )
          ) {
            setSelectedLocationId("all");
          }
        }

        const monthTotals = new Map<string, number>(
          months.map((month) => [month.key, 0]),
        );
        const monthRevenueTotals = new Map<string, number>(
          months.map((month) => [month.key, 0]),
        );
        const overallCounts = new Map<string, number>();
        const monthLocationCounts = new Map<string, Map<string, number>>();

        for (const row of seed.events) {
          const key = monthKeyFromDate(row.occurredAt);
          if (!key || !monthKeys.has(key)) {
            continue;
          }

          if (
            selectedLocationId !== "all" &&
            String(row.locationId ?? "") !== selectedLocationId
          ) {
            continue;
          }

          if (
            managedLocationIds.length > 0 &&
            row.locationId != null &&
            !managedLocationIds.includes(row.locationId)
          ) {
            continue;
          }

          const locationName =
            (row.locationId != null
              ? locationNameById.get(row.locationId)
              : undefined) ?? "Unknown Location";

          monthTotals.set(key, (monthTotals.get(key) ?? 0) + 1);
          monthRevenueTotals.set(
            key,
            (monthRevenueTotals.get(key) ?? 0) +
              (Number.isFinite(row.amount) ? row.amount : 0),
          );
          overallCounts.set(
            locationName,
            (overallCounts.get(locationName) ?? 0) + 1,
          );

          const currentMonthMap = monthLocationCounts.get(key) ?? new Map();
          currentMonthMap.set(
            locationName,
            (currentMonthMap.get(locationName) ?? 0) + 1,
          );
          monthLocationCounts.set(key, currentMonthMap);
        }

        let trackedNames = [...overallCounts.entries()]
          .sort((left, right) => right[1] - left[1])
          .slice(0, 4)
          .map(([name]) => name);

        if (trackedNames.length === 0 && locationNames.length > 0) {
          trackedNames = locationNames.slice(0, 4);
        }

        if (trackedNames.length === 0) {
          trackedNames = ["No Activity"];
        }

        const normalizedData: PeriodEntry[] = months.map((month) => {
          const locationCounts =
            monthLocationCounts.get(month.key) ?? new Map();

          return {
            period: month.label,
            revenue: monthRevenueTotals.get(month.key) ?? 0,
            companies: trackedNames.map((name) => {
              const count = locationCounts.get(name) ?? 0;
              const popularity = count;

              return {
                name,
                popularity,
                machineTransactions: count,
              };
            }),
          };
        });

        if (!ignore) {
          setPeriodData(normalizedData);
          setError(null);
        }
      } catch (fetchError) {
        console.error(fetchError);
        if (!ignore) {
          setError("Failed to load traffic data");
          setPeriodData([]);
        }
      } finally {
        if (!ignore) {
          setLoading(false);
        }
      }
    };

    fetchTrafficData();

    return () => {
      ignore = true;
    };
  }, [getTrafficDashboardSeed, selectedLocationId]);

  const trend = useMemo(
    () =>
      periodData.map(({ period, companies, revenue }) => {
        const totalPopularity = companies.reduce(
          (sum, company) => sum + company.popularity,
          0,
        );
        const totalTransactions = companies.reduce(
          (sum, company) => sum + company.machineTransactions,
          0,
        );

        return {
          period,
          revenue,
          averagePopularity:
            companies.length > 0 ? totalPopularity / companies.length : 0,
          machineTransactions: totalTransactions,
        };
      }),
    [periodData],
  );

  useEffect(() => {
    if (trend.length === 0) {
      setSelectedPeriod("");
      return;
    }

    setSelectedPeriod((previous) => {
      if (previous && trend.some((point) => point.period === previous)) {
        return previous;
      }

      return trend[trend.length - 1]!.period;
    });
  }, [trend]);

  if (loading) {
    return (
      <div className="dashboard-page">
        <div className="dashboard-header">
          <h1>Traffic Dashboard</h1>
          <p>Average account activity over the last six months</p>
        </div>

        <section className="dashboard-card">
          <p>Loading traffic...</p>
        </section>
      </div>
    );
  }

  if (error) {
    return (
      <div className="dashboard-page">
        <div className="dashboard-header">
          <h1>Traffic Dashboard</h1>
          <p>Average account activity over the last six months</p>
        </div>

        <section className="dashboard-card">
          <p>{error}</p>
        </section>
      </div>
    );
  }

  const fallbackPoint = {
    period: "Current",
    revenue: 0,
    averagePopularity: 0,
    machineTransactions: 0,
  };
  const selectedIndex = trend.findIndex(
    (point) => point.period === selectedPeriod,
  );
  const activeIndex = selectedIndex >= 0 ? selectedIndex : trend.length - 1;
  const activePoint = trend[activeIndex] ?? fallbackPoint;
  const previousPoint = trend[Math.max(activeIndex - 1, 0)] ?? activePoint;
  const firstPoint = trend[0] ?? activePoint;
  const averageScore = activePoint.averagePopularity;
  const monthlyChange = averageScore - previousPoint.averagePopularity;
  const totalGrowth = averageScore - firstPoint.averagePopularity;
  const companyLeader = [...(periodData[activeIndex]?.companies ?? [])].sort(
    (left, right) => right.popularity - left.popularity,
  )[0] ?? {
    name: "No Activity",
    popularity: 0,
    machineTransactions: 0,
  };

  const chartWidth = 660;
  const chartHeight = 290;
  const padding = 30;
  const scores = trend.map((point) => point.averagePopularity);
  const minScore = Math.min(...scores, 0);
  const maxScore = Math.max(...scores, 1);
  const scoreRange = Math.max(maxScore - minScore, 1);

  const points = trend.map((point, index) => {
    const x =
      padding +
      (index * (chartWidth - padding * 2)) / Math.max(trend.length - 1, 1);
    const normalized = (point.averagePopularity - minScore) / scoreRange;
    const y = chartHeight - padding - normalized * (chartHeight - padding * 2);

    return {
      ...point,
      x,
      y,
    };
  });

  const linePath =
    points
      .map((point, index) => `${index === 0 ? "M" : "L"} ${point.x} ${point.y}`)
      .join(" ") || `M ${padding} ${chartHeight - padding}`;

  const lastX = points.at(-1)?.x ?? padding;
  const firstX = points[0]?.x ?? padding;
  const areaPath = `${linePath} L ${lastX} ${chartHeight - padding} L ${firstX} ${chartHeight - padding} Z`;

  return (
    <div className="dashboard-page">
      <div className="dashboard-header">
        <h1>Traffic Dashboard</h1>
        <p>Average account activity over the last six months</p>
      </div>

      <div className="dashboard-top-section">
        <div className="dashboard-sub-section">
          <select
            className="dashboard-periods-list"
            name="Period List"
            id="dashboard-periods-list"
            value={selectedPeriod}
            onChange={(event) => setSelectedPeriod(event.target.value)}
          >
            {trend.map((point) => (
              <option key={point.period} value={point.period}>
                {point.period}
              </option>
            ))}
          </select>

          <select
            className="dashboard-periods-list"
            name="Location List"
            id="dashboard-locations-list"
            value={selectedLocationId}
            onChange={(event) => setSelectedLocationId(event.target.value)}
          >
            <option value="all">All locations</option>
            {locationOptions.map((location) => (
              <option key={location.id} value={String(location.id)}>
                {location.name}
              </option>
            ))}
          </select>
        </div>
        <p>Showing {activePoint.period}</p>
      </div>

      <div className="dashboard-seperation-line"></div>

      <div className="dashboard-machine-description">
        <p>Locations available: {managedLocations}</p>
      </div>

      <section className="dashboard-card">
        <div className="dashboard-card-header">
          <div>
            <h2>Activity trend widget</h2>
            <p>
              6-month movement from transaction activity with{" "}
              {activePoint.period} selected
            </p>
          </div>
        </div>

        <div className="dashboard-filters" aria-label="Summary metrics">
          <div className="dashboard-filter-pill dashboard-filter-pill--all active">
            {activePoint.period} avg{" "}
            <span className="dashboard-pill-count">
              {averageScore.toFixed(1)}
            </span>
          </div>
          <div className="dashboard-filter-pill dashboard-filter-pill--approved active">
            Change vs start{" "}
            <span className="dashboard-pill-count">
              +{totalGrowth.toFixed(1)}
            </span>
          </div>
          <div className="dashboard-filter-pill dashboard-filter-pill--pending active">
            Top location{" "}
            <span className="dashboard-pill-count">{companyLeader.name}</span>
          </div>
        </div>

        <ul className="dashboard-widget-list" aria-label="Popularity summary">
          <li className="dashboard-widget-item dashboard-widget-item-wide">
            <article className="dashboard-widget-panel">
              <span className="dashboard-widget-label">
                Average activity trend
              </span>
              <strong>{averageScore.toFixed(1)}</strong>
              <small>Current average transactions per tracked location</small>

              <div className="dashboard-chart-card">
                <svg
                  className="dashboard-chart"
                  viewBox={`0 0 ${chartWidth} ${chartHeight}`}
                  role="img"
                  aria-label="Average activity trend over six months"
                >
                  <defs>
                    <linearGradient
                      id="popularityArea"
                      x1="0"
                      y1="0"
                      x2="0"
                      y2="1"
                    >
                      <stop offset="0%" stopColor="rgba(54, 88, 255, 0.24)" />
                      <stop offset="100%" stopColor="rgba(54, 88, 255, 0.02)" />
                    </linearGradient>
                  </defs>

                  {[0, 1, 2, 3].map((step) => {
                    const y =
                      padding + (step * (chartHeight - padding * 2)) / 3;

                    return (
                      <line
                        key={step}
                        className="dashboard-grid-line"
                        x1={padding}
                        y1={y}
                        x2={chartWidth - padding}
                        y2={y}
                      />
                    );
                  })}

                  <path className="dashboard-area-path" d={areaPath} />
                  <path className="dashboard-line-path" d={linePath} />

                  {points.map((point) => (
                    <g key={point.period}>
                      <text
                        className="dashboard-point-value"
                        x={point.x}
                        y={Math.max(point.y - 22, padding - 8)}
                        style={{
                          fill:
                            point.period === activePoint.period
                              ? "#111827"
                              : undefined,
                          fontWeight:
                            point.period === activePoint.period
                              ? 700
                              : undefined,
                        }}
                      >
                        {point.averagePopularity.toFixed(1)}
                      </text>
                      <circle
                        className="dashboard-point-ring"
                        cx={point.x}
                        cy={point.y}
                        r={point.period === activePoint.period ? "9" : "6"}
                        style={{
                          stroke:
                            point.period === activePoint.period
                              ? "#111827"
                              : undefined,
                          strokeWidth:
                            point.period === activePoint.period
                              ? 2.6
                              : undefined,
                        }}
                      />
                      <circle
                        className="dashboard-point-dot"
                        cx={point.x}
                        cy={point.y}
                        r={point.period === activePoint.period ? "5" : "3.5"}
                        style={{
                          fill:
                            point.period === activePoint.period
                              ? "#111827"
                              : undefined,
                        }}
                      />
                      <text
                        className="dashboard-point-label"
                        x={point.x}
                        y={chartHeight - 6}
                        style={{
                          fill:
                            point.period === activePoint.period
                              ? "#111827"
                              : undefined,
                          fontWeight:
                            point.period === activePoint.period
                              ? 700
                              : undefined,
                        }}
                      >
                        {point.period}
                      </text>
                    </g>
                  ))}
                </svg>
              </div>
            </article>
          </li>

          <li className="dashboard-widget-item">
            <article className="dashboard-widget-panel">
              <span className="dashboard-widget-label">Monthly lift</span>
              <strong>+{monthlyChange.toFixed(1)}</strong>
              <small>
                {activePoint.period} compared with {previousPoint.period}
              </small>
            </article>
          </li>

          <li className="dashboard-widget-item">
            <article className="dashboard-widget-panel">
              <span className="dashboard-widget-label">Money earned</span>
              <strong>{formatCurrency(activePoint.revenue)}</strong>
              <small>Total earned in {activePoint.period}</small>
            </article>
          </li>

          <li className="dashboard-widget-item dashboard-widget-item-wide">
            <article className="dashboard-widget-panel dashboard-widget-panel-inline">
              <span>
                {formatCompactNumber(activePoint.machineTransactions)} machine
                transactions in {activePoint.period}
              </span>
            </article>
          </li>
        </ul>
      </section>
    </div>
  );
}

export default TrafficDashboardPage;
