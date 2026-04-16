// src/supabase/adminClient.ts
import { createClient, SupabaseClient } from "@supabase/supabase-js";
import type { User, AdminUserAttributes } from "@supabase/supabase-js";

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const serviceRoleKey = import.meta.env.VITE_SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !serviceRoleKey) {
    throw new Error("Missing Supabase URL or Service Role Key");
}

// Admin client using service role key
export const supabaseAdmin: SupabaseClient = createClient(supabaseUrl, serviceRoleKey);

/**
 * Delete a user by email if exists
 */
export async function deleteUserIfExists(email: string): Promise<void> {
    const { data, error } = await supabaseAdmin.auth.admin.listUsers();
    if (error) throw error;

    const users: User[] = data.users ?? [];
    const existing = users.find((u) => u.email === email);

    if (existing) {
        await supabaseAdmin.auth.admin.deleteUser(existing.id);
    }
}

/**
 * Seed test users (Alice and Bob)
 */
export async function seedTestUsers(): Promise<Record<"alice" | "bob", User>> {
    await deleteUserIfExists("alice@example.com");
    await deleteUserIfExists("bob@example.com");

    const { data: aliceData, error: aliceError } = await supabaseAdmin.auth.admin.createUser({
        email: "alice@example.com",
        password: "password123",
        email_confirm: true,
    } as AdminUserAttributes);

    if (aliceError || !aliceData.user) throw aliceError ?? new Error("Failed to create Alice");
    const alice: User = aliceData.user;

    const { data: bobData, error: bobError } = await supabaseAdmin.auth.admin.createUser({
        email: "bob@example.com",
        password: "Password123",
        email_confirm: true,
    } as AdminUserAttributes);

    if (bobError || !bobData.user) throw bobError ?? new Error("Failed to create Bob");
    const bob: User = bobData.user;

    return { alice, bob };
}