import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import TrafficDashboardPage from "./TrafficDashboardPage";

const mockGetTrafficDashboardSeed = vi.fn();

vi.mock("../di/container", () => ({
  useTraffic: () => ({
    getTrafficDashboardSeed: mockGetTrafficDashboardSeed,
  }),
}));

function isoForCurrentMonth(day: number) {
  const now = new Date();
  return new Date(now.getFullYear(), now.getMonth(), day).toISOString();
}

describe("TrafficDashboardPage", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renders traffic data from the service", async () => {
    mockGetTrafficDashboardSeed.mockResolvedValue({
      managedLocations: [
        { id: 1, name: "Main Street" },
        { id: 2, name: "North Plaza" },
      ],
      events: [
        { occurredAt: isoForCurrentMonth(3), locationId: 1, amount: 120 },
        { occurredAt: isoForCurrentMonth(8), locationId: 2, amount: 180 },
      ],
    });

    render(<TrafficDashboardPage />);

    expect(screen.getByText("Loading traffic...")).toBeInTheDocument();

    await waitFor(() => {
      expect(screen.getByText("Locations available: 2")).toBeInTheDocument();
    });

    expect(screen.getByText("Money earned")).toBeInTheDocument();
    expect(screen.getByText("$300")).toBeInTheDocument();
  });

  it("filters totals when location selection changes", async () => {
    mockGetTrafficDashboardSeed.mockResolvedValue({
      managedLocations: [
        { id: 1, name: "Main Street" },
        { id: 2, name: "North Plaza" },
      ],
      events: [
        { occurredAt: isoForCurrentMonth(3), locationId: 1, amount: 120 },
        { occurredAt: isoForCurrentMonth(8), locationId: 2, amount: 180 },
      ],
    });

    render(<TrafficDashboardPage />);

    await waitFor(() => {
      expect(screen.getByText("$300")).toBeInTheDocument();
    });

    const selects = screen.getAllByRole("combobox");
    const locationSelect = selects[1];

    fireEvent.change(locationSelect, { target: { value: "1" } });

    await waitFor(() => {
      expect(screen.getByText("$120")).toBeInTheDocument();
    });
  });
});
