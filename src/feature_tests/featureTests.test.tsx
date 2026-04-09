// tests/refundsPage.ui.test.tsx
import { describe, it, expect, vi } from "vitest";
import { render, screen, waitFor, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import RefundsPage from "../components/RefundsDashboardPage";

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

        // 🔹 Find the correct row
        const row = await screen.findByText("John Doe");
        const tableRow = row.closest("tr")!;
        const rowUtils = within(tableRow);

        // 🔹 Check initial status (scoped)
        expect(rowUtils.getByText("Pending")).toBeInTheDocument();

        // 🔹 Open modal
        await user.click(rowUtils.getByRole("button", { name: /respond/i }));

        // 🔹 Scope to the .modal div to avoid matching filter pills
        const modalEl = document.querySelector(".modal") as HTMLElement;
        const modalUtils = within(modalEl);

        // 🔹 Click approve
        await user.click(modalUtils.getByRole("button", { name: /approve/i }));

        // 🔹 Submit
        await user.click(modalUtils.getByRole("button", { name: /submit/i }));

        // 🔹 Verify backend call
        await waitFor(() => {
            expect(callFunction).toHaveBeenCalledWith("approveRefund", {
                transactionId: 130,
                customerId: "acf8e5f3-03f5-4e2a-a120-fcd10ca64e1a",
                amount: 2,
                note: "",
            });
        });

        // 🔹 Verify ONLY this row updates
        await waitFor(() => {
            expect(rowUtils.getByText("Approved")).toBeInTheDocument();
        });

        // 🔹 Toast appears — scoped to .toast to avoid matching filter pill + status badge
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