import type {AuthService} from "../../interfaces/AuthService";
import {AuthenticationResponse} from "../enum/authentication_responses";
import {SupabaseClient, type Session} from "@supabase/supabase-js";

export class AuthRepository implements AuthService {

    private session: Session | null = null;
    private userID: string | null = null;

    constructor(private client: SupabaseClient) {}

    login = async (email: string, password: string): Promise<AuthenticationResponse> => {
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

    isSession = async (): Promise<boolean> => {
        return this.session != null;
    };

    getUserID = async (): Promise<string | null> => {
        return this.userID;
    }
}