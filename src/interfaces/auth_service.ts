import { AuthenticationResponse } from "../supabase/enum/authentication_responses";

export interface AuthService{
    login(email:string,password:string): Promise<AuthenticationResponse>;
    getRole(userID: string | undefined): Promise<AuthenticationResponse>;
    isSession(): Promise<boolean>;
    getUserID(): string | null;
}