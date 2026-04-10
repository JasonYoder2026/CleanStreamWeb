import { render, screen } from "@testing-library/react";
import { describe, it, expect, vi } from "vitest";
import DashBoard from "./DashboardPage";

vi.mock("../components/TodayRevenue", () => ({
    default: () => <div data-testid="today-revenue" />,
}));

vi.mock("../components/MonthlyIncome", () => ({
    default: () => <div data-testid="monthly-income" />,
}));

describe("DashboardPage", () => {
    it("renders the dashboard title", () => {
        render(<DashBoard />);

        expect(
            screen.getByRole("heading", { name: /dashboard/i })
        ).toBeInTheDocument();
    });

    it("renders the current date", () => {
        render(<DashBoard />);

        const today = new Date().toLocaleDateString("en-US", {
            weekday: "long",
            year: "numeric",
            month: "long",
            day: "numeric",
        });

        expect(screen.getByText(today)).toBeInTheDocument();
    });

    it("renders child widgets", () => {
        render(<DashBoard />);

        expect(screen.getByTestId("today-revenue")).toBeInTheDocument();
        expect(screen.getByTestId("monthly-income")).toBeInTheDocument();
    });

    it("renders the dashboard layout container", () => {
        const { container } = render(<DashBoard />);

        expect(container.querySelector(".dashboard-page")).toBeInTheDocument();
        expect(container.querySelector(".dashboard-grid")).toBeInTheDocument();
    });
});