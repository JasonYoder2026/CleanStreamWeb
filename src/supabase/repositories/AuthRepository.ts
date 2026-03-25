import type {AuthService} from "../../interfaces/auth_service";
import {AuthenticationResponse} from "../enum/authentication_responses";
import {SupabaseClient, type Session} from "@supabase/supabase-js";
import supabase from '../client';

export class SupabaseAuthRepository implements AuthService {

    private client: SupabaseClient = supabase;
    private session: Session | null = null;
    private userID: string | null = null;

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
 
            // Save the session
            if (data.session != null) {
                this.session = data.session;
            }

            //Save the userID
            this.userID = data.user.id;

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

    async isSession(): Promise<boolean> {
        return this.session != null;
    }

    getUserID(): string | null {
        return this.userID;
    }
}