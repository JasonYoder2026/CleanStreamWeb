// src/data/repositories/RefundRepository.test.ts
import { describe, it, expect, vi, beforeEach } from "vitest";
import type { SupabaseClient } from "@supabase/supabase-js";
import { RefundRepository } from "./RefundRepository";

describe("RefundRepository", () => {
    let mockClient: SupabaseClient;
    let repo: RefundRepository;
    let mockFrom: any;
    let mockSelect: any;

    beforeEach(() => {
        mockSelect = vi.fn();
        mockFrom = vi.fn(() => ({ select: mockSelect }));
        mockClient = {
            from: mockFrom,
        } as unknown as SupabaseClient;

        repo = new RefundRepository(mockClient);
    });

    it("should fetch refunds and map them correctly", async () => {
        const mockData = [
            {
                refund_id: 1,
                transaction_id: "T123",
                amount: 50,
                description: "Test refund",
                date: "2026-03-27",
                status: "pending",
                profiles: {
                    id: "U123",
                    full_name: "John Doe",
                    refund_attempts: 2,
                },
            },
        ];

        mockSelect.mockResolvedValue({ data: mockData, error: null });

        const result = await repo.getRefunds();

        expect(mockFrom).toHaveBeenCalledWith("Refunds");
        expect(mockSelect).toHaveBeenCalled();
        expect(result).toEqual([
            {
                id: "R1",
                customerName: "John Doe",
                customerId: "U123",
                transactionId: "T123",
                amount: 50,
                reason: "Test refund",
                date: "2026-03-27",
                status: "pending",
                attempts: 2,
            },
        ]);
    });

    it("should throw an error if Supabase returns an error", async () => {
        const mockError = new Error("Database error");
        mockSelect.mockResolvedValue({ data: null, error: mockError });

        await expect(repo.getRefunds()).rejects.toThrow("Database error");
    });

    it("should throw an error if data is null without error", async () => {
        mockSelect.mockResolvedValue({ data: null, error: null });

        await expect(repo.getRefunds()).rejects.toBeNull();
    });
});