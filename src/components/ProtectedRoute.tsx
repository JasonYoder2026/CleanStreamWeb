import { Navigate } from "react-router-dom";
import {type JSX, useEffect, useState} from "react";
import { authenticator } from "../api/singleton/auth_singleton";
import { SupabaseAuthService } from "../api/models/supabase_auth_service";

interface ProtectedRouteProps {
    children: JSX.Element;
}

export function ProtectedRoute({ children }: ProtectedRouteProps) {
    const [isAuth, setIsAuth] = useState<boolean | null>(null);

    useEffect(() => {
        (async () => {
            const session = await authenticator.isSession();
            setIsAuth(session);
        })();
    }, [authenticator]);

    if (isAuth === null) {
        // still checking
        return <div>Loading...</div>;
    }

    if (!isAuth) {
        return <Navigate to="/" replace />;
    }

    return children;
}