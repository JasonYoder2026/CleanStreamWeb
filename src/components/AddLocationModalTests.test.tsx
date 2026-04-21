import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import AddLocationModal from "./AddLocationModal";

// ─── Mock Services ────────────────────────────────────────────────────────────

const mockGetCoordinates = vi.fn();
const mockAddLocations = vi.fn();

vi.mock("../di/container", () => ({
  useCoordinates: () => ({
    getCoordinates: mockGetCoordinates,
  }),
  useLocations: () => ({
    addLocations: mockAddLocations,
  }),
}));

// ─── Mock Data ────────────────────────────────────────────────────────────────

const defaultProps = {
  isOpen: true,
  onClose: vi.fn(),
  onSuccess: vi.fn(),
};

const mockCoordinates = { lat: 39.7684, lon: -86.1581 };

const fillForm = () => {
  fireEvent.change(screen.getByLabelText("Location Name"), {
    target: { value: "Downtown Laundromat", id: "locationName" },
  });
  fireEvent.change(screen.getByLabelText("Street Address"), {
    target: { value: "123 Main St", id: "streetAddress" },
  });
  fireEvent.change(screen.getByLabelText("City"), {
    target: { value: "Indianapolis", id: "city" },
  });
  fireEvent.change(screen.getByLabelText("State"), {
    target: { value: "IN", id: "state" },
  });
  fireEvent.change(screen.getByLabelText("ZIP Code"), {
    target: { value: "46201", id: "zipCode" },
  });
};

// ─── Tests ────────────────────────────────────────────────────────────────────

