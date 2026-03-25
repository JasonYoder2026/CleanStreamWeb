import type {AuthService} from "../services/auth_service";
import {AuthenticationResponse} from "../Enum/authentication_responses";
import type {SupabaseClient} from "@supabase/supabase-js";

export class SupabaseAuthService implements AuthService {

    private client: SupabaseClient;

    constructor(client: SupabaseClient) {
        this.client = client;
    }

    async login(email: string, password: string): Promise<AuthenticationResponse> {
        let output: AuthenticationResponse = AuthenticationResponse.success;

        const {data, error } = await this.client.auth.signInWithPassword({
            email: email,
            password: password
        });


        if(data.user === null || error){
            output = AuthenticationResponse.failure
        }else{
            let response: AuthenticationResponse = await this.getRole(data.user?.id)
            if(response === AuthenticationResponse.invalidPermissions){
                output = AuthenticationResponse.invalidPermissions;
            }

            // Save JWT token to localStorage
            if (data.session?.access_token) {
                localStorage.setItem("supabase_token", data.session.access_token);
            }
        }

        return output;
    }

    async getRole(userID: string | undefined): Promise<AuthenticationResponse> {
        let output: AuthenticationResponse;

        const {data,error} = await this.client
            .from('profiles')
            .select("Roles")
            .eq('id', userID)
            .single();

        if(data != null) {
            if (data.Roles === "Admin" || data.Roles === "Owner") {
                output = AuthenticationResponse.success;
            }else{
                output = AuthenticationResponse.invalidPermissions;
            }
        }else{
            output = AuthenticationResponse.failure;
        }

        return output;
    }
}