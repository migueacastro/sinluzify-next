import Link from "next/link";
import { useAuthGuard } from "@/hooks/useAuthGuard";

export default function Layout({ children }: { children: React.ReactNode }) {
    const { session, isLoading } = useAuthGuard();

    if (isLoading) {
        return (
            <div className="flex min-h-screen items-center justify-center bg-zinc-950 text-zinc-50">
                <div className="flex flex-col items-center gap-3">
                    {/* Premium sleek spinner */}
                    <div className="relative h-10 w-10">
                        <div className="absolute inset-0 rounded-full border-2 border-zinc-800" />
                        <div className="absolute inset-0 rounded-full border-2 border-t-yellow-500 animate-spin" />
                    </div>
                    <p className="text-xs font-semibold uppercase tracking-widest text-zinc-500 dark:text-zinc-400 animate-pulse">
                        Verificando sesión
                    </p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-zinc-950 text-zinc-50 flex flex-col">
            {/* Sticky Minimalist Navbar with Backdrop Blur */}
            <nav className="border-b border-zinc-900 bg-zinc-950/70 backdrop-blur-md sticky top-0 z-50">
                <div className="mx-auto max-w-6xl px-4 py-3 flex items-center justify-between">
                    <Link href="/" className="flex items-center gap-2 font-bold tracking-tight">
                        <span>SinLuzify</span>
                    </Link>
                    <div className="flex items-center gap-5 text-sm font-medium text-zinc-400">
                        <Link href="/todos" className="hover:text-zinc-50 transition-colors">Tareas</Link>
                        {session ? (
                            <Link
                                href="/profile"
                                className="inline-flex items-center justify-center rounded-lg bg-zinc-50 px-3 py-1.5 text-xs font-semibold text-zinc-950 hover:bg-zinc-200 transition-colors"
                            >
                                Mi Perfil
                            </Link>
                        ) : (
                            <>
                                <Link href="/auth/login" className="hover:text-zinc-50 transition-colors">Entrar</Link>
                                <Link
                                    href="/auth/register"
                                    className="inline-flex items-center justify-center rounded-lg bg-zinc-50 px-3 py-1.5 text-xs font-semibold text-zinc-950 hover:bg-zinc-200 transition-colors"
                                >
                                    Registro
                                </Link>
                            </>
                        )}
                    </div>
                </div>
            </nav>
            <main className="flex-1">{children}</main>
        </div>
    );
}