describe("AddLocationModal", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockGetCoordinates.mockResolvedValue(mockCoordinates);
    mockAddLocations.mockResolvedValue(undefined);
  });

  // ── Visibility ────────────────────────────────────────────────────────────

  describe("visibility", () => {
    it("renders nothing when isOpen is false", () => {
      render(<AddLocationModal {...defaultProps} isOpen={false} />);

      expect(
        screen.queryByText("Add Location", { selector: "p" }),
      ).not.toBeInTheDocument();
    });

    it("renders the modal when isOpen is true", () => {
      render(<AddLocationModal {...defaultProps} />);

      expect(
        screen.getByText("Add Location", { selector: "p" }),
      ).toBeInTheDocument();
    });
  });

  // ── Rendering ─────────────────────────────────────────────────────────────

  describe("rendering", () => {
    it("renders all form fields", () => {
      render(<AddLocationModal {...defaultProps} />);

      expect(screen.getByLabelText("Location Name")).toBeInTheDocument();
      expect(screen.getByLabelText("Street Address")).toBeInTheDocument();
      expect(screen.getByLabelText("City")).toBeInTheDocument();
      expect(screen.getByLabelText("State")).toBeInTheDocument();
      expect(screen.getByLabelText("ZIP Code")).toBeInTheDocument();
      expect(screen.getByLabelText("Country")).toBeInTheDocument();
    });

    it("renders cancel and submit buttons", () => {
      render(<AddLocationModal {...defaultProps} />);

      expect(
        screen.getByRole("button", { name: "Cancel" }),
      ).toBeInTheDocument();
      expect(
        screen.getByRole("button", { name: "Add Location" }),
      ).toBeInTheDocument();
    });

    it("renders the close button", () => {
      render(<AddLocationModal {...defaultProps} />);

      expect(
        screen.getByRole("button", { name: "Close modal" }),
      ).toBeInTheDocument();
    });

    it("defaults country to US", () => {
      render(<AddLocationModal {...defaultProps} />);

      expect(screen.getByLabelText("Country")).toHaveValue("US");
    });

    it("renders all 50 US state options", () => {
      render(<AddLocationModal {...defaultProps} />);

      const stateSelect = screen.getByLabelText("State");
      // 50 states + 1 disabled placeholder
      expect(stateSelect.querySelectorAll("option")).toHaveLength(51);
    });
  });

  // ── Form interaction ──────────────────────────────────────────────────────

  describe("form interaction", () => {
    it("updates location name field on change", () => {
      render(<AddLocationModal {...defaultProps} />);

      fireEvent.change(screen.getByLabelText("Location Name"), {
        target: { value: "Downtown Laundromat", id: "locationName" },
      });

      expect(screen.getByLabelText("Location Name")).toHaveValue(
        "Downtown Laundromat",
      );
    });

    it("updates street address field on change", () => {
      render(<AddLocationModal {...defaultProps} />);

      fireEvent.change(screen.getByLabelText("Street Address"), {
        target: { value: "123 Main St", id: "streetAddress" },
      });

      expect(screen.getByLabelText("Street Address")).toHaveValue(
        "123 Main St",
      );
    });

    it("updates city field on change", () => {
      render(<AddLocationModal {...defaultProps} />);

      fireEvent.change(screen.getByLabelText("City"), {
        target: { value: "Indianapolis", id: "city" },
      });

      expect(screen.getByLabelText("City")).toHaveValue("Indianapolis");
    });

    it("updates state select on change", () => {
      render(<AddLocationModal {...defaultProps} />);

      fireEvent.change(screen.getByLabelText("State"), {
        target: { value: "IN", id: "state" },
      });

      expect(screen.getByLabelText("State")).toHaveValue("IN");
    });

    it("updates zip code field on change", () => {
      render(<AddLocationModal {...defaultProps} />);

      fireEvent.change(screen.getByLabelText("ZIP Code"), {
        target: { value: "46201", id: "zipCode" },
      });

      expect(screen.getByLabelText("ZIP Code")).toHaveValue("46201");
    });
  });

  // ── Submission ────────────────────────────────────────────────────────────

  describe("submission", () => {
    it("calls getCoordinates with the correct address params", async () => {
      render(<AddLocationModal {...defaultProps} />);

      fillForm();
      fireEvent.click(screen.getByRole("button", { name: "Add Location" }));

      await waitFor(() => {
        expect(mockGetCoordinates).toHaveBeenCalledWith({
          address: "123 Main St",
          city: "Indianapolis",
          state: "IN",
          zipCode: "46201",
          country: "US",
        });
      });
    });

    it("calls addLocations with correct data including coordinates", async () => {
      render(<AddLocationModal {...defaultProps} />);

      fillForm();
      fireEvent.click(screen.getByRole("button", { name: "Add Location" }));

      await waitFor(() => {
        expect(mockAddLocations).toHaveBeenCalledWith(
          expect.objectContaining({
            Name: "Downtown Laundromat",
            Address: "123 Main St, Indianapolis, IN",
            Latitude: mockCoordinates.lat,
            Longitude: mockCoordinates.lon,
          }),
        );
      });
    });

    it("shows success state after a successful submit", async () => {
      render(<AddLocationModal {...defaultProps} />);

      fillForm();
      fireEvent.click(screen.getByRole("button", { name: "Add Location" }));

      await waitFor(() => {
        expect(screen.getByText("Location Added!")).toBeInTheDocument();
      });
    });

    it("shows the location name in the success message", async () => {
      render(<AddLocationModal {...defaultProps} />);

      fillForm();
      fireEvent.click(screen.getByRole("button", { name: "Add Location" }));

      await waitFor(() => {
        expect(
          screen.getByText("Downtown Laundromat has been added successfully."),
        ).toBeInTheDocument();
      });
    });

    it("shows error banner when coordinates cannot be found", async () => {
      mockGetCoordinates.mockResolvedValue(null);

      render(<AddLocationModal {...defaultProps} />);

      fillForm();
      fireEvent.click(screen.getByRole("button", { name: "Add Location" }));

      await waitFor(() => {
        expect(
          screen.getByText(
            "Could not find coordinates for this address. Please check the address and try again.",
          ),
        ).toBeInTheDocument();
      });
    });

    it("does not call addLocations when coordinates are null", async () => {
      mockGetCoordinates.mockResolvedValue(null);

      render(<AddLocationModal {...defaultProps} />);

      fillForm();
      fireEvent.click(screen.getByRole("button", { name: "Add Location" }));

      await waitFor(() => {
        expect(mockAddLocations).not.toHaveBeenCalled();
      });
    });

    it("shows error banner when addLocations returns an error string", async () => {
      mockAddLocations.mockResolvedValue("Insert failed");

      render(<AddLocationModal {...defaultProps} />);

      fillForm();
      fireEvent.click(screen.getByRole("button", { name: "Add Location" }));

      await waitFor(() => {
        expect(screen.getByText("Insert failed")).toBeInTheDocument();
      });
    });

    it("shows error banner when addLocations throws", async () => {
      mockAddLocations.mockRejectedValue(new Error("Network error"));

      render(<AddLocationModal {...defaultProps} />);

      fillForm();
      fireEvent.click(screen.getByRole("button", { name: "Add Location" }));

      await waitFor(() => {
        expect(screen.getByText("Network error")).toBeInTheDocument();
      });
    });

    it("clears error message on a new submission attempt", async () => {
      mockGetCoordinates.mockResolvedValueOnce(null);
      mockGetCoordinates.mockResolvedValueOnce(mockCoordinates);

      render(<AddLocationModal {...defaultProps} />);

      fillForm();
      fireEvent.click(screen.getByRole("button", { name: "Add Location" }));

      await waitFor(() =>
        screen.getByText(
          "Could not find coordinates for this address. Please check the address and try again.",
        ),
      );

      fireEvent.click(screen.getByRole("button", { name: "Add Location" }));

      await waitFor(() => {
        expect(
          screen.queryByText(
            "Could not find coordinates for this address. Please check the address and try again.",
          ),
        ).not.toBeInTheDocument();
      });
    });
  });

  // ── Close behaviour ───────────────────────────────────────────────────────

  describe("close behaviour", () => {
    it("calls onClose when cancel button is clicked", () => {
      render(<AddLocationModal {...defaultProps} />);

      fireEvent.click(screen.getByRole("button", { name: "Cancel" }));

      expect(defaultProps.onClose).toHaveBeenCalledTimes(1);
    });

    it("calls onClose when close icon button is clicked", () => {
      render(<AddLocationModal {...defaultProps} />);

      fireEvent.click(screen.getByRole("button", { name: "Close modal" }));

      expect(defaultProps.onClose).toHaveBeenCalledTimes(1);
    });

    it("calls onClose when clicking the backdrop", () => {
      render(<AddLocationModal {...defaultProps} />);

      fireEvent.click(
        screen
          .getByText("Add Location", { selector: "p" })
          .closest(".modal-backdrop")!,
      );

      expect(defaultProps.onClose).toHaveBeenCalledTimes(1);
    });

    it("calls onSuccess when closing", () => {
      render(<AddLocationModal {...defaultProps} />);

      fireEvent.click(screen.getByRole("button", { name: "Cancel" }));

      expect(defaultProps.onSuccess).toHaveBeenCalledTimes(1);
    });

    it("resets form fields after closing", () => {
      render(<AddLocationModal {...defaultProps} />);

      fireEvent.change(screen.getByLabelText("Location Name"), {
        target: { value: "Downtown Laundromat", id: "locationName" },
      });

      fireEvent.click(screen.getByRole("button", { name: "Cancel" }));

      expect(
        screen.queryByDisplayValue("Downtown Laundromat"),
      ).not.toBeInTheDocument();
    });
  });
});
