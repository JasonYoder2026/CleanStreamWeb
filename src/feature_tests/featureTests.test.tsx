import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, screen, waitFor, within, act } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import RefundsPage from "../components/RefundsDashboardPage";
import TodayRevenue from "../components/TodayRevenue";

vi.mock("../di/container", () => ({
    useTransactions: vi.fn(),
    useRefunds: vi.fn(),
    useFunctions: vi.fn(),
}));

import { useTransactions } from "../di/container";

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