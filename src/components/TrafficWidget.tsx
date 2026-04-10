import { useEffect, useMemo, useState } from "react";
import "../styles/TrafficWidget.css";
import { useTraffic } from "../di/container";
import type { TrafficEvent } from "../interfaces/TrafficService";

interface Point {
  hour: number;
  x: number;
  y: number;
}

function formatCompactNumber(value: number): string {
  return new Intl.NumberFormat("en-US", {
    notation: "compact",
    maximumFractionDigits: 1,
  }).format(value);
}

function formatHour(hour: number): string {
  const suffix = hour >= 12 ? "PM" : "AM";
  const normalized = hour % 12 === 0 ? 12 : hour % 12;
  return `${normalized} ${suffix}`;
}

function formatHourRange(hour: number): string {
  const next = (hour + 1) % 24;
  return `${formatHour(hour)} - ${formatHour(next)}`;
}

function TrafficWidget() {
  const [events, setEvents] = useState<TrafficEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const { getTrafficDashboardSeed } = useTraffic();

  useEffect(() => {
    let ignore = false;

    const fetchTrafficData = async () => {
      try {
        const start = new Date();
        start.setDate(start.getDate() - 29);

        const seed = await getTrafficDashboardSeed(start.toISOString());
        const managedLocationIds = new Set(
          seed.managedLocations.map((location) => location.id),
        );

        const filteredEvents = seed.events.filter((event) => {
          if (managedLocationIds.size === 0) {
            return true;
          }

          return (
            event.locationId == null || managedLocationIds.has(event.locationId)
          );
        });

        if (!ignore) {
          setEvents(filteredEvents);
          setError(false);
        }
      } catch (fetchError) {
        console.error(fetchError);
        if (!ignore) {
          setError(true);
          setEvents([]);
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
  }, [getTrafficDashboardSeed]);

  const hourlyCounts = useMemo(() => {
    const buckets = Array.from({ length: 24 }, () => 0);

    for (const event of events) {
      const parsed = new Date(event.occurredAt);
      if (Number.isNaN(parsed.getTime())) {
        continue;
      }

      const hour = parsed.getHours();
      buckets[hour] = (buckets[hour] ?? 0) + 1;
    }

    return buckets;
  }, [events]);

  const totalTransactions = useMemo(
    () => hourlyCounts.reduce((sum, value) => sum + value, 0),
    [hourlyCounts],
  );

  const peakHour = useMemo(() => {
    let bestHour = 0;
    let bestValue = -1;

    for (let hour = 0; hour < hourlyCounts.length; hour += 1) {
      const count = hourlyCounts[hour] ?? 0;
      if (count > bestValue) {
        bestValue = count;
        bestHour = hour;
      }
    }

    return bestHour;
  }, [hourlyCounts]);

  const peakCount = hourlyCounts[peakHour] ?? 0;
  const chartWidth = 320;
  const chartHeight = 120;
  const padding = 8;
  const barSpacing = 0.8;
  const totalBars = hourlyCounts.length;
  const barWidth = (chartWidth - padding * 2) / totalBars - barSpacing;
  const minScore = Math.min(...hourlyCounts, 0);
  const maxScore = Math.max(...hourlyCounts, 1);
  const scoreRange = Math.max(maxScore - minScore, 1);

  const points: Point[] = hourlyCounts.map((count, hour) => {
    const x = padding + hour * (barWidth + barSpacing) + barWidth / 2;
    const normalized = (count - minScore) / scoreRange;
    const y = chartHeight - padding - normalized * (chartHeight - padding * 2);

    return {
      hour,
      x,
      y,
    };
  });

  return (
    <div className="tw-card">
      <div className="tw-glow" />

      <div className="tw-label">Traffic By Hour</div>
      <div className="tw-date">Machine transactions · last 30 days</div>

      {loading ? (
        <div className="tw-amount loading" />
      ) : error ? (
        <div className="tw-amount error-state">Failed to load</div>
      ) : (
        <>
          <div className="tw-amount">
            {formatCompactNumber(totalTransactions)} Transactions
          </div>
          <div className="tw-trend-note">
            Peak time: {formatHourRange(peakHour)} ({peakCount} total)
          </div>

          <div className="tw-chart-wrap">
            <svg
              className="tw-chart"
              viewBox={`0 0 ${chartWidth} ${chartHeight}`}
              role="img"
              aria-label="Hourly machine transaction traffic over last thirty days"
            >
              {points.map((point) => {
                const barHeight = chartHeight - padding - point.y;
                return (
                  <rect
                    key={point.hour}
                    className="tw-bar"
                    x={point.x - barWidth / 2}
                    y={point.y}
                    width={barWidth}
                    height={barHeight}
                  />
                );
              })}
            </svg>

            <div className="tw-axis-labels" aria-hidden="true">
              <span>12 AM</span>
              <span>6 AM</span>
              <span>12 PM</span>
              <span>6 PM</span>
              <span>11 PM</span>
            </div>
          </div>
        </>
      )}

      <div className="tw-divider" />

      <div className="tw-footer">
        <div className={`tw-dot ${error ? "error-dot" : ""}`} />
        {loading
          ? "Fetching..."
          : error
            ? "Query failed"
            : "Live · Last 30 days"}
      </div>
    </div>
  );
}

export default TrafficWidget;
