import Link from "next/link";
import { useState, useEffect } from "react";
import { Sun, Moon } from "lucide-react";
import { useAuthGuard } from "@/hooks/useAuthGuard";

export default function Layout({ children }: { children: React.ReactNode }) {
    const { session, isLoading } = useAuthGuard();
    const [mounted, setMounted] = useState(false);
    const [theme, setTheme] = useState<"light" | "dark">("dark");

    useEffect(() => {
        setMounted(true);
        const storedTheme = localStorage.getItem("theme") as "light" | "dark" | null;
        if (storedTheme) {
            setTheme(storedTheme);
            if (storedTheme === "dark") {
                document.documentElement.classList.add("dark");
            } else {
                document.documentElement.classList.remove("dark");
            }
        } else {
            // Default to dark
            setTheme("dark");
            document.documentElement.classList.add("dark");
        }
    }, []);

    const toggleTheme = () => {
        const nextTheme = theme === "dark" ? "light" : "dark";
        setTheme(nextTheme);
        localStorage.setItem("theme", nextTheme);
        if (nextTheme === "dark") {
            document.documentElement.classList.add("dark");
        } else {
            document.documentElement.classList.remove("dark");
        }
    };

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
        <div className="min-h-screen bg-white dark:bg-zinc-950 text-zinc-900 dark:text-zinc-50 flex flex-col transition-colors duration-200">
            {/* Sticky Minimalist Navbar with Backdrop Blur */}
            <nav className="border-b border-zinc-200 dark:border-zinc-900 bg-white/70 dark:bg-zinc-950/70 backdrop-blur-md sticky top-0 z-50 transition-colors duration-200">
                <div className="mx-auto max-w-6xl px-4 py-3 flex items-center justify-between">
                    <Link href="/" className="flex items-center gap-2 font-bold tracking-tight">
                        <span>SinLuzify</span>
                    </Link>
                    <div className="flex items-center gap-5 text-sm font-medium text-zinc-500 dark:text-zinc-400">
                        <Link href="/todos" className="hover:text-zinc-900 dark:hover:text-zinc-50 transition-colors">Tareas</Link>
                        {session ? (
                            <Link
                                href="/profile"
                                className="inline-flex items-center justify-center rounded-lg bg-zinc-900 dark:bg-zinc-50 px-3 py-1.5 text-xs font-semibold text-white dark:text-zinc-950 hover:bg-zinc-800 dark:hover:bg-zinc-200 transition-colors"
                            >
                                Mi Perfil
                            </Link>
                        ) : (
                            <>
                                <Link href="/auth/login" className="hover:text-zinc-900 dark:hover:text-zinc-50 transition-colors">Entrar</Link>
                                <Link
                                    href="/auth/register"
                                    className="inline-flex items-center justify-center rounded-lg bg-zinc-900 dark:bg-zinc-50 px-3 py-1.5 text-xs font-semibold text-white dark:text-zinc-950 hover:bg-zinc-800 dark:hover:bg-zinc-200 transition-colors"
                                >
                                    Registro
                                </Link>
                            </>
                        )}

                        {/* Theme Switcher Button */}
                        <button
                            onClick={toggleTheme}
                            className="p-1.5 rounded-lg border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900/50 hover:bg-zinc-100 dark:hover:bg-zinc-800/80 text-zinc-650 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-50 transition-all active:scale-[0.93] cursor-pointer"
                            aria-label="Alternar tema"
                        >
                            {!mounted ? (
                                <div className="h-4 w-4" />
                            ) : theme === "dark" ? (
                                <Sun className="h-4 w-4 text-yellow-500" />
                            ) : (
                                <Moon className="h-4 w-4 text-zinc-600" />
                            )}
                        </button>
                    </div>
                </div>
            </nav>
            <main className="flex-1">{children}</main>
        </div>
    );
}
