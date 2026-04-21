import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import AddEmployeeModal from "./AddEmployeeModal";

// ─── Mock Services ────────────────────────────────────────────────────────────

const mockGetLocations = vi.fn();
const mockAssignAdminLocation = vi.fn();

vi.mock("../di/container", () => ({
  useLocations: () => ({
    getLocations: mockGetLocations,
  }),
  useEmployee: () => ({
    assignAdminLocation: mockAssignAdminLocation,
  }),
}));

// ─── Mock Data ────────────────────────────────────────────────────────────────

const defaultProps = {
  isOpen: true,
  onClose: vi.fn(),
  onSuccess: vi.fn(),
};

const mockLocations = [
  { id: 1, Name: "Downtown Branch" },
  { id: 2, Name: "Northside Branch" },
];

const fillForm = () => {
  fireEvent.change(screen.getByLabelText("Employee Email"), {
    target: { value: "john@example.com", id: "employeeEmail" },
  });
};

// ─── Tests ────────────────────────────────────────────────────────────────────

describe("AddEmployeeModal", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockGetLocations.mockResolvedValue(mockLocations);
    mockAssignAdminLocation.mockResolvedValue(undefined);
  });

  // ── Visibility ────────────────────────────────────────────────────────────

  describe("visibility", () => {
    it("renders nothing when isOpen is false", () => {
      render(<AddEmployeeModal {...defaultProps} isOpen={false} />);

      expect(
        screen.queryByText("Add Employee", { selector: "p" }),
      ).not.toBeInTheDocument();
    });

    it("renders the modal when isOpen is true", () => {
      render(<AddEmployeeModal {...defaultProps} />);

      expect(
        screen.getByText("Add Employee", { selector: "p" }),
      ).toBeInTheDocument();
    });
  });

  // ── Rendering ─────────────────────────────────────────────────────────────

  describe("rendering", () => {
    it("renders all form fields", async () => {
      render(<AddEmployeeModal {...defaultProps} />);

      expect(screen.getByLabelText("Employee Email")).toBeInTheDocument();
      await waitFor(() => {
        expect(screen.getByLabelText("Location")).toBeInTheDocument();
      });
    });

    it("renders cancel and submit buttons", () => {
      render(<AddEmployeeModal {...defaultProps} />);

      expect(
        screen.getByRole("button", { name: "Cancel" }),
      ).toBeInTheDocument();
      expect(
        screen.getByRole("button", { name: "Add Employee" }),
      ).toBeInTheDocument();
    });

    it("renders the close button", () => {
      render(<AddEmployeeModal {...defaultProps} />);

      expect(
        screen.getByRole("button", { name: "Close modal" }),
      ).toBeInTheDocument();
    });

    it("populates location dropdown with fetched locations", async () => {
      render(<AddEmployeeModal {...defaultProps} />);

      await waitFor(() => {
        expect(
          screen.getByRole("option", { name: "Downtown Branch" }),
        ).toBeInTheDocument();
        expect(
          screen.getByRole("option", { name: "Northside Branch" }),
        ).toBeInTheDocument();
      });
    });

    it("defaults location to the first fetched location", async () => {
      render(<AddEmployeeModal {...defaultProps} />);

      await waitFor(() => {
        expect(screen.getByLabelText("Location")).toHaveValue("1");
      });
    });
  });

  // ── Form Interaction ──────────────────────────────────────────────────────

  describe("form interaction", () => {
    it("updates employee email field on change", () => {
      render(<AddEmployeeModal {...defaultProps} />);

      fireEvent.change(screen.getByLabelText("Employee Email"), {
        target: { value: "john@example.com", id: "employeeEmail" },
      });

      expect(screen.getByLabelText("Employee Email")).toHaveValue(
        "john@example.com",
      );
    });

    it("updates location select on change", async () => {
      render(<AddEmployeeModal {...defaultProps} />);

      await waitFor(() =>
        screen.getByRole("option", { name: "Northside Branch" }),
      );

      fireEvent.change(screen.getByLabelText("Location"), {
        target: { value: "2", id: "locationID" },
      });

      expect(screen.getByLabelText("Location")).toHaveValue("2");
    });
  });

  // ── Submission ────────────────────────────────────────────────────────────

  describe("submission", () => {
    it("calls assignAdminLocation with the correct params", async () => {
      render(<AddEmployeeModal {...defaultProps} />);

      await waitFor(() =>
        screen.getByRole("option", { name: "Downtown Branch" }),
      );

      fillForm();
      fireEvent.click(screen.getByRole("button", { name: "Add Employee" }));

      await waitFor(() => {
        expect(mockAssignAdminLocation).toHaveBeenCalledWith({
          email: "john@example.com",
          locationID: 1,
        });
      });
    });

    it("calls onSuccess after a successful submit", async () => {
      render(<AddEmployeeModal {...defaultProps} />);

      fillForm();
      fireEvent.click(screen.getByRole("button", { name: "Add Employee" }));

      await waitFor(() => {
        expect(defaultProps.onSuccess).toHaveBeenCalledTimes(1);
      });
    });

    it("shows success state after a successful submit", async () => {
      render(<AddEmployeeModal {...defaultProps} />);

      fillForm();
      fireEvent.click(screen.getByRole("button", { name: "Add Employee" }));

      await waitFor(() => {
        expect(screen.getByText("Employee Added!")).toBeInTheDocument();
      });
    });

    it("shows the employee email in the success message", async () => {
      render(<AddEmployeeModal {...defaultProps} />);

      fillForm();
      fireEvent.click(screen.getByRole("button", { name: "Add Employee" }));

      await waitFor(() => {
        expect(
          screen.getByText("john@example.com has been added successfully."),
        ).toBeInTheDocument();
      });
    });

    it("shows fallback text in success message when email is empty", async () => {
      render(<AddEmployeeModal {...defaultProps} />);

      fireEvent.click(screen.getByRole("button", { name: "Add Employee" }));

      await waitFor(() => {
        expect(
          screen.getByText("Employee has been added successfully."),
        ).toBeInTheDocument();
      });
    });

    it("shows error banner when assignAdminLocation throws", async () => {
      mockAssignAdminLocation.mockRejectedValue(new Error("Network error"));

      render(<AddEmployeeModal {...defaultProps} />);

      fillForm();
      fireEvent.click(screen.getByRole("button", { name: "Add Employee" }));

      await waitFor(() => {
        expect(screen.getByText("Network error")).toBeInTheDocument();
      });
    });

    it("shows fallback error message when a non-Error is thrown", async () => {
      mockAssignAdminLocation.mockRejectedValue("unexpected failure");

      render(<AddEmployeeModal {...defaultProps} />);

      fillForm();
      fireEvent.click(screen.getByRole("button", { name: "Add Employee" }));

      await waitFor(() => {
        expect(screen.getByText("Something went wrong.")).toBeInTheDocument();
      });
    });

    it("clears the error message on a new submission attempt", async () => {
      mockAssignAdminLocation.mockRejectedValueOnce(new Error("Network error"));
      mockAssignAdminLocation.mockResolvedValueOnce(undefined);

      render(<AddEmployeeModal {...defaultProps} />);

      fillForm();
      fireEvent.click(screen.getByRole("button", { name: "Add Employee" }));

      await waitFor(() => screen.getByText("Network error"));

      fireEvent.click(screen.getByRole("button", { name: "Add Employee" }));

      await waitFor(() => {
        expect(screen.queryByText("Network error")).not.toBeInTheDocument();
      });
    });
  });

  // ── Close Behaviour ───────────────────────────────────────────────────────

  describe("close behaviour", () => {
    it("calls onClose when cancel button is clicked", () => {
      render(<AddEmployeeModal {...defaultProps} />);

      fireEvent.click(screen.getByRole("button", { name: "Cancel" }));

      expect(defaultProps.onClose).toHaveBeenCalledTimes(1);
    });

    it("calls onClose when close icon button is clicked", () => {
      render(<AddEmployeeModal {...defaultProps} />);

      fireEvent.click(screen.getByRole("button", { name: "Close modal" }));

      expect(defaultProps.onClose).toHaveBeenCalledTimes(1);
    });

    it("calls onClose when clicking the backdrop", () => {
      render(<AddEmployeeModal {...defaultProps} />);

      fireEvent.click(
        screen
          .getByText("Add Employee", { selector: "p" })
          .closest(".modal-backdrop")!,
      );

      expect(defaultProps.onClose).toHaveBeenCalledTimes(1);
    });

    it("resets the email field after closing", async () => {
      render(<AddEmployeeModal {...defaultProps} />);

      fireEvent.change(screen.getByLabelText("Employee Email"), {
        target: { value: "john@example.com", id: "employeeEmail" },
      });

      fireEvent.click(screen.getByRole("button", { name: "Cancel" }));

      expect(
        screen.queryByDisplayValue("john@example.com"),
      ).not.toBeInTheDocument();
    });

    it("resets the error message after closing", async () => {
      mockAssignAdminLocation.mockRejectedValue(new Error("Network error"));

      render(<AddEmployeeModal {...defaultProps} />);

      fillForm();
      fireEvent.click(screen.getByRole("button", { name: "Add Employee" }));

      await waitFor(() => screen.getByText("Network error"));

      fireEvent.click(screen.getByRole("button", { name: "Cancel" }));

      expect(screen.queryByText("Network error")).not.toBeInTheDocument();
    });
  });
});
