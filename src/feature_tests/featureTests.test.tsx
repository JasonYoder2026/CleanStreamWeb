import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, screen, waitFor, within, act } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import RefundsPage from "../components/RefundsDashboardPage";
import TodayRevenue from "../components/TodayRevenue";
import MonthlyIncome from "../components/MonthlyIncome";

vi.mock("../di/container", () => ({
    useTransactions: vi.fn(),
    useRefunds: vi.fn(),
    useFunctions: vi.fn(),
}));

import { useTransactions } from "../di/container";


const buildDailyData = (days = 30, amountPerDay = 100) => {
    const result: { date: string; amount: number }[] = [];
    const today = new Date();
    for (let i = days - 1; i >= 0; i--) {
        const d = new Date();
        d.setDate(today.getDate() - i);
        result.push({ date: d.toISOString().split("T")[0]!, amount: amountPerDay });
    }
    return result;
};


describe("RefundsPage UI (Integration with mocks)", () => {
    it("approves a refund and updates the correct row", async () => {
        const user = userEvent.setup();

        const mockRefund = {
            id: 1,
            transactionId: 130,
            customerId: "acf8e5f3-03f5-4e2a-a120-fcd10ca64e1a",
            customerName: "John Doe",
            attempts: 1,
            amount: 2,
            reason: "test",
            date: new Date().toISOString(),
            status: "pending" as const,
        };

        const getRefunds = vi.fn().mockResolvedValue([mockRefund]);
        const callFunction = vi.fn().mockResolvedValue({});

        render(
            <RefundsPage
                refundService={{ getRefunds }}
                functionService={{ callFunction }}
            />
        );

        const row = await screen.findByText("John Doe");
        const tableRow = row.closest("tr")!;
        const rowUtils = within(tableRow);

        expect(rowUtils.getByText("Pending")).toBeInTheDocument();

        await user.click(rowUtils.getByRole("button", { name: /respond/i }));

        const modalEl = document.querySelector(".modal") as HTMLElement;
        const modalUtils = within(modalEl);

        await user.click(modalUtils.getByRole("button", { name: /approve/i }));
        await user.click(modalUtils.getByRole("button", { name: /submit/i }));

        await waitFor(() => {
            expect(callFunction).toHaveBeenCalledWith("approveRefund", {
                transactionId: 130,
                customerId: "acf8e5f3-03f5-4e2a-a120-fcd10ca64e1a",
                amount: 2,
                note: "",
            });
        });

        await waitFor(() => {
            expect(rowUtils.getByText("Approved")).toBeInTheDocument();
        });

        await waitFor(() => {
            const toastEl = document.querySelector(".toast") as HTMLElement;
            expect(toastEl).toBeInTheDocument();
            expect(toastEl).toHaveTextContent(/approved/i);
        });
    });

    it("denies a refund and updates the correct row", async () => {
        const user = userEvent.setup();

        const mockRefund = {
            id: 2,
            transactionId: 200,
            customerId: "user-2",
            customerName: "Jane Smith",
            attempts: 2,
            amount: 5,
            reason: "another test",
            date: new Date().toISOString(),
            status: "pending" as const,
        };

        const getRefunds = vi.fn().mockResolvedValue([mockRefund]);
        const callFunction = vi.fn().mockResolvedValue({});

        render(
            <RefundsPage
                refundService={{ getRefunds }}
                functionService={{ callFunction }}
            />
        );

        const row = await screen.findByText("Jane Smith");
        const tableRow = row.closest("tr")!;
        const rowUtils = within(tableRow);

        expect(rowUtils.getByText("Pending")).toBeInTheDocument();

        await user.click(rowUtils.getByRole("button", { name: /respond/i }));

        const modalEl = document.querySelector(".modal") as HTMLElement;
        const modalUtils = within(modalEl);

        await user.click(modalUtils.getByRole("button", { name: /deny/i }));
        await user.click(modalUtils.getByRole("button", { name: /submit/i }));

        await waitFor(() => {
            expect(callFunction).toHaveBeenCalledWith("denyRefund", {
                transactionId: 200,
                customerId: "user-2",
                amount: 5,
                note: "",
            });
        });

        await waitFor(() => {
            expect(rowUtils.getByText("Denied")).toBeInTheDocument();
        });
    });
});

