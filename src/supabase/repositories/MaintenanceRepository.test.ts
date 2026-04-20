import { describe, it, expect, vi, beforeEach } from "vitest";
import type { SupabaseClient } from "@supabase/supabase-js";
import { MaintenanceRepository } from "./MaintenanceRepository";

describe("MaintenanceRepository", () => {
    let mockClient: SupabaseClient;
    let repo: MaintenanceRepository;
    let mockFrom: any;
    let mockSelect: any;
    let mockGte: any;

    beforeEach(() => {
        mockGte = vi.fn();

        mockSelect = vi.fn(() => ({
            gte: mockGte,
        }));

        mockFrom = vi.fn(() => ({
            select: mockSelect,
        }));

        mockClient = {
            from: mockFrom,
        } as unknown as SupabaseClient;

        repo = new MaintenanceRepository(mockClient);
    });

    it("should fetch maintenance records and map them correctly", async () => {
        const mockData = [
            {
                userId: "USER-123",
                category: "Plumbing",
                description: "Leaky faucet in kitchen",
                date: "2026-04-01T10:00:00Z",
                location: "Building A, Room 101",
                image_data: "data:image/png;base64,sample",
            },
        ];

        mockGte.mockResolvedValue({ data: mockData, error: null });

        const result = await repo.getMaintenances();

        expect(mockFrom).toHaveBeenCalledWith("Maintenances");
        expect(mockSelect).toHaveBeenCalled();
        expect(mockGte).toHaveBeenCalledWith("date", expect.any(String));

        expect(result).toEqual([
            {
                userId: "USER-123",
                category: "Plumbing",
                description: "Leaky faucet in kitchen",
                date: "2026-04-01T10:00:00Z",
                location: "Building A, Room 101",
                image_data: "data:image/png;base64,sample",
            },
        ]);
    });

    it("should throw an error if Supabase returns an error", async () => {
        const mockError = new Error("Connection failed");
        mockGte.mockResolvedValue({ data: null, error: mockError });

        await expect(repo.getMaintenances()).rejects.toThrow("Connection failed");
    });

    it("should throw an error if data is null without an explicit error", async () => {
        mockGte.mockResolvedValue({ data: null, error: null });

        await expect(repo.getMaintenances()).rejects.toThrow();
    });
});