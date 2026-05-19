import { useRouter } from "next/router";
import Link from "next/link";
import { MailOpen, ArrowRight, ExternalLink, ArrowLeft } from "lucide-react";

export default function VerifyPage() {
    const router = useRouter();
    const { email } = router.query;

    // Helper to detect email provider and suggest a link
    const getEmailProviderLink = () => {
        if (!email || typeof email !== "string") return null;
        const domain = email.split("@")[1]?.toLowerCase();
        if (domain === "gmail.com") {
            return { name: "Ir a Gmail", url: "https://mail.google.com" };
        }
        if (domain === "outlook.com" || domain === "hotmail.com" || domain === "live.com") {
            return { name: "Ir a Outlook", url: "https://outlook.live.com" };
        }
        if (domain === "yahoo.com") {
            return { name: "Ir a Yahoo Mail", url: "https://mail.yahoo.com" };
        }
        return null;
    };

    const providerLink = getEmailProviderLink();

    return (
        <div className="flex min-h-screen items-center justify-center bg-zinc-50 px-4 py-12 dark:bg-zinc-950 sm:px-6 lg:px-8">
            <div className="w-full max-w-md text-center space-y-6 rounded-2xl border border-zinc-200/80 bg-white p-8 shadow-xl shadow-zinc-200/30 dark:border-zinc-800/80 dark:bg-zinc-900/50 dark:shadow-none backdrop-blur-xl animate-in zoom-in-95 duration-200">
                {/* Icon Wrapper */}
                <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-yellow-500/10 text-yellow-500 shadow-inner">
                    <MailOpen className="h-8 w-8 animate-bounce duration-1000" />
                </div>

                {/* Main Message */}
                <div className="space-y-2">
                    <h2 className="text-2xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50">
                        Verifica tu correo
                    </h2>
                    <p className="text-sm text-zinc-600 dark:text-zinc-400">
                        Te hemos enviado un enlace de confirmación a tu bandeja de entrada.
                    </p>
                    {email && (
                        <div className="inline-block mt-2 rounded-full bg-zinc-100 dark:bg-zinc-800 px-3.5 py-1 text-xs font-semibold text-zinc-800 dark:text-zinc-300">
                            {email}
                        </div>
                    )}
                </div>

                {/* Instructions */}
                <div className="rounded-xl border border-zinc-100 bg-zinc-50/50 p-4 text-left text-xs text-zinc-500 dark:border-zinc-800/40 dark:bg-zinc-950/20 dark:text-zinc-400 space-y-2">
                    <p className="font-semibold text-zinc-700 dark:text-zinc-300">¿Qué debo hacer?</p>
                    <ol className="list-decimal list-inside space-y-1.5 leading-relaxed">
                        <li>Abre tu correo electrónico.</li>
                        <li>Busca el mensaje de confirmación de <strong>SinLuzify</strong>.</li>
                        <li>Haz clic en el enlace de verificación para activar tu cuenta.</li>
                    </ol>
                </div>

                {/* Navigation and Provider Shortcuts */}
                <div className="space-y-3 pt-2">
                    {providerLink && (
                        <a
                            href={providerLink.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex w-full items-center justify-center gap-2 rounded-lg bg-zinc-900 px-4 py-2.5 text-sm font-semibold text-white shadow-lg hover:bg-zinc-800 dark:bg-zinc-50 dark:text-zinc-900 dark:hover:bg-zinc-200 transition-all active:scale-[0.98]"
                        >
                            <span>{providerLink.name}</span>
                            <ExternalLink className="h-4 w-4" />
                        </a>
                    )}

                    <Link
                        href="/auth/login"
                        className="flex w-full items-center justify-center gap-2 rounded-lg border border-zinc-200 bg-white px-4 py-2.5 text-sm font-semibold text-zinc-700 hover:bg-zinc-50 dark:border-zinc-800 dark:bg-zinc-950/50 dark:text-zinc-300 dark:hover:bg-zinc-900/50 transition-all active:scale-[0.98]"
                    >
                        <span>Ya verifiqué, ir a Iniciar Sesión</span>
                        <ArrowRight className="h-4 w-4" />
                    </Link>
                </div>

                {/* Return */}
                <div className="pt-2 border-t border-zinc-100 dark:border-zinc-800/60">
                    <Link
                        href="/"
                        className="inline-flex items-center gap-1.5 text-xs font-semibold text-zinc-500 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-200 transition-colors"
                    >
                        <ArrowLeft className="h-3.5 w-3.5" />
                        <span>Volver al inicio</span>
                    </Link>
                </div>
            </div>
        </div>
    );
}
