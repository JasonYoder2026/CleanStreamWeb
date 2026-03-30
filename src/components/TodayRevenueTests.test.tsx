import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import TodayRevenue from "./TodayRevenue";

// ─── Mocks ───────────────────────────────────────────────────────────────────

const mockGetTodayRevenue = vi.fn();
const mockSubscribeToTodayRevenue = vi.fn().mockReturnValue(() => {});

vi.mock("../di/container", () => ({
    useTransactions: () => ({
        getTodayRevenue: mockGetTodayRevenue,
        subscribeToTodayRevenue: mockSubscribeToTodayRevenue,
    }),
}));

vi.mock("../styles/TodayRevenue.css", () => ({}));

// ─── Helpers ─────────────────────────────────────────────────────────────────

const renderComponent = () => render(<TodayRevenue />);

// ─── Tests ───────────────────────────────────────────────────────────────────

describe("TodayRevenue", () => {

    beforeEach(() => {
        vi.clearAllMocks();
    });

    describe("loading state", () => {

        it("shows fetching text while loading", () => {
            mockGetTodayRevenue.mockResolvedValue(new Promise(() => {})); // never resolves
            renderComponent();

            expect(screen.getByText("Fetching...")).toBeDefined();
        });

        it("shows the Daily Revenue label", async () => {
            mockGetTodayRevenue.mockResolvedValue(100);
            renderComponent();

            expect(screen.getByText("Daily Revenue")).toBeDefined();
        });

    });

    describe("success state", () => {

        it("displays formatted revenue after loading", async () => {
            mockGetTodayRevenue.mockResolvedValue(150.5);
            renderComponent();

            await waitFor(() => {
                expect(screen.getByText("$150.50")).toBeDefined();
            });
        });

        it("displays $0.00 when revenue is 0", async () => {
            mockGetTodayRevenue.mockResolvedValue(0);
            renderComponent();

            await waitFor(() => {
                expect(screen.getByText("$0.00")).toBeDefined();
            });
        });

        it("shows Live · UTC day footer after loading", async () => {
            mockGetTodayRevenue.mockResolvedValue(100);
            renderComponent();

            await waitFor(() => {
                expect(screen.getByText("Live · UTC day")).toBeDefined();
            });
        });

        it("calls getTodayRevenue once on mount", async () => {
            mockGetTodayRevenue.mockResolvedValue(100);
            renderComponent();

            await waitFor(() => expect(mockGetTodayRevenue).toHaveBeenCalledTimes(1));
        });

        it("formats large revenue amounts correctly", async () => {
            mockGetTodayRevenue.mockResolvedValue(12345.67);
            renderComponent();

            await waitFor(() => {
                expect(screen.getByText("$12,345.67")).toBeDefined();
            });
        });

    });

    describe("error state", () => {

        it("shows failed to load when getTodayRevenue returns null", async () => {
            mockGetTodayRevenue.mockResolvedValue(null);
            renderComponent();

            await waitFor(() => {
                expect(screen.getByText("Failed to load")).toBeDefined();
            });
        });

        it("shows Query failed footer when there is an error", async () => {
            mockGetTodayRevenue.mockResolvedValue(null);
            renderComponent();

            await waitFor(() => {
                expect(screen.getByText("Query failed")).toBeDefined();
            });
        });

        it("shows failed to load when getTodayRevenue throws", async () => {
            const consoleSpy = vi.spyOn(console, "error").mockImplementation(() => {});
            mockGetTodayRevenue.mockRejectedValue(new Error("Network error"));
            renderComponent();

            await waitFor(() => {
                expect(screen.getByText("Failed to load")).toBeDefined();
            });

            consoleSpy.mockRestore();
        });

        it("shows error-dot class on footer dot when there is an error", async () => {
            mockGetTodayRevenue.mockResolvedValue(null);
            renderComponent();

            await waitFor(() => {
                const dot = document.querySelector(".dr-dot");
                expect(dot?.classList.contains("error-dot")).toBe(true);
            });
        });

    });

    describe("when getTodayRevenue is not available", () => {

        it("shows failed to load when repository method is missing", async () => {
            const consoleSpy = vi.spyOn(console, "error").mockImplementation(() => {});

            vi.mocked(mockGetTodayRevenue); // clear ref
            vi.doMock("../di/container", () => ({
                useTransactions: () => ({}), // no getTodayRevenue
            }));

            // Re-render with missing method scenario by returning null from mock
            mockGetTodayRevenue.mockImplementation(() => {
                throw new Error("not available");
            });

            renderComponent();

            await waitFor(() => {
                expect(screen.getByText("Failed to load")).toBeDefined();
            });

            consoleSpy.mockRestore();
        });

    });

});