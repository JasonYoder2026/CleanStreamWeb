import { useEffect, useState } from "react";
import { useTransactions } from "../di/container";
import "../styles/MonthlyIncome.css";

interface DailyData {
    date: string;
    amount: number;
}

const formatCurrency = (value: number) =>
    new Intl.NumberFormat("en-US", {
        style: "currency",
        currency: "USD",
        minimumFractionDigits: 0,
        maximumFractionDigits: 0,
    }).format(value);

const dateLabel = () => {
    const end = new Date();
    const start = new Date();
    start.setDate(start.getDate() - 29);

    return `${start.toLocaleDateString("en-US", { month: "short", day: "numeric" })} - ${end.toLocaleDateString("en-US", { month: "short", day: "numeric" })}`;
};

export default function MonthlyIncome() {
    const repository = useTransactions();
    const getLast30DaysRevenue = repository?.getLast30DaysRevenue;

    const [dailyData, setDailyData] = useState<DailyData[]>([]);
    const [total, setTotal] = useState<number>(0);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(false);
    const [hoveredPoint, setHoveredPoint] = useState<{
        x: number;
        y: number;
        date: string;
        amount: number;
    } | null>(null);

    useEffect(() => {
        if (!getLast30DaysRevenue) {
            console.error("getLast30DaysRevenue not available!");
            setError(true);
            setLoading(false);
            return;
        }

        const fetchMonthlyData = async () => {
            setLoading(true);
            setError(false);

            try {
                const result = await getLast30DaysRevenue();

                if (result === null) {
                    setError(true);
                } else {
                    setDailyData(result.dailyData);
                    setTotal(result.total);
                }
            } catch (e) {
                console.error("Error fetching monthly data:", e);
                setError(true);
            }

            setLoading(false);
        };

        fetchMonthlyData();
    }, [getLast30DaysRevenue]);

    const maxAmount = Math.max(...dailyData.map(d => d.amount), 1);
    const minAmount = Math.min(...dailyData.map(d => d.amount), 0);

    // Generate SVG path for the line
    const generatePath = () => {
        if (dailyData.length === 0) return "";

        const width = 100;
        const height = 100;
        const padding = 5;

        const points = dailyData.map((day, i) => {
            const x = (i / (dailyData.length - 1)) * width;
            const y = height - ((day.amount - minAmount) / (maxAmount - minAmount)) * (height - padding * 2) - padding;
            return `${x},${y}`;
        });

        return `M ${points.join(" L ")}`;
    };

    // Generate SVG path for the area fill
    const generateAreaPath = () => {
        if (dailyData.length === 0) return "";

        const width = 100;
        const height = 100;
        const padding = 5;

        const points = dailyData.map((day, i) => {
            const x = (i / (dailyData.length - 1)) * width;
            const y = height - ((day.amount - minAmount) / (maxAmount - minAmount)) * (height - padding * 2) - padding;
            return `${x},${y}`;
        });

        return `M 0,${height} L ${points.join(" L ")} L ${width},${height} Z`;
    };

    return (
        <div className="mi-card">
            <div className="mi-glow" />

            <div className="mi-label">30-Day Income</div>
            <div className="mi-date">{dateLabel()}</div>

            {loading ? (
                <div className="mi-chart-loading" />
            ) : error ? (
                <div className="mi-error-state">Failed to load</div>
            ) : (
                <>
                    <div className="mi-amount">
                        {formatCurrency(total)}
                    </div>

                    <div className="mi-chart">
                        <svg viewBox="0 0 100 100" preserveAspectRatio="none" className="mi-chart-svg">
                            {/* Area fill */}
                            <path
                                d={generateAreaPath()}
                                className="mi-area"
                            />
                            {/* Line */}
                            <path
                                d={generatePath()}
                                className="mi-line"
                            />
                            {/* Data points */}
                            {dailyData.map((day, i) => {
                                const x = (i / (dailyData.length - 1)) * 100;
                                const y = 100 - ((day.amount - minAmount) / (maxAmount - minAmount)) * 90 - 5;

                                return (
                                    <circle
                                        key={i}
                                        cx={x}
                                        cy={y}
                                        r="1.5"
                                        className="mi-point"
                                        onMouseEnter={(e) => {
                                            const rect = e.currentTarget.ownerSVGElement!.getBoundingClientRect();

                                            setHoveredPoint({
                                                x: (x / 100) * rect.width,
                                                y: (y / 100) * rect.height,
                                                date: day.date,
                                                amount: day.amount,
                                            });
                                        }}
                                        onMouseLeave={() => setHoveredPoint(null)}
                                    />
                                );
                            })}
                        </svg>
                        {hoveredPoint && (
                            <div
                                className="mi-tooltip"
                                style={{
                                    left: hoveredPoint.x,
                                    top: hoveredPoint.y,
                                }}
                            >
                                <div className="mi-tooltip-date">{hoveredPoint.date}</div>
                                <div className="mi-tooltip-amount">
                                    {formatCurrency(hoveredPoint.amount)}
                                </div>
                            </div>
                        )}
                    </div>
                </>
            )}

            <div className="mi-divider" />

            <div className="mi-footer">
                <div className={`mi-dot ${error ? "error-dot" : ""}`} />
                {loading ? "Fetching..." : error ? "Query failed" : "Last 30 days"}
            </div>
        </div>
    );
}