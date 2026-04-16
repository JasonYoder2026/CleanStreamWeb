import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import EmployeePage from "./EmployeeDashboardPage";

// ─── Mock Services ────────────────────────────────────────────────────────────

const mockGetLocations = vi.fn();
const mockFetchEmployees = vi.fn();

vi.mock("../di/container", () => ({
  useLocations: () => ({
    getLocations: mockGetLocations,
  }),
  useEmployee: () => ({
    fetchEmployees: mockFetchEmployees,
    assignAdminLocation: vi.fn(),
  }),
}));

vi.mock("./AddEmployeeModal", () => ({
  default: ({
    isOpen,
    onClose,
    onSuccess,
  }: {
    isOpen: boolean;
    onClose: () => void;
    onSuccess: () => void;
  }) =>
    isOpen ? (
      <div data-testid="add-employee-modal">
        <button onClick={onClose}>Close</button>
        <button onClick={onSuccess}>Submit</button>
      </div>
    ) : null,
}));

// ─── Mock Data ────────────────────────────────────────────────────────────────

const mockLocations = [
  { id: 1, Name: "Downtown Branch" },
  { id: 2, Name: "Northside Branch" },
];

const mockEmployees = [
  { name: "Alice Smith", email: "alice@example.com", locationID: 1 },
  { name: "Bob Jones", email: "bob@example.com", locationID: 2 },
];

// ─── Tests ────────────────────────────────────────────────────────────────────

describe("EmployeePage", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockGetLocations.mockResolvedValue(mockLocations);
    mockFetchEmployees.mockResolvedValue(mockEmployees);
  });

  // ── Rendering ─────────────────────────────────────────────────────────────

  describe("rendering", () => {
    it("renders the Add Employee button", () => {
      render(<EmployeePage />);

      expect(
        screen.getByRole("button", { name: /add employee/i }),
      ).toBeInTheDocument();
    });

    it("renders the table headers", () => {
      render(<EmployeePage />);

      expect(screen.getByText("Name")).toBeInTheDocument();
      expect(screen.getByText("Email")).toBeInTheDocument();
      expect(screen.getByText("Location ID")).toBeInTheDocument();
    });

    it("renders the empty state row before data loads", () => {
      mockFetchEmployees.mockReturnValue(new Promise(() => {}));

      render(<EmployeePage />);

      expect(
        screen.getByText("No employees at this time."),
      ).toBeInTheDocument();
    });

    it("renders employee rows after data loads", async () => {
      render(<EmployeePage />);

      await waitFor(() => {
        expect(screen.getByText("Alice Smith")).toBeInTheDocument();
        expect(screen.getByText("Bob Jones")).toBeInTheDocument();
      });
    });

    it("renders employee emails", async () => {
      render(<EmployeePage />);

      await waitFor(() => {
        expect(screen.getByText("alice@example.com")).toBeInTheDocument();
        expect(screen.getByText("bob@example.com")).toBeInTheDocument();
      });
    });

    it("renders employee location IDs", async () => {
      render(<EmployeePage />);

      await waitFor(() => {
        expect(screen.getByText("1")).toBeInTheDocument();
        expect(screen.getByText("2")).toBeInTheDocument();
      });
    });

    it("does not render the empty state row when employees are loaded", async () => {
      render(<EmployeePage />);

      await waitFor(() => {
        expect(
          screen.queryByText("No employees at this time."),
        ).not.toBeInTheDocument();
      });
    });

    it("renders the empty state when fetchEmployees returns an empty array", async () => {
      mockFetchEmployees.mockResolvedValue([]);

      render(<EmployeePage />);

      await waitFor(() => {
        expect(
          screen.getByText("No employees at this time."),
        ).toBeInTheDocument();
      });
    });
  });

  // ── Data Fetching ─────────────────────────────────────────────────────────

  describe("data fetching", () => {
    it("calls getLocations on mount", async () => {
      render(<EmployeePage />);

      await waitFor(() => {
        expect(mockGetLocations).toHaveBeenCalledTimes(1);
      });
    });

    it("calls fetchEmployees with location IDs derived from getLocations", async () => {
      render(<EmployeePage />);

      await waitFor(() => {
        expect(mockFetchEmployees).toHaveBeenCalledWith([1, 2]);
      });
    });

    it("calls fetchEmployees with an empty array when there are no locations", async () => {
      mockGetLocations.mockResolvedValue([]);

      render(<EmployeePage />);

      await waitFor(() => {
        expect(mockFetchEmployees).toHaveBeenCalledWith([]);
      });
    });
  });

  // ── Modal Interaction ─────────────────────────────────────────────────────

  describe("modal interaction", () => {
    it("does not render the modal on initial load", () => {
      render(<EmployeePage />);

      expect(
        screen.queryByTestId("add-employee-modal"),
      ).not.toBeInTheDocument();
    });

    it("opens the modal when the Add Employee button is clicked", () => {
      render(<EmployeePage />);

      fireEvent.click(screen.getByRole("button", { name: /add employee/i }));

      expect(screen.getByTestId("add-employee-modal")).toBeInTheDocument();
    });

    it("closes the modal when onClose is triggered", () => {
      render(<EmployeePage />);

      fireEvent.click(screen.getByRole("button", { name: /add employee/i }));
      fireEvent.click(screen.getByRole("button", { name: "Close" }));

      expect(
        screen.queryByTestId("add-employee-modal"),
      ).not.toBeInTheDocument();
    });

    it("refetches employees when onSuccess is triggered", async () => {
      render(<EmployeePage />);

      await waitFor(() => expect(mockFetchEmployees).toHaveBeenCalledTimes(1));

      fireEvent.click(screen.getByRole("button", { name: /add employee/i }));
      fireEvent.click(screen.getByRole("button", { name: "Submit" }));

      await waitFor(() => {
        expect(mockFetchEmployees).toHaveBeenCalledTimes(2);
      });
    });

    it("keeps the modal open after onSuccess is triggered", async () => {
      render(<EmployeePage />);

      fireEvent.click(screen.getByRole("button", { name: /add employee/i }));
      fireEvent.click(screen.getByRole("button", { name: "Submit" }));

      await waitFor(() => {
        expect(screen.getByTestId("add-employee-modal")).toBeInTheDocument();
      });
    });
  });
});
