import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import LocationsPage from "./LocationsDashboardPage";
import type { Location, Machine } from "../interfaces/LocationService";

// ─── Mock Child Modals ────────────────────────────────────────────────────────

vi.mock("./AddMachineModal", () => ({
  default: ({ isOpen }: { isOpen: boolean }) => (isOpen ? <div data-testid="add-machine-modal" /> : null),
}));

vi.mock("./AddLocationModal", () => ({
  default: ({ isOpen }: { isOpen: boolean }) => (isOpen ? <div data-testid="add-location-modal" /> : null),
}));

// ─── Mock useLocations ────────────────────────────────────────────────────────

const mockGetLocations = vi.fn();
const mockGetMachines = vi.fn();
const mockFetchUserRole = vi.fn();

vi.mock("../di/container", () => ({
  useLocations: () => ({
    getLocations: mockGetLocations,
    getMachines: mockGetMachines,
    fetchUserRole: mockFetchUserRole,
  }),
}));

// ─── Mock Data ────────────────────────────────────────────────────────────────

const mockLocations: Location[] = [
  {
    id: 1,
    Name: "Location A",
    Address: "123 Main St",
    Latitude: 40.71,
    Longitude: -74.0,
  },
  {
    id: 2,
    Name: "Location B",
    Address: "456 Elm St",
    Latitude: 34.05,
    Longitude: -118.24,
  },
];

const mockMachines: Machine[] = [
  {
    id: 1,
    Name: "Washer 1",
    Price: 2.5,
    Runtime: 30,
    Status: "Available",
    Location_ID: 1,
    Machine_type: "Washer",
    Weight_kg: 12,
  },
  {
    id: 2,
    Name: "Dryer 1",
    Price: 1.75,
    Runtime: 45,
    Status: "In Use",
    Location_ID: 1,
    Machine_type: "Dryer",
    Weight_kg: 16,
  },
];

// ─── Tests ────────────────────────────────────────────────────────────────────

