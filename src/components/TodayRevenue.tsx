import { useEffect, useState } from "react";
import { useTransactions } from "../di/container";
import "../styles/TodayRevenue.css";

const formatCurrency = (value: number) =>
    new Intl.NumberFormat("en-US", {
        style: "currency",
        currency: "USD",
        minimumFractionDigits: 2,
    }).format(value);

const todayLabel = () =>
    new Date().toLocaleDateString("en-US", {
        weekday: "long",
        month: "long",
        day: "numeric",
    });

export default function TodayRevenue() {
    const repository = useTransactions(); // keep the full object temporarily

    // Pull out the method safely
    const getTodayRevenue = repository?.getTodayRevenue;

    const [revenue, setRevenue] = useState<number | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(false);

    useEffect(() => {
        if (!getTodayRevenue) {
            console.error("getTodayRevenue not available!");
            setError(true);
            setLoading(false);
            return;
        }

        const fetchRevenue = async () => {
            setLoading(true);
            setError(false);

            try {
                const result = await getTodayRevenue();
                if (result === null) {
                    setError(true);
                } else {
                    setRevenue(result as number);
                }
            } catch (e) {
                console.error("Error fetching revenue:", e);
                setError(true);
            }

            setLoading(false);
        };

        fetchRevenue();
    }, [getTodayRevenue]);

    useEffect(() => {
        if (!repository?.subscribeToTodayRevenue) return;

        const unsubscribe = repository.subscribeToTodayRevenue((total) => {
            setRevenue(total);
        });

        return () => unsubscribe();
    }, []);

    return (
        <div className="dr-card">
            <div className="dr-glow" />

            <div className="dr-label">Daily Revenue</div>
            <div className="dr-date">{todayLabel()}</div>

            {loading ? (
                <div className="dr-amount loading" />
            ) : error ? (
                <div className="dr-amount error-state">Failed to load</div>
            ) : (
                <div className="dr-amount">{formatCurrency(revenue ?? 0)}</div>
            )}

            <div className="dr-divider" />

            <div className="dr-footer">
                <div className={`dr-dot ${error ? "error-dot" : ""}`} />
                {loading ? "Fetching..." : error ? "Query failed" : "Live · UTC day"}
            </div>
        </div>
    );
}