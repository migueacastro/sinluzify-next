import { useState } from "react";
import { useRouter } from "next/router";
import Link from "next/link";
import { supabase } from "@/lib/supabase";
import { Mail, Lock, Loader2, ArrowRight, UserPlus, ShieldAlert, CheckCircle2 } from "lucide-react";

export default function RegisterPage() {
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState(false);

    async function handleSubmit(event: React.SubmitEvent<HTMLFormElement>) {
        event.preventDefault();
        setLoading(true);
        setError(null);

        const formData = new FormData(event.currentTarget);
        const email = formData.get("email") as string;
        const password = formData.get("password") as string;
        const confirmPassword = formData.get("confirmPassword") as string;

        if (password !== confirmPassword) {
            setError("Las contraseñas no coinciden.");
            setLoading(false);
            return;
        }

        if (password.length < 6) {
            setError("La contraseña debe tener al menos 6 caracteres.");
            setLoading(false);
            return;
        }

        try {
            const { data, error: signUpError } = await supabase.auth.signUp({
                email,
                password,
            });

            if (signUpError) {
                setError(signUpError.message);
            } else if (data?.user) {
                router.push(`/auth/verify/verify?email=${encodeURIComponent(email)}`);
            } else {
                setError("Ocurrió un error inesperado al registrar el usuario.");
            }
        } catch (err) {
            setError("Ocurrió un error de red o de servidor.");
        } finally {
            setLoading(false);
        }
    }

    if (success) {
        return (
            <div className="flex min-h-screen items-center justify-center bg-zinc-50 px-4 py-12 dark:bg-zinc-950 sm:px-6 lg:px-8">
                <div className="w-full max-w-md text-center space-y-6 rounded-2xl border border-zinc-200/80 bg-white p-8 shadow-xl dark:border-zinc-800/80 dark:bg-zinc-900/50 backdrop-blur-xl animate-in zoom-in-95 duration-200">
                    <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-emerald-50 text-emerald-600 dark:bg-emerald-950/30 dark:text-emerald-400">
                        <CheckCircle2 className="h-8 w-8" />
                    </div>
                    <div className="space-y-2">
                        <h2 className="text-2xl font-bold text-zinc-900 dark:text-zinc-50">
                            ¡Registro Exitoso!
                        </h2>
                        <p className="text-sm text-zinc-600 dark:text-zinc-400">
                            Tu cuenta ha sido creada correctamente con Supabase Auth.
                        </p>
                    </div>
                    <div className="rounded-lg bg-zinc-50 p-4 text-xs text-zinc-500 dark:bg-zinc-950/40 dark:text-zinc-400 text-left border border-zinc-100 dark:border-zinc-800/50">
                        Si la confirmación por correo está activada en tu consola de Supabase, por favor revisa tu correo electrónico para verificar tu cuenta antes de iniciar sesión.
                    </div>
                    <Link
                        href="/auth/login"
                        className="flex w-full items-center justify-center gap-2 rounded-lg bg-zinc-900 px-4 py-2.5 text-sm font-semibold text-white shadow-lg transition-all hover:bg-zinc-800 dark:bg-zinc-50 dark:text-zinc-900 dark:hover:bg-zinc-200"
                    >
                        <span>Ir al inicio de sesión</span>
                        <ArrowRight className="h-4 w-4" />
                    </Link>
                </div>
            </div>
        );
    }

    return (
        <div className="flex min-h-screen items-center justify-center bg-zinc-50 px-4 py-12 dark:bg-zinc-950 sm:px-6 lg:px-8">
            <div className="w-full max-w-md space-y-8">
                {/* Header */}
                <div className="text-center">
                    <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-xl bg-zinc-900 text-white dark:bg-zinc-50 dark:text-zinc-900 shadow-lg shadow-zinc-900/10 dark:shadow-zinc-50/10">
                        <UserPlus className="h-6 w-6" />
                    </div>
                    <h2 className="mt-6 text-3xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50">
                        Crea una cuenta
                    </h2>
                    <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-400">
                        Regístrate gratis para empezar a usar la aplicación
                    </p>
                </div>

                {/* Card Container */}
                <div className="rounded-2xl border border-zinc-200/80 bg-white p-8 shadow-xl shadow-zinc-200/30 dark:border-zinc-800/80 dark:bg-zinc-900/50 dark:shadow-none backdrop-blur-xl">
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
                                        className="block w-full rounded-lg border border-zinc-200 bg-zinc-50/50 py-2.5 pl-10 pr-3 text-sm text-zinc-900 placeholder-zinc-400 outline-none transition-all focus:border-zinc-900 focus:bg-white focus:ring-1 focus:ring-zinc-900 disabled:cursor-not-allowed disabled:opacity-50 dark:border-zinc-800 dark:bg-zinc-950/50 dark:text-zinc-50 dark:focus:border-zinc-50 dark:focus:bg-zinc-950 dark:focus:ring-zinc-50"
                                    />
                                </div>
                            </div>

                            {/* Password Field */}
                            <div>
                                <label htmlFor="password" className="block text-xs font-semibold uppercase tracking-wider text-zinc-500 dark:text-zinc-400">
                                    Contraseña
                                </label>
                                <div className="relative mt-1.5 rounded-lg shadow-sm">
                                    <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                                        <Lock className="h-5 w-5 text-zinc-400" />
                                    </div>
                                    <input
                                        id="password"
                                        name="password"
                                        type="password"
                                        required
                                        placeholder="Mínimo 6 caracteres"
                                        disabled={loading}
                                        className="block w-full rounded-lg border border-zinc-200 bg-zinc-50/50 py-2.5 pl-10 pr-3 text-sm text-zinc-900 placeholder-zinc-400 outline-none transition-all focus:border-zinc-900 focus:bg-white focus:ring-1 focus:ring-zinc-900 disabled:cursor-not-allowed disabled:opacity-50 dark:border-zinc-800 dark:bg-zinc-950/50 dark:text-zinc-50 dark:focus:border-zinc-50 dark:focus:bg-zinc-950 dark:focus:ring-zinc-50"
                                    />
                                </div>
                            </div>

                            {/* Confirm Password Field */}
                            <div>
                                <label htmlFor="confirmPassword" className="block text-xs font-semibold uppercase tracking-wider text-zinc-500 dark:text-zinc-400">
                                    Confirmar Contraseña
                                </label>
                                <div className="relative mt-1.5 rounded-lg shadow-sm">
                                    <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                                        <Lock className="h-5 w-5 text-zinc-400" />
                                    </div>
                                    <input
                                        id="confirmPassword"
                                        name="confirmPassword"
                                        type="password"
                                        required
                                        placeholder="Repite tu contraseña"
                                        disabled={loading}
                                        className="block w-full rounded-lg border border-zinc-200 bg-zinc-50/50 py-2.5 pl-10 pr-3 text-sm text-zinc-900 placeholder-zinc-400 outline-none transition-all focus:border-zinc-900 focus:bg-white focus:ring-1 focus:ring-zinc-900 disabled:cursor-not-allowed disabled:opacity-50 dark:border-zinc-800 dark:bg-zinc-950/50 dark:text-zinc-50 dark:focus:border-zinc-50 dark:focus:bg-zinc-950 dark:focus:ring-zinc-50"
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
                                    <span>Creando cuenta...</span>
                                </>
                            ) : (
                                <>
                                    <span>Registrarse</span>
                                    <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
                                </>
                            )}
                        </button>
                    </form>
                </div>

                {/* Footer Link */}
                <p className="text-center text-sm text-zinc-600 dark:text-zinc-400">
                    ¿Ya tienes una cuenta?{" "}
                    <Link
                        href="/auth/login"
                        className="font-semibold text-zinc-900 hover:underline dark:text-zinc-50"
                    >
                        Inicia sesión
                    </Link>
                </p>
            </div>
        </div>
    );
}
