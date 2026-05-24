import Link from "next/link";
import {
  ZapOff,
  ArrowRight,
  Layout,
  ShieldCheck,
} from "lucide-react";

export default function Home() {
  return (
    <div className="relative min-h-screen overflow-hidden bg-zinc-50 text-zinc-900 dark:bg-zinc-950 dark:text-zinc-50 font-sans selection:bg-zinc-950 selection:text-zinc-50 dark:selection:bg-zinc-50 dark:selection:text-zinc-950">
      {/* Background decorative glowing circles */}
      <div className="absolute top-0 -left-40 h-150 w-150 rounded-full bg-yellow-500/10 blur-[120px] pointer-events-none dark:bg-yellow-500/5" />
      <div className="absolute bottom-0 -right-40 h-150 w-150 rounded-full bg-zinc-200/50 blur-[120px] pointer-events-none dark:bg-zinc-800/20" />

      <div className="relative z-10 mx-auto max-w-6xl px-4 py-20 sm:px-6 lg:px-8">
        <main className="mt-20 text-center sm:mt-28">
          <div className="mx-auto inline-flex items-center gap-2 rounded-full border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900/50 px-4 py-1.5 text-xs text-zinc-600 dark:text-zinc-400">
            <ZapOff className="h-3.5 w-3.5 text-yellow-500" />
            <span>Monitoreo de energía eléctrica en tiempo real</span>
          </div>

          <h1 className="mt-8 text-4xl font-extrabold tracking-tight sm:text-6xl bg-linear-to-b from-zinc-900 to-zinc-500 dark:from-zinc-50 dark:via-zinc-100 dark:to-zinc-500 bg-clip-text text-transparent max-w-4xl mx-auto leading-tight">
            ¿Te quedaste sin luz? Mantente informado
          </h1>
          <p className="mt-6 text-lg text-zinc-600 dark:text-zinc-400 max-w-2xl mx-auto leading-relaxed">
            SinLuzify es tu plataforma premium para reportar, monitorear y
            recibir notificaciones instantáneas sobre cortes de energía
            eléctrica en tu zona de forma colaborativa.
          </p>

          {/* Navigation Cards/Actions Grid */}
          <div className="mt-16 grid gap-6 sm:grid-cols-2 lg:grid-cols-3 text-left">
            {/* Card 1: Iniciar Sesión */}
            <Link
              href="/auth/login"
              className="group relative rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white/80 dark:bg-zinc-900/30 p-6 transition-all hover:border-zinc-300 dark:hover:border-zinc-700 hover:shadow-lg"
            >
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-zinc-100 dark:bg-zinc-800 text-zinc-800 dark:text-zinc-50 group-hover:bg-zinc-900 group-hover:text-white dark:group-hover:bg-zinc-50 dark:group-hover:text-zinc-900 transition-all">
                <Layout className="h-6 w-6" />
              </div>
              <h3 className="mt-5 text-lg font-bold text-zinc-800 dark:text-zinc-100 group-hover:text-black dark:group-hover:text-white">
                Iniciar Sesión
              </h3>
              <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-400 leading-relaxed">
                Accede a tu panel personalizado utilizando NextAuth v5 y
                Supabase como proveedor seguro.
              </p>
              <div className="mt-4 inline-flex items-center gap-1 text-xs font-semibold text-zinc-500 dark:text-zinc-400 group-hover:text-yellow-500 transition-colors">
                <span>Entrar al Panel</span>
                <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-1" />
              </div>
            </Link>

            {/* Card 2: Registrarse */}
            <Link
              href="/auth/register"
              className="group relative rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white/80 dark:bg-zinc-900/30 p-6 transition-all hover:border-zinc-300 dark:hover:border-zinc-700 hover:shadow-lg"
            >
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-zinc-100 dark:bg-zinc-800 text-zinc-800 dark:text-zinc-50 group-hover:bg-zinc-900 group-hover:text-white dark:group-hover:bg-zinc-50 dark:group-hover:text-zinc-900 transition-all">
                <ShieldCheck className="h-6 w-6" />
              </div>
              <h3 className="mt-5 text-lg font-bold text-zinc-800 dark:text-zinc-100 group-hover:text-black dark:group-hover:text-white">
                Crear Cuenta
              </h3>
              <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-400 leading-relaxed">
                Regístrate de forma directa en Supabase Auth y activa el flujo
                colaborativo de reportes.
              </p>
              <div className="mt-4 inline-flex items-center gap-1 text-xs font-semibold text-zinc-500 dark:text-zinc-400 group-hover:text-yellow-500 transition-colors">
                <span>Registrarse gratis</span>
                <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-1" />
              </div>
            </Link>

            {/* Card 3: Centro de Control */}
            <Link
              href="/dashboard"
              className="group relative rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white/80 dark:bg-zinc-900/30 p-6 transition-all hover:border-zinc-300 dark:hover:border-zinc-700 hover:shadow-lg sm:col-span-2 lg:col-span-1"
            >
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-zinc-100 dark:bg-zinc-800 text-zinc-800 dark:text-zinc-50 group-hover:bg-zinc-900 group-hover:text-white dark:group-hover:bg-zinc-50 dark:group-hover:text-zinc-900 transition-all">
                <Layout className="h-6 w-6" />
              </div>
              <h3 className="mt-5 text-lg font-bold text-zinc-800 dark:text-zinc-100 group-hover:text-black dark:group-hover:text-white">
                Centro de Control
              </h3>
              <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-400 leading-relaxed">
                Accede al centro colaborativo para reportar apagones,
                administrar tus grupos y coordinar jornadas en tiempo real.
              </p>
              <div className="mt-4 inline-flex items-center gap-1 text-xs font-semibold text-zinc-500 dark:text-zinc-400 group-hover:text-yellow-500 transition-colors">
                <span>Ir al Centro de Control</span>
                <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-1" />
              </div>
            </Link>
          </div>
        </main>

        {/* Footer */}
        <footer className="mt-28 border-t border-zinc-200 dark:border-zinc-800 pt-8 text-center text-xs text-zinc-500 dark:text-zinc-600">
          <p>
            © {new Date().getFullYear()} SinLuzify. Todos los derechos
            reservados. pair programming with Antigravity AI.
          </p>
        </footer>
      </div>
    </div>
  );
}