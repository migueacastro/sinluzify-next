import Link from "next/link";
import { Zap, ZapOff, ArrowRight, Layout, Database, ShieldCheck, ListTodo } from "lucide-react";

export default function Home() {
    return (
        <div className="relative min-h-screen overflow-hidden bg-zinc-950 text-zinc-50 font-sans selection:bg-zinc-50 selection:text-zinc-950">
            {/* Background decorative glowing circles */}
            <div className="absolute top-0 -left-40 h-[600px] w-[600px] rounded-full bg-yellow-500/10 blur-[120px] pointer-events-none" />
            <div className="absolute bottom-0 -right-40 h-[600px] w-[600px] rounded-full bg-zinc-800/20 blur-[120px] pointer-events-none" />

            <div className="relative z-10 mx-auto max-w-6xl px-4 py-20 sm:px-6 lg:px-8">
                {/* Header/Navbar */}
                <header className="flex items-center justify-between border-b border-zinc-900 pb-6">
                    <div className="flex items-center gap-2.5">
                        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-tr from-yellow-500 to-amber-400 text-zinc-950 shadow-md shadow-yellow-500/10">
                            <Zap className="h-5 w-5 fill-current" />
                        </div>
                        <span className="text-xl font-bold tracking-tight bg-gradient-to-r from-zinc-50 to-zinc-400 bg-clip-text text-transparent">
                            SinLuzify
                        </span>
                    </div>
                    <div className="flex items-center gap-4">
                        <Link
                            href="/auth/login"
                            className="text-sm font-medium text-zinc-400 hover:text-zinc-50 transition-colors"
                        >
                            Iniciar Sesión
                        </Link>
                        <Link
                            href="/auth/register"
                            className="inline-flex items-center justify-center rounded-lg bg-zinc-50 px-4 py-2 text-sm font-semibold text-zinc-950 hover:bg-zinc-200 transition-all active:scale-95"
                        >
                            Registrarse
                        </Link>
                    </div>
                </header>

                {/* Hero Section */}
                <main className="mt-20 text-center sm:mt-28">
                    <div className="mx-auto inline-flex items-center gap-2 rounded-full border border-zinc-800 bg-zinc-900/50 px-4 py-1.5 text-xs text-zinc-400 backdrop-blur-md">
                        <ZapOff className="h-3.5 w-3.5 text-yellow-500" />
                        <span>Monitoreo de energía eléctrica en tiempo real</span>
                    </div>
                    
                    <h1 className="mt-8 text-4xl font-extrabold tracking-tight sm:text-6xl bg-gradient-to-b from-zinc-50 via-zinc-100 to-zinc-500 bg-clip-text text-transparent max-w-4xl mx-auto leading-tight">
                        ¿Te quedaste sin luz? Mantente informado
                    </h1>
                    <p className="mt-6 text-lg text-zinc-400 max-w-2xl mx-auto leading-relaxed">
                        SinLuzify es tu plataforma premium para reportar, monitorear y recibir notificaciones instantáneas sobre cortes de energía eléctrica en tu zona de forma colaborativa.
                    </p>

                    {/* Navigation Cards/Actions Grid */}
                    <div className="mt-16 grid gap-6 sm:grid-cols-2 lg:grid-cols-3 text-left">
                        {/* Card 1: Iniciar Sesión */}
                        <Link
                            href="/auth/login"
                            className="group relative rounded-2xl border border-zinc-900 bg-zinc-900/30 p-6 transition-all hover:border-zinc-800 hover:bg-zinc-900/50 hover:shadow-lg hover:shadow-zinc-950/20 backdrop-blur-xl"
                        >
                            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-zinc-800 text-zinc-50 group-hover:bg-zinc-50 group-hover:text-zinc-950 transition-all">
                                <Layout className="h-6 w-6" />
                            </div>
                            <h3 className="mt-5 text-lg font-bold text-zinc-100 group-hover:text-white">
                                Iniciar Sesión
                            </h3>
                            <p className="mt-2 text-sm text-zinc-400 leading-relaxed">
                                Accede a tu panel personalizado utilizando NextAuth v5 y Supabase como proveedor seguro.
                            </p>
                            <div className="mt-4 inline-flex items-center gap-1 text-xs font-semibold text-zinc-400 group-hover:text-yellow-500 transition-colors">
                                <span>Entrar al Panel</span>
                                <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-1" />
                            </div>
                        </Link>

                        {/* Card 2: Registrarse */}
                        <Link
                            href="/auth/register"
                            className="group relative rounded-2xl border border-zinc-900 bg-zinc-900/30 p-6 transition-all hover:border-zinc-800 hover:bg-zinc-900/50 hover:shadow-lg hover:shadow-zinc-950/20 backdrop-blur-xl"
                        >
                            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-zinc-800 text-zinc-50 group-hover:bg-zinc-50 group-hover:text-zinc-950 transition-all">
                                <ShieldCheck className="h-6 w-6" />
                            </div>
                            <h3 className="mt-5 text-lg font-bold text-zinc-100 group-hover:text-white">
                                Crear Cuenta
                            </h3>
                            <p className="mt-2 text-sm text-zinc-400 leading-relaxed">
                                Regístrate de forma directa en Supabase Auth y activa el flujo colaborativo de reportes.
                            </p>
                            <div className="mt-4 inline-flex items-center gap-1 text-xs font-semibold text-zinc-400 group-hover:text-yellow-500 transition-colors">
                                <span>Registrarse gratis</span>
                                <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-1" />
                            </div>
                        </Link>

                        {/* Card 3: Ver Tareas / Database Check */}
                        <Link
                            href="/todos"
                            className="group relative rounded-2xl border border-zinc-900 bg-zinc-900/30 p-6 transition-all hover:border-zinc-800 hover:bg-zinc-900/50 hover:shadow-lg hover:shadow-zinc-950/20 backdrop-blur-xl sm:col-span-2 lg:col-span-1"
                        >
                            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-zinc-800 text-zinc-50 group-hover:bg-zinc-50 group-hover:text-zinc-950 transition-all">
                                <ListTodo className="h-6 w-6" />
                            </div>
                            <h3 className="mt-5 text-lg font-bold text-zinc-100 group-hover:text-white">
                                Probar Conexión
                            </h3>
                            <p className="mt-2 text-sm text-zinc-400 leading-relaxed">
                                Consulta la base de datos de Supabase y visualiza el listado de tareas en tiempo real desde la ruta `/todos`.
                            </p>
                            <div className="mt-4 inline-flex items-center gap-1 text-xs font-semibold text-zinc-400 group-hover:text-yellow-500 transition-colors">
                                <span>Ver listado de Tareas</span>
                                <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-1" />
                            </div>
                        </Link>
                    </div>
                </main>

                {/* Footer */}
                <footer className="mt-28 border-t border-zinc-900 pt-8 text-center text-xs text-zinc-600">
                    <p>© {new Date().getFullYear()} SinLuzify. Todos los derechos reservados. pair programming with Antigravity AI.</p>
                </footer>
            </div>
        </div>
    );
}
