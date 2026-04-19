import { render, screen, fireEvent } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import DeleteEmployeeModal from "./DeleteEmployeeModal";

// ─── Mock Data ────────────────────────────────────────────────────────────────

const mockEmployee = {
  name: "Alice Smith",
  email: "alice@example.com",
  locationID: 1,
};

const mockOnConfirm = vi.fn();
const mockOnCancel = vi.fn();

// ─── Tests ────────────────────────────────────────────────────────────────────

describe("DeleteEmployeeModal", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  // ── Rendering ─────────────────────────────────────────────────────────────

  describe("rendering", () => {
    it("renders nothing when employee is null", () => {
      const { container } = render(<DeleteEmployeeModal employee={null} onConfirm={mockOnConfirm} onCancel={mockOnCancel} />);

      expect(container).toBeEmptyDOMElement();
    });

    it("renders the modal when an employee is provided", () => {
      render(<DeleteEmployeeModal employee={mockEmployee} onConfirm={mockOnConfirm} onCancel={mockOnCancel} />);

      expect(screen.getByText("Remove employee?")).toBeInTheDocument();
    });

    it("renders the employee name in the confirmation message", () => {
      render(<DeleteEmployeeModal employee={mockEmployee} onConfirm={mockOnConfirm} onCancel={mockOnCancel} />);

      expect(screen.getByText(mockEmployee.name)).toBeInTheDocument();
    });

    it("renders the Cancel button", () => {
      render(<DeleteEmployeeModal employee={mockEmployee} onConfirm={mockOnConfirm} onCancel={mockOnCancel} />);

      expect(screen.getByRole("button", { name: /cancel/i })).toBeInTheDocument();
    });

    it("renders the Remove button", () => {
      render(<DeleteEmployeeModal employee={mockEmployee} onConfirm={mockOnConfirm} onCancel={mockOnCancel} />);

      expect(screen.getByRole("button", { name: /remove/i })).toBeInTheDocument();
    });

    it("renders the cannot be undone warning", () => {
      render(<DeleteEmployeeModal employee={mockEmployee} onConfirm={mockOnConfirm} onCancel={mockOnCancel} />);

      expect(screen.getByText(/this action cannot be undone/i)).toBeInTheDocument();
    });
  });

  // ── Interactions ──────────────────────────────────────────────────────────

  describe("interactions", () => {
    it("calls onCancel when the Cancel button is clicked", () => {
      render(<DeleteEmployeeModal employee={mockEmployee} onConfirm={mockOnConfirm} onCancel={mockOnCancel} />);

      fireEvent.click(screen.getByRole("button", { name: /cancel/i }));

      expect(mockOnCancel).toHaveBeenCalledTimes(1);
    });

    it("calls onConfirm when the Remove button is clicked", () => {
      render(<DeleteEmployeeModal employee={mockEmployee} onConfirm={mockOnConfirm} onCancel={mockOnCancel} />);

      fireEvent.click(screen.getByRole("button", { name: /remove/i }));

      expect(mockOnConfirm).toHaveBeenCalledTimes(1);
    });

    it("does not call onConfirm when Cancel is clicked", () => {
      render(<DeleteEmployeeModal employee={mockEmployee} onConfirm={mockOnConfirm} onCancel={mockOnCancel} />);

      fireEvent.click(screen.getByRole("button", { name: /cancel/i }));

      expect(mockOnConfirm).not.toHaveBeenCalled();
    });

    it("does not call onCancel when Remove is clicked", () => {
      render(<DeleteEmployeeModal employee={mockEmployee} onConfirm={mockOnConfirm} onCancel={mockOnCancel} />);

      fireEvent.click(screen.getByRole("button", { name: /remove/i }));

      expect(mockOnCancel).not.toHaveBeenCalled();
    });
  });
});
