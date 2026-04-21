import { render, screen, fireEvent } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import DeleteConfirmModal from "./DeleteMachineModal";
import type { Machine } from "../interfaces/LocationService";

const mockMachine: Machine = {
  id: 1,
  Name: "Machine Alpha",
  Price: 9.99,
  Runtime: 30,
  Status: "active",
  Location_ID: 101,
  Machine_type: "Washer",
  Weight_kg: 75,
};

describe("DeleteConfirmModal", () => {
  const onConfirm = vi.fn();
  const onCancel = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("when machine is null", () => {
    it("renders nothing", () => {
      const { container } = render(<DeleteConfirmModal machine={null} onConfirm={onConfirm} onCancel={onCancel} />);
      expect(container).toBeEmptyDOMElement();
    });
  });

  describe("when machine is provided", () => {
    beforeEach(() => {
      render(<DeleteConfirmModal machine={mockMachine} onConfirm={onConfirm} onCancel={onCancel} />);
    });

    it("renders the modal", () => {
      expect(screen.getByText("Delete machine?")).toBeInTheDocument();
    });

    it("displays the machine name in the confirmation message", () => {
      expect(screen.getByText(mockMachine.Name)).toBeInTheDocument();
    });

    it("renders the warning that the action cannot be undone", () => {
      expect(screen.getByText(/This action cannot be undone/i)).toBeInTheDocument();
    });

    it("renders a Cancel button", () => {
      expect(screen.getByRole("button", { name: /cancel/i })).toBeInTheDocument();
    });

    it("renders a Delete button", () => {
      expect(screen.getByRole("button", { name: /delete/i })).toBeInTheDocument();
    });

    it("calls onCancel when Cancel is clicked", () => {
      fireEvent.click(screen.getByRole("button", { name: /cancel/i }));
      expect(onCancel).toHaveBeenCalledTimes(1);
    });

    it("calls onConfirm when Delete is clicked", () => {
      fireEvent.click(screen.getByRole("button", { name: /delete/i }));
      expect(onConfirm).toHaveBeenCalledTimes(1);
    });

    it("does not call onConfirm when Cancel is clicked", () => {
      fireEvent.click(screen.getByRole("button", { name: /cancel/i }));
      expect(onConfirm).not.toHaveBeenCalled();
    });

    it("does not call onCancel when Delete is clicked", () => {
      fireEvent.click(screen.getByRole("button", { name: /delete/i }));
      expect(onCancel).not.toHaveBeenCalled();
    });

    it("applies the correct CSS class to the backdrop", () => {
      expect(document.querySelector(".modal-backdrop")).toBeInTheDocument();
    });

    it("applies the correct CSS class to the modal card", () => {
      expect(document.querySelector(".modal-card")).toBeInTheDocument();
    });
  });

  describe("with a different machine name", () => {
    it("shows the correct machine name", () => {
      const anotherMachine: Machine = { ...mockMachine, id: 2, Name: "Machine Beta" };
      render(<DeleteConfirmModal machine={anotherMachine} onConfirm={onConfirm} onCancel={onCancel} />);
      expect(screen.getByText("Machine Beta")).toBeInTheDocument();
    });
  });
});
