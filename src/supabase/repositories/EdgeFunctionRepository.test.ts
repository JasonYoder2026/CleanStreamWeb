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
        mockInvoke.mockResolvedValue({ data: mockData, error: null });

        const result = await repo.callFunction('test-function', { foo: 'bar' });

        expect(mockInvoke).toHaveBeenCalledWith('test-function', {
            body: { foo: 'bar' },
        });
        expect(result).toEqual(mockData);
    });

    it('should throw if response.data is missing', async () => {
        mockInvoke.mockResolvedValue({ data: undefined, error: null });

        await expect(repo.callFunction('empty-function')).rejects.toThrow(
            'empty-function returned no data'
        );
    });

    it('should throw if Supabase returns a function error', async () => {
        const mockError = new Error('Function returned 500');
        mockInvoke.mockResolvedValue({ data: null, error: mockError });

        await expect(repo.callFunction('failing-function')).rejects.toBe(mockError);
    });

    it('should propagate errors thrown by the invocation', async () => {
        const mockError = new Error('Function failed');
        mockInvoke.mockRejectedValue(mockError);

        await expect(repo.callFunction('failing-function')).rejects.toBe(mockError);
    });
});
