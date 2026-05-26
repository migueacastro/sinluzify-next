import Link from "next/link";
import { useState, useEffect } from "react";
import { Sun, Moon, LogOut, Menu, X, Zap } from "lucide-react";
import { useAuthGuard } from "@/hooks/useAuthGuard";
import { signOut } from "next-auth/react";

export default function Layout({ children }: { children: React.ReactNode }) {
    const { session, isLoading } = useAuthGuard();
    const [mounted, setMounted] = useState(false);
    const [theme, setTheme] = useState<"light" | "dark">("dark");
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

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
            <nav className="border-b border-zinc-200 dark:border-zinc-900 bg-white/70 dark:bg-zinc-950/70 sticky top-0 z-50 transition-colors duration-200">
                <div className="mx-auto max-w-6xl px-4 py-3 flex items-center justify-between">
                    <Link href="/" className="flex items-center gap-2 font-bold tracking-tight text-lg text-zinc-900 dark:text-white">
                        <Zap className="h-5 w-5 text-yellow-500 fill-yellow-500 animate-pulse animate-duration-1000" />
                        <span>SinLuzify</span>
                    </Link>

                    {/* Desktop Menu */}
                    <div className="hidden sm:flex items-center gap-4 text-sm font-medium text-zinc-500 dark:text-zinc-400">
                        {session ? (
                            <>
                                <Link href="/dashboard" className="hover:text-zinc-900 dark:hover:text-zinc-50 transition-colors">Panel</Link>
                                <Link href="/sessions" className="hover:text-zinc-900 dark:hover:text-zinc-50 transition-colors">Historial</Link>
                                <Link
                                    href="/profile"
                                    className="hover:text-zinc-900 dark:hover:text-zinc-50 transition-colors"
                                >
                                    Mi Perfil
                                </Link>
                                <button
                                    onClick={() => signOut({ callbackUrl: "/auth/login" })}
                                    className="inline-flex items-center justify-center gap-1.5 rounded-lg border border-red-200/80 dark:border-red-950/30 bg-red-50/50 dark:bg-red-950/30 px-3 py-1.5 text-xs font-semibold text-red-600 dark:text-red-400 hover:bg-red-600 hover:text-white dark:hover:bg-red-600 dark:hover:text-white transition-all active:scale-[0.96] cursor-pointer"
                                >
                                    <LogOut className="h-3.5 w-3.5" />
                                    <span>Cerrar Sesión</span>
                                </button>
                            </>
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

                    {/* Mobile Menu Button (Hamburger) */}
                    <div className="flex sm:hidden items-center gap-3">
                        {/* Theme Switcher Button Mobile */}
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

                        <button
                            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                            className="p-1.5 rounded-lg border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900/50 hover:bg-zinc-100 dark:hover:bg-zinc-800/80 text-zinc-650 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-50 transition-all cursor-pointer"
                            aria-label="Menú"
                        >
                            {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
                        </button>
                    </div>
                </div>

                {/* Mobile Menu Dropdown Panel */}
                {mobileMenuOpen && (
                    <div className="sm:hidden border-t border-zinc-200 dark:border-zinc-900 bg-white dark:bg-zinc-950 px-4 py-4 space-y-3 transition-all duration-200 ease-in-out">
                        {session ? (
                            <div className="flex flex-col gap-3">
                                <Link
                                    href="/dashboard"
                                    onClick={() => setMobileMenuOpen(false)}
                                    className="block px-3 py-2 rounded-lg hover:bg-zinc-100 dark:hover:bg-zinc-900/80 text-zinc-700 dark:text-zinc-300 font-semibold transition-colors"
                                >
                                    Panel
                                </Link>
                                <Link
                                    href="/sessions"
                                    onClick={() => setMobileMenuOpen(false)}
                                    className="block px-3 py-2 rounded-lg hover:bg-zinc-100 dark:hover:bg-zinc-900/80 text-zinc-700 dark:text-zinc-300 font-semibold transition-colors"
                                >
                                    Historial
                                </Link>
                                <Link
                                    href="/profile"
                                    onClick={() => setMobileMenuOpen(false)}
                                    className="block px-3 py-2 rounded-lg hover:bg-zinc-100 dark:hover:bg-zinc-900/80 text-zinc-700 dark:text-zinc-300 font-semibold transition-colors"
                                >
                                    Mi Perfil
                                </Link>
                                <button
                                    onClick={() => {
                                        setMobileMenuOpen(false);
                                        signOut({ callbackUrl: "/auth/login" });
                                    }}
                                    className="w-full flex items-center justify-center gap-1.5 rounded-lg border border-red-200/80 dark:border-red-950/30 bg-red-50/50 dark:bg-red-950/30 py-2.5 text-sm font-semibold text-red-600 dark:text-red-400 hover:bg-red-600 hover:text-white dark:hover:bg-red-600 dark:hover:text-white transition-all cursor-pointer"
                                >
                                    <LogOut className="h-4 w-4" />
                                    <span>Cerrar Sesión</span>
                                </button>
                            </div>
                        ) : (
                            <div className="flex flex-col gap-3">
                                <Link
                                    href="/auth/login"
                                    onClick={() => setMobileMenuOpen(false)}
                                    className="block px-3 py-2 rounded-lg hover:bg-zinc-100 dark:hover:bg-zinc-900/80 text-zinc-700 dark:text-zinc-300 font-semibold transition-colors"
                                >
                                    Entrar
                                </Link>
                                <Link
                                    href="/auth/register"
                                    onClick={() => setMobileMenuOpen(false)}
                                    className="w-full flex items-center justify-center rounded-lg bg-zinc-900 dark:bg-zinc-50 py-2 text-sm font-semibold text-white dark:text-zinc-950 hover:bg-zinc-800 dark:hover:bg-zinc-200 transition-colors"
                                >
                                    Registro
                                </Link>
                            </div>
                        )}
                    </div>
                )}
            </nav>
            <main className="flex-1">{children}</main>
        </div>
    );
}
