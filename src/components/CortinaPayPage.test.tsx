import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { beforeEach, describe, expect, it, vi } from "vitest";
import CortinaPayPage from "./CortinaPayPage";

const service = {
  quote: vi.fn(), createCard: vi.fn(), payWithWallet: vi.fn(),
  status: vi.fn(), hasSession: vi.fn(),
};

vi.mock("../di/container", () => ({ useCortinaVend: () => service }));

describe("CortinaPayPage", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    service.hasSession.mockResolvedValue(false);
  });

  it("uses the server washer price and leaves cycle selection to the machine", async () => {
    service.quote.mockResolvedValue({
      machineId: 1, machineName: "Washer 4", machineType: "washer",
      washerSizeLabel: "Large", amountCents: 425, dryer: null,
    });
    render(<MemoryRouter initialEntries={["/pay?machine=public-token"]}><CortinaPayPage /></MemoryRouter>);

    expect(await screen.findByText("Washer 4")).toBeInTheDocument();
    expect(screen.getByText("$4.25")).toBeInTheDocument();
    expect(screen.getByText(/Choose temperature and cycle settings/)).toBeInTheDocument();
    expect(service.quote).toHaveBeenCalledWith("public-token", undefined);
  });

  it("lets a dryer customer choose quarter-dollar increments", async () => {
    service.quote.mockResolvedValue({
      machineId: 2, machineName: "Dryer 2", machineType: "dryer",
      washerSizeLabel: null, amountCents: 150,
      dryer: { incrementCents: 25, minutesPerIncrement: 5, minimumCents: 25, maximumCents: 450, defaultCents: 150 },
    });
    render(<MemoryRouter initialEntries={["/pay?machine=public-token"]}><CortinaPayPage /></MemoryRouter>);

    const slider = await screen.findByLabelText("Dryer amount");
    expect(screen.getByText("30 minutes")).toBeInTheDocument();
    fireEvent.change(slider, { target: { value: "200" } });
    expect(screen.getByText("40 minutes")).toBeInTheDocument();
    expect(screen.getByText("$2.00")).toBeInTheDocument();
  });

  it("resumes a paid browser session without exposing machine identifiers", async () => {
    service.status.mockResolvedValue({ status: "started" });
    render(<MemoryRouter initialEntries={["/pay?session=session-1&access=secret-1"]}><CortinaPayPage /></MemoryRouter>);

    await waitFor(() => expect(screen.getByText("Machine started")).toBeInTheDocument());
    expect(screen.getByText("Select your wash cycle on the machine.")).toBeInTheDocument();
    expect(service.status).toHaveBeenCalledWith({ sessionId: "session-1", accessToken: "secret-1" });
    expect(service.quote).not.toHaveBeenCalled();
  });

  it("polls an authenticated wallet vend until the machine starts", async () => {
    service.hasSession.mockResolvedValue(true);
    service.quote.mockResolvedValue({
      machineId: 2, machineName: "Dryer 2", machineType: "dryer",
      washerSizeLabel: null, amountCents: 150,
      dryer: { incrementCents: 25, minutesPerIncrement: 5, minimumCents: 25, maximumCents: 450, defaultCents: 150 },
    });
    service.payWithWallet.mockResolvedValue({ sessionId: "wallet-1", accessToken: "wallet-secret" });
    service.status.mockResolvedValue({ status: "started", dryer_minutes: 30 });
    render(<MemoryRouter initialEntries={["/pay?machine=public-token"]}><CortinaPayPage /></MemoryRouter>);

    fireEvent.click(await screen.findByRole("button", { name: "Use Clean Stream wallet" }));

    await waitFor(() => expect(screen.getByText("Your purchased time has been added.")).toBeInTheDocument());
    expect(service.status).toHaveBeenCalledWith({ sessionId: "wallet-1", accessToken: "wallet-secret" });
  });
});
