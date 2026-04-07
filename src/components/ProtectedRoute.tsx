import { Navigate } from "react-router-dom";
import {type JSX, useEffect, useState} from "react";
import { useAuth } from "../di/container";

interface ProtectedRouteProps {
    children: JSX.Element;
}

export function ProtectedRoute({ children }: ProtectedRouteProps) {
    const [isAuth, setIsAuth] = useState<boolean | null>(null);
    const {isSession} = useAuth();

    useEffect(() => {
        (async () => {
            const session = await isSession();
            setIsAuth(session);
        })();
    }, []);

    if (isAuth === null) {
        // still checking
        return <div>Loading...</div>;
    }

    if (!isAuth || isAuth == undefined) {
        return <Navigate to="/" replace />;
    }

    return children;
}