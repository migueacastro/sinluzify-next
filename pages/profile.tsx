import { GetServerSideProps } from "next";
import { signOut } from "next-auth/react";
import { auth } from "@/auth";
import { User, Mail, ShieldCheck, LogOut, Key, Calendar } from "lucide-react";

interface ProfileProps {
    session: {
        user?: {
            id?: string;
            name?: string;
            email?: string;
        };
        expires?: string;
    };
}

export default function ProfilePage({ session }: ProfileProps) {
    const user = session.user;
    
    // Get user initials for the avatar placeholder
    const getInitials = () => {
        if (!user?.email) return "U";
        return user.email.slice(0, 2).toUpperCase();
    };

    return (
        <div className="flex min-h-[90vh] items-center justify-center bg-zinc-50 px-4 py-12 dark:bg-zinc-950 sm:px-6 lg:px-8">
            <div className="w-full max-w-2xl space-y-8">
                {/* Header */}
                <div className="text-center">
                    <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-zinc-900 text-zinc-50 dark:bg-zinc-50 dark:text-zinc-900 shadow-lg shadow-zinc-900/10 dark:shadow-zinc-50/10">
                        <User className="h-7 w-7" />
                    </div>
                    <h2 className="mt-6 text-3xl font-extrabold tracking-tight text-zinc-900 dark:text-zinc-50">
                        Tu Perfil de Usuario
                    </h2>
                    <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-400">
                        Gestiona tus datos de acceso y tu sesión activa
                    </p>
                </div>

                {/* Main Profile Card */}
                <div className="rounded-2xl border border-zinc-200/80 bg-white p-8 shadow-xl shadow-zinc-200/30 dark:border-zinc-800/80 dark:bg-zinc-900/50 backdrop-blur-xl space-y-8">
                    {/* User Info Header Block */}
                    <div className="flex flex-col sm:flex-row items-center gap-6 pb-6 border-b border-zinc-100 dark:border-zinc-800/80">
                        {/* Avatar */}
                        <div className="flex h-20 w-20 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-tr from-yellow-500 to-amber-400 text-zinc-950 font-black text-3xl shadow-md shadow-yellow-500/10">
                            {getInitials()}
                        </div>
                        {/* Details */}
                        <div className="text-center sm:text-left space-y-1">
                            <h3 className="text-xl font-bold text-zinc-900 dark:text-zinc-50">
                                {user?.name || "Usuario Activo"}
                            </h3>
                            <div className="flex flex-wrap justify-center sm:justify-start gap-2">
                                <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2.5 py-0.5 text-xs font-semibold text-emerald-700 dark:bg-emerald-950/30 dark:text-emerald-400">
                                    <ShieldCheck className="h-3.5 w-3.5" />
                                    Sesión Activa
                                </span>
                                <span className="inline-flex items-center gap-1 rounded-full bg-zinc-100 px-2.5 py-0.5 text-xs font-semibold text-zinc-800 dark:bg-zinc-800 dark:text-zinc-300">
                                    Supabase Auth
                                </span>
                            </div>
                        </div>
                    </div>

                    {/* Meta Fields Grid */}
                    <div className="grid gap-6 sm:grid-cols-2">
                        {/* Email */}
                        <div className="space-y-1.5">
                            <span className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-zinc-500 dark:text-zinc-400">
                                <Mail className="h-4 w-4" />
                                Correo Electrónico
                            </span>
                            <p className="text-sm font-semibold text-zinc-900 dark:text-zinc-100 break-all">
                                {user?.email || "No disponible"}
                            </p>
                        </div>

                        {/* User ID */}
                        <div className="space-y-1.5">
                            <span className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-zinc-500 dark:text-zinc-400">
                                <Key className="h-4 w-4" />
                                ID de Usuario
                            </span>
                            <p className="text-xs font-mono font-semibold bg-zinc-50 dark:bg-zinc-950 px-2.5 py-1.5 rounded-lg border border-zinc-100 dark:border-zinc-800 text-zinc-850 dark:text-zinc-300 break-all select-all">
                                {user?.id || "No disponible"}
                            </p>
                        </div>

                        {/* Session Expiry */}
                        <div className="space-y-1.5 sm:col-span-2">
                            <span className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-zinc-500 dark:text-zinc-400">
                                <Calendar className="h-4 w-4" />
                                Caducidad de la Sesión
                            </span>
                            <p className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">
                                {session.expires ? new Date(session.expires).toLocaleString("es-ES") : "Indefinida"}
                            </p>
                        </div>
                    </div>

                    {/* Sign Out Action Button */}
                    <div className="pt-6 border-t border-zinc-100 dark:border-zinc-800/80">
                        <button
                            onClick={() => signOut({ callbackUrl: "/auth/login" })}
                            className="flex w-full sm:w-auto items-center justify-center gap-2 rounded-lg bg-red-600 px-5 py-2.5 text-sm font-semibold text-white shadow-lg shadow-red-600/10 hover:bg-red-500 transition-all active:scale-[0.98]"
                        >
                            <LogOut className="h-4 w-4" />
                            <span>Cerrar Sesión</span>
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}

export const getServerSideProps: GetServerSideProps = async (context) => {
    // NextAuth v5 server check inside getServerSideProps
    const session = await auth(context);

    if (!session) {
        return {
            redirect: {
                destination: "/auth/login",
                permanent: false,
            },
        };
    }

    return {
        props: {
            session,
        },
    };
};
