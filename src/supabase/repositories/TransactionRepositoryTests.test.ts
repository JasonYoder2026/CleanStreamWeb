import { describe, it, expect, vi } from "vitest";

import { SupabaseClient } from "@supabase/supabase-js";
import {TransactionRepository} from "./TranscationRepository";

// ─── Mock Client Factory ─────────────────────────────────────────────────────

const createMockClient = (result: { data: any; error: any }) => {
    const not = vi.fn().mockResolvedValue(result);
    const chain = {
        select: vi.fn().mockReturnThis(),
        gte: vi.fn().mockReturnThis(),
        lte: vi.fn().mockReturnThis(),
        not,
    };

    return {
        client: {
            from: vi.fn().mockReturnValue(chain),
        } as unknown as SupabaseClient,
        chain,
    };
};

// ─── Tests ───────────────────────────────────────────────────────────────────

describe("TransactionRepository", () => {

    describe("getTodayRevenue", () => {

        it("returns the correct sum of transaction amounts", async () => {
            const { client } = createMockClient({
                data: [
                    { amount: "15.0", description: "Laundry" },
                    { amount: "25.0", description: "Dry Clean" },
                    { amount: "10.0", description: "Wash" },
                ],
                error: null,
            });

            const repo = new TransactionRepository(client);
            const result = await repo.getTodayRevenue();

            expect(result).toBe(50);
        });

        it("returns 0 when there are no transactions", async () => {
            const { client } = createMockClient({ data: [], error: null });

            const repo = new TransactionRepository(client);
            const result = await repo.getTodayRevenue();

            expect(result).toBe(0);
        });

        it("returns 0 when data is null", async () => {
            const { client } = createMockClient({ data: null, error: null });

            const repo = new TransactionRepository(client);
            const result = await repo.getTodayRevenue();

            expect(result).toBe(0);
        });

        it("returns null when there is a supabase error", async () => {
            const { client } = createMockClient({
                data: null,
                error: { message: "Database error" },
            });

            const repo = new TransactionRepository(client);
            const result = await repo.getTodayRevenue();

            expect(result).toBeNull();
        });

        it("skips rows with invalid amount values", async () => {
            const { client } = createMockClient({
                data: [
                    { amount: "20.0", description: "Laundry" },
                    { amount: "invalid", description: "Wash" },
                    { amount: null, description: "Dry Clean" },
                ],
                error: null,
            });

            const repo = new TransactionRepository(client);
            const result = await repo.getTodayRevenue();

            expect(result).toBe(20);
        });

        it("queries the transactions table", async () => {
            const { client } = createMockClient({ data: [], error: null });

            const repo = new TransactionRepository(client);
            await repo.getTodayRevenue();

            expect(client.from).toHaveBeenCalledWith("transactions");
        });

        it("filters out loyalty payment descriptions", async () => {
            const { client, chain } = createMockClient({ data: [], error: null });

            const repo = new TransactionRepository(client);
            await repo.getTodayRevenue();

            expect(chain.not).toHaveBeenCalledWith(
                "description",
                "in",
                '("Loyalty payment on Dryer","Loyalty payment on Washer")'
            );
        });

        it("applies date range filters for today", async () => {
            const { client, chain } = createMockClient({ data: [], error: null });

            const repo = new TransactionRepository(client);
            await repo.getTodayRevenue();

            expect(chain.gte).toHaveBeenCalledWith("created_at", expect.any(String));
            expect(chain.lte).toHaveBeenCalledWith("created_at", expect.any(String));
        });

        it("handles decimal amounts correctly", async () => {
            const { client } = createMockClient({
                data: [
                    { amount: "10.50", description: "Laundry" },
                    { amount: "5.75", description: "Wash" },
                ],
                error: null,
            });

            const repo = new TransactionRepository(client);
            const result = await repo.getTodayRevenue();

            expect(result).toBeCloseTo(16.25);
        });

    });
});