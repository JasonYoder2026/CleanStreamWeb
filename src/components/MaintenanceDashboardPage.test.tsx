import { render, screen, fireEvent, waitFor, within } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import MaintenanceDashboardPage from "./MaintenanceDashboardPage";
import * as diContainer from "../di/container";
import * as supabaseClient from "../supabase/client";

// Mock the external hooks and clients
vi.mock("../di/container");
vi.mock("../supabase/client");

const mockMaintenances = [
  {
    maint_id: 1,
    user_id: "USER-001",
    category: "Plumbing",
    description: "Leaky faucet",
    created_at: "2024-03-20T10:00:00Z",
    location: "Kitchen",
    image_data: "example.com/img.jpg", // Test the https prefix addition
  },
  {
    maint_id: 2,
    user_id: "USER-002",
    category: "Electrical",
    description: "Light out",
    created_at: "2024-03-21T11:30:00Z",
    location: "Hallway",
    image_data: "https://example.com/direct.jpg", // Test direct URL
  },
];

describe("MaintenanceDashboardPage", () => {
  const mockGetMaintenances = vi.fn();
  const mockGetSession = vi.fn();
  const mockFetch = vi.spyOn(global, 'fetch');

  beforeEach(() => {
    vi.clearAllMocks();
    
    // Setup DI container mock
    (diContainer.useMaintenance as any).mockReturnValue({
      getMaintenances: mockGetMaintenances,
    });

    // Setup Supabase client mock
    (supabaseClient.getSupabaseClient as any).mockReturnValue({
      auth: { getSession: mockGetSession }
    });

    // Default window.confirm to true
    vi.spyOn(window, 'confirm').mockReturnValue(true);
  });

  it("renders loading state then data", async () => {
    mockGetMaintenances.mockResolvedValue(mockMaintenances);
    render(<MaintenanceDashboardPage />);

    expect(screen.getByText(/loading maintenance reports/i)).toBeInTheDocument();
    
    const firstRow = await screen.findByText("Leaky faucet");
    expect(firstRow).toBeInTheDocument();
    expect(screen.queryByText(/loading maintenance reports/i)).not.toBeInTheDocument();
  });

  it("renders error state when fetch fails", async () => {
    mockGetMaintenances.mockRejectedValue(new Error("Fetch failed"));
    render(<MaintenanceDashboardPage />);

    const errorMsg = await screen.findByText("Failed to load maintenance requests");
    expect(errorMsg).toBeInTheDocument();
  });

  it("filters data when category pills are clicked", async () => {
    mockGetMaintenances.mockResolvedValue(mockMaintenances);
    render(<MaintenanceDashboardPage />);

    await screen.findByText("Leaky faucet");

    // Click 'Plumbing' pill
    const plumbingPill = screen.getByRole("button", { name: "Plumbing" });
    fireEvent.click(plumbingPill);

    expect(screen.getByText("Leaky faucet")).toBeInTheDocument();
    expect(screen.queryByText("Light out")).not.toBeInTheDocument();

    // Click 'All' to reset
    fireEvent.click(screen.getByRole("button", { name: "All" }));
    expect(screen.getByText("Light out")).toBeInTheDocument();
  });

  it("handles the 'View' button with and without http prefix", async () => {
    mockGetMaintenances.mockResolvedValue(mockMaintenances);
    const windowSpy = vi.spyOn(window, 'open').mockImplementation(() => null);
    render(<MaintenanceDashboardPage />);

    const viewButtons = await screen.findAllByText("View");

    // Test URL construction (adds https://)
    fireEvent.click(viewButtons[0]);
    expect(windowSpy).toHaveBeenCalledWith("https://example.com/img.jpg", "_blank");

    // Test direct URL (keeps existing https://)
    fireEvent.click(viewButtons[1]);
    expect(windowSpy).toHaveBeenCalledWith("https://example.com/direct.jpg", "_blank");
  });

  it("successfully deletes a record", async () => {
    mockGetMaintenances.mockResolvedValue(mockMaintenances);
    mockGetSession.mockResolvedValue({ data: { session: { access_token: 'token123' } } });
    mockFetch.mockResolvedValue({ ok: true });

    render(<MaintenanceDashboardPage />);
    const deleteButtons = await screen.findAllByText("Delete");

    fireEvent.click(deleteButtons[0]);

    await waitFor(() => {
      expect(mockFetch).toHaveBeenCalledWith(
        expect.stringContaining('delete-maintenance'),
        expect.objectContaining({
          method: 'POST',
          body: JSON.stringify({ id: "1" })
        })
      );
    });

    // Verify row is removed from UI
    expect(screen.queryByText("Leaky faucet")).not.toBeInTheDocument();
  });

  it("aborts delete if window.confirm is cancelled", async () => {
    mockGetMaintenances.mockResolvedValue(mockMaintenances);
    vi.spyOn(window, 'confirm').mockReturnValue(false);
    
    render(<MaintenanceDashboardPage />);
    const deleteButtons = await screen.findAllByText("Delete");
    fireEvent.click(deleteButtons[0]);

    expect(mockFetch).not.toHaveBeenCalled();
  });

  it("handles delete failure (no session)", async () => {
    const alertSpy = vi.spyOn(window, 'alert').mockImplementation(() => {});
    mockGetMaintenances.mockResolvedValue(mockMaintenances);
    mockGetSession.mockResolvedValue({ data: { session: null } });

    render(<MaintenanceDashboardPage />);
    const deleteButtons = await screen.findAllByText("Delete");
    fireEvent.click(deleteButtons[0]);

    await waitFor(() => {
      expect(alertSpy).toHaveBeenCalledWith(expect.stringContaining("Could not delete record"));
    });
  });

  it("handles delete failure (server error 500)", async () => {
    const alertSpy = vi.spyOn(window, 'alert').mockImplementation(() => {});
    mockGetMaintenances.mockResolvedValue(mockMaintenances);
    mockGetSession.mockResolvedValue({ data: { session: { access_token: 'abc' } } });
    mockFetch.mockResolvedValue({ ok: false, json: () => Promise.resolve({ error: 'fail' }) });

    render(<MaintenanceDashboardPage />);
    const deleteButtons = await screen.findAllByText("Delete");
    fireEvent.click(deleteButtons[0]);

    await waitFor(() => {
      expect(alertSpy).toHaveBeenCalled();
    });
  });

  it("displays empty state when no records match filter", async () => {
    mockGetMaintenances.mockResolvedValue([]);
    render(<MaintenanceDashboardPage />);

    const emptyMsg = await screen.findByText(/No maintenance records found/i);
    expect(emptyMsg).toBeInTheDocument();
  });
});