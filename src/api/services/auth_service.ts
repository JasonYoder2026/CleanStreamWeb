import { AuthenticationResponse } from "../Enum/authentication_responses";

export interface AuthService{
    login(email:string,password:string): Promise<AuthenticationResponse>;
}