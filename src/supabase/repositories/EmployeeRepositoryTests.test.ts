import { describe, it, expect, vi, beforeEach } from "vitest";
import { EmployeeRepository } from "./EmployeeRepository";

// ─── Mock Services ────────────────────────────────────────────────────────────

const mockGetUserID = vi.fn();

vi.mock("../../di/container", () => ({
  useAuth: () => ({
    getUserID: mockGetUserID,
  }),
}));

// ─── Supabase Client Mock ─────────────────────────────────────────────────────

const mockSelect = vi.fn();
const mockUpdate = vi.fn();
const mockInsert = vi.fn();
const mockDelete = vi.fn();
const mockEq = vi.fn();
const mockNeq = vi.fn();
const mockIn = vi.fn();

const mockFrom = vi.fn(() => ({
  update: mockUpdate,
  insert: mockInsert,
  select: mockSelect,
  delete: mockDelete,
}));

mockUpdate.mockReturnValue({ eq: mockEq });
mockEq.mockReturnValue({ select: mockSelect });
mockSelect.mockReturnValue({ neq: mockNeq });
mockNeq.mockReturnValue({ in: mockIn });
mockDelete.mockReturnValue({ eq: mockEq });

const mockClient = { from: mockFrom } as any;

// ─── Mock Data ────────────────────────────────────────────────────────────────

const mockUserID = "uuid-current-admin";
const mockTargetUserID = "uuid-target-user";

const mockAdminForm = {
  email: "john@example.com",
  locationID: 1,
};

const mockEmployeeData = [
  {
    location_id: 1,
    profiles: { full_name: "Alice Smith", email: "alice@example.com" },
  },
  {
    location_id: 2,
    profiles: { full_name: "Bob Jones", email: "bob@example.com" },
  },
];

// ─── Tests ────────────────────────────────────────────────────────────────────

