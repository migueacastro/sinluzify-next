import Link from "next/link";
import { Zap } from "lucide-react";

export default function Layout({ children }: { children: React.ReactNode }) {
    return (
        <div className="min-h-screen bg-zinc-950 text-zinc-50 flex flex-col">
            {/* Sticky Minimalist Navbar with Backdrop Blur */}
            <nav className="border-b border-zinc-900 bg-zinc-950/70 backdrop-blur-md sticky top-0 z-50">
                <div className="mx-auto max-w-6xl px-4 py-3 flex items-center justify-between">
                    <Link href="/" className="flex items-center gap-2 font-bold tracking-tight">
                        <Zap className="h-4 w-4 text-yellow-500 fill-current" />
                        <span>SinLuzify</span>
                    </Link>
                    <div className="flex items-center gap-5 text-sm font-medium text-zinc-400">
                        <Link href="/todos" className="hover:text-zinc-50 transition-colors">Tareas</Link>
                        <Link href="/auth/login" className="hover:text-zinc-50 transition-colors">Entrar</Link>
                        <Link
                            href="/auth/register"
                            className="inline-flex items-center justify-center rounded-lg bg-zinc-50 px-3 py-1.5 text-xs font-semibold text-zinc-950 hover:bg-zinc-200 transition-colors"
                        >
                            Registro
                        </Link>
                    </div>
                </div>
            </nav>
            <main className="flex-1">{children}</main>
        </div>
    );
}
