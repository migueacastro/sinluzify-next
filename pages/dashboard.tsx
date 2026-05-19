import React, { useState, useEffect } from "react";
import { GetServerSideProps } from "next";
import { auth } from "@/auth";
import { supabase } from "@/lib/supabase";
import {
    Zap, ZapOff, Users, UserPlus, Plus, Check, X,
    AlertTriangle, Play, Square, Compass, Clock, Send,
    Shield, CheckCircle2, User, Loader2, ChevronDown, ChevronUp,
    History, Search
} from "lucide-react";

interface DashboardProps {
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

export default function DashboardPage({ session }: DashboardProps) {
    const user = session.user;
    const userId = user?.id;

    // Journeys & Session History States
    const [journeyType, setJourneyType] = useState<"Presencial" | "Remoto">("Presencial");
    const [sessionHistory, setSessionHistory] = useState<any[]>([]);
    const [historyExpanded, setHistoryExpanded] = useState<boolean>(true);
    const [sessionSearch, setSessionSearch] = useState("");
    const [statusFilter, setStatusFilter] = useState<"all" | "active" | "completed">("all");
    const [expandedSessions, setExpandedSessions] = useState<Record<number, boolean>>({});

    // Loading & Notification states
    const [loading, setLoading] = useState(true);
    const [sessionReady, setSessionReady] = useState(false);
    const [actionLoading, setActionLoading] = useState<string | null>(null);
    const [alert, setAlert] = useState<{ type: "success" | "error"; message: string } | null>(null);

    // Groups & Memberships states
    const [ownedGroups, setOwnedGroups] = useState<any[]>([]);
    const [joinedGroups, setJoinedGroups] = useState<any[]>([]);
    const [selectedGroupId, setSelectedGroupId] = useState<string>("");
    const [newGroupName, setNewGroupName] = useState("");
    const [inviteEmail, setInviteEmail] = useState("");

    // Invitations / Notifications state
    const [invitations, setInvitations] = useState<any[]>([]);

    // Monitoring Session state
    const [activeSession, setActiveSession] = useState<any | null>(null);
    const [activeOutage, setActiveOutage] = useState<any | null>(null);
    const [activeJourney, setActiveJourney] = useState<any | null>(null);
    const [elapsedTimeText, setElapsedTimeText] = useState<string>("");
    const [journeyTimeText, setJourneyTimeText] = useState<string>("");
    const [groupsExpanded, setGroupsExpanded] = useState<boolean>(false);
    const [sessionMembers, setSessionMembers] = useState<any[]>([]);

    // Real-time elapsed time counter for active session
    useEffect(() => {
        if (!activeSession) {
            setElapsedTimeText("");
            return;
        }

        const updateTimer = () => {
            const start = new Date(activeSession.created_at).getTime();
            const now = new Date().getTime();
            const diffMs = Math.max(0, now - start);

            const hours = Math.floor(diffMs / 3600000);
            const minutes = Math.floor((diffMs % 3600000) / 60000);
            const seconds = Math.floor((diffMs % 60000) / 1000);

            const pad = (num: number) => String(num).padStart(2, "0");
            setElapsedTimeText(`${pad(hours)}:${pad(minutes)}:${pad(seconds)}`);
        };

        updateTimer();
        const interval = setInterval(updateTimer, 1000);
        return () => clearInterval(interval);
    }, [activeSession]);

    // Real-time elapsed time counter for active journey (jornada)
    useEffect(() => {
        if (!activeJourney) {
            setJourneyTimeText("");
            return;
        }

        const updateTimer = () => {
            const start = new Date(activeJourney.start).getTime();
            const now = new Date().getTime();
            const diffMs = Math.max(0, now - start);

            const hours = Math.floor(diffMs / 3600000);
            const minutes = Math.floor((diffMs % 3600000) / 60000);
            const seconds = Math.floor((diffMs % 60000) / 1000);

            const pad = (num: number) => String(num).padStart(2, "0");
            setJourneyTimeText(`${pad(hours)}:${pad(minutes)}:${pad(seconds)}`);
        };

        updateTimer();
        const interval = setInterval(updateTimer, 1000);
        return () => clearInterval(interval);
    }, [activeJourney]);

    // Synchronize client-side Supabase client with NextAuth token
    useEffect(() => {
        const syncSession = async () => {
            const token = session?.accessToken;
            const refreshToken = session?.refreshToken;
            
            console.log("🔄 NextAuth Session sync:", { 
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
                    console.error("❌ Failed to synchronize Supabase session:", error.message);
                } else {
                    console.log("✅ Supabase session synchronized successfully. User role:", data.user?.role);
                }
            } else {
                console.warn("⚠️ No access token found in NextAuth session to synchronize with Supabase.");
            }
            setSessionReady(true);
        };
        syncSession();
    }, [session]);

    // Fetch initial data
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

            // 2. Fetch joined groups (via group_members)
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

            // 3. Fetch notifications (invitations) where accepted is false
            const { data: invites, error: inviteErr } = await supabase
                .from("notifications")
                .select("*, from_profile:profiles!notifications_from_profile_id_fkey(first_name, last_name, email), group:groups(name)")
                .eq("to_profile_id", userId)
                .eq("accepted", false);
            if (inviteErr) throw inviteErr;
            setInvitations(invites || []);

        } catch (err: any) {
            showMsg("error", err.message || "Error al cargar datos");
        } finally {
            setLoading(false);
        }
    };

    // Triggered when selected group changes to load active sessions
    useEffect(() => {
        if (sessionReady) {
            fetchActiveSessionData();
        }
    }, [selectedGroupId, sessionReady]);

    // Helper to calculate and format duration between two times (live counting if end is null)
    const formatDuration = (startStr: string, endStr: string | null) => {
        const start = new Date(startStr).getTime();
        const end = endStr ? new Date(endStr).getTime() : new Date().getTime();
        const diffMs = Math.max(0, end - start);
        const hours = Math.floor(diffMs / 3600000);
        const minutes = Math.floor((diffMs % 3600000) / 60000);
        const seconds = Math.floor((diffMs % 60000) / 1000);
        const pad = (num: number) => String(num).padStart(2, "0");
        return pad(hours) + ":" + pad(minutes) + ":" + pad(seconds);
    };

    // Toggle session detail collapse
    const toggleSessionExpand = (sessionId: number) => {
        setExpandedSessions((prev) => ({
            ...prev,
            [sessionId]: !prev[sessionId]
        }));
    };

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

    // Filters session history based on query and status filter
    const getFilteredSessions = () => {
        return sessionHistory.filter((sess) => {
            if (statusFilter === "active" && !sess.active) return false;
            if (statusFilter === "completed" && sess.active) return false;

            if (sessionSearch.trim() !== "") {
                const searchLower = sessionSearch.toLowerCase();
                const matchesSessionId = String(sess.id).includes(searchLower);
                const matchesJourneys = (sess.journey || []).some((j: any) => {
                    const profile = j.profiles;
                    if (!profile) return false;
                    const fullName = (profile.first_name || "" + " " + profile.last_name || "").toLowerCase();
                    const email = (profile.email || "").toLowerCase();
                    const journeyTypeVal = (j.type || "").toLowerCase();
                    return fullName.includes(searchLower) || email.includes(searchLower) || journeyTypeVal.includes(searchLower);
                });
                return matchesSessionId || matchesJourneys;
            }

            return true;
        });
    };

    const fetchActiveSessionData = async () => {
        if (!selectedGroupId || !userId || !sessionReady) {
            setActiveSession(null);
            setActiveOutage(null);
            setActiveJourney(null);
            setSessionMembers([]);
            return;
        }

        try {
            // Find active session in this group
            const { data: sess, error: sessErr } = await supabase
                .from("sessions")
                .select("*")
                .eq("group_id", parseInt(selectedGroupId))
                .eq("active", true)
                .maybeSingle();

            if (sessErr) throw sessErr;

            if (sess) {
                setActiveSession(sess);

                // Fetch active power outage for this session
                const { data: outage, error: outageErr } = await supabase
                    .from("power_outages")
                    .select("*")
                    .eq("session_id", sess.id)
                    .eq("active", true)
                    .maybeSingle();
                if (outageErr) throw outageErr;
                setActiveOutage(outage || null);

                // Fetch active journey for current user in this session
                const { data: journey, error: journeyErr } = await supabase
                    .from("journey")
                    .select("*")
                    .eq("session_id", sess.id)
                    .eq("profile_id", userId)
                    .eq("active", true)
                    .maybeSingle();
                if (journeyErr) throw journeyErr;
                setActiveJourney(journey || null);

                // Fetch all members of the group and their active journeys for this session
                const { data: members, error: membersErr } = await supabase
                    .from("group_members")
                    .select(`
                        profile_id,
                        profiles (
                            id,
                            email,
                            name,
                            first_name,
                            last_name
                        )
                    `)
                    .eq("group_id", parseInt(selectedGroupId));

                if (membersErr) throw membersErr;

                // Fetch all active journeys in this session
                const { data: activeJourneys, error: activeJourneysErr } = await supabase
                    .from("journey")
                    .select("*")
                    .eq("session_id", sess.id)
                    .eq("active", true);

                if (activeJourneysErr) throw activeJourneysErr;

                // Merge members with their active journey information
                const membersWithStatus = (members || []).map((m: any) => {
                    const profile = m.profiles;
                    const activeJ = (activeJourneys || []).find((j: any) => j.profile_id === profile?.id);
                    return {
                        id: profile?.id,
                        name: profile ? `${profile.first_name || ""} ${profile.last_name || ""}`.trim() || profile.name || profile.email : "Usuario desconocido",
                        email: profile?.email,
                        activeJourney: activeJ || null
                    };
                });

                setSessionMembers(membersWithStatus);
            } else {
                setActiveSession(null);
                setActiveOutage(null);
                setActiveJourney(null);
                setSessionMembers([]);
            }
            await fetchSessionHistory();
        } catch (err: any) {
            console.error("Error fetching session state:", err);
        }
    };

    useEffect(() => {
        if (sessionReady) {
            fetchData();
        }
    }, [userId, sessionReady]);

    // Subscribes to real-time updates for sessions, outages, journeys, and group members
    useEffect(() => {
        if (!selectedGroupId || !userId || !sessionReady) return;

        // Channel name includes selectedGroupId to keep listeners scoped to the active group
        const channel = supabase
            .channel("group-realtime:" + selectedGroupId)
            .on(
                "postgres_changes",
                { event: "*", schema: "public", table: "sessions", filter: "group_id=eq." + selectedGroupId },
                () => {
                    fetchActiveSessionData();
                }
            )
            .on(
                "postgres_changes",
                { event: "*", schema: "public", table: "power_outages" },
                () => {
                    fetchActiveSessionData();
                }
            )
            .on(
                "postgres_changes",
                { event: "*", schema: "public", table: "journey" },
                () => {
                    fetchActiveSessionData();
                }
            )
            .on(
                "postgres_changes",
                { event: "*", schema: "public", table: "group_members", filter: "group_id=eq." + selectedGroupId },
                () => {
                    fetchActiveSessionData();
                }
            )
            .subscribe();

        return () => {
            supabase.removeChannel(channel);
        };
    }, [selectedGroupId, userId, sessionReady]);

    const showMsg = (type: "success" | "error", message: string) => {
        setAlert({ type, message });
        setTimeout(() => setAlert(null), 5000);
    };

    // Create a new group
    const handleCreateGroup = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!newGroupName.trim() || !userId) return;
        setActionLoading("createGroup");

        try {
            // Insert new group (the trigger will automatically add the owner to group_members!)
            const { data: group, error } = await supabase
                .from("groups")
                .insert({
                    name: newGroupName,
                    owner_id: userId
                })
                .select()
                .single();

            if (error) throw error;

            showMsg("success", `Grupo "${group.name}" creado con éxito. El disparador te añadió como miembro automáticamente.`);
            setNewGroupName("");
            await fetchData();
            if (group) setSelectedGroupId(group.id.toString());

        } catch (err: any) {
            showMsg("error", err.message || "Error al crear grupo");
        } finally {
            setActionLoading(null);
        }
    };

    // Send a group invitation
    const handleSendInvite = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!inviteEmail.trim() || !selectedGroupId || !userId) return;
        setActionLoading("invite");

        try {
            // Find invitee profile by email
            const { data: invitee, error: findErr } = await supabase
                .from("profiles")
                .select("id")
                .eq("email", inviteEmail.trim())
                .maybeSingle();

            if (findErr) throw findErr;
            if (!invitee) {
                throw new Error("No se encontró ningún usuario con ese correo electrónico registrado.");
            }

            if (invitee.id === userId) {
                throw new Error("No puedes invitarte a ti mismo a tu propio grupo.");
            }

            // Check if already a member
            const { data: existingMember, error: memberErr } = await supabase
                .from("group_members")
                .select("*")
                .eq("group_id", parseInt(selectedGroupId))
                .eq("profile_id", invitee.id)
                .maybeSingle();

            if (memberErr) throw memberErr;
            if (existingMember) {
                throw new Error("Este usuario ya es miembro de este grupo.");
            }

            // Insert invitation notification
            const { error: inviteErr } = await supabase
                .from("notifications")
                .insert({
                    to_profile_id: invitee.id,
                    from_profile_id: userId,
                    group_id: parseInt(selectedGroupId),
                    type: "group_invite",
                    accepted: false,
                    read: false
                });

            if (inviteErr) throw inviteErr;

            showMsg("success", `Invitación enviada con éxito a ${inviteEmail}.`);
            setInviteEmail("");

        } catch (err: any) {
            showMsg("error", err.message || "Error al enviar invitación");
        } finally {
            setActionLoading(null);
        }
    };

    // Accept a group invitation (Triggers automatic database joining)
    const handleAcceptInvite = async (inviteId: string) => {
        setActionLoading(`accept-${inviteId}`);
        try {
            // Set accepted to true. The Postgres trigger 'on_invitation_accepted' will do the rest!
            const { error } = await supabase
                .from("notifications")
                .update({ accepted: true, read: true })
                .eq("id", parseInt(inviteId));

            if (error) throw error;

            showMsg("success", "¡Invitación aceptada! El trigger de la base de datos te agregó al grupo al instante.");
            await fetchData();

        } catch (err: any) {
            showMsg("error", err.message || "Error al aceptar invitación");
        } finally {
            setActionLoading(null);
        }
    };

    // Start a new monitoring session
    const handleStartSession = async () => {
        if (!selectedGroupId) return;
        setActionLoading("session");

        try {
            const { error } = await supabase
                .from("sessions")
                .insert({
                    group_id: parseInt(selectedGroupId),
                    active: true
                });

            if (error) throw error;
            showMsg("success", "Nueva sesión de monitoreo iniciada con éxito.");
            await fetchActiveSessionData();

        } catch (err: any) {
            showMsg("error", err.message || "Error al iniciar sesión");
        } finally {
            setActionLoading(null);
        }
    };

    // Toggle Power Outage (Uses automatic database triggers for end dates!)
    const handleToggleOutage = async () => {
        if (!activeSession) return;
        setActionLoading("outage");

        try {
            if (activeOutage) {
                // Resolution: set active = false. The trigger 'on_outage_deactivated' automatically sets the 'end' date!
                const { error } = await supabase
                    .from("power_outages")
                    .update({ active: false })
                    .eq("id", activeOutage.id);

                if (error) throw error;
                showMsg("success", "Apagón resuelto. La base de datos registró la hora de fin automáticamente.");
            } else {
                // Outage: Report new outage
                const { error } = await supabase
                    .from("power_outages")
                    .insert({
                        session_id: activeSession.id,
                        active: true,
                        start: new Date().toISOString()
                    });

                if (error) throw error;
                showMsg("success", "Reporte de corte de luz enviado a la sesión del grupo.");
            }
            await fetchActiveSessionData();

        } catch (err: any) {
            showMsg("error", err.message || "Error al cambiar estado de energía");
        } finally {
            setActionLoading(null);
        }
    };

    // Toggle Journey (Uses automatic duplicate checker and end date triggers!)
    const handleToggleJourney = async () => {
        if (!activeSession || !userId) return;
        setActionLoading("journey");

        try {
            if (activeJourney) {
                // End Journey: set active = false. Trigger sets 'end' date automatically!
                const { error } = await supabase
                    .from("journey")
                    .update({ active: false })
                    .eq("id", activeJourney.id);

                if (error) throw error;
                showMsg("success", "Jornada finalizada con éxito.");
            } else {
                // Start Journey: database trigger will automatically deactivate any other active journeys of this user!
                const { error } = await supabase
                    .from("journey")
                    .insert({
                        session_id: activeSession.id,
                        profile_id: userId,
                        active: true,
                        start: new Date().toISOString(),
                        type: journeyType
                    });

                if (error) throw error;
                showMsg("success", "Jornada iniciada. El trigger cerrará automáticamente cualquier otra jornada activa.");
            }
            await fetchActiveSessionData();

        } catch (err: any) {
            showMsg("error", err.message || "Error al cambiar estado de la jornada");
        } finally {
            setActionLoading(null);
        }
    };

    // ⏹️ Close Monitoring Session (Triggers cascading deactivation of all active outages and journeys!)
    const handleCloseSession = async () => {
        if (!activeSession) return;
        if (!confirm("¿Seguro que deseas cerrar la sesión? El disparador cerrará en cascada todos los apagones y jornadas activas.")) return;
        setActionLoading("session");

        try {
            // Close session: set active = false. The trigger 'on_session_deactivated' automatically cascades deactivations!
            const { error } = await supabase
                .from("sessions")
                .update({ active: false })
                .eq("id", activeSession.id);

            if (error) throw error;
            showMsg("success", "⏹️ Sesión cerrada. El disparador de cascada limpió todos los registros activos asociados.");
            await fetchActiveSessionData();

        } catch (err: any) {
            showMsg("error", err.message || "Error al cerrar sesión");
        } finally {
            setActionLoading(null);
        }
    };

    // Get group name by ID
    const getSelectedGroupName = () => {
        const group = [...ownedGroups, ...joinedGroups].find(g => g.id.toString() === selectedGroupId);
        return group ? group.name : "Sin grupo seleccionado";
    };

    const isOwnerOfSelected = () => {
        const group = ownedGroups.find(g => g.id.toString() === selectedGroupId);
        return !!group;
    };

    if (loading) {
        return (
            <div className="flex min-h-[90vh] items-center justify-center bg-zinc-50 px-4 dark:bg-zinc-950">
                <div className="flex flex-col items-center gap-3 text-center">
                    <Loader2 className="h-10 w-10 text-yellow-500 animate-spin" />
                    <p className="text-sm font-semibold uppercase tracking-wider text-zinc-500 dark:text-zinc-400">
                        Cargando centro de control...
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
                    <div className={`fixed bottom-5 right-5 z-50 flex items-center gap-2 rounded-xl px-4 py-3 shadow-lg border backdrop-blur-xl animate-bounce ${alert.type === "success"
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
                        <h1 className="text-3xl font-extrabold tracking-tight">Centro de Control</h1>
                        <p className="text-sm text-zinc-500 dark:text-zinc-400">
                            Bienvenido, <span className="font-semibold text-zinc-900 dark:text-zinc-200">{user?.name}</span>. Monitorea y reporta energía eléctrica de forma colectiva.
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
                                <option value="">Sin grupos. Crea uno abajo</option>
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

                {/* Main Content Grid */}
                <div className={`grid gap-8 ${invitations.length > 0 ? "md:grid-cols-3" : "grid-cols-1"}`}>

                    {/* Left Column: Invitations Panel */}
                    {invitations.length > 0 && (
                        <div className="space-y-8 md:col-span-1">
                            <div className="rounded-2xl border border-yellow-200 bg-yellow-50/50 p-6 dark:border-yellow-950/40 dark:bg-yellow-950/10 space-y-4 backdrop-blur-xl">
                                <h3 className="flex items-center gap-2 text-sm font-bold text-yellow-800 dark:text-yellow-400">
                                    <Send className="h-4 w-4" />
                                    Invitaciones Pendientes ({invitations.length})
                                </h3>
                                <div className="space-y-3">
                                    {invitations.map((inv) => (
                                        <div key={inv.id} className="rounded-xl border border-yellow-200/50 bg-white p-4 dark:border-yellow-900/30 dark:bg-zinc-900/50 space-y-3">
                                            <div className="text-xs text-zinc-600 dark:text-zinc-400">
                                                <p className="font-semibold text-zinc-950 dark:text-zinc-100">
                                                    {inv.from_profile?.first_name} {inv.from_profile?.last_name}
                                                </p>
                                                <p className="mt-0.5 font-mono text-[10px]">{inv.from_profile?.email}</p>
                                                <p className="mt-1 text-zinc-500">
                                                    Te invita al grupo: <span className="font-bold text-zinc-900 dark:text-zinc-200">"{inv.group?.name}"</span>
                                                </p>
                                            </div>
                                            <div className="flex gap-2">
                                                <button
                                                    onClick={() => handleAcceptInvite(inv.id)}
                                                    disabled={actionLoading === `accept-${inv.id}`}
                                                    className="flex-1 inline-flex items-center justify-center gap-1 rounded-lg bg-yellow-500 hover:bg-yellow-400 disabled:bg-yellow-600/30 text-zinc-950 px-2.5 py-1.5 text-xs font-semibold shadow-sm transition-all active:scale-95 cursor-pointer"
                                                >
                                                    {actionLoading === `accept-${inv.id}` ? (
                                                        <Loader2 className="h-3.5 w-3.5 animate-spin" />
                                                    ) : (
                                                        <>
                                                            <Check className="h-3.5 w-3.5" />
                                                            Aceptar
                                                        </>
                                                    )}
                                                </button>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Right Column: Monitoring Session & Power Outages */}
                    <div className={`space-y-8 ${invitations.length > 0 ? "md:col-span-2" : "w-full"}`}>

                        {/* Select Group Prompt (When there are no groups selected) */}
                        {!selectedGroupId ? (
                            <div className="rounded-2xl border border-zinc-200/80 bg-white p-12 dark:border-zinc-800/80 dark:bg-zinc-900/50 backdrop-blur-xl text-center space-y-4">
                                <Users className="mx-auto h-12 w-12 text-zinc-400 animate-pulse" />
                                <h3 className="text-lg font-bold">No tienes ningún grupo todavía</h3>
                                <p className="text-sm text-zinc-500 dark:text-zinc-400 max-w-sm mx-auto">
                                    Crea tu primer grupo a la izquierda o acepta una invitación para empezar a reportar cortes de energía colaborativamente.
                                </p>
                            </div>
                        ) : (

                            /* Interactive Session Monitor Board */
                            <div className="rounded-2xl border border-zinc-200/80 bg-white p-8 dark:border-zinc-800/80 dark:bg-zinc-900/50 backdrop-blur-xl space-y-8">

                                {/* Header Details */}
                                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-6 border-b border-zinc-100 dark:border-zinc-800/80">
                                    <div className="space-y-1">
                                        <span className="inline-flex items-center gap-1 rounded-full bg-zinc-100 dark:bg-zinc-800/50 px-2.5 py-0.5 text-[10px] font-bold text-zinc-500 dark:text-zinc-400 uppercase tracking-wide">
                                            Grupo de Trabajo
                                        </span>
                                        <h2 className="text-2xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50">
                                            {getSelectedGroupName()}
                                        </h2>
                                    </div>
                                    <div>
                                        {activeSession ? (
                                            <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-700 dark:bg-emerald-950/30 dark:text-emerald-400 border border-emerald-200/30">
                                                <div className="h-2 w-2 rounded-full bg-emerald-500 animate-ping" />
                                                Sesión de Monitoreo Activa
                                            </span>
                                        ) : (
                                            <span className="inline-flex items-center gap-1.5 rounded-full bg-zinc-100 px-3 py-1 text-xs font-semibold text-zinc-500 dark:bg-zinc-800/50 dark:text-zinc-400">
                                                <div className="h-2 w-2 rounded-full bg-zinc-400" />
                                                Sin Sesión Activa
                                            </span>
                                        )}
                                    </div>
                                </div>

                                {/* IF NO MONITORING SESSION IS RUNNING IN THIS GROUP */}
                                {!activeSession ? (
                                    <div className="py-8 text-center space-y-6">
                                        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-zinc-100 dark:bg-zinc-900/80 text-zinc-400">
                                            <Clock className="h-7 w-7" />
                                        </div>
                                        <div className="space-y-2">
                                            <h3 className="text-lg font-bold">No hay ninguna sesión de monitoreo abierta</h3>
                                            <p className="text-sm text-zinc-500 dark:text-zinc-400 max-w-md mx-auto">
                                                Para reportar cortes de luz y realizar el seguimiento colectivo, debes iniciar una sesión para este grupo.
                                            </p>
                                        </div>
                                        <button
                                            onClick={handleStartSession}
                                            disabled={actionLoading === "session"}
                                            className="inline-flex items-center justify-center gap-2 rounded-xl bg-gradient-to-tr from-yellow-500 to-amber-400 text-zinc-950 px-6 py-3 text-sm font-bold shadow-lg shadow-yellow-500/10 hover:from-yellow-400 hover:to-amber-300 disabled:opacity-50 transition-all active:scale-[0.98] cursor-pointer"
                                        >
                                            {actionLoading === "session" ? (
                                                <Loader2 className="h-4 w-4 animate-spin" />
                                            ) : (
                                                <>
                                                    <Play className="h-4 w-4 fill-current" />
                                                    Iniciar Sesión de Monitoreo
                                                </>
                                            )}
                                        </button>
                                    </div>
                                ) : (

                                    /* ACTIVE SESSION WORKING ZONE */
                                    <div className="space-y-6">
                                        {/* Reduced Live Session Timer */}
                                        {elapsedTimeText && (
                                            <div className="rounded-xl border border-zinc-150 bg-zinc-50/50 p-4 dark:border-zinc-800/80 dark:bg-zinc-950/20 flex flex-row items-center justify-between gap-4">
                                                <div className="flex items-center gap-2.5 min-w-0">
                                                    <Clock className="h-4 w-4 text-zinc-500 dark:text-zinc-400 animate-pulse shrink-0" />
                                                    <div className="text-left min-w-0">
                                                        <p className="text-xs font-bold text-zinc-700 dark:text-zinc-300">
                                                            Tiempo de Monitoreo
                                                        </p>
                                                        <p className="text-[10px] text-zinc-400 dark:text-zinc-500 mt-0.5 leading-none truncate">
                                                            Sesión ID: #{activeSession.id} • Iniciada a las {new Date(activeSession.created_at).toLocaleTimeString("es-ES", { hour: "2-digit", minute: "2-digit" })}
                                                        </p>
                                                    </div>
                                                </div>
                                                <div className="text-xl font-bold tracking-wider text-zinc-700 dark:text-zinc-300 font-mono shrink-0">
                                                    {elapsedTimeText}
                                                </div>
                                            </div>
                                        )}

                                        {/* Large Dynamic Live Journey (Jornada) Timer */}
                                        {activeJourney && journeyTimeText && (
                                            <div className="rounded-2xl border border-amber-250/20 bg-amber-500/5 p-5 dark:border-amber-900/30 dark:bg-amber-950/10 flex flex-col sm:flex-row items-center justify-between gap-4 backdrop-blur-xl">
                                                <div className="flex items-center gap-3">
                                                    <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-amber-500/10 text-amber-600 dark:text-amber-400 shrink-0">
                                                        <Compass className="h-5 w-5 animate-spin-slow text-amber-500" />
                                                    </div>
                                                    <div className="text-left">
                                                        <p className="text-[10px] font-bold text-amber-600 dark:text-amber-400 uppercase tracking-widest leading-none">
                                                            Tiempo Transcurrido de Jornada
                                                        </p>
                                                        <p className="text-xs font-semibold text-zinc-500 dark:text-zinc-400 mt-1">
                                                            Jornada iniciada a las {new Date(activeJourney.start).toLocaleTimeString("es-ES", { hour: "2-digit", minute: "2-digit" })}
                                                        </p>
                                                    </div>
                                                </div>
                                                <div className="text-4xl sm:text-5xl font-black tracking-widest text-amber-500 dark:text-amber-400 font-mono select-all">
                                                    {journeyTimeText}
                                                </div>
                                            </div>
                                        )}


                                        <div className="flex flex-col gap-6 w-full">
                                            {/* Horizontal Flex container for Box A and Box B */}
                                            <div className="flex flex-col md:flex-row gap-6 w-full">
                                                {/* Box A: Power Outage Reporter (power_outages table + trigger) */}
                                                <div className="flex-1 rounded-xl border border-zinc-150 bg-zinc-50/50 p-6 dark:border-zinc-800/80 dark:bg-zinc-950/20 space-y-6 flex flex-col justify-between">
                                                    <div className="space-y-4">
                                                        <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-zinc-500 dark:text-zinc-400">
                                                            <Zap className="h-4 w-4" />
                                                            Estado de Energía Eléctrica
                                                        </div>

                                                        {/* Energy Status Card Visual Indicator */}
                                                        <div className={`rounded-xl p-4 flex flex-row items-center gap-3 sm:gap-4 border overflow-hidden min-w-0 ${activeOutage
                                                            ? "bg-red-50/50 border-red-200/50 text-red-900 dark:bg-red-950/20 dark:border-red-900/30 dark:text-red-300"
                                                            : "bg-emerald-50/50 border-emerald-200/50 text-emerald-900 dark:bg-emerald-950/20 dark:border-emerald-900/30 dark:text-emerald-300"
                                                            }`}>
                                                            <div className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-xl font-bold ${activeOutage
                                                                ? "bg-red-100 text-red-700 dark:bg-red-950 dark:text-red-400"
                                                                : "bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-400"
                                                                }`}>
                                                                {activeOutage ? <ZapOff className="h-6 w-6" /> : <Zap className="h-6 w-6" />}
                                                            </div>
                                                            <div className="text-left min-w-0 flex-1">
                                                                <div className="text-[10px] font-bold uppercase tracking-wider text-zinc-400 dark:text-zinc-500">
                                                                    Estado Actual
                                                                </div>
                                                                <div className="text-sm font-bold uppercase break-words leading-tight">
                                                                    {activeOutage ? "SIN LUZ" : "ENERGÍA NORMAL"}
                                                                </div>
                                                            </div>
                                                        </div>

                                                        {activeOutage && (
                                                            <div className="text-xs text-red-650 dark:text-red-400 font-medium flex items-center gap-1.5">
                                                                <Clock className="h-3.5 w-3.5" />
                                                                <span>Corte reportado: {new Date(activeOutage.start).toLocaleTimeString("es-ES")}</span>
                                                            </div>
                                                        )}
                                                    </div>

                                                    {/* Report Button */}
                                                    <button
                                                        onClick={handleToggleOutage}
                                                        disabled={actionLoading === "outage"}
                                                        className={`w-full flex items-center justify-center gap-2 rounded-xl py-3 text-sm font-bold shadow-lg transition-all active:scale-[0.97] cursor-pointer ${activeOutage
                                                            ? "bg-emerald-600 hover:bg-emerald-500 text-white shadow-emerald-600/10"
                                                            : "bg-red-600 hover:bg-red-500 text-white shadow-red-600/10"
                                                            }`}
                                                    >
                                                        {actionLoading === "outage" ? (
                                                            <Loader2 className="h-4 w-4 animate-spin" />
                                                        ) : activeOutage ? (
                                                            <>
                                                                <Zap className="h-4 w-4 fill-current" />
                                                                Luz Restablecida
                                                            </>
                                                        ) : (
                                                            <>
                                                                <ZapOff className="h-4 w-4 fill-current" />
                                                                Reportar Corte de Luz
                                                            </>
                                                        )}
                                                    </button>
                                                </div>

                                                {/* Box B: Shift / Journey Tracker (journey table + triggers) */}
                                                <div className="flex-1 rounded-xl border border-zinc-150 bg-zinc-50/50 p-6 dark:border-zinc-800/80 dark:bg-zinc-950/20 space-y-6 flex flex-col justify-between">
                                                    <div className="space-y-4">
                                                        <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-zinc-500 dark:text-zinc-400">
                                                            <Compass className="h-4 w-4" />
                                                            Seguimiento de Mi Jornada
                                                        </div>

                                                        {/* Journey Status Card Visual Indicator */}
                                                        <div className={`rounded-xl p-4 flex flex-row items-center gap-3 sm:gap-4 border overflow-hidden min-w-0 ${activeJourney
                                                            ? "bg-amber-50/50 border-amber-200/50 text-amber-905 dark:bg-amber-950/20 dark:border-amber-900/30 dark:text-amber-300"
                                                            : "bg-zinc-100/50 border-zinc-200/50 text-zinc-800 dark:bg-zinc-950/20 dark:border-zinc-800/30 dark:text-zinc-400"
                                                            }`}>
                                                            <div className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-xl font-bold ${activeJourney
                                                                ? "bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-400"
                                                                : "bg-zinc-200 text-zinc-700 dark:bg-zinc-800 dark:text-zinc-400"
                                                                }`}>
                                                                <Compass className={`h-6 w-6 ${activeJourney ? "animate-spin-slow" : ""}`} />
                                                            </div>
                                                            <div className="text-left min-w-0 flex-1">
                                                                <div className="text-[10px] font-bold uppercase tracking-wider text-zinc-400 dark:text-zinc-500">
                                                                    Estado
                                                                </div>
                                                                <div className="text-sm font-bold uppercase break-words leading-tight">
                                                                    {activeJourney ? "EN TRÁNSITO" : "EN ESPERA"}
                                                                </div>
                                                            </div>
                                                        </div>

                                                        {activeJourney ? (
                                                            <div className="space-y-2">
                                                                <div className="text-xs text-amber-650 dark:text-amber-400 font-medium flex items-center gap-1.5">
                                                                    <Clock className="h-3.5 w-3.5" />
                                                                    <span>Jornada iniciada: {new Date(activeJourney.start).toLocaleTimeString("es-ES")}</span>
                                                                </div>
                                                                <div className="text-xs font-semibold text-zinc-650 dark:text-zinc-350 flex items-center gap-1.5">
                                                                    <span>Tipo:</span>
                                                                    <span className="px-2 py-0.5 rounded-full text-[9px] uppercase font-bold bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20">{activeJourney.type || "Presencial"}</span>
                                                                </div>
                                                            </div>
                                                        ) : (
                                                            <div className="space-y-2 pt-1.5 border-t border-zinc-150/40 dark:border-zinc-800/30">
                                                                <label className="text-[10px] font-bold uppercase tracking-wider text-zinc-400 dark:text-zinc-500">
                                                                    Tipo de Jornada
                                                                </label>
                                                                <div className="flex gap-2">
                                                                    <button
                                                                        type="button"
                                                                        onClick={() => setJourneyType("Presencial")}
                                                                        className={`flex-1 py-1.5 text-xs font-bold rounded-lg border transition-all cursor-pointer ${
                                                                            journeyType === "Presencial"
                                                                                ? "bg-amber-500/10 border-amber-500 text-amber-600 dark:text-amber-400"
                                                                                : "bg-white border-zinc-200 text-zinc-600 hover:bg-zinc-50 dark:bg-zinc-900/40 dark:border-zinc-800 dark:text-zinc-450 dark:hover:bg-zinc-900/80"
                                                                        }`}
                                                                    >
                                                                        Presencial
                                                                    </button>
                                                                    <button
                                                                        type="button"
                                                                        onClick={() => setJourneyType("Remoto")}
                                                                        className={`flex-1 py-1.5 text-xs font-bold rounded-lg border transition-all cursor-pointer ${
                                                                            journeyType === "Remoto"
                                                                                ? "bg-amber-500/10 border-amber-500 text-amber-600 dark:text-amber-400"
                                                                                : "bg-white border-zinc-200 text-zinc-600 hover:bg-zinc-50 dark:bg-zinc-900/40 dark:border-zinc-800 dark:text-zinc-450 dark:hover:bg-zinc-900/80"
                                                                        }`}
                                                                    >
                                                                        Remoto
                                                                    </button>
                                                                </div>
                                                            </div>
                                                        )}
                                                    </div>

                                                    {/* Journey Button */}
                                                    <button
                                                        onClick={handleToggleJourney}
                                                        disabled={actionLoading === "journey"}
                                                        className={`w-full flex items-center justify-center gap-2 rounded-xl py-3 text-sm font-bold shadow-lg transition-all active:scale-[0.97] cursor-pointer ${activeJourney
                                                            ? "bg-zinc-700 hover:bg-zinc-650 text-white dark:bg-zinc-800 dark:hover:bg-zinc-700 dark:border dark:border-zinc-700 shadow-zinc-800/10"
                                                            : "bg-zinc-900 hover:bg-zinc-850 text-white dark:bg-zinc-50 dark:text-zinc-950 dark:hover:bg-zinc-200 shadow-zinc-900/10"
                                                            }`}
                                                    >
                                                        {actionLoading === "journey" ? (
                                                            <Loader2 className="h-4 w-4 animate-spin" />
                                                        ) : activeJourney ? (
                                                            <>
                                                                <Square className="h-4 w-4 fill-current" />
                                                                Finalizar Jornada
                                                            </>
                                                        ) : (
                                                            <>
                                                                <Play className="h-4 w-4 fill-current" />
                                                                Iniciar Jornada
                                                            </>
                                                        )}
                                                    </button>
                                                </div>
                                            </div>

                                            {/* Box C: Live Group Members Tracker */}
                                            <div className="w-full rounded-xl border border-zinc-150 bg-zinc-50/50 p-6 dark:border-zinc-800/80 dark:bg-zinc-950/20 space-y-6">
                                                <div className="flex items-center justify-between">
                                                    <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-zinc-500 dark:text-zinc-400">
                                                        <Users className="h-4 w-4" />
                                                        Miembros del Grupo y su Estado de Tránsito
                                                    </div>
                                                    <span className="min-w-[5rem] inline-flex items-center rounded-full bg-zinc-100 px-2.5 py-0.5 text-xs font-semibold text-zinc-800 dark:bg-zinc-800 dark:text-zinc-300">
                                                        {sessionMembers.length} {sessionMembers.length === 1 ? "miembro" : "miembros"}
                                                    </span>
                                                </div>

                                                <div className="flex flex-col sm:flex-row flex-wrap gap-4">
                                                    {sessionMembers.map((member) => (
                                                        <div
                                                            key={member.id}
                                                            className={`flex-1 w-full rounded-xl p-4 border flex items-center justify-between gap-3 transition-all duration-200 overflow-hidden ${member.activeJourney
                                                                ? "bg-amber-50/30 border-amber-250/30 dark:bg-amber-950/10 dark:border-amber-900/20"
                                                                : "bg-white/80 border-zinc-200/50 dark:bg-zinc-900/40 dark:border-zinc-800/50"
                                                                }`}
                                                        >
                                                            <div className="flex items-center gap-3 min-w-0 flex-1">
                                                                <div className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg font-bold text-xs uppercase ${member.activeJourney
                                                                    ? "bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-400"
                                                                    : "bg-zinc-100 text-zinc-600 dark:bg-zinc-800 dark:text-zinc-400"
                                                                    }`}>
                                                                    {member.name.substring(0, 2)}
                                                                </div>
                                                                <div className="text-left min-w-0 flex-1">
                                                                    <p className="text-sm font-bold text-zinc-850 dark:text-zinc-250 truncate">
                                                                        {member.name} {member.id === userId && <span className="text-[10px] text-zinc-400 dark:text-zinc-500 font-normal ml-1 shrink-0">(Tú)</span>}
                                                                    </p>
                                                                    <p className="text-[10px] text-zinc-400 dark:text-zinc-500 truncate">
                                                                        {member.email}
                                                                    </p>
                                                                    {member.activeJourney && (
                                                                        <p className="text-[9px] font-bold text-amber-600 dark:text-amber-400 uppercase tracking-wide mt-0.5">
                                                                            {member.activeJourney.type === "Remoto" ? "Remoto" : "Presencial"}
                                                                        </p>
                                                                    )}
                                                                </div>
                                                            </div>

                                                            <div className="flex items-center gap-2 shrink-0">
                                                                {member.activeJourney ? (
                                                                    <span className="inline-flex items-center gap-1.5 rounded-full bg-amber-100 dark:bg-amber-950 px-2.5 py-0.5 text-[10px] font-bold text-amber-800 dark:text-amber-400 animate-pulse">
                                                                        <span className="h-1.5 w-1.5 rounded-full bg-amber-500" />
                                                                        En Tránsito
                                                                    </span>
                                                                ) : (
                                                                    <span className="inline-flex items-center gap-1.5 rounded-full bg-zinc-100 dark:bg-zinc-800 px-2.5 py-0.5 text-[10px] font-bold text-zinc-600 dark:text-zinc-400">
                                                                        <span className="h-1.5 w-1.5 rounded-full bg-zinc-400" />
                                                                        En Espera
                                                                    </span>
                                                                )}
                                                            </div>
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>

                                            {/* Closing/Meta session action row (Uses cascading triggers!) */}
                                            <div className="w-full pt-6 border-t border-zinc-100 dark:border-zinc-800/80 flex flex-col sm:flex-row items-center justify-between gap-4 overflow-hidden min-w-0">
                                                <div className="text-xs text-zinc-500 dark:text-zinc-400 text-center sm:text-left min-w-0 flex-1 space-y-1">
                                                    <div>
                                                        <span className="font-semibold text-zinc-900 dark:text-zinc-300">Sesión ID:</span> #{activeSession.id}
                                                    </div>
                                                    <div className="text-[10px] text-zinc-450 dark:text-zinc-500 leading-normal break-words">
                                                        Iniciada el {new Date(activeSession.created_at).toLocaleDateString("es-ES")} a las {new Date(activeSession.created_at).toLocaleTimeString("es-ES", { hour: '2-digit', minute: '2-digit' })}
                                                    </div>
                                                </div>

                                                {isOwnerOfSelected() && (
                                                    <button
                                                        onClick={handleCloseSession}
                                                        disabled={actionLoading === "session"}
                                                        className="w-full sm:w-auto shrink-0 flex items-center justify-center gap-2 rounded-lg border border-red-200 hover:bg-red-50 dark:border-red-900/30 dark:hover:bg-red-950/20 text-red-650 dark:text-red-400 px-4 py-2 text-xs font-bold transition-all active:scale-95 cursor-pointer"
                                                    >
                                                        {actionLoading === "session" ? (
                                                            <Loader2 className="h-3.5 w-3.5 animate-spin" />
                                                        ) : (
                                                            <>
                                                                <Square className="h-3.5 w-3.5" />
                                                                Cerrar Sesión de Monitoreo
                                                            </>
                                                        )}
                                                    </button>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                </div>


                                {/* Administrar Grupos Panel (Debajo de la tarjeta principal, w-full) */}
                <div className="rounded-2xl border border-zinc-200/80 bg-white p-6 dark:border-zinc-800/80 dark:bg-zinc-900/50 backdrop-blur-xl space-y-6 transition-all duration-300 w-full shadow-sm">
                    <button
                        onClick={() => setGroupsExpanded(!groupsExpanded)}
                        className="w-full flex items-center justify-between text-sm font-bold uppercase tracking-wider text-zinc-400 hover:text-zinc-650 dark:hover:text-zinc-200 transition-colors focus:outline-none cursor-pointer"
                    >
                        <span className="flex items-center gap-2">
                            <Users className="h-4 w-4" />
                            Administrar Grupos
                        </span>
                        {groupsExpanded ? (
                            <ChevronUp className="h-4 w-4 transition-transform duration-200" />
                        ) : (
                            <ChevronDown className="h-4 w-4 transition-transform duration-200" />
                        )}
                    </button>

                    {groupsExpanded && (
                        <div className="space-y-6 pt-2 animate-fadeIn">
                            {/* Forms in horizontal flex grid for premium look */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                {/* Create Group Form */}
                                <form onSubmit={handleCreateGroup} className="space-y-3">
                                    <div className="space-y-1.5">
                                        <label htmlFor="groupName" className="text-xs font-bold text-zinc-500 dark:text-zinc-400">
                                            Crear Nuevo Grupo
                                        </label>
                                        <input
                                            type="text"
                                            id="groupName"
                                            required
                                            value={newGroupName}
                                            onChange={(e) => setNewGroupName(e.target.value)}
                                            placeholder="Ej. Casa, Trabajo, Familia"
                                            className="block w-full rounded-lg border border-zinc-200 bg-zinc-50 px-3 py-2 text-sm text-zinc-950 dark:text-zinc-50 placeholder-zinc-400 focus:border-zinc-400 focus:bg-white dark:focus:bg-zinc-900 focus:outline-none dark:border-zinc-800 dark:bg-zinc-950 dark:placeholder-zinc-600 dark:focus:border-zinc-700"
                                        />
                                    </div>
                                    <button
                                        type="submit"
                                        disabled={actionLoading === "createGroup" || !newGroupName.trim()}
                                        className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-lg bg-zinc-900 hover:bg-zinc-850 disabled:bg-zinc-300 dark:bg-zinc-50 dark:hover:bg-zinc-200 dark:disabled:bg-zinc-800/50 text-white dark:text-zinc-950 px-5 py-2.5 text-xs font-semibold shadow-sm transition-all active:scale-95 cursor-pointer"
                                    >
                                        {actionLoading === "createGroup" ? (
                                            <Loader2 className="h-3.5 w-3.5 animate-spin" />
                                        ) : (
                                            <>
                                                <Plus className="h-3.5 w-3.5" />
                                                Crear Grupo
                                            </>
                                        )}
                                    </button>
                                </form>

                                {/* Send Invite Form (Only visible if groups exist) */}
                                {selectedGroupId && (
                                    <form onSubmit={handleSendInvite} className="space-y-3">
                                        <div className="space-y-1.5">
                                            <label htmlFor="inviteEmail" className="text-xs font-bold text-zinc-500 dark:text-zinc-400">
                                                Invitar Miembro a "{getSelectedGroupName()}"
                                            </label>
                                            <input
                                                type="email"
                                                id="inviteEmail"
                                                required
                                                value={inviteEmail}
                                                onChange={(e) => setInviteEmail(e.target.value)}
                                                placeholder="correo@ejemplo.com"
                                                className="block w-full rounded-lg border border-zinc-200 bg-zinc-50 px-3 py-2 text-sm text-zinc-950 dark:text-zinc-50 placeholder-zinc-400 focus:border-zinc-400 focus:bg-white dark:focus:bg-zinc-900 focus:outline-none dark:border-zinc-800 dark:bg-zinc-950 dark:placeholder-zinc-600 dark:focus:border-zinc-700"
                                            />
                                        </div>
                                        <button
                                            type="submit"
                                            disabled={actionLoading === "invite" || !inviteEmail.trim()}
                                            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-lg border border-zinc-200 hover:bg-zinc-100 dark:border-zinc-800 dark:hover:bg-zinc-800/80 text-zinc-700 dark:text-zinc-300 px-5 py-2.5 text-xs font-semibold shadow-sm transition-all active:scale-95 cursor-pointer"
                                        >
                                            {actionLoading === "invite" ? (
                                                <Loader2 className="h-3.5 w-3.5 animate-spin" />
                                            ) : (
                                                <>
                                                    <UserPlus className="h-3.5 w-3.5" />
                                                    Enviar Invitación
                                                </>
                                            )}
                                        </button>
                                    </form>
                                )}
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}

export const getServerSideProps: GetServerSideProps = async (context) => {
    // NextAuth v5 server check to secure dashboard route (passing req and res for correct header/cookie resolution in production)
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
