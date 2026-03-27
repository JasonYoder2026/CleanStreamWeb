import { describe, it, expect, vi, beforeEach } from 'vitest';
import type { SupabaseClient } from '@supabase/supabase-js';
import { EdgeFunctionRepository } from './EdgeFunctionRepository';

describe('EdgeFunctionRepository', () => {
    let mockClient: SupabaseClient;
    let repo: EdgeFunctionRepository;
    let mockInvoke: any;

    beforeEach(() => {
        mockInvoke = vi.fn();
        mockClient = {
            functions: {
                invoke: mockInvoke,
            },
        } as unknown as SupabaseClient;

        repo = new EdgeFunctionRepository(mockClient);
    });

    it('should call the Supabase function and return data', async () => {
        const mockData = { success: true };
        mockInvoke.mockResolvedValue({ data: mockData });

        const result = await repo.callFunction('test-function', { foo: 'bar' });

        expect(mockInvoke).toHaveBeenCalledWith('test-function', {
            body: JSON.stringify({ foo: 'bar' }),
        });
        expect(result).toEqual(mockData);
    });

    it('should return null if response.data is undefined', async () => {
        mockInvoke.mockResolvedValue({ data: undefined });

        const result = await repo.callFunction('empty-function');

        expect(result).toBeNull();
    });

    it('should return the error if the invocation throws', async () => {
        const mockError = new Error('Function failed');
        mockInvoke.mockRejectedValue(mockError);

        const result = await repo.callFunction('failing-function');

        expect(result).toBe(mockError);
    });
});