describe("TodayRevenue UI", () => {
    let consoleErrorSpy: any;

    beforeEach(() => {
        vi.clearAllMocks();
        consoleErrorSpy = vi.spyOn(console, "error").mockImplementation(() => {});
    });

    afterEach(() => {
        consoleErrorSpy.mockRestore();
    });

    const getRevenueEl = () =>
        document.querySelector(".dr-amount") as HTMLElement;

    it("displays revenue when fetch succeeds", async () => {
        vi.mocked(useTransactions).mockReturnValue({
            getTodayRevenue: vi.fn().mockResolvedValue(123.45),
            subscribeToTodayRevenue: vi.fn().mockReturnValue(() => {}),
        } as any);

        render(<TodayRevenue />);

        expect(document.querySelector(".dr-amount.loading")).toBeInTheDocument();

        await waitFor(() => {
            expect(getRevenueEl()).toHaveTextContent("$123.45");
        });
    });

    it("displays error state when fetch returns null", async () => {
        vi.mocked(useTransactions).mockReturnValue({
            getTodayRevenue: vi.fn().mockResolvedValue(null),
            subscribeToTodayRevenue: vi.fn().mockReturnValue(() => {}),
        } as any);

        render(<TodayRevenue />);

        await waitFor(() => {
            expect(screen.getByText("Failed to load")).toBeInTheDocument();
        });
    });

    it("displays error state when fetch throws", async () => {
        vi.mocked(useTransactions).mockReturnValue({
            getTodayRevenue: vi.fn().mockRejectedValue(new Error("Network error")),
            subscribeToTodayRevenue: vi.fn().mockReturnValue(() => {}),
        } as any);

        render(<TodayRevenue />);

        await waitFor(() => {
            expect(screen.getByText("Failed to load")).toBeInTheDocument();
        });
    });

    it("updates revenue when subscription fires", async () => {
        let capturedOnUpdate: (total: number) => void;

        vi.mocked(useTransactions).mockReturnValue({
            getTodayRevenue: vi.fn().mockResolvedValue(50.0),
            subscribeToTodayRevenue: vi.fn().mockImplementation((onUpdate) => {
                capturedOnUpdate = onUpdate;
                return () => {};
            }),
        } as any);

        render(<TodayRevenue />);

        await waitFor(() => {
            expect(getRevenueEl()).toHaveTextContent("$50.00");
        });

        await act(async () => {
            capturedOnUpdate!(200.0);
        });

        await waitFor(() => {
            expect(getRevenueEl()).toHaveTextContent("$200.00");
        });
    });

    it("calls unsubscribe on unmount", async () => {
        const unsubscribe = vi.fn();

        vi.mocked(useTransactions).mockReturnValue({
            getTodayRevenue: vi.fn().mockResolvedValue(0),
            subscribeToTodayRevenue: vi.fn().mockReturnValue(unsubscribe),
        } as any);

        const { unmount } = render(<TodayRevenue />);

        await waitFor(() => {
            expect(getRevenueEl()).toHaveTextContent("$0.00");
        });

        unmount();

        expect(unsubscribe).toHaveBeenCalledOnce();
    });
});

