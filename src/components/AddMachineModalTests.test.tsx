import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import AddMachineModal from "./AddMachineModal";

// ─── Mock useLocations ────────────────────────────────────────────────────────

const mockAddMachines = vi.fn();
const mockCalculatePrice = vi.fn();

vi.mock("../di/container", () => ({
  useLocations: () => ({
    addMachines: mockAddMachines,
    calculatePrice: mockCalculatePrice,
  }),
}));

// ─── Mock Data ────────────────────────────────────────────────────────────────

const defaultProps = {
  isOpen: true,
  onClose: vi.fn(),
  onSuccess: vi.fn(),
  machineTypes: ["Washer", "Dryer"],
  locations: [
    { id: 1, name: "Location A" },
    { id: 2, name: "Location B" },
  ],
};

// ─── Tests ────────────────────────────────────────────────────────────────────

describe("AddMachineModal", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockAddMachines.mockResolvedValue(undefined);
    mockCalculatePrice.mockReturnValue(20);
  });

  // ── Visibility ────────────────────────────────────────────────────────────

  describe("visibility", () => {
    it("renders nothing when isOpen is false", () => {
      render(<AddMachineModal {...defaultProps} isOpen={false} />);

      expect(screen.queryByText("Add Machine")).not.toBeInTheDocument();
    });

    it("renders the modal when isOpen is true", () => {
      render(<AddMachineModal {...defaultProps} />);

      expect(screen.getByText("Add Machine", { selector: "p" })).toBeInTheDocument();
    });
  });

  // ── Rendering ─────────────────────────────────────────────────────────────

  describe("rendering", () => {
    it("renders all form fields", () => {
      render(<AddMachineModal {...defaultProps} />);

      expect(screen.getByLabelText("Machine Name")).toBeInTheDocument();
      expect(screen.getByLabelText("Weight")).toBeInTheDocument();
      expect(screen.getByLabelText("Run Time (Minutes)")).toBeInTheDocument();
      expect(screen.getByLabelText("Machine Type")).toBeInTheDocument();
      expect(screen.getByLabelText("Location")).toBeInTheDocument();
    });

    it("does not render a Price input field", () => {
      render(<AddMachineModal {...defaultProps} />);

      expect(screen.queryByLabelText("Price ($)")).not.toBeInTheDocument();
    });

    it("renders machine type options", () => {
      render(<AddMachineModal {...defaultProps} />);

      expect(screen.getByRole("option", { name: "Washer" })).toBeInTheDocument();
      expect(screen.getByRole("option", { name: "Dryer" })).toBeInTheDocument();
    });

    it("renders location options", () => {
      render(<AddMachineModal {...defaultProps} />);

      expect(screen.getByRole("option", { name: "Location A" })).toBeInTheDocument();
      expect(screen.getByRole("option", { name: "Location B" })).toBeInTheDocument();
    });

    it("renders cancel and submit buttons", () => {
      render(<AddMachineModal {...defaultProps} />);

      expect(screen.getByRole("button", { name: "Cancel" })).toBeInTheDocument();
      expect(screen.getByRole("button", { name: "Add Machine" })).toBeInTheDocument();
    });

    it("renders the close button", () => {
      render(<AddMachineModal {...defaultProps} />);

      expect(screen.getByRole("button", { name: "Close modal" })).toBeInTheDocument();
    });
  });

  // ── Form interaction ──────────────────────────────────────────────────────

  describe("form interaction", () => {
    it("updates machine name field on change", () => {
      render(<AddMachineModal {...defaultProps} />);

      fireEvent.change(screen.getByLabelText("Machine Name"), {
        target: { value: "Washer #3", id: "machineName" },
      });

      expect(screen.getByLabelText("Machine Name")).toHaveValue("Washer #3");
    });

    it("updates weight field on change", () => {
      render(<AddMachineModal {...defaultProps} />);

      fireEvent.change(screen.getByLabelText("Weight"), {
        target: { value: "12", id: "machineWeight" },
      });

      expect(screen.getByLabelText("Weight")).toHaveValue(12);
    });

    it("updates run time field on change", () => {
      render(<AddMachineModal {...defaultProps} />);

      fireEvent.change(screen.getByLabelText("Run Time (Minutes)"), {
        target: { value: "30", id: "machineRunTime" },
      });

      expect(screen.getByLabelText("Run Time (Minutes)")).toHaveValue(30);
    });

    it("updates machine type select on change", () => {
      render(<AddMachineModal {...defaultProps} />);

      fireEvent.change(screen.getByLabelText("Machine Type"), {
        target: { value: "Dryer", id: "machineType" },
      });

      expect(screen.getByLabelText("Machine Type")).toHaveValue("Dryer");
    });

    it("updates location select on change", () => {
      render(<AddMachineModal {...defaultProps} />);

      fireEvent.change(screen.getByLabelText("Location"), {
        target: { value: "1", id: "machineLocation" },
      });

      expect(screen.getByLabelText("Location")).toHaveValue("1");
    });
  });

  // ── Submission ────────────────────────────────────────────────────────────

  describe("submission", () => {
    const fillForm = () => {
      fireEvent.change(screen.getByLabelText("Machine Name"), {
        target: { value: "Washer #3", id: "machineName" },
      });
      fireEvent.change(screen.getByLabelText("Weight"), {
        target: { value: "12", id: "machineWeight" },
      });
      fireEvent.change(screen.getByLabelText("Run Time (Minutes)"), {
        target: { value: "30", id: "machineRunTime" },
      });
      fireEvent.change(screen.getByLabelText("Machine Type"), {
        target: { value: "Washer", id: "machineType" },
      });
      fireEvent.change(screen.getByLabelText("Location"), {
        target: { value: "1", id: "machineLocation" },
      });
    };

    it("calls addMachines with the correct machine data on submit", async () => {
      render(<AddMachineModal {...defaultProps} />);
      fillForm();

      fireEvent.click(screen.getByRole("button", { name: "Add Machine" }));

      await waitFor(() => {
        expect(mockAddMachines).toHaveBeenCalledWith(
          expect.objectContaining({
            Name: "Washer #3",
            Status: "idle",
            Location_ID: 1,
            Machine_type: "Washer",
            Weight_kg: "12",
          }),
        );
      });
    });

    it("calls calculatePrice with the entered weight on submit", async () => {
      render(<AddMachineModal {...defaultProps} />);
      fillForm();

      fireEvent.click(screen.getByRole("button", { name: "Add Machine" }));

      await waitFor(() => {
        expect(mockCalculatePrice).toHaveBeenCalledWith("12");
      });
    });

    it("sets machine Price from calculatePrice result", async () => {
      mockCalculatePrice.mockReturnValue(40);
      render(<AddMachineModal {...defaultProps} />);
      fillForm();

      fireEvent.click(screen.getByRole("button", { name: "Add Machine" }));

      await waitFor(() => {
        expect(mockAddMachines).toHaveBeenCalledWith(expect.objectContaining({ Price: 40 }));
      });
    });

    it("calls onSuccess after a successful submit", async () => {
      render(<AddMachineModal {...defaultProps} />);

      fireEvent.click(screen.getByRole("button", { name: "Add Machine" }));

      await waitFor(() => {
        expect(defaultProps.onSuccess).toHaveBeenCalledTimes(1);
      });
    });

    it("shows success state after a successful submit", async () => {
      render(<AddMachineModal {...defaultProps} />);

      fireEvent.click(screen.getByRole("button", { name: "Add Machine" }));

      await waitFor(() => {
        expect(screen.getByText("Machine Added!")).toBeInTheDocument();
      });
    });

    it("shows the machine name in the success subtitle", async () => {
      render(<AddMachineModal {...defaultProps} />);

      fireEvent.change(screen.getByLabelText("Machine Name"), {
        target: { value: "Washer #3", id: "machineName" },
      });

      fireEvent.click(screen.getByRole("button", { name: "Add Machine" }));

      await waitFor(() => {
        expect(screen.getByText("Washer #3 has been added successfully.")).toBeInTheDocument();
      });
    });

    it("shows error banner when addMachines returns an error string", async () => {
      mockAddMachines.mockResolvedValue("Something went wrong");

      render(<AddMachineModal {...defaultProps} />);

      fireEvent.click(screen.getByRole("button", { name: "Add Machine" }));

      await waitFor(() => {
        expect(screen.getByText("Something went wrong")).toBeInTheDocument();
      });
    });

    it("shows error banner when addMachines throws", async () => {
      mockAddMachines.mockRejectedValue(new Error("Network error"));

      render(<AddMachineModal {...defaultProps} />);

      fireEvent.click(screen.getByRole("button", { name: "Add Machine" }));

      await waitFor(() => {
        expect(screen.getByText("Network error")).toBeInTheDocument();
      });
    });

    it("does not call onSuccess when addMachines returns an error string", async () => {
      mockAddMachines.mockResolvedValue("Insert failed");

      render(<AddMachineModal {...defaultProps} />);

      fireEvent.click(screen.getByRole("button", { name: "Add Machine" }));

      await waitFor(() => {
        expect(defaultProps.onSuccess).not.toHaveBeenCalled();
      });
    });

    it("clears the previous error message on a new submit attempt", async () => {
      mockAddMachines.mockResolvedValueOnce("First error").mockResolvedValueOnce(undefined);

      render(<AddMachineModal {...defaultProps} />);

      fireEvent.click(screen.getByRole("button", { name: "Add Machine" }));
      await waitFor(() => screen.getByText("First error"));

      fireEvent.click(screen.getByRole("button", { name: "Add Machine" }));

      await waitFor(() => {
        expect(screen.queryByText("First error")).not.toBeInTheDocument();
      });
    });
  });

  // ── Close behaviour ───────────────────────────────────────────────────────

  describe("close behaviour", () => {
    it("calls onClose when cancel button is clicked", () => {
      render(<AddMachineModal {...defaultProps} />);

      fireEvent.click(screen.getByRole("button", { name: "Cancel" }));

      expect(defaultProps.onClose).toHaveBeenCalledTimes(1);
    });

    it("calls onClose when close icon button is clicked", () => {
      render(<AddMachineModal {...defaultProps} />);

      fireEvent.click(screen.getByRole("button", { name: "Close modal" }));

      expect(defaultProps.onClose).toHaveBeenCalledTimes(1);
    });

    it("calls onClose when clicking the backdrop", () => {
      render(<AddMachineModal {...defaultProps} />);

      fireEvent.click(screen.getByText("Add Machine", { selector: "p" }).closest(".modal-backdrop")!);

      expect(defaultProps.onClose).toHaveBeenCalledTimes(1);
    });

    it("resets form fields after closing and reopening", () => {
      const { rerender } = render(<AddMachineModal {...defaultProps} />);

      fireEvent.change(screen.getByLabelText("Machine Name"), {
        target: { value: "Washer #3", id: "machineName" },
      });

      fireEvent.click(screen.getByRole("button", { name: "Cancel" }));
      rerender(<AddMachineModal {...defaultProps} isOpen={false} />);

      rerender(<AddMachineModal {...defaultProps} isOpen={true} />);

      expect(screen.queryByDisplayValue("Washer #3")).not.toBeInTheDocument();
    });

    it("clears error message after closing and reopening", async () => {
      mockAddMachines.mockResolvedValue("Some error");

      const { rerender } = render(<AddMachineModal {...defaultProps} />);

      fireEvent.click(screen.getByRole("button", { name: "Add Machine" }));
      await waitFor(() => screen.getByText("Some error"));

      fireEvent.click(screen.getByRole("button", { name: "Cancel" }));
      rerender(<AddMachineModal {...defaultProps} isOpen={false} />);
      rerender(<AddMachineModal {...defaultProps} isOpen={true} />);

      expect(screen.queryByText("Some error")).not.toBeInTheDocument();
    });
  });
});