describe("EmployeeRepository", () => {
  let repo: EmployeeRepository;

  beforeEach(() => {
    vi.clearAllMocks();
    repo = new EmployeeRepository(mockClient);
    mockGetUserID.mockResolvedValue(mockUserID);

    // Default happy-path chain for changeUserRole
    mockFrom.mockReturnValue({ update: mockUpdate, insert: mockInsert, select: mockSelect, delete: mockDelete });
    mockUpdate.mockReturnValue({ eq: mockEq });
    mockEq.mockReturnValue({ select: mockSelect });
    mockDelete.mockReturnValue({ eq: mockEq });
  });

  // ── changeUserRole ────────────────────────────────────────────────────────

  describe("changeUserRole", () => {
    it("queries the profiles table", async () => {
      mockSelect.mockResolvedValueOnce({
        data: [{ id: mockTargetUserID }],
        error: null,
      });

      await repo.assignAdminRole("john@example.com");

      expect(mockFrom).toHaveBeenCalledWith("profiles");
    });

    it("updates the role to Admin for the given email", async () => {
      mockSelect.mockResolvedValueOnce({
        data: [{ id: mockTargetUserID }],
        error: null,
      });

      await repo.assignAdminRole("john@example.com");

      expect(mockUpdate).toHaveBeenCalledWith({ roles: "Admin" });
      expect(mockEq).toHaveBeenCalledWith("email", "john@example.com");
    });

    it("returns the user ID from the updated profile", async () => {
      mockSelect.mockResolvedValueOnce({
        data: [{ id: mockTargetUserID }],
        error: null,
      });

      const result = await repo.assignAdminRole("john@example.com");

      expect(result).toBe(mockTargetUserID);
    });

    it("returns undefined when the response data is empty", async () => {
      mockSelect.mockResolvedValueOnce({ data: [], error: null });

      const result = await repo.assignAdminRole("john@example.com");

      expect(result).toBeUndefined();
    });

    it("throws when Supabase returns an error", async () => {
      mockSelect.mockResolvedValueOnce({
        data: null,
        error: { message: "Update failed" },
      });

      await expect(repo.assignAdminRole("john@example.com")).rejects.toThrow(
        "Update failed",
      );
    });
  });

  // ── assignAdminLocation ───────────────────────────────────────────────────

  describe("assignAdminLocation", () => {
    beforeEach(() => {
      // changeUserRole succeeds and resolves the target user ID
      mockSelect.mockResolvedValueOnce({
        data: [{ id: mockTargetUserID }],
        error: null,
      });
    });

    it("inserts into the Location_to_Admin table", async () => {
      mockInsert.mockResolvedValueOnce({ error: null });

      await repo.assignAdminLocation(mockAdminForm);

      expect(mockFrom).toHaveBeenCalledWith("Location_to_Admin");
    });

    it("inserts the correct location and user IDs", async () => {
      mockInsert.mockResolvedValueOnce({ error: null });

      await repo.assignAdminLocation(mockAdminForm);

      expect(mockInsert).toHaveBeenCalledWith({
        location_id: mockAdminForm.locationID,
        user_id: mockTargetUserID,
      });
    });

    it("resolves without a value on success", async () => {
      mockInsert.mockResolvedValueOnce({ error: null });

      await expect(
        repo.assignAdminLocation(mockAdminForm),
      ).resolves.toBeUndefined();
    });

    it("throws when the insert returns an error", async () => {
      mockInsert.mockResolvedValueOnce({ error: { message: "Insert failed" } });

      await expect(repo.assignAdminLocation(mockAdminForm)).rejects.toThrow(
        "Insert failed",
      );
    });

    it("throws when changeUserRole fails before the insert", async () => {
      // Override the first mockSelect to simulate changeUserRole failing
      mockSelect.mockReset();
      mockEq.mockReturnValue({ select: mockSelect });
      mockSelect.mockResolvedValueOnce({
        data: null,
        error: { message: "Profile not found" },
      });

      await expect(repo.assignAdminLocation(mockAdminForm)).rejects.toThrow(
        "Profile not found",
      );
      expect(mockInsert).not.toHaveBeenCalled();
    });
  });

  // ── fetchEmployees ────────────────────────────────────────────────────────

  describe("fetchEmployees", () => {
    const mockInResolved = vi.fn();
    const mockNeqChain = vi.fn();
    const mockSelectChain = vi.fn();

    beforeEach(() => {
      mockInResolved.mockResolvedValue({ data: mockEmployeeData, error: null });
      mockNeqChain.mockReturnValue({ in: mockInResolved });
      mockSelectChain.mockReturnValue({ neq: mockNeqChain });

      mockFrom.mockReturnValue({
        update: mockUpdate,
        insert: mockInsert,
        select: mockSelectChain,
        delete: mockDelete,
      });
    });

    it("queries the Location_to_Admin table", async () => {
      await repo.fetchEmployees([1, 2]);

      expect(mockFrom).toHaveBeenCalledWith("Location_to_Admin");
    });

    it("excludes the current user from results", async () => {
      await repo.fetchEmployees([1, 2]);

      expect(mockNeqChain).toHaveBeenCalledWith("user_id", mockUserID);
    });

    it("filters by the provided location IDs", async () => {
      await repo.fetchEmployees([1, 2]);

      expect(mockInResolved).toHaveBeenCalledWith("location_id", [1, 2]);
    });

    it("maps the response to EmployeeRecord shape", async () => {
      const result = await repo.fetchEmployees([1, 2]);

      expect(result).toEqual([
        { locationID: 1, name: "Alice Smith", email: "alice@example.com" },
        { locationID: 2, name: "Bob Jones", email: "bob@example.com" },
      ]);
    });

    it("returns an empty array when there are no matching employees", async () => {
      mockInResolved.mockResolvedValueOnce({ data: [], error: null });

      const result = await repo.fetchEmployees([1, 2]);

      expect(result).toEqual([]);
    });

    it("handles profiles with missing fields gracefully", async () => {
      mockInResolved.mockResolvedValueOnce({
        data: [{ location_id: 1, profiles: null }],
        error: null,
      });

      const result = await repo.fetchEmployees([1]);

      expect(result).toEqual([
        { locationID: 1, name: undefined, email: undefined },
      ]);
    });

    it("throws when Supabase returns an error", async () => {
      mockInResolved.mockResolvedValueOnce({
        data: null,
        error: { message: "Fetch failed" },
      });

      await expect(repo.fetchEmployees([1, 2])).rejects.toThrow("Fetch failed");
    });
  });

  // ── removeAdminRole ───────────────────────────────────────────────────────

  describe("removeAdminRole", () => {
    it("queries the profiles table", async () => {
      mockSelect.mockResolvedValueOnce({
        data: [{ id: mockTargetUserID }],
        error: null,
      });

      await repo.removeAdminRole("john@example.com");

      expect(mockFrom).toHaveBeenCalledWith("profiles");
    });

    it("updates the role to User for the given email", async () => {
      mockSelect.mockResolvedValueOnce({
        data: [{ id: mockTargetUserID }],
        error: null,
      });

      await repo.removeAdminRole("john@example.com");

      expect(mockUpdate).toHaveBeenCalledWith({ roles: "User" });
      expect(mockEq).toHaveBeenCalledWith("email", "john@example.com");
    });

    it("returns the user ID from the updated profile", async () => {
      mockSelect.mockResolvedValueOnce({
        data: [{ id: mockTargetUserID }],
        error: null,
      });

      const result = await repo.removeAdminRole("john@example.com");

      expect(result).toBe(mockTargetUserID);
    });

    it("returns undefined when the response data is empty", async () => {
      mockSelect.mockResolvedValueOnce({ data: [], error: null });

      const result = await repo.removeAdminRole("john@example.com");

      expect(result).toBeUndefined();
    });

    it("throws when Supabase returns an error", async () => {
      mockSelect.mockResolvedValueOnce({
        data: null,
        error: { message: "Update failed" },
      });

      await expect(repo.removeAdminRole("john@example.com")).rejects.toThrow(
        "Update failed",
      );
    });
  });

  // ── removeAdminLocation ───────────────────────────────────────────────────

  describe("removeAdminLocation", () => {
    beforeEach(() => {
      // removeAdminRole succeeds and resolves the target user ID
      mockSelect.mockResolvedValueOnce({
        data: [{ id: mockTargetUserID }],
        error: null,
      });
    });

    it("deletes from the Location_to_Admin table", async () => {
      mockEq.mockResolvedValueOnce({ error: null });

      await repo.removeAdminLocation("john@example.com");

      expect(mockFrom).toHaveBeenCalledWith("Location_to_Admin");
    });

    it("deletes the row matching the resolved user ID", async () => {
      mockEq.mockResolvedValueOnce({ error: null });

      await repo.removeAdminLocation("john@example.com");

      expect(mockDelete).toHaveBeenCalled();
      expect(mockEq).toHaveBeenCalledWith("user_id", mockTargetUserID);
    });

    it("resolves without a value on success", async () => {
      mockEq.mockResolvedValueOnce({ error: null });

      await expect(
        repo.removeAdminLocation("john@example.com"),
      ).resolves.toBeUndefined();
    });

    it("throws when the delete returns an error", async () => {
      mockEq.mockResolvedValueOnce({ error: { message: "Delete failed" } });

      await expect(
        repo.removeAdminLocation("john@example.com"),
      ).rejects.toThrow("Delete failed");
    });

    it("throws when removeAdminRole fails before the delete", async () => {
      mockSelect.mockReset();
      mockEq.mockReturnValue({ select: mockSelect });
      mockSelect.mockResolvedValueOnce({
        data: null,
        error: { message: "Profile not found" },
      });

      await expect(
        repo.removeAdminLocation("john@example.com"),
      ).rejects.toThrow("Profile not found");
      expect(mockDelete).not.toHaveBeenCalled();
    });
  });
});