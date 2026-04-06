import { createClient, SupabaseClient } from "@supabase/supabase-js";
import type { FunctionService } from "../../interfaces/FunctionService";

export class EdgeFunctionRepository implements FunctionService {
    constructor(private client: SupabaseClient) { }

    callFunction = async <T = unknown>(
        name: string,
        params?: any
    ): Promise<T> => {
        try {
            const response = await this.client.functions.invoke(name, {
                body: JSON.stringify(params),
            });

            if (response.data != undefined) {
                return response.data as T;
            } else return null as T;
        } catch (err: any) {
            return err as T;
        }
    }
}