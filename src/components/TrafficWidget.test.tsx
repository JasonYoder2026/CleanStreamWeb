import { render, screen, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import TrafficWidget from "./TrafficWidget";

const mockGetTrafficDashboardSeed = vi.fn();

vi.mock("../di/container", () => ({
  useTraffic: () => ({
    getTrafficDashboardSeed: mockGetTrafficDashboardSeed,
  }),
}));

function isoForCurrentMonth(day: number, hour = 12) {
  const now = new Date();
  return new Date(now.getFullYear(), now.getMonth(), day, hour).toISOString();
}

describe("TrafficWidget", () => {
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
        { occurredAt: isoForCurrentMonth(3, 9), locationId: 1, amount: 120 },
        { occurredAt: isoForCurrentMonth(8, 9), locationId: 1, amount: 180 },
        { occurredAt: isoForCurrentMonth(8, 17), locationId: 2, amount: 180 },
      ],
    });

    render(<TrafficWidget />);

    expect(document.querySelector(".tw-amount.loading")).not.toBeNull();

    await waitFor(() => {
      expect(screen.getByText("Live · Last 30 days")).toBeInTheDocument();
    });

    expect(screen.getByText("Traffic By Hour")).toBeInTheDocument();
    expect(screen.getByText("3 Transactions")).toBeInTheDocument();
    expect(screen.getByText(/Peak time:/)).toBeInTheDocument();
  });

  it("shows query failed when service throws", async () => {
    mockGetTrafficDashboardSeed.mockResolvedValue({
      managedLocations: [],
      events: [],
    });
    mockGetTrafficDashboardSeed.mockRejectedValueOnce(new Error("boom"));

    render(<TrafficWidget />);

    await waitFor(() => {
      expect(screen.getByText("Failed to load")).toBeInTheDocument();
      expect(screen.getByText("Query failed")).toBeInTheDocument();
    });
  });
});
