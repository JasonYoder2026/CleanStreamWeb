export interface FunctionService {
    callFunction<T= unknown>(name: string, params?: any): Promise<T>
}