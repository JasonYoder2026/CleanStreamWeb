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
        const mockSupabaseData = [
            {
                maint_id: "1",
                user_id: "USER-123",
                category: "Plumbing",
                description: "Leaky faucet",
                created_at: "2026-04-01T10:00:00Z",
                location: "Room 101",
                image_data: "base64_string",
            },
        ];

        mockGte.mockResolvedValue({ data: mockSupabaseData, error: null });

        const result = await repo.getMaintenances();

        expect(result[0]).toEqual({
            maint_id: "1",
            user_id: "USER-123",
            category: "Plumbing",
            description: "Leaky faucet",
            created_at: "2026-04-01T10:00:00Z",
            location: "Room 101",
            image_data: "base64_string",
        });
    });

    it("should throw an error if Supabase returns an error", async () => {
        // Supabase error objects have a 'message' property
        const mockSupabaseError = { message: "Connection failed" };
        mockGte.mockResolvedValue({ data: null, error: mockSupabaseError });

        await expect(repo.getMaintenances()).rejects.toThrow("Connection failed");
    });

    it("should throw an error if data is null without an explicit error", async () => {
        mockGte.mockResolvedValue({ data: null, error: null });

        await expect(repo.getMaintenances()).rejects.toThrow("No data returned from server");
    });
});