describe("MonthlyIncome UI", () => {
    let consoleErrorSpy: any;

    beforeEach(() => {
        vi.clearAllMocks();
        consoleErrorSpy = vi.spyOn(console, "error").mockImplementation(() => {});
    });

    afterEach(() => {
        consoleErrorSpy.mockRestore();
    });

    const getAmountEl = () =>
        document.querySelector(".mi-amount") as HTMLElement;

    const getChartEl = () =>
        document.querySelector(".mi-chart") as HTMLElement;

    // --- happy path ---

    it("shows loading state initially", async () => {
        // Never resolves, so the component stays in loading
        vi.mocked(useTransactions).mockReturnValue({
            getLast30DaysRevenue: vi.fn().mockReturnValue(new Promise(() => {})),
        } as any);

        render(<MonthlyIncome />);

        expect(document.querySelector(".mi-chart-loading")).toBeInTheDocument();
        expect(getAmountEl()).toBeNull();
    });

    it("displays total and chart when fetch succeeds", async () => {
        const dailyData = buildDailyData(30, 200);  // 30 days × $200 = $6,000

        vi.mocked(useTransactions).mockReturnValue({
            getLast30DaysRevenue: vi.fn().mockResolvedValue({
                dailyData,
                total: 6000,
            }),
        } as any);

        render(<MonthlyIncome />);

        await waitFor(() => {
            expect(getAmountEl()).toHaveTextContent("$6,000");
        });

        expect(getChartEl()).toBeInTheDocument();
        expect(document.querySelector(".mi-chart-loading")).toBeNull();
    });

    it("renders one SVG data point per day", async () => {
        const dailyData = buildDailyData(30, 50);

        vi.mocked(useTransactions).mockReturnValue({
            getLast30DaysRevenue: vi.fn().mockResolvedValue({ dailyData, total: 1500 }),
        } as any);

        render(<MonthlyIncome />);

        await waitFor(() => {
            const points = document.querySelectorAll(".mi-point");
            expect(points).toHaveLength(30);
        });
    });

    it("displays the correct date range label", async () => {
        vi.mocked(useTransactions).mockReturnValue({
            getLast30DaysRevenue: vi.fn().mockResolvedValue({
                dailyData: buildDailyData(30, 0),
                total: 0,
            }),
        } as any);

        render(<MonthlyIncome />);

        // The label is rendered immediately (outside the async block)
        const dateEl = document.querySelector(".mi-date") as HTMLElement;
        expect(dateEl).toBeInTheDocument();
        expect(dateEl.textContent).toMatch(/\w{3} \d+ - \w{3} \d+/);
    });

    it("displays $0 total when all days have zero revenue", async () => {
        vi.mocked(useTransactions).mockReturnValue({
            getLast30DaysRevenue: vi.fn().mockResolvedValue({
                dailyData: buildDailyData(30, 0),
                total: 0,
            }),
        } as any);

        render(<MonthlyIncome />);

        await waitFor(() => {
            expect(getAmountEl()).toHaveTextContent("$0");
        });
    });

    // --- error states ---

    it("displays error state when fetch returns null", async () => {
        vi.mocked(useTransactions).mockReturnValue({
            getLast30DaysRevenue: vi.fn().mockResolvedValue(null),
        } as any);

        render(<MonthlyIncome />);

        await waitFor(() => {
            expect(screen.getByText("Failed to load")).toBeInTheDocument();
        });

        expect(getAmountEl()).toBeNull();
        expect(getChartEl()).toBeNull();
    });

    it("displays error state when fetch throws", async () => {
        vi.mocked(useTransactions).mockReturnValue({
            getLast30DaysRevenue: vi.fn().mockRejectedValue(new Error("Network error")),
        } as any);

        render(<MonthlyIncome />);

        await waitFor(() => {
            expect(screen.getByText("Failed to load")).toBeInTheDocument();
        });
    });

    it("shows error footer dot when fetch fails", async () => {
        vi.mocked(useTransactions).mockReturnValue({
            getLast30DaysRevenue: vi.fn().mockResolvedValue(null),
        } as any);

        render(<MonthlyIncome />);

        await waitFor(() => {
            const dot = document.querySelector(".mi-dot") as HTMLElement;
            expect(dot).toHaveClass("error-dot");
        });
    });

    it("shows 'Query failed' footer text when fetch fails", async () => {
        vi.mocked(useTransactions).mockReturnValue({
            getLast30DaysRevenue: vi.fn().mockResolvedValue(null),
        } as any);

        render(<MonthlyIncome />);

        await waitFor(() => {
            expect(screen.getByText("Query failed")).toBeInTheDocument();
        });
    });

    it("displays error when getLast30DaysRevenue is not available in context", async () => {
        vi.mocked(useTransactions).mockReturnValue({} as any);

        render(<MonthlyIncome />);

        await waitFor(() => {
            expect(screen.getByText("Failed to load")).toBeInTheDocument();
        });

        expect(consoleErrorSpy).toHaveBeenCalledWith(
            expect.stringMatching(/getLast30DaysRevenue not available/i)
        );
    });

    it("shows 'Last 30 days' footer text on success", async () => {
        vi.mocked(useTransactions).mockReturnValue({
            getLast30DaysRevenue: vi.fn().mockResolvedValue({
                dailyData: buildDailyData(30, 100),
                total: 3000,
            }),
        } as any);

        render(<MonthlyIncome />);

        await waitFor(() => {
            expect(screen.getByText("Last 30 days")).toBeInTheDocument();
        });
    });

    it("shows 'Fetching...' footer text while loading", () => {
        vi.mocked(useTransactions).mockReturnValue({
            getLast30DaysRevenue: vi.fn().mockReturnValue(new Promise(() => {})),
        } as any);

        render(<MonthlyIncome />);

        expect(screen.getByText("Fetching...")).toBeInTheDocument();
    });
    

    it("shows tooltip with date and amount on data point hover", async () => {
        const user = userEvent.setup();
        const dailyData = buildDailyData(30, 300);

        vi.mocked(useTransactions).mockReturnValue({
            getLast30DaysRevenue: vi.fn().mockResolvedValue({ dailyData, total: 9000 }),
        } as any);

        render(<MonthlyIncome />);

        await waitFor(() => {
            expect(document.querySelectorAll(".mi-point")).toHaveLength(30);
        });

        const firstPoint = document.querySelector(".mi-point") as SVGCircleElement;
        await user.hover(firstPoint);

        await waitFor(() => {
            const tooltip = document.querySelector(".mi-tooltip") as HTMLElement;
            expect(tooltip).toBeInTheDocument();
            expect(tooltip.querySelector(".mi-tooltip-date")).toHaveTextContent(dailyData[0]!.date);
            expect(tooltip.querySelector(".mi-tooltip-amount")).toHaveTextContent("$300");
        });
    });

    it("hides tooltip when mouse leaves a data point", async () => {
        const user = userEvent.setup();
        const dailyData = buildDailyData(30, 300);

        vi.mocked(useTransactions).mockReturnValue({
            getLast30DaysRevenue: vi.fn().mockResolvedValue({ dailyData, total: 9000 }),
        } as any);

        render(<MonthlyIncome />);

        await waitFor(() => {
            expect(document.querySelectorAll(".mi-point")).toHaveLength(30);
        });

        const firstPoint = document.querySelector(".mi-point") as SVGCircleElement;
        await user.hover(firstPoint);

        await waitFor(() => {
            expect(document.querySelector(".mi-tooltip")).toBeInTheDocument();
        });

        await user.unhover(firstPoint);

        await waitFor(() => {
            expect(document.querySelector(".mi-tooltip")).toBeNull();
        });
    });
});