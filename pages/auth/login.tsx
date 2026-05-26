import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/router";
import Link from "next/link";
import { Mail, Lock, Loader2, ArrowRight, ShieldAlert } from "lucide-react";

export default function LoginPage() {
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
        event.preventDefault();
        setLoading(true);
        setError(null);

        const formData = new FormData(event.currentTarget);
        const email = formData.get("email") as string;
        const password = formData.get("password") as string;

        try {
            const result = await signIn("credentials", {
                redirect: false,
                email,
                password
            });

            if (result?.ok && !result.error) {
                router.push("/profile");
            } else {
                setError("Credenciales incorrectas. Por favor, verifica tu correo y contraseña.");
            }
        } catch (err) {
            setError("Ocurrió un error inesperado al iniciar sesión.");
        } finally {
            setLoading(false);
        }
    }

    return (
        <div className="flex min-h-screen items-center justify-center bg-zinc-50 px-4 py-12 dark:bg-zinc-950 sm:px-6 lg:px-8">
            <div className="w-full max-w-md space-y-8">
                {/* Header */}
                <div className="text-center">
                    <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-xl bg-zinc-900 text-white dark:bg-zinc-50 dark:text-zinc-900 shadow-lg shadow-zinc-900/10 dark:shadow-zinc-50/10">
                        <Lock className="h-6 w-6" />
                    </div>
                    <h2 className="mt-6 text-3xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50">
                        Bienvenido de nuevo
                    </h2>
                    <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-400">
                        Ingresa tus credenciales para acceder a tu cuenta
                    </p>
                </div>

                {/* Card Container */}
                <div className="rounded-2xl border border-zinc-200/80 bg-white p-8 shadow-xl shadow-zinc-200/30 dark:border-zinc-800/80 dark:bg-zinc-900/50 dark:shadow-none ">
                    <form onSubmit={handleSubmit} className="space-y-6">
                        {/* Error Alert */}
                        {error && (
                            <div className="flex items-center gap-3 rounded-lg border border-red-200 bg-red-50/50 p-3.5 text-sm text-red-600 dark:border-red-900/30 dark:bg-red-950/20 dark:text-red-400 animate-in fade-in slide-in-from-top-1 duration-200">
                                <ShieldAlert className="h-5 w-5 shrink-0" />
                                <p className="font-medium leading-5">{error}</p>
                            </div>
                        )}

                        <div className="space-y-5">
                            {/* Email Field */}
                            <div>
                                <label htmlFor="email" className="block text-xs font-semibold uppercase tracking-wider text-zinc-500 dark:text-zinc-400">
                                    Correo Electrónico
                                </label>
                                <div className="relative mt-1.5 rounded-lg shadow-sm">
                                    <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                                        <Mail className="h-5 w-5 text-zinc-400" />
                                    </div>
                                    <input
                                        id="email"
                                        name="email"
                                        type="email"
                                        autoComplete="email"
                                        required
                                        placeholder="tu@ejemplo.com"
                                        disabled={loading}
                                        className="block w-full rounded-lg border border-zinc-200 bg-zinc-50/50 py-2.5 pl-10 pr-3 text-sm text-zinc-900 placeholder-zinc-400 outline-none transition-all focus:border-yellow-500 focus:bg-white focus:ring-1 focus:ring-yellow-500 disabled:cursor-not-allowed disabled:opacity-50 dark:border-zinc-800 dark:bg-zinc-950/50 dark:text-zinc-50 dark:focus:border-yellow-400 dark:focus:bg-zinc-950 dark:focus:ring-yellow-400"
                                    />
                                </div>
                            </div>

                            {/* Password Field */}
                            <div>
                                <div className="flex items-center justify-between">
                                    <label htmlFor="password" className="block text-xs font-semibold uppercase tracking-wider text-zinc-500 dark:text-zinc-400">
                                        Contraseña
                                    </label>
                                </div>
                                <div className="relative mt-1.5 rounded-lg shadow-sm">
                                    <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                                        <Lock className="h-5 w-5 text-zinc-400" />
                                    </div>
                                    <input
                                        id="password"
                                        name="password"
                                        type="password"
                                        autoComplete="current-password"
                                        required
                                        placeholder="••••••••"
                                        disabled={loading}
                                        className="block w-full rounded-lg border border-zinc-200 bg-zinc-50/50 py-2.5 pl-10 pr-3 text-sm text-zinc-900 placeholder-zinc-400 outline-none transition-all focus:border-yellow-500 focus:bg-white focus:ring-1 focus:ring-yellow-500 disabled:cursor-not-allowed disabled:opacity-50 dark:border-zinc-800 dark:bg-zinc-950/50 dark:text-zinc-50 dark:focus:border-yellow-400 dark:focus:bg-zinc-950 dark:focus:ring-yellow-400"
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Submit Button */}
                        <button
                            type="submit"
                            disabled={loading}
                            className="group flex w-full items-center justify-center gap-2 rounded-lg bg-zinc-900 px-4 py-2.5 text-sm font-semibold text-white shadow-lg transition-all hover:bg-zinc-800 active:scale-[0.98] disabled:pointer-events-none disabled:opacity-50 dark:bg-zinc-50 dark:text-zinc-900 dark:hover:bg-zinc-200"
                        >
                            {loading ? (
                                <>
                                    <Loader2 className="h-4 w-4 animate-spin" />
                                    <span>Iniciando sesión...</span>
                                </>
                            ) : (
                                <>
                                    <span>Iniciar Sesión</span>
                                    <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
                                </>
                            )}
                        </button>
                    </form>
                </div>

                {/* Footer Link */}
                <p className="text-center text-sm text-zinc-600 dark:text-zinc-400">
                    ¿No tienes una cuenta?{" "}
                    <Link
                        href="/auth/register"
                        className="font-semibold text-zinc-900 hover:underline dark:text-zinc-50"
                    >
                        Regístrate gratis
                    </Link>
                </p>
            </div>
        </div>
    );
}
