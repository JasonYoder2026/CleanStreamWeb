import type {AuthService} from "../services/auth_service";
import {AuthenticationResponse} from "../Enum/authentication_responses";
import type {SupabaseClient} from "@supabase/supabase-js";

export class SupabaseAuthService implements AuthService {

    private client: SupabaseClient;

    constructor(client: SupabaseClient) {
        this.client = client;
    }

    async login(email: string, password: string): Promise<AuthenticationResponse> {
        let response: AuthenticationResponse = AuthenticationResponse.success;

        const {data, error } = await this.client.auth.signInWithPassword({
            email: email,
            password: password
        });


        if(data.user === null || error){
            response = AuthenticationResponse.failure
        }

        return response;
    }
}