import { describe, it, expect, vi, beforeEach } from "vitest";
import { CoordinateRepository } from "./CoordinateRepository";
import type { AddressParams, Coordinates } from "../../interfaces/CoordinateService";

// ─── Mock Data ────────────────────────────────────────────────────────────────

const mockAddress: AddressParams = {
    address: "123 Main St",
    city: "Indianapolis",
    state: "IN",
    zipCode: "46201",
    country: "US",
};

const mockCoordinates: Coordinates = {
    lat: 39.7684,
    lon: -86.1581,
};

// ─── Helpers ──────────────────────────────────────────────────────────────────

const mockFetchResponse = (body: unknown, ok = true, status = 200) => {
    vi.stubGlobal(
        "fetch",
        vi.fn().mockResolvedValue({
            ok,
            status,
            json: vi.fn().mockResolvedValue(body),
        })
    );
};

const createMockFetch = (body: unknown) => {
    const mockFetch = vi.fn().mockResolvedValue({
        ok: true,
        status: 200,
        json: vi.fn().mockResolvedValue(body),
    });
    vi.stubGlobal("fetch", mockFetch);
    return mockFetch;
};

// ─── Tests ────────────────────────────────────────────────────────────────────

describe("CoordinateRepository", () => {

    beforeEach(() => {
        vi.unstubAllGlobals();
        vi.clearAllMocks();
    });

    describe("getCoordinates", () => {
        it("returns coordinates on a successful response", async () => {
            mockFetchResponse([mockCoordinates]);

            const repo = new CoordinateRepository();
            const result = await repo.getCoordinates(mockAddress);

            expect(result).toEqual({ lat: mockCoordinates.lat, lon: mockCoordinates.lon });
        });

        it("returns null when the result array is empty", async () => {
            mockFetchResponse([]);

            const repo = new CoordinateRepository();
            const result = await repo.getCoordinates(mockAddress);

            expect(result).toBeNull();
        });

        it("returns null when fetch response is not ok", async () => {
            mockFetchResponse(null, false, 500);

            const repo = new CoordinateRepository();
            const result = await repo.getCoordinates(mockAddress);

            expect(result).toBeNull();
        });

        it("returns null when fetch throws a network error", async () => {
            vi.stubGlobal("fetch", vi.fn().mockRejectedValue(new Error("Network error")));

            const repo = new CoordinateRepository();
            const result = await repo.getCoordinates(mockAddress);

            expect(result).toBeNull();
        });

        it("only returns lat and lon from the first result", async () => {
            mockFetchResponse([
                { lat: 39.7684, lon: -86.1581, display_name: "Indianapolis, IN", importance: 0.8 },
                { lat: 41.8781, lon: -87.6298, display_name: "Chicago, IL", importance: 0.9 },
            ]);

            const repo = new CoordinateRepository();
            const result = await repo.getCoordinates(mockAddress);

            expect(result).toEqual({ lat: 39.7684, lon: -86.1581 });
            expect(result).not.toHaveProperty("display_name");
            expect(result).not.toHaveProperty("importance");
        });

        it("builds the query URL with address parts joined by '+'", async () => {
            const mockFetch = createMockFetch([mockCoordinates]);

            const repo = new CoordinateRepository();
            await repo.getCoordinates(mockAddress);

            const calledUrl = mockFetch.mock.calls[0]?.[0] as string | undefined;
            expect(calledUrl).toBeDefined();
            expect(calledUrl).toContain("123+Main+St");
            expect(calledUrl).toContain("Indianapolis");
            expect(calledUrl).toContain("IN");
            expect(calledUrl).toContain("46201");
            expect(calledUrl).toContain("US");
        });

        it("replaces spaces in address parts with '+'", async () => {
            const mockFetch = createMockFetch([mockCoordinates]);

            const repo = new CoordinateRepository();
            await repo.getCoordinates({ ...mockAddress, address: "123 Main Street" });

            const calledUrl = mockFetch.mock.calls[0]?.[0] as string | undefined;
            expect(calledUrl).toBeDefined();
            expect(calledUrl).not.toContain(" ");
            expect(calledUrl).toContain("123+Main+Street");
        });

        it("calls the geocode endpoint", async () => {
            const mockFetch = createMockFetch([mockCoordinates]);

            const repo = new CoordinateRepository();
            await repo.getCoordinates(mockAddress);

            const calledUrl = mockFetch.mock.calls[0]?.[0] as string | undefined;
            expect(calledUrl).toBeDefined();
            expect(calledUrl).toContain("https://geocode.maps.co/search");
        });
    });
});