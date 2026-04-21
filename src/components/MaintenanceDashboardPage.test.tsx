import { describe, it, expect, vi, beforeEach, type Mock } from "vitest";

vi.hoisted(() => {
  const dummyEnv = {
    VITE_SUPABASE_URL: "https://placeholder.supabase.co",
    VITE_SUPABASE_ANON_KEY: "placeholder-key",
  };
  
  if (typeof process !== "undefined") {
    Object.assign(process.env, dummyEnv);
  } else {
    (globalThis as any).process = { env: dummyEnv };
  }
});

import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import MaintenanceDashboardPage from "./MaintenanceDashboardPage";
import * as diContainer from "../di/container";
import * as supabaseClient from "../supabase/client";

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
    image_data: "example.com/img.jpg",
  },
  {
    maint_id: 2,
    user_id: "USER-002",
    category: "Electrical",
    description: "Light out",
    created_at: "2024-03-21T11:30:00Z",
    location: "Hallway",
    image_data: "https://example.com/direct.jpg",
  },
];

describe("MaintenanceDashboardPage", () => {
  const mockGetMaintenances = vi.fn();
  const mockGetSession = vi.fn();
  const mockFetch = vi.spyOn(globalThis, 'fetch') as Mock;

  beforeEach(() => {
    vi.clearAllMocks();
    
    (diContainer.useMaintenance as any).mockReturnValue({
      getMaintenances: mockGetMaintenances,
    });

    (supabaseClient.getSupabaseClient as any).mockReturnValue({
      auth: { getSession: mockGetSession }
    });

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

    const plumbingPill = screen.getByRole("button", { name: "Plumbing" });
    fireEvent.click(plumbingPill);

    expect(screen.getByText("Leaky faucet")).toBeInTheDocument();
    expect(screen.queryByText("Light out")).not.toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: "All" }));
    expect(screen.getByText("Light out")).toBeInTheDocument();
  });

  it("handles the 'View' button with and without http prefix", async () => {
    mockGetMaintenances.mockResolvedValue(mockMaintenances);
    const windowSpy = vi.spyOn(window, 'open').mockImplementation(() => null);
    render(<MaintenanceDashboardPage />);

    const viewButtons = await screen.findAllByText("View");

    fireEvent.click(viewButtons[0]!);
    expect(windowSpy).toHaveBeenCalledWith("https://example.com/img.jpg", "_blank");

    fireEvent.click(viewButtons[1]!);
    expect(windowSpy).toHaveBeenCalledWith("https://example.com/direct.jpg", "_blank");
  });

  it("successfully deletes a record", async () => {
    mockGetMaintenances.mockResolvedValue(mockMaintenances);
    mockGetSession.mockResolvedValue({ data: { session: { access_token: 'token123' } } });
    mockFetch.mockResolvedValue({ ok: true });

    render(<MaintenanceDashboardPage />);
    const deleteButtons = await screen.findAllByText("Delete");

    fireEvent.click(deleteButtons[0]!);

    await waitFor(() => {
      expect(mockFetch).toHaveBeenCalledWith(
        expect.stringContaining('delete-maintenance'),
        expect.objectContaining({
          method: 'POST',
          body: JSON.stringify({ id: "1" })
        })
      );
    });

    expect(screen.queryByText("Leaky faucet")).not.toBeInTheDocument();
  });

  it("aborts delete if window.confirm is cancelled", async () => {
    mockGetMaintenances.mockResolvedValue(mockMaintenances);
    vi.spyOn(window, 'confirm').mockReturnValue(false);
    
    render(<MaintenanceDashboardPage />);
    const deleteButtons = await screen.findAllByText("Delete");
    fireEvent.click(deleteButtons[0]!);

    expect(mockFetch).not.toHaveBeenCalled();
  });

  it("handles delete failure (no session)", async () => {
    const alertSpy = vi.spyOn(window, 'alert').mockImplementation(() => {});
    mockGetMaintenances.mockResolvedValue(mockMaintenances);
    mockGetSession.mockResolvedValue({ data: { session: null } });

    render(<MaintenanceDashboardPage />);
    const deleteButtons = await screen.findAllByText("Delete");
    fireEvent.click(deleteButtons[0]!);

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
    fireEvent.click(deleteButtons[0]!);

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