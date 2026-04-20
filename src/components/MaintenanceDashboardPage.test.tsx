import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import MaintenanceDashboardPage from "./MaintenanceDashboardPage";
import type { Maintenance } from "../interfaces/MaintenanceService";

const mockMaintenances: Maintenance[] = [
    {
        user_id: "USER-001",
        category: "Plumbing",
        description: "Leaky faucet in the breakroom",
        created_at: "2024-03-20T10:00:00Z",
        location: "Level 1, Kitchen",
        image_data: "https://example.com/image1.jpg",
    },
    {
        user_id: "USER-002",
        category: "Electrical",
        description: "Flickering lights in hallway",
        created_at: "2024-03-21T11:30:00Z",
        location: "Level 2, West Wing",
        image_data: "",
    },
];

describe("MaintenanceDashboardPage", () => {
    const mockGetMaintenances = vi.fn();

    const mockMaintenanceService = {
        getMaintenances: mockGetMaintenances,
    };

    beforeEach(() => {
        vi.clearAllMocks();
        mockGetMaintenances.mockResolvedValue(mockMaintenances);
    });

    it("renders the page title and description", () => {
        render(<MaintenanceDashboardPage maintenanceService={mockMaintenanceService} />);

        expect(screen.getByText("Maintenance Dashboard")).toBeInTheDocument();
        expect(
            screen.getByText("Review and manage facility maintenance reports")
        ).toBeInTheDocument();
    });

    it("displays loading state initially", () => {
        render(<MaintenanceDashboardPage maintenanceService={mockMaintenanceService} />);
        expect(screen.getByText("Loading maintenance reports...")).toBeInTheDocument();
    });

    it("loads and displays maintenance data in the table", async () => {
        render(<MaintenanceDashboardPage maintenanceService={mockMaintenanceService} />);

        await waitFor(() => {
            expect(mockGetMaintenances).toHaveBeenCalled();
        });

        expect(screen.getByText("Plumbing")).toBeInTheDocument();
        expect(screen.getByText("Leaky faucet in the breakroom")).toBeInTheDocument();
        expect(screen.getByText("USER-001")).toBeInTheDocument();
        expect(screen.getByText("Level 1, Kitchen")).toBeInTheDocument();
    });

    it("displays error state when service fetch fails", async () => {
        mockGetMaintenances.mockRejectedValue(new Error("API Error"));

        render(<MaintenanceDashboardPage maintenanceService={mockMaintenanceService} />);

        await waitFor(() => {
            expect(screen.getByText("Failed to load maintenance requests")).toBeInTheDocument();
        });
    });

    it("filters maintenance requests when category buttons are clicked", async () => {
        render(<MaintenanceDashboardPage maintenanceService={mockMaintenanceService} />);

        await waitFor(() => {
            expect(screen.getByText("Plumbing")).toBeInTheDocument();
        });

        expect(screen.getByText("Plumbing")).toBeInTheDocument();
        expect(screen.getByText("Electrical")).toBeInTheDocument();

        const plumbingButton = screen.getByRole("button", { name: "Plumbing" });
        fireEvent.click(plumbingButton);

        expect(screen.getByText("Plumbing")).toBeInTheDocument();
        expect(screen.queryByText("Electrical")).not.toBeInTheDocument();
    });

    it("opens image in a new window when 'View Image' is clicked", async () => {
        const windowSpy = vi.spyOn(window, "open").mockImplementation(() => null);

        render(<MaintenanceDashboardPage maintenanceService={mockMaintenanceService} />);

        await waitFor(() => {
            expect(screen.getByText("View Image")).toBeInTheDocument();
        });

        const viewButton = screen.getByText("View Image");
        fireEvent.click(viewButton);

        expect(windowSpy).toHaveBeenCalledWith("https://example.com/image1.jpg", "_blank");
        windowSpy.mockRestore();
    });

    it("shows 'No Image' text when image_data is empty", async () => {
        render(<MaintenanceDashboardPage maintenanceService={mockMaintenanceService} />);

        await waitFor(() => {
            expect(screen.getByText("No Image")).toBeInTheDocument();
        });
    });

    it("shows empty state message when no data is returned", async () => {
        mockGetMaintenances.mockResolvedValue([]);

        render(<MaintenanceDashboardPage maintenanceService={mockMaintenanceService} />);

        await waitFor(() => {
            expect(
                screen.getByText("No maintenance records found for this category.")
            ).toBeInTheDocument();
        });
    });
});