describe("LocationsPage", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockGetLocations.mockResolvedValue(mockLocations);
    mockGetMachines.mockResolvedValue(mockMachines);
    mockFetchUserRole.mockResolvedValue("Admin");
  });

  // ── Rendering ─────────────────────────────────────────────────────────────

  describe("rendering", () => {
    it("renders the location select dropdown", async () => {
      render(<LocationsPage />);

      await waitFor(() => {
        expect(screen.getByRole("combobox")).toBeInTheDocument();
      });
    });

    it("renders the default select option", async () => {
      render(<LocationsPage />);

      await waitFor(() => {
        expect(screen.getByText("Select a location")).toBeInTheDocument();
      });
    });

    it("renders locations in the dropdown after fetching", async () => {
      render(<LocationsPage />);

      await waitFor(() => {
        expect(screen.getByText("Location A")).toBeInTheDocument();
        expect(screen.getByText("Location B")).toBeInTheDocument();
      });
    });

    it("renders the machines table with correct headers", async () => {
      render(<LocationsPage />);

      await waitFor(() => {
        expect(screen.getByText("Name")).toBeInTheDocument();
        expect(screen.getByText("Type")).toBeInTheDocument();
        expect(screen.getByText("Status")).toBeInTheDocument();
        expect(screen.getByText("Weight")).toBeInTheDocument();
      });
    });

    it("does not render a Price column header", async () => {
      render(<LocationsPage />);

      await waitFor(() => screen.getByText("Name"));

      expect(screen.queryByRole("columnheader", { name: "Price" })).not.toBeInTheDocument();
    });

    it("renders empty state message when no machines are loaded", async () => {
      render(<LocationsPage />);

      await waitFor(() => {
        expect(screen.getByText("No machines at this location.")).toBeInTheDocument();
      });
    });

    it("renders machine rows after selecting a location", async () => {
      render(<LocationsPage />);

      await waitFor(() => screen.getByText("Location A"));

      fireEvent.change(screen.getByRole("combobox"), {
        target: { value: "1" },
      });

      await waitFor(() => {
        expect(screen.getByText("Washer 1")).toBeInTheDocument();
        expect(screen.getByText("Dryer 1")).toBeInTheDocument();
      });
    });

    it("renders machine weight formatted as kg after selecting a location", async () => {
      render(<LocationsPage />);

      await waitFor(() => screen.getByText("Location A"));

      fireEvent.change(screen.getByRole("combobox"), {
        target: { value: "1" },
      });

      await waitFor(() => {
        expect(screen.getByText("12 kg")).toBeInTheDocument();
        expect(screen.getByText("16 kg")).toBeInTheDocument();
      });
    });

    it("does not render machine price in the table", async () => {
      render(<LocationsPage />);

      await waitFor(() => screen.getByText("Location A"));

      fireEvent.change(screen.getByRole("combobox"), {
        target: { value: "1" },
      });

      await waitFor(() => screen.getByText("Washer 1"));

      expect(screen.queryByText("$2.50")).not.toBeInTheDocument();
      expect(screen.queryByText("$1.75")).not.toBeInTheDocument();
    });

    it("renders machine type and status after selecting a location", async () => {
      render(<LocationsPage />);

      await waitFor(() => screen.getByText("Location A"));

      fireEvent.change(screen.getByRole("combobox"), {
        target: { value: "1" },
      });

      await waitFor(() => {
        expect(screen.getByText("Washer")).toBeInTheDocument();
        expect(screen.getByText("Available")).toBeInTheDocument();
        expect(screen.getByText("Dryer")).toBeInTheDocument();
        expect(screen.getByText("In Use")).toBeInTheDocument();
      });
    });
  });

  // ── Owner-only UI ─────────────────────────────────────────────────────────

  describe("owner role", () => {
    beforeEach(() => {
      mockFetchUserRole.mockResolvedValue("Owner");
    });

    it("shows add location button for Owner", async () => {
      render(<LocationsPage />);

      await waitFor(() => {
        expect(screen.getByText("Add Location:")).toBeInTheDocument();
      });
    });

    it("shows add machine button for Owner", async () => {
      render(<LocationsPage />);

      await waitFor(() => {
        expect(screen.getByText("Add Machine")).toBeInTheDocument();
      });
    });

    it("opens add location modal when add location button is clicked", async () => {
      render(<LocationsPage />);

      await waitFor(() => screen.getByText("Add Location:"));

      const addLocationSection = screen.getByText("Add Location:").closest(".sub-section");
      fireEvent.click(addLocationSection!.querySelector("button")!);

      expect(screen.getByTestId("add-location-modal")).toBeInTheDocument();
    });

    it("opens add machine modal when add machine button is clicked", async () => {
      render(<LocationsPage />);

      await waitFor(() => screen.getByText("Add Machine"));

      fireEvent.click(screen.getByText("Add Machine"));

      expect(screen.getByTestId("add-machine-modal")).toBeInTheDocument();
    });

    it("modal is absent before the add machine button is clicked", async () => {
      render(<LocationsPage />);

      await waitFor(() => screen.getByText("Add Machine"));

      expect(screen.queryByTestId("add-machine-modal")).not.toBeInTheDocument();
    });
  });

  // ── Non-owner role ────────────────────────────────────────────────────────

  describe("non-owner role", () => {
    it("does not show add location button for Admin", async () => {
      mockFetchUserRole.mockResolvedValue("Admin");
      render(<LocationsPage />);

      await waitFor(() => screen.getByText("Location A"));

      expect(screen.queryByText("Add Location:")).not.toBeInTheDocument();
    });

    it("does not show add machine button for Admin", async () => {
      mockFetchUserRole.mockResolvedValue("Admin");
      render(<LocationsPage />);

      await waitFor(() => screen.getByText("Location A"));

      expect(screen.queryByText("Add Machine")).not.toBeInTheDocument();
    });

    it("does not show owner controls when role is null", async () => {
      mockFetchUserRole.mockResolvedValue(null);
      render(<LocationsPage />);

      await waitFor(() => screen.getByText("Location A"));

      expect(screen.queryByText("Add Location:")).not.toBeInTheDocument();
      expect(screen.queryByText("Add Machine")).not.toBeInTheDocument();
    });
  });

  // ── Service calls ─────────────────────────────────────────────────────────

  describe("service calls", () => {
    it("calls getLocations on mount", async () => {
      render(<LocationsPage />);

      await waitFor(() => {
        expect(mockGetLocations).toHaveBeenCalledTimes(1);
      });
    });

    it("calls fetchUserRole on mount", async () => {
      render(<LocationsPage />);

      await waitFor(() => {
        expect(mockFetchUserRole).toHaveBeenCalledTimes(1);
      });
    });

    it("calls getMachines with the selected location id", async () => {
      render(<LocationsPage />);

      await waitFor(() => screen.getByText("Location A"));

      fireEvent.change(screen.getByRole("combobox"), {
        target: { value: "2" },
      });

      await waitFor(() => {
        expect(mockGetMachines).toHaveBeenCalledWith("2");
      });
    });

    it("does not call getMachines on mount", async () => {
      render(<LocationsPage />);

      await waitFor(() => screen.getByText("Location A"));

      expect(mockGetMachines).not.toHaveBeenCalled();
    });

    it("calls getMachines again when a different location is selected", async () => {
      render(<LocationsPage />);

      await waitFor(() => screen.getByText("Location A"));

      fireEvent.change(screen.getByRole("combobox"), { target: { value: "1" } });
      await waitFor(() => expect(mockGetMachines).toHaveBeenCalledWith("1"));

      fireEvent.change(screen.getByRole("combobox"), { target: { value: "2" } });
      await waitFor(() => expect(mockGetMachines).toHaveBeenCalledWith("2"));

      expect(mockGetMachines).toHaveBeenCalledTimes(2);
    });
  });

  // ── Error handling ────────────────────────────────────────────────────────

  describe("error handling", () => {
    it("renders empty dropdown when getLocations fails", async () => {
      mockGetLocations.mockRejectedValue(new Error("Failed to fetch"));
      render(<LocationsPage />);

      await waitFor(() => {
        expect(screen.queryByText("Location A")).not.toBeInTheDocument();
      });
    });

    it("still renders the Select a location placeholder when getLocations fails", async () => {
      mockGetLocations.mockRejectedValue(new Error("Failed to fetch"));
      render(<LocationsPage />);

      await waitFor(() => {
        expect(screen.getByText("Select a location")).toBeInTheDocument();
      });
    });

    it("renders empty machine table when getMachines fails", async () => {
      mockGetMachines.mockRejectedValue(new Error("Failed to fetch machines"));
      render(<LocationsPage />);

      await waitFor(() => screen.getByText("Location A"));

      fireEvent.change(screen.getByRole("combobox"), {
        target: { value: "1" },
      });

      await waitFor(() => {
        expect(screen.getByText("No machines at this location.")).toBeInTheDocument();
      });
    });

    it("retains previous machines when getMachines fails on a subsequent selection", async () => {
      mockGetMachines.mockResolvedValueOnce(mockMachines).mockRejectedValueOnce(new Error("Failed"));

      render(<LocationsPage />);

      await waitFor(() => screen.getByText("Location A"));

      fireEvent.change(screen.getByRole("combobox"), { target: { value: "1" } });
      await waitFor(() => screen.getByText("Washer 1"));

      fireEvent.change(screen.getByRole("combobox"), { target: { value: "2" } });

      await waitFor(() => {
        expect(screen.getByText("Washer 1")).toBeInTheDocument();
      });
    });
  });
});
