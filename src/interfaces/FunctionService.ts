export interface FunctionService {
    callFunction<T = unknown>(name: string, params?: Record<string, unknown>): Promise<T>
}
