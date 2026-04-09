// tests/refund.integration.test.ts
import { describe, it, expect, beforeAll } from "vitest";
import supabase from "../supabase/client"; // normal anon client for DB ops
import { useRefunds, useFunctions } from "../di/container";
import { supabaseAdmin, seedTestUsers } from "./adminClient";

/**
 * Seed a transaction for a given user
 */
async function seedTestTransaction(userId: string) {
    const transaction = {
        id: 455,
        user_id: userId,
        amount: "10.0",
        description: "Loyalty Card",
        created_at: new Date().toISOString(),
        type: "Laundry",
        requested_refund: true,
    };

    const { data: existing, error: selectError } = await supabase
        .from("transactions")
        .select("*")
        .eq("id", transaction.id)
        .single();

    if (selectError && selectError.code !== "PGRST116") throw selectError;

    if (!existing) {
        const { error: insertError } = await supabase.from("transactions").insert([transaction]);
        if (insertError) throw insertError;
    }

    return transaction;
}

/**
 * Seed a pending refund for the transaction
 */
async function seedPendingRefund(transactionId: number) {
    const { data: existing } = await supabase
        .from("refunds")
        .select("*")
        .eq("transactionId", transactionId)
        .single();

    if (!existing) {
        const { error: insertError } = await supabase.from("refunds").insert([
            {
                transactionId,
                status: "pending",
                note: "Seeded for integration test",
            },
        ]);

        if (insertError) throw insertError;
    }
}

/**
 * Seed everything: auth users, transaction, refund
 */
async function seedTestData() {
    const { alice } = await seedTestUsers(); // ✅ uses admin client
    const transaction = await seedTestTransaction(alice.id); // table insert via anon client
    await seedPendingRefund(transaction.id);
}

describe("Refund Integration Tests (Real DB, Direct)", () => {
    beforeAll(async () => {
        await seedTestData();
    });

    it("approves a pending refund and verifies DB changes", async () => {
        const refundRepo = useRefunds();
        const { callFunction } = useFunctions();

        // 🔹 Get all refunds
        const refunds = await refundRepo.getRefunds();
        const pending = refunds.find((r) => r.status === "pending");
        expect(pending, "No pending refund available in the test database").toBeDefined();
        if (!pending) return;

        // 🔹 Approve the refund using the Edge Function
        await callFunction("approveRefund", {
            transactionId: pending.transactionId,
            customerId: pending.customerId,
            amount: pending.amount,
            note: "Integration test approval",
        });

        // 🔹 Verify the refund status is updated
        const updatedRefunds = await refundRepo.getRefunds();
        const updated = updatedRefunds.find((r) => r.id === pending.id);

        expect(updated).toBeDefined();
        expect(updated!.status).toBe("approved");
    });
});