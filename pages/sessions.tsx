import React, { useState, useEffect } from "react";
import { GetServerSideProps } from "next";
import { auth } from "@/auth";
import { supabase } from "@/lib/supabase";
import {
    Zap, ZapOff, Users, Loader2, ChevronDown, ChevronUp,
    History, Search, Calendar, Compass, Clock, AlertTriangle, CheckCircle2
} from "lucide-react";

interface SessionsProps {
    session: {
        user?: {
            id?: string;
            name?: string;
            email?: string;
        };
        accessToken?: string;
        refreshToken?: string;
        expires?: string;
    };
}

export default function SessionsHistoryPage({ session }: SessionsProps) {
    const user = session.user;
    const userId = user?.id;

    // Loading & Notification states
    const [loading, setLoading] = useState(true);
    const [sessionReady, setSessionReady] = useState(false);
    const [alert, setAlert] = useState<{ type: "success" | "error"; message: string } | null>(null);

    // Groups & Memberships states
    const [ownedGroups, setOwnedGroups] = useState<any[]>([]);
    const [joinedGroups, setJoinedGroups] = useState<any[]>([]);
    const [selectedGroupId, setSelectedGroupId] = useState<string>("");

    // Historical Session state
    const [sessionHistory, setSessionHistory] = useState<any[]>([]);
    const [historyExpanded, setHistoryExpanded] = useState<boolean>(true);
    const [sessionSearch, setSessionSearch] = useState("");
    const [statusFilter, setStatusFilter] = useState<"all" | "active" | "completed">("all");
    const [expandedSessions, setExpandedSessions] = useState<Record<number, boolean>>({});

    // Date Range Filters
    const [startDate, setStartDate] = useState<string>("");
    const [endDate, setEndDate] = useState<string>("");

    // Helper to calculate and format duration between two times (live counting if end is null)
    const formatDuration = (startStr: string, endStr: string | null) => {
        const start = new Date(startStr).getTime();
        const end = endStr ? new Date(endStr).getTime() : new Date().getTime();
        const diffMs = Math.max(0, end - start);
        const hours = Math.floor(diffMs / 3600000);
        const minutes = Math.floor((diffMs % 3600000) / 60000);
        const seconds = Math.floor((diffMs % 60000) / 1000);
        const pad = (num: number) => String(num).padStart(2, "0");
        return `${pad(hours)}:${pad(minutes)}:${pad(seconds)}`;
    };

    // Toggle session detail collapse
    const toggleSessionExpand = (sessionId: number) => {
        setExpandedSessions((prev) => ({
            ...prev,
            [sessionId]: !prev[sessionId]
        }));
    };

    // Synchronize client-side Supabase client with NextAuth token
    useEffect(() => {
        const syncSession = async () => {
            const token = session?.accessToken;
            const refreshToken = session?.refreshToken;

            console.log("🔄 NextAuth Session sync (Sessions Page):", { 
                hasUser: !!session?.user,
                userId: session?.user?.id,
                hasAccessToken: !!token,
                hasRefreshToken: !!refreshToken
            });

            if (token) {
                const { data, error } = await supabase.auth.setSession({
                    access_token: token,
                    refresh_token: refreshToken || "",
                });

                if (error) {
                    console.error("❌ Failed to synchronize Supabase session on sessions page:", error.message);
                } else {
                    console.log("✅ Supabase session synchronized successfully on sessions page. User role:", data.user?.role);
                }
            } else {
                console.warn("⚠️ No access token found in NextAuth session to synchronize with Supabase on sessions page.");
            }
            setSessionReady(true);
        };
        syncSession();
    }, [session]);

    // Fetch initial groups data
    const fetchData = async () => {
        if (!userId || !sessionReady) return;
        setLoading(true);
        try {
            // 1. Fetch owned groups
            const { data: owned, error: ownedErr } = await supabase
                .from("groups")
                .select("*")
                .eq("owner_id", userId);
            if (ownedErr) throw ownedErr;
            setOwnedGroups(owned || []);

            // 2. Fetch joined groups
            const { data: joined, error: joinedErr } = await supabase
                .from("group_members")
                .select("group_id, groups(*)")
                .eq("profile_id", userId);
            if (joinedErr) throw joinedErr;

            const filteredJoined = joined
                ? joined.map((j: any) => j.groups).filter((g: any) => g && g.owner_id !== userId)
                : [];
            setJoinedGroups(filteredJoined);

            // Set default selected group if any
            const allGroups = [...(owned || []), ...filteredJoined];
            if (allGroups.length > 0 && !selectedGroupId) {
                setSelectedGroupId(allGroups[0].id.toString());
            }

        } catch (err: any) {
            showMsg("error", err.message || "Error al cargar grupos");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (sessionReady) {
            fetchData();
        }
    }, [userId, sessionReady]);

    // Fetch the historical list of sessions and individual journeys for the selected group
    const fetchSessionHistory = async () => {
        if (!selectedGroupId || !sessionReady) {
            setSessionHistory([]);
            return;
        }

        try {
            const { data: sessions, error } = await supabase
                .from("sessions")
                .select(`
                    *,
                    journey (
                        id,
                        profile_id,
                        active,
                        start,
                        end,
                        type,
                        profiles (
                            id,
                            name,
                            first_name,
                            last_name,
                            email
                        )
                    )
                `)
                .eq("group_id", parseInt(selectedGroupId))
                .order("created_at", { ascending: false });

            if (error) throw error;
            setSessionHistory(sessions || []);
        } catch (err) {
            console.error("Error fetching session history:", err);
        }
    };

    // Fetch history when selected group changes
    useEffect(() => {
        if (sessionReady && selectedGroupId) {
            fetchSessionHistory();
        }
    }, [selectedGroupId, sessionReady]);

    // Subscribes to real-time updates for sessions and journeys
    useEffect(() => {
        if (!selectedGroupId || !userId || !sessionReady) return;

        const channel = supabase
            .channel("group-history-realtime:" + selectedGroupId)
            .on(
                "postgres_changes",
                { event: "*", schema: "public", table: "sessions", filter: "group_id=eq." + selectedGroupId },
                () => {
                    fetchSessionHistory();
                }
            )
            .on(
                "postgres_changes",
                { event: "*", schema: "public", table: "journey" },
                () => {
                    fetchSessionHistory();
                }
            )
            .subscribe();

        return () => {
            supabase.removeChannel(channel);
        };
    }, [selectedGroupId, userId, sessionReady]);

    // Filter session history based on query, status, and date range
    const getFilteredSessions = () => {
        return sessionHistory.filter((sess) => {
            // Filter by active/completed status
            if (statusFilter === "active" && !sess.active) return false;
            if (statusFilter === "completed" && sess.active) return false;

            // Filter by date range
            if (startDate) {
                const sDate = new Date(startDate);
                sDate.setHours(0, 0, 0, 0);
                const sessionDate = new Date(sess.created_at);
                if (sessionDate < sDate) return false;
            }
            if (endDate) {
                const eDate = new Date(endDate);
                eDate.setHours(23, 59, 59, 999);
                const sessionDate = new Date(sess.created_at);
                if (sessionDate > eDate) return false;
            }

            // Filter by search query
            if (sessionSearch.trim() !== "") {
                const searchLower = sessionSearch.toLowerCase();
                const matchesSessionId = String(sess.id).includes(searchLower);
                const matchesJourneys = (sess.journey || []).some((j: any) => {
                    const profile = j.profiles;
                    if (!profile) return false;
                    const fullName = `${profile.first_name || ""} ${profile.last_name || ""}`.toLowerCase();
                    const email = (profile.email || "").toLowerCase();
                    const journeyTypeVal = (j.type || "").toLowerCase();
                    return fullName.includes(searchLower) || email.includes(searchLower) || journeyTypeVal.includes(searchLower);
                });
                return matchesSessionId || matchesJourneys;
            }

            return true;
        });
    };

    const showMsg = (type: "success" | "error", message: string) => {
        setAlert({ type, message });
        setTimeout(() => setAlert(null), 5000);
    };

    if (loading) {
        return (
            <div className="flex min-h-[90vh] items-center justify-center bg-zinc-50 px-4 dark:bg-zinc-950">
                <div className="flex flex-col items-center gap-3 text-center">
                    <Loader2 className="h-10 w-10 text-yellow-500 animate-spin" />
                    <p className="text-sm font-semibold uppercase tracking-wider text-zinc-500 dark:text-zinc-400">
                        Cargando historial del grupo...
                    </p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-[90vh] bg-zinc-50 dark:bg-zinc-950 px-4 py-8 sm:px-6 lg:px-8 text-zinc-900 dark:text-zinc-50 transition-colors duration-200">
            <div className="mx-auto max-w-6xl space-y-8">
                {/* Floating Notification Alerts */}
                {alert && (
                    <div className={`fixed bottom-5 right-5 z-50 flex items-center gap-2 rounded-xl px-4 py-3 shadow-lg border  animate-bounce ${alert.type === "success"
                        ? "bg-emerald-50/90 border-emerald-200 text-emerald-800 dark:bg-emerald-950/90 dark:border-emerald-800 dark:text-emerald-300"
                        : "bg-red-50/90 border-red-200 text-red-800 dark:bg-red-950/90 dark:border-red-800 dark:text-red-300"
                        }`}>
                        {alert.type === "success" ? <CheckCircle2 className="h-5 w-5 shrink-0" /> : <AlertTriangle className="h-5 w-5 shrink-0" />}
                        <span className="text-sm font-semibold">{alert.message}</span>
                    </div>
                )}

                {/* Dashboard Header */}
                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6 pb-6 border-b border-zinc-200 dark:border-zinc-900">
                    <div className="space-y-1">
                        <h1 className="text-3xl font-extrabold tracking-tight">Historial del Grupo</h1>
                        <p className="text-sm text-zinc-500 dark:text-zinc-400">
                            Consulta las sesiones de monitoreo y jornadas de trabajo anteriores de tu grupo.
                        </p>
                    </div>

                    {/* Group Selector Dropdown */}
                    <div className="flex items-center gap-3">
                        <Users className="h-5 w-5 text-zinc-400" />
                        <select
                            value={selectedGroupId}
                            onChange={(e) => setSelectedGroupId(e.target.value)}
                            className="block rounded-lg border border-zinc-200 bg-white px-3 py-2 text-sm font-semibold shadow-sm focus:border-zinc-400 focus:outline-none dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-50 cursor-pointer"
                        >
                            {[...ownedGroups, ...joinedGroups].length === 0 && (
                                <option value="">Sin grupos</option>
                            )}
                            {ownedGroups.length > 0 && (
                                <optgroup label="Mis Grupos Creados">
                                    {ownedGroups.map(g => (
                                        <option key={g.id} value={g.id}>{g.name} (Dueño)</option>
                                    ))}
                                </optgroup>
                            )}
                            {joinedGroups.length > 0 && (
                                <optgroup label="Grupos Compartidos">
                                    {joinedGroups.map(g => (
                                        <option key={g.id} value={g.id}>{g.name}</option>
                                    ))}
                                </optgroup>
                            )}
                        </select>
                    </div>
                </div>

                {/* Historial de Sesiones y Jornadas Panel */}
                <div className="rounded-2xl border border-zinc-200/80 bg-white p-6 dark:border-zinc-800/80 dark:bg-zinc-900/50  space-y-6 transition-all duration-300 w-full shadow-sm">
                    <button
                        onClick={() => setHistoryExpanded(!historyExpanded)}
                        className="w-full flex items-center justify-between text-sm font-bold uppercase tracking-wider text-zinc-400 hover:text-zinc-650 dark:hover:text-zinc-200 transition-colors focus:outline-none cursor-pointer"
                    >
                        <span className="flex items-center gap-2">
                            <History className="h-4 w-4" />
                            Historial de Sesiones y Jornadas del Grupo
                        </span>
                        {historyExpanded ? (
                            <ChevronUp className="h-4 w-4 transition-transform duration-200" />
                        ) : (
                            <ChevronDown className="h-4 w-4 transition-transform duration-200" />
                        )}
                    </button>

                    {historyExpanded && (
                        <div className="space-y-6 pt-2 animate-fadeIn">
                            {/* Search & Date Range Filters & Status Tabs */}
                            <div className="flex flex-col lg:flex-row gap-4 justify-between items-stretch lg:items-center bg-zinc-50/50 dark:bg-zinc-950/20 p-4 rounded-xl border border-zinc-150 dark:border-zinc-850">
                                <div className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-center flex-1">
                                    {/* Search Input */}
                                    <div className="relative w-full sm:w-64">
                                        <Search className="absolute left-3 top-2.5 h-4 w-4 text-zinc-450 dark:text-zinc-500" />
                                        <input
                                            type="text"
                                            value={sessionSearch}
                                            onChange={(e) => setSessionSearch(e.target.value)}
                                            placeholder="Buscar por miembro, jornada..."
                                            className="pl-9 pr-4 py-2 w-full text-xs rounded-lg border border-zinc-200 bg-white text-zinc-950 dark:text-zinc-50 placeholder-zinc-400 focus:border-zinc-400 focus:outline-none dark:border-zinc-800 dark:bg-zinc-950 dark:placeholder-zinc-600 dark:focus:border-zinc-700"
                                        />
                                    </div>

                                    {/* Date Range Picker */}
                                    <div className="flex flex-wrap items-center gap-2">
                                        <div className="flex items-center gap-2 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-lg px-2.5 py-1.5 shadow-sm">
                                            <Calendar className="h-3.5 w-3.5 text-zinc-400" />
                                            <input
                                                type="date"
                                                value={startDate}
                                                onChange={(e) => setStartDate(e.target.value)}
                                                className="bg-transparent border-none text-[11px] font-semibold focus:outline-none dark:text-zinc-100 cursor-pointer"
                                            />
                                        </div>
                                        <span className="text-zinc-400 text-[10px] font-bold uppercase tracking-wider">al</span>
                                        <div className="flex items-center gap-2 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-lg px-2.5 py-1.5 shadow-sm">
                                            <Calendar className="h-3.5 w-3.5 text-zinc-400" />
                                            <input
                                                type="date"
                                                value={endDate}
                                                onChange={(e) => setEndDate(e.target.value)}
                                                className="bg-transparent border-none text-[11px] font-semibold focus:outline-none dark:text-zinc-100 cursor-pointer"
                                            />
                                        </div>
                                        {(startDate || endDate) && (
                                            <button
                                                onClick={() => {
                                                    setStartDate("");
                                                    setEndDate("");
                                                }}
                                                className="text-[10px] font-bold text-red-650 hover:text-red-500 transition-colors uppercase tracking-wider ml-1 cursor-pointer"
                                            >
                                                Limpiar Filtros
                                            </button>
                                        )}
                                    </div>
                                </div>

                                {/* Status Filters Tabs */}
                                <div className="flex gap-2 shrink-0">
                                    <button
                                        type="button"
                                        onClick={() => setStatusFilter("all")}
                                        className={`flex-1 sm:flex-none px-3 py-1.5 text-xs font-bold rounded-lg transition-all cursor-pointer ${statusFilter === "all"
                                            ? "bg-zinc-900 text-white dark:bg-zinc-50 dark:text-zinc-950"
                                            : "bg-white border border-zinc-200 text-zinc-650 hover:bg-zinc-50 dark:bg-zinc-900/40 dark:border-zinc-800 dark:text-zinc-450 dark:hover:bg-zinc-900/80"
                                            }`}
                                    >
                                        Todas
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => setStatusFilter("active")}
                                        className={`flex-1 sm:flex-none px-3 py-1.5 text-xs font-bold rounded-lg transition-all cursor-pointer ${statusFilter === "active"
                                            ? "bg-emerald-600 text-white shadow-lg shadow-emerald-600/10"
                                            : "bg-white border border-zinc-200 text-zinc-650 hover:bg-zinc-50 dark:bg-zinc-900/40 dark:border-zinc-800 dark:text-zinc-450 dark:hover:bg-zinc-900/80"
                                            }`}
                                    >
                                        Activas
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => setStatusFilter("completed")}
                                        className={`flex-1 sm:flex-none px-3 py-1.5 text-xs font-bold rounded-lg transition-all cursor-pointer ${statusFilter === "completed"
                                            ? "bg-zinc-650 text-white dark:bg-zinc-750"
                                            : "bg-white border border-zinc-200 text-zinc-650 hover:bg-zinc-50 dark:bg-zinc-900/40 dark:border-zinc-800 dark:text-zinc-450 dark:hover:bg-zinc-900/80"
                                            }`}
                                    >
                                        Finalizadas
                                    </button>
                                </div>
                            </div>

                            {/* Main DataTable */}
                            <div className="overflow-x-auto rounded-xl border border-zinc-150 dark:border-zinc-800/80">
                                <table className="w-full text-left border-collapse">
                                    <thead>
                                        <tr className="bg-zinc-100/50 dark:bg-zinc-950/40 text-[10px] font-bold uppercase tracking-wider text-zinc-400 dark:text-zinc-500 border-b border-zinc-150 dark:border-zinc-800/80">
                                            <th className="py-3 px-4 w-12 text-center"></th>
                                            <th className="py-3 px-4">ID de Sesión</th>
                                            <th className="py-3 px-4">Fecha</th>
                                            <th className="py-3 px-4">Estado</th>
                                            <th className="py-3 px-4">Inicio</th>
                                            <th className="py-3 px-4">Duración</th>
                                            <th className="py-3 px-4">Jornadas</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-zinc-150 dark:divide-zinc-800/60 text-xs">
                                        {getFilteredSessions().length === 0 ? (
                                            <tr>
                                                <td colSpan={7} className="py-8 text-center text-zinc-400 dark:text-zinc-500 font-medium">
                                                    No se encontraron sesiones registradas en este grupo para los filtros seleccionados.
                                                </td>
                                            </tr>
                                        ) : (
                                            getFilteredSessions().map((sess) => {
                                                const isExpanded = expandedSessions[sess.id] || false;
                                                const journeys = sess.journey || [];
                                                const activeJourneysCount = journeys.filter((j: any) => j.active).length;

                                                return (
                                                    <React.Fragment key={sess.id}>
                                                        <tr className={`hover:bg-zinc-50/50 dark:hover:bg-zinc-900/30 transition-colors ${isExpanded ? "bg-zinc-50/20 dark:bg-zinc-950/10" : ""}`}>
                                                            <td className="py-3.5 px-4 text-center">
                                                                <button
                                                                    onClick={() => toggleSessionExpand(sess.id)}
                                                                    className="p-1 rounded hover:bg-zinc-200 dark:hover:bg-zinc-800 text-zinc-500 hover:text-zinc-700 dark:text-zinc-400 dark:hover:text-zinc-200 transition-colors cursor-pointer"
                                                                >
                                                                    {isExpanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                                                                </button>
                                                            </td>
                                                            <td className="py-3.5 px-4 font-mono font-bold text-zinc-700 dark:text-zinc-300">
                                                                #{sess.id}
                                                            </td>
                                                            <td className="py-3.5 px-4 font-semibold text-zinc-650 dark:text-zinc-300">
                                                                {new Date(sess.created_at).toLocaleDateString("es-ES", { day: "numeric", month: "short", year: "numeric" })}
                                                            </td>
                                                            <td className="py-3.5 px-4">
                                                                {sess.active ? (
                                                                    <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-250/20 px-2 py-0.5 text-[10px] font-bold text-emerald-600 dark:text-emerald-400 animate-pulse">
                                                                        <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                                                                        ACTIVA
                                                                    </span>
                                                                ) : (
                                                                    <span className="inline-flex items-center gap-1 rounded-full bg-zinc-50 dark:bg-zinc-900 border border-zinc-200/50 px-2 py-0.5 text-[10px] font-bold text-zinc-500 dark:text-zinc-400">
                                                                        <span className="h-1.5 w-1.5 rounded-full bg-zinc-400" />
                                                                        FINALIZADA
                                                                    </span>
                                                                )}
                                                            </td>
                                                            <td className="py-3.5 px-4 text-zinc-500 dark:text-zinc-400">
                                                                {new Date(sess.created_at).toLocaleTimeString("es-ES", { hour: "2-digit", minute: "2-digit" })}
                                                            </td>
                                                            <td className="py-3.5 px-4 font-mono text-zinc-650 dark:text-zinc-300">
                                                                {formatDuration(sess.created_at, sess.active ? null : (sess.journey?.[0]?.end || null))}
                                                            </td>
                                                            <td className="relative group py-3.5 px-4 font-bold text-zinc-700 dark:text-zinc-300 cursor-help">
                                                                <div className="flex items-center">
                                                                    {journeys.length} {journeys.length === 1 ? "jornada" : "jornadas"}
                                                                    {activeJourneysCount > 0 && (
                                                                        <span className="ml-2 text-[9px] text-amber-600 dark:text-amber-400 font-bold bg-amber-500/10 px-1.5 py-0.5 rounded border border-amber-500/20 animate-pulse">
                                                                            {activeJourneysCount} sesiones activas
                                                                        </span>
                                                                    )}
                                                                </div>

                                                                {/* Premium Glassmorphic Tooltip */}
                                                                <div className="absolute right-4 bottom-full mb-2 w-72 p-3 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white/95 dark:bg-zinc-950/95  shadow-xl text-left text-xs font-normal z-50 opacity-0 pointer-events-none group-hover:opacity-100 transition-all duration-200 transform translate-y-1 group-hover:translate-y-0">
                                                                    <p className="text-[10px] font-bold uppercase tracking-wider text-zinc-400 dark:text-zinc-500 mb-2 border-b border-zinc-100 dark:border-zinc-850 pb-1.5">
                                                                        Resumen de Jornadas
                                                                    </p>
                                                                    {journeys.length === 0 ? (
                                                                        <p className="text-[11px] text-zinc-400 dark:text-zinc-500 italic">Sin jornadas registradas</p>
                                                                    ) : (
                                                                        <div className="space-y-2 max-h-48 overflow-y-auto">
                                                                            {journeys.map((j: any) => {
                                                                                const memberProfile = j.profiles;
                                                                                const memberName = memberProfile
                                                                                    ? `${memberProfile.first_name || ""} ${memberProfile.last_name || ""}`.trim() || memberProfile.name || memberProfile.email
                                                                                    : "Usuario desconocido";
                                                                                return (
                                                                                    <div key={j.id} className="flex flex-col gap-0.5 border-b border-zinc-100/50 dark:border-zinc-900/50 pb-1.5 last:border-0 last:pb-0">
                                                                                        <div className="flex items-center justify-between gap-2">
                                                                                            <span className="font-semibold text-zinc-800 dark:text-zinc-200 truncate max-w-35">
                                                                                                {memberName}
                                                                                            </span>
                                                                                            <span className={`px-1.5 py-0.5 rounded text-[9px] font-bold uppercase ${j.type === "Remoto"
                                                                                                    ? "bg-sky-500/10 text-sky-600 dark:text-sky-400"
                                                                                                    : "bg-amber-500/10 text-amber-600 dark:text-amber-400"
                                                                                                }`}>
                                                                                                {j.type === "Remoto" ? "Remoto" : "Presencial"}
                                                                                            </span>
                                                                                        </div>
                                                                                        <div className="flex items-center justify-between text-[10px] text-zinc-400 dark:text-zinc-500">
                                                                                            <span>
                                                                                                {new Date(j.start).toLocaleTimeString("es-ES", { hour: "2-digit", minute: "2-digit" })}
                                                                                                {j.end ? ` - ${new Date(j.end).toLocaleTimeString("es-ES", { hour: "2-digit", minute: "2-digit" })}` : " - En curso"}
                                                                                            </span>
                                                                                            <span className="font-mono font-medium">
                                                                                                {formatDuration(j.start, j.end)}
                                                                                            </span>
                                                                                        </div>
                                                                                    </div>
                                                                                );
                                                                            })}
                                                                        </div>
                                                                    )}
                                                                </div>
                                                            </td>
                                                        </tr>

                                                        {/* Nested Journeys table when expanded */}
                                                        {isExpanded && (
                                                            <tr>
                                                                <td colSpan={7} className="p-4 bg-zinc-50/30 dark:bg-zinc-950/10 border-t border-b border-zinc-150 dark:border-zinc-800/80">
                                                                    <div className="space-y-3 rounded-lg border border-zinc-200/60 dark:border-zinc-800/80 bg-white dark:bg-zinc-900/40 p-4">
                                                                        <div className="text-[10px] font-bold uppercase tracking-wider text-zinc-400 dark:text-zinc-500 flex items-center gap-1.5">
                                                                            <Compass className="h-3.5 w-3.5" />
                                                                            Desglose de Jornadas de la Sesión #{sess.id}
                                                                        </div>
                                                                        {journeys.length === 0 ? (
                                                                            <p className="text-xs text-zinc-400 dark:text-zinc-500 italic">
                                                                                No se registraron jornadas individuales durante esta sesión de monitoreo.
                                                                            </p>
                                                                        ) : (
                                                                            <div className="overflow-x-auto">
                                                                                <table className="w-full text-left text-xs border-collapse">
                                                                                    <thead>
                                                                                        <tr className="text-[9px] font-bold uppercase text-zinc-400 dark:text-zinc-500 border-b border-zinc-100 dark:border-zinc-800/40">
                                                                                            <th className="pb-2">Miembro</th>
                                                                                            <th className="pb-2">Tipo</th>
                                                                                            <th className="pb-2">Inicio</th>
                                                                                            <th className="pb-2">Fin</th>
                                                                                            <th className="pb-2">Duración</th>
                                                                                            <th className="pb-2">Estado</th>
                                                                                        </tr>
                                                                                    </thead>
                                                                                    <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800/20">
                                                                                        {journeys.map((j: any) => {
                                                                                            const memberProfile = j.profiles;
                                                                                            const memberName = memberProfile
                                                                                                ? `${memberProfile.first_name || ""} ${memberProfile.last_name || ""}`.trim() || memberProfile.name || memberProfile.email
                                                                                                : "Usuario desconocido";
                                                                                            const isJourneyActive = j.active;

                                                                                            return (
                                                                                                <tr key={j.id} className="hover:bg-zinc-50/20 dark:hover:bg-zinc-900/10">
                                                                                                    <td className="py-2.5 font-semibold text-zinc-850 dark:text-zinc-250">
                                                                                                        {memberName} {memberProfile?.id === userId && <span className="text-[10px] text-zinc-400 dark:text-zinc-500 font-normal ml-0.5">(Tú)</span>}
                                                                                                        <div className="text-[9px] font-normal text-zinc-400 dark:text-zinc-500">
                                                                                                            {memberProfile?.email}
                                                                                                        </div>
                                                                                                    </td>
                                                                                                    <td className="py-2.5">
                                                                                                        <span className={`px-2 py-0.5 rounded-full text-[9px] font-bold uppercase border ${j.type === "Remoto"
                                                                                                            ? "bg-sky-500/10 text-sky-600 dark:text-sky-400 border-sky-500/20"
                                                                                                            : "bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20"
                                                                                                            }`}>
                                                                                                            {j.type === "Remoto" ? "Remoto" : "Presencial"}
                                                                                                        </span>
                                                                                                    </td>
                                                                                                    <td className="py-2.5 text-zinc-500 dark:text-zinc-400">
                                                                                                        {new Date(j.start).toLocaleTimeString("es-ES", { hour: "2-digit", minute: "2-digit" })}
                                                                                                    </td>
                                                                                                    <td className="py-2.5 text-zinc-500 dark:text-zinc-400">
                                                                                                        {j.end ? (
                                                                                                            new Date(j.end).toLocaleTimeString("es-ES", { hour: "2-digit", minute: "2-digit" })
                                                                                                        ) : (
                                                                                                            <span className="italic text-zinc-400 dark:text-zinc-500">En curso</span>
                                                                                                        )}
                                                                                                    </td>
                                                                                                    <td className="py-2.5 font-mono text-zinc-650 dark:text-zinc-400">
                                                                                                        {formatDuration(j.start, j.end)}
                                                                                                    </td>
                                                                                                    <td className="py-2.5">
                                                                                                        {isJourneyActive ? (
                                                                                                            <span className="inline-flex items-center gap-1 rounded bg-amber-50 dark:bg-amber-950/20 px-1.5 py-0.5 text-[9px] font-bold text-amber-700 dark:text-amber-400 animate-pulse">
                                                                                                                Activo
                                                                                                            </span>
                                                                                                        ) : (
                                                                                                            <span className="inline-flex items-center gap-1 rounded bg-zinc-100 dark:bg-zinc-800 px-1.5 py-0.5 text-[9px] font-bold text-zinc-650 dark:text-zinc-400">
                                                                                                                Completada
                                                                                                            </span>
                                                                                                        )}
                                                                                                    </td>
                                                                                                </tr>
                                                                                            );
                                                                                        })}
                                                                                    </tbody>
                                                                                </table>
                                                                            </div>
                                                                        )}
                                                                    </div>
                                                                </td>
                                                            </tr>
                                                        )}
                                                    </React.Fragment>
                                                );
                                            })
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}

export const getServerSideProps: GetServerSideProps = async (context) => {
    // NextAuth v5 server check (passing req and res for correct header/cookie resolution in production)
    const session = await auth(context.req as any, context.res as any);

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
