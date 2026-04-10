import { render, screen, fireEvent } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import SideBar from "../components/SideBar";
import { vi, describe, it, expect, beforeEach } from "vitest";

const mockNavigate = vi.fn();
const mockSignOut = vi.fn();

vi.mock("react-router-dom", async () => {
  const actual =
    await vi.importActual<typeof import("react-router-dom")>(
      "react-router-dom",
    );
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  };
});

vi.mock("../di/container", () => ({
  useAuth: () => ({
    signOut: mockSignOut,
  }),
}));

describe("SideBar", () => {
  const renderComponent = () =>
    render(
      <MemoryRouter>
        <SideBar />
      </MemoryRouter>,
    );

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renders closed sidebar initially", () => {
    renderComponent();

    expect(screen.getByLabelText("Open sidebar")).toBeInTheDocument();
  });

  it("opens sidebar when toggle is clicked", () => {
    renderComponent();

    fireEvent.click(screen.getByLabelText("Open sidebar"));

    expect(screen.getByLabelText("Close sidebar")).toBeInTheDocument();
    expect(screen.getByText("Dashboard")).toBeInTheDocument();
  });

  it("navigates to dashboard and closes sidebar", () => {
    renderComponent();

    fireEvent.click(screen.getByLabelText("Open sidebar"));
    fireEvent.click(screen.getByText("Dashboard"));

    expect(mockNavigate).toHaveBeenCalledWith("/home");
  });

  it("navigates to refunds", () => {
    renderComponent();

    fireEvent.click(screen.getByLabelText("Open sidebar"));
    fireEvent.click(screen.getByText("Refunds"));

    expect(mockNavigate).toHaveBeenCalledWith("/home/refunds");
  });

  it("navigates to locations", () => {
    renderComponent();

    fireEvent.click(screen.getByLabelText("Open sidebar"));
    fireEvent.click(screen.getByText("Locations"));

    expect(mockNavigate).toHaveBeenCalledWith("/home/locations");
  });

  it("navigates to settings", () => {
    renderComponent();

    fireEvent.click(screen.getByLabelText("Open sidebar"));
    fireEvent.click(screen.getByText("Settings"));

    expect(mockNavigate).toHaveBeenCalledWith("/home/settings");
  });

  it("calls signOut and redirects to root", async () => {
    mockSignOut.mockResolvedValue(undefined);

    renderComponent();

    fireEvent.click(screen.getByLabelText("Open sidebar"));
    fireEvent.click(screen.getByText("Sign Out"));

    expect(mockSignOut).toHaveBeenCalled();
  });

  it("redirects after signOut", async () => {
    mockSignOut.mockResolvedValue(undefined);

    renderComponent();

    fireEvent.click(screen.getByLabelText("Open sidebar"));
    fireEvent.click(screen.getByText("Sign Out"));

    // wait for async
    await Promise.resolve();

    expect(mockNavigate).toHaveBeenCalledWith("/");
  });
});
