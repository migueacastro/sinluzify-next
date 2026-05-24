import { useSession } from "next-auth/react";
import { useRouter } from "next/router";
import { useEffect } from "react";

export function useAuthGuard() {
    const { data: session, status } = useSession();
    const router = useRouter();

    const publicRoutes = ["/auth/login", "/auth/register", "/"];
    const isPublicRoute = publicRoutes.includes(router.pathname);

    useEffect(() => {
        if (status === "loading") return;

        if (!session && !isPublicRoute) {
            // Not logged in and trying to access a protected page (/, /profile, /todos, /auth/verify)
            router.push("/auth/login");
        } else if (session && isPublicRoute) {
            // Logged in and trying to access a public page (login / register) -> redirect to profile
            router.push("/dashboard"); // fix auth redirection to profile, go to dashboard instead
        }
    }, [session, status, router.pathname, isPublicRoute]);

    // Calculate if we should show a loading screen (to prevent flashes of protected content)
    const isRedirecting = 
        (status === "loading") ||
        (!session && !isPublicRoute) || 
        (!!session && isPublicRoute);

    return {
        session,
        isLoading: isRedirecting
    };
}
