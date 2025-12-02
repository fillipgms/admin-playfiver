"use client";

import { useState, useEffect, useRef, useMemo, useCallback } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import {
    CaretDownIcon,
    CaretUpIcon,
    WarningCircleIcon,
    XCircleIcon,
    InfoIcon,
    CheckCircleIcon,
    FunnelIcon,
    XIcon,
} from "@phosphor-icons/react";
import PaginationControls from "@/components/PaginationControls";
import { Card } from "@/components/Card";
import { searchUser } from "@/actions/user";
import { getAgentsData } from "@/actions/agents";

interface LogsContentProps {
    initialData: LogsResponse;
    params: Record<string, string | string[] | undefined>;
}

function formatRelativeTime(dateString: string): string {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffSec = Math.floor(diffMs / 1000);
    const diffMin = Math.floor(diffSec / 60);
    const diffHrs = Math.floor(diffMin / 60);
    const diffDays = Math.floor(diffHrs / 24);

    if (diffMin < 1) return "agora mesmo";
    if (diffMin < 60) return `há ${diffMin} min`;
    if (diffHrs < 24) return `há ${diffHrs}h`;
    if (diffDays === 0) return "Hoje";
    if (diffDays === 1) return "Ontem";
    if (diffDays < 7) return `há ${diffDays} dias`;

    return new Intl.DateTimeFormat("pt-BR", {
        day: "numeric",
        month: "short",
        year: "numeric",
    }).format(date);
}

function formatDateGroup(dateString: string): string {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

    if (diffDays === 0) return "Hoje";
    if (diffDays === 1) return "Ontem";

    return new Intl.DateTimeFormat("pt-BR", {
        weekday: "short",
        day: "2-digit",
        month: "short",
        year: "numeric",
    }).format(date);
}

function formatTime(dateString: string): string {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat("pt-BR", {
        hour: "2-digit",
        minute: "2-digit",
        hour12: false,
    }).format(date);
}

function getInitials(name?: string, email?: string): string {
    if (name) {
        const parts = name.trim().split(" ");
        if (parts.length >= 2) {
            return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
        }
        return name[0].toUpperCase();
    }
    if (email) {
        return email[0].toUpperCase();
    }
    return "?";
}

function getGravityVariant(
    gravity?: string
): "default" | "destructive" | "outline" {
    if (!gravity) return "outline";
    const lower = gravity.toLowerCase();
    if (lower.includes("error") || lower.includes("critical"))
        return "destructive";
    if (lower.includes("warning")) return "outline";
    return "default";
}

function getGravityIcon(gravity?: string) {
    if (!gravity) return <InfoIcon className="size-4" />;
    const lower = gravity.toLowerCase();
    if (lower.includes("error") || lower.includes("critical")) {
        return <XCircleIcon className="size-4" />;
    }
    if (lower.includes("warning")) {
        return <WarningCircleIcon className="size-4" />;
    }
    if (lower.includes("success")) {
        return <CheckCircleIcon className="size-4" />;
    }
    return <InfoIcon className="size-4" />;
}

export default function LogsContent({ initialData, params }: LogsContentProps) {
    const router = useRouter();
    const searchParams = useSearchParams();

    const getParamValue = (param?: string | string[]) =>
        Array.isArray(param) ? param[0] : param;

    const parseArrayParam = (param?: string | string[]): string[] => {
        const value = getParamValue(param);
        if (!value) return [];
        try {
            return JSON.parse(value);
        } catch {
            return [];
        }
    };

    const [users, setUsers] = useState<string[]>(
        parseArrayParam(params.user) || []
    );
    const [agents, setAgents] = useState<string[]>(
        parseArrayParam(params.agent) || []
    );
    const [gravities, setGravities] = useState<string[]>(
        parseArrayParam(params.gravity) || []
    );
    const [types, setTypes] = useState<string[]>(
        parseArrayParam(params.type) || []
    );
    const [dateStart, setDateStart] = useState<string>(
        getParamValue(params.dateStart) || ""
    );
    const [dateEnd, setDateEnd] = useState<string>(
        getParamValue(params.dateEnd) || ""
    );
    const [expandedDates, setExpandedDates] = useState<Set<string>>(new Set());
    const [data, setData] = useState<LogEntryProps[]>(initialData.data);
    const [isInitialized, setIsInitialized] = useState(false);
    const [showFilters, setShowFilters] = useState(false);

    // User search state
    const [userSearchTerm, setUserSearchTerm] = useState("");
    const [foundUsers, setFoundUsers] = useState<
        Array<{ id: number | string; name: string; email: string }>
    >([]);
    const [isUserSearching, setIsUserSearching] = useState(false);
    const userSearchTimeoutRef = useRef<NodeJS.Timeout | null>(null);

    // Agent search state
    const [agentSearchTerm, setAgentSearchTerm] = useState("");
    const [foundAgents, setFoundAgents] = useState<
        Array<{ id: number; code: string; memo: string }>
    >([]);
    const [isAgentSearching, setIsAgentSearching] = useState(false);
    const agentSearchTimeoutRef = useRef<NodeJS.Timeout | null>(null);

    // Update data when initialData changes
    useEffect(() => {
        setData(initialData.data);
    }, [initialData]);

    // Group logs by date
    const groupedLogs = useMemo(() => {
        const groups: Record<string, LogEntryProps[]> = {};
        data.forEach((log) => {
            const dateGroup = formatDateGroup(log.created_at);
            if (!groups[dateGroup]) {
                groups[dateGroup] = [];
            }
            groups[dateGroup].push(log);
        });
        return groups;
    }, [data]);

    // Filter logs
    const filteredLogs = useMemo(() => {
        let filtered = data;

        // Filter by gravity
        if (gravities.length > 0) {
            filtered = filtered.filter((log) =>
                gravities.some((g) =>
                    log.gravity?.toLowerCase().includes(g.toLowerCase())
                )
            );
        }

        // Filter by type
        if (types.length > 0) {
            filtered = filtered.filter((log) =>
                types.some((t) => log.type?.toLowerCase() === t.toLowerCase())
            );
        }

        // Filter by date range (for client-side refinement)
        if (dateStart || dateEnd) {
            filtered = filtered.filter((log) => {
                const logDate = new Date(log.created_at).getTime();
                if (dateStart) {
                    const start = new Date(dateStart).getTime();
                    if (logDate < start) return false;
                }
                if (dateEnd) {
                    const end = new Date(dateEnd).getTime();
                    if (logDate > end) return false;
                }
                return true;
            });
        }

        return filtered;
    }, [data, gravities, types, dateStart, dateEnd]);

    // Group filtered logs
    const filteredGroupedLogs = useMemo(() => {
        const groups: Record<string, LogEntryProps[]> = {};
        filteredLogs.forEach((log) => {
            const dateGroup = formatDateGroup(log.created_at);
            if (!groups[dateGroup]) {
                groups[dateGroup] = [];
            }
            groups[dateGroup].push(log);
        });
        return groups;
    }, [filteredLogs]);

    // Get unique gravities and types for filter options
    const uniqueGravities = useMemo(() => {
        const gravities = new Set<string>();
        data.forEach((log) => {
            if (log.gravity) gravities.add(log.gravity);
        });
        return Array.from(gravities).sort();
    }, [data]);

    const uniqueTypes = useMemo(() => {
        const types = new Set<string>();
        data.forEach((log) => {
            if (log.type) types.add(log.type);
        });
        return Array.from(types).sort();
    }, [data]);

    // Count statistics
    const stats = useMemo(() => {
        const all = data.length;
        const errors = data.filter(
            (log) =>
                log.gravity?.toLowerCase().includes("error") ||
                log.gravity?.toLowerCase().includes("critical")
        ).length;
        const warnings = data.filter((log) =>
            log.gravity?.toLowerCase().includes("warning")
        ).length;
        const resolved = data.filter((log) => log.data?.status === 1).length;
        const unresolved = all - resolved;

        return { all, errors, warnings, resolved, unresolved };
    }, [data]);

    const hasActiveFilters = useMemo(() => {
        return !!(
            gravities.length > 0 ||
            types.length > 0 ||
            users.length > 0 ||
            agents.length > 0 ||
            dateStart ||
            dateEnd
        );
    }, [gravities, types, users, agents, dateStart, dateEnd]);

    const updateUrlParams = useCallback(
        (updates: Record<string, string>) => {
            const params = new URLSearchParams(searchParams?.toString() || "");

            Object.entries(updates).forEach(([key, value]) => {
                if (value && value !== "") {
                    params.set(key, value);
                } else {
                    params.delete(key);
                }
            });

            params.set("page", "1");
            params.set("tab", "logs");

            router.replace(`/relatorios?${params.toString()}`);
        },
        [searchParams, router]
    );

    const handleGravityChange = useCallback(
        (gravity: string, checked: boolean) => {
            const newGravities = checked
                ? [...gravities, gravity]
                : gravities.filter((g) => g !== gravity);
            setGravities(newGravities);

            updateUrlParams({
                gravity:
                    newGravities.length > 0 ? JSON.stringify(newGravities) : "",
            });
        },
        [gravities, updateUrlParams]
    );

    const handleTypeChange = useCallback(
        (type: string, checked: boolean) => {
            const newTypes = checked
                ? [...types, type]
                : types.filter((t) => t !== type);
            setTypes(newTypes);

            updateUrlParams({
                type: newTypes.length > 0 ? JSON.stringify(newTypes) : "",
            });
        },
        [types, updateUrlParams]
    );

    const handleDateStartChange = useCallback(
        (date: string) => {
            setDateStart(date);
            updateUrlParams({ dateStart: date });
        },
        [updateUrlParams]
    );

    const handleDateEndChange = useCallback(
        (date: string) => {
            setDateEnd(date);
            updateUrlParams({ dateEnd: date });
        },
        [updateUrlParams]
    );

    const handleUserSearch = useCallback((value: string) => {
        setUserSearchTerm(value);

        if (userSearchTimeoutRef.current) {
            clearTimeout(userSearchTimeoutRef.current);
        }

        if (value.length < 3) {
            setFoundUsers([]);
            return;
        }

        userSearchTimeoutRef.current = setTimeout(async () => {
            setIsUserSearching(true);
            try {
                const result = await searchUser(value);
                if (
                    result.success &&
                    result.data &&
                    Array.isArray(result.data.data)
                ) {
                    setFoundUsers(
                        result.data.data.map((u: any) => ({
                            id: u.id,
                            name: u.name || u.email,
                            email: u.email,
                        }))
                    );
                } else {
                    setFoundUsers([]);
                }
            } catch (error) {
                setFoundUsers([]);
            } finally {
                setIsUserSearching(false);
            }
        }, 300);
    }, []);

    const handleAgentSearch = useCallback((value: string) => {
        setAgentSearchTerm(value);

        if (agentSearchTimeoutRef.current) {
            clearTimeout(agentSearchTimeoutRef.current);
        }

        if (value.length < 3) {
            setFoundAgents([]);
            return;
        }

        agentSearchTimeoutRef.current = setTimeout(async () => {
            setIsAgentSearching(true);
            try {
                const result = await getAgentsData({ search: value, page: 1 });
                if (result && result.data && Array.isArray(result.data)) {
                    setFoundAgents(
                        result.data.map((agent: Agent) => ({
                            id: agent.id,
                            code: agent.agent_code,
                            memo: agent.agent_memo || agent.agent_code,
                        }))
                    );
                } else {
                    setFoundAgents([]);
                }
            } catch (error) {
                setFoundAgents([]);
            } finally {
                setIsAgentSearching(false);
            }
        }, 300);
    }, []);

    const handleUserSelect = useCallback(
        (user: { id: number | string; name: string; email: string }) => {
            const userId = user.id.toString();
            if (!users.includes(userId)) {
                const newUsers = [...users, userId];
                setUsers(newUsers);
                updateUrlParams({
                    user: JSON.stringify(newUsers),
                });
            }
            setUserSearchTerm("");
            setFoundUsers([]);
        },
        [users, updateUrlParams]
    );

    const handleAgentSelect = useCallback(
        (agent: { id: number; code: string; memo: string }) => {
            const agentId = agent.id.toString();
            if (!agents.includes(agentId)) {
                const newAgents = [...agents, agentId];
                setAgents(newAgents);
                updateUrlParams({
                    agent: JSON.stringify(newAgents),
                });
            }
            setAgentSearchTerm("");
            setFoundAgents([]);
        },
        [agents, updateUrlParams]
    );

    const handleUserFilterClear = useCallback(() => {
        setUsers([]);
        setUserSearchTerm("");
        updateUrlParams({ user: "" });
    }, [updateUrlParams]);

    const handleAgentFilterClear = useCallback(() => {
        setAgents([]);
        setAgentSearchTerm("");
        updateUrlParams({ agent: "" });
    }, [updateUrlParams]);

    const clearAllFilters = useCallback(() => {
        setGravities([]);
        setTypes([]);
        setUsers([]);
        setAgents([]);
        setDateStart("");
        setDateEnd("");
        setUserSearchTerm("");
        setAgentSearchTerm("");
        updateUrlParams({
            gravity: "",
            type: "",
            user: "",
            agent: "",
            dateStart: "",
            dateEnd: "",
        });
    }, [updateUrlParams]);

    const handleRemoveUser = useCallback(
        (userId: string) => {
            const newUsers = users.filter((id) => id !== userId);
            setUsers(newUsers);
            updateUrlParams({
                user: newUsers.length > 0 ? JSON.stringify(newUsers) : "",
            });
        },
        [users, updateUrlParams]
    );

    const handleRemoveAgent = useCallback(
        (agentId: string) => {
            const newAgents = agents.filter((id) => id !== agentId);
            setAgents(newAgents);
            updateUrlParams({
                agent: newAgents.length > 0 ? JSON.stringify(newAgents) : "",
            });
        },
        [agents, updateUrlParams]
    );

    const toggleDateGroup = useCallback((dateGroup: string) => {
        setExpandedDates((prev) => {
            const newSet = new Set(prev);
            if (newSet.has(dateGroup)) {
                newSet.delete(dateGroup);
            } else {
                newSet.add(dateGroup);
            }
            return newSet;
        });
    }, []);

    // Auto-expand all groups on initialization
    useEffect(() => {
        if (!isInitialized && Object.keys(filteredGroupedLogs).length > 0) {
            setExpandedDates(new Set(Object.keys(filteredGroupedLogs)));
            setIsInitialized(true);
        }
    }, [filteredGroupedLogs, isInitialized]);

    // Cleanup timeouts
    useEffect(() => {
        return () => {
            if (userSearchTimeoutRef.current) {
                clearTimeout(userSearchTimeoutRef.current);
            }
            if (agentSearchTimeoutRef.current) {
                clearTimeout(agentSearchTimeoutRef.current);
            }
        };
    }, []);

    // Sync state with URL params when they change
    useEffect(() => {
        const newUsers = parseArrayParam(params.user) || [];
        const newAgents = parseArrayParam(params.agent) || [];
        if (JSON.stringify(newUsers) !== JSON.stringify(users)) {
            setUsers(newUsers);
        }
        if (JSON.stringify(newAgents) !== JSON.stringify(agents)) {
            setAgents(newAgents);
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [params.user, params.agent]);

    const isResolved = (log: LogEntryProps) => log.data?.status === 1;

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                    <h2 className="text-3xl font-bold tracking-tight">
                        Logs do Sistema
                    </h2>
                    <p className="text-sm text-foreground/60 mt-2">
                        Monitore e analise os eventos do seu sistema
                    </p>
                </div>
            </div>

            {/* Filters Toggle */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div />
                <div className="flex flex-col sm:flex-row gap-3">
                    <Button
                        variant="outline"
                        onClick={() => setShowFilters(!showFilters)}
                        className="flex items-center gap-2"
                    >
                        <FunnelIcon className="size-4" />
                        Filtros
                        {hasActiveFilters && (
                            <div className="h-2 w-2 rounded-full bg-primary" />
                        )}
                    </Button>

                    {hasActiveFilters && (
                        <Button
                            variant="ghost"
                            onClick={clearAllFilters}
                            className="text-muted-foreground hover:text-foreground"
                        >
                            Limpar filtros
                        </Button>
                    )}
                </div>
            </div>

            {showFilters && (
                <Card className="p-4 bg-card/50 backdrop-blur-sm border-border/50">
                    <div className="space-y-4">
                        {/* User and Agent Search */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            {/* User Search */}
                            <div className="space-y-1.5">
                                <label className="text-xs font-medium text-muted-foreground ml-1">
                                    Filtrar por Usuário
                                </label>
                                <div className="relative">
                                    <Input
                                        placeholder="Pesquise usuários (mín. 3 caracteres)"
                                        value={userSearchTerm}
                                        onChange={(e) =>
                                            handleUserSearch(e.target.value)
                                        }
                                        className="bg-background h-9"
                                    />
                                    {(foundUsers.length > 0 || isUserSearching) &&
                                        userSearchTerm.length >= 3 && (
                                            <div className="absolute z-10 w-full mt-1 border rounded-md bg-popover shadow-lg max-h-48 overflow-y-auto">
                                                {isUserSearching && (
                                                    <div className="flex items-center justify-center p-3 text-sm text-muted-foreground">
                                                        Buscando...
                                                    </div>
                                                )}
                                                {foundUsers.map((user) => (
                                                    <div
                                                        key={user.id}
                                                        className="p-3 cursor-pointer hover:bg-accent hover:text-accent-foreground text-sm flex flex-col transition-colors"
                                                        onClick={() =>
                                                            handleUserSelect(user)
                                                        }
                                                    >
                                                        <span className="font-medium">
                                                            {user.name}
                                                        </span>
                                                        <span className="text-xs text-muted-foreground">
                                                            {user.email}
                                                        </span>
                                                    </div>
                                                ))}
                                                {foundUsers.length === 0 &&
                                                    !isUserSearching && (
                                                        <div className="p-3 text-sm text-muted-foreground">
                                                            Nenhum usuário
                                                            encontrado.
                                                        </div>
                                                    )}
                                            </div>
                                        )}
                                </div>
                                {users.length > 0 && (
                                    <div className="flex flex-wrap gap-1 mt-2">
                                        {users.map((userId) => (
                                            <Badge
                                                key={userId}
                                                variant="secondary"
                                                className="gap-1 cursor-pointer"
                                                onClick={() =>
                                                    handleRemoveUser(userId)
                                                }
                                            >
                                                Usuário: {userId}
                                                <XIcon className="size-3 " />
                                            </Badge>
                                        ))}
                                    </div>
                                )}
                            </div>

                            {/* Agent Search */}
                            <div className="space-y-1.5">
                                <label className="text-xs font-medium text-muted-foreground ml-1">
                                    Filtrar por Agente
                                </label>
                                <div className="relative">
                                    <Input
                                        placeholder="Pesquise agentes (mín. 3 caracteres)"
                                        value={agentSearchTerm}
                                        onChange={(e) =>
                                            handleAgentSearch(e.target.value)
                                        }
                                        className="bg-background h-9"
                                    />
                                    {(foundAgents.length > 0 || isAgentSearching) &&
                                        agentSearchTerm.length >= 3 && (
                                            <div className="absolute z-10 w-full mt-1 border rounded-md bg-popover shadow-lg max-h-48 overflow-y-auto">
                                                {isAgentSearching && (
                                                    <div className="flex items-center justify-center p-3 text-sm text-muted-foreground">
                                                        Buscando...
                                                    </div>
                                                )}
                                                {foundAgents.map((agent) => (
                                                    <div
                                                        key={agent.id}
                                                        className="p-3 cursor-pointer hover:bg-accent hover:text-accent-foreground text-sm flex flex-col transition-colors"
                                                        onClick={() =>
                                                            handleAgentSelect(agent)
                                                        }
                                                    >
                                                        <span className="font-medium">
                                                            {agent.memo}
                                                        </span>
                                                        <span className="text-xs text-muted-foreground">
                                                            {agent.code}
                                                        </span>
                                                    </div>
                                                ))}
                                                {foundAgents.length === 0 &&
                                                    !isAgentSearching && (
                                                        <div className="p-3 text-sm text-muted-foreground">
                                                            Nenhum agente
                                                            encontrado.
                                                        </div>
                                                    )}
                                            </div>
                                        )}
                                </div>
                                {agents.length > 0 && (
                                    <div className="flex flex-wrap gap-1 mt-2">
                                        {agents.map((agentId) => (
                                            <Badge
                                                key={agentId}
                                                variant="secondary"
                                                className="gap-1 cursor-pointer"
                                                onClick={() =>
                                                    handleRemoveAgent(agentId)
                                                }
                                            >
                                                Agente: {agentId}
                                                <XIcon className="size-3 " />
                                            </Badge>
                                        ))}
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Filter Chips */}
                        <div className="flex flex-wrap gap-2 items-center">
                            {/* Gravity Filter Popover */}
                            {uniqueGravities.length > 0 && (
                                <Popover>
                                    <PopoverTrigger asChild>
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            className="gap-2"
                                        >
                                            <FunnelIcon className="size-4" />
                                            Gravidade
                                            {gravities.length > 0 && (
                                                <Badge
                                                    variant="secondary"
                                                    className="ml-1"
                                                >
                                                    {gravities.length}
                                                </Badge>
                                            )}
                                        </Button>
                                    </PopoverTrigger>
                                    <PopoverContent className="w-60 p-0">
                                        <ScrollArea className="h-64">
                                            <div className="p-4 space-y-3">
                                                <p className="text-sm font-medium leading-none mb-3">
                                                    Filtrar por Gravidade
                                                </p>
                                                {uniqueGravities.map((gravity) => (
                                                    <label
                                                        key={gravity}
                                                        className="flex items-center space-x-2 cursor-pointer hover:bg-accent/50 p-2 rounded transition-colors"
                                                    >
                                                        <input
                                                            type="checkbox"
                                                            className="w-4 h-4 rounded border-input"
                                                            checked={gravities.includes(
                                                                gravity
                                                            )}
                                                            onChange={(e) =>
                                                                handleGravityChange(
                                                                    gravity,
                                                                    e.target.checked
                                                                )
                                                            }
                                                        />
                                                        <span className="text-sm font-medium flex-1">
                                                            {gravity}
                                                        </span>
                                                    </label>
                                                ))}
                                            </div>
                                        </ScrollArea>
                                    </PopoverContent>
                                </Popover>
                            )}

                            {/* Type Filter Popover */}
                            {uniqueTypes.length > 0 && (
                                <Popover>
                                    <PopoverTrigger asChild>
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            className="gap-2"
                                        >
                                            <FunnelIcon className="size-4" />
                                            Tipo
                                            {types.length > 0 && (
                                                <Badge
                                                    variant="secondary"
                                                    className="ml-1"
                                                >
                                                    {types.length}
                                                </Badge>
                                            )}
                                        </Button>
                                    </PopoverTrigger>
                                    <PopoverContent className="w-60 p-0">
                                        <ScrollArea className="h-64">
                                            <div className="p-4 space-y-3">
                                                <p className="text-sm font-medium leading-none mb-3">
                                                    Filtrar por Tipo
                                                </p>
                                                {uniqueTypes.map((type) => (
                                                    <label
                                                        key={type}
                                                        className="flex items-center space-x-2 cursor-pointer hover:bg-accent/50 p-2 rounded transition-colors"
                                                    >
                                                        <input
                                                            type="checkbox"
                                                            className="w-4 h-4 rounded border-input"
                                                            checked={types.includes(
                                                                type
                                                            )}
                                                            onChange={(e) =>
                                                                handleTypeChange(
                                                                    type,
                                                                    e.target.checked
                                                                )
                                                            }
                                                        />
                                                        <span className="text-sm font-medium flex-1">
                                                            {type}
                                                        </span>
                                                    </label>
                                                ))}
                                            </div>
                                        </ScrollArea>
                                    </PopoverContent>
                                </Popover>
                            )}

                            {/* Date Filters */}
                            <div className="flex gap-2 ml-auto">
                                <div className="flex items-center gap-2">
                                    <label className="text-xs font-medium text-muted-foreground">
                                        De:
                                    </label>
                                    <input
                                        type="date"
                                        value={dateStart}
                                        onChange={(e) =>
                                            handleDateStartChange(e.target.value)
                                        }
                                        className="px-2 py-1 text-sm border border-input rounded-md bg-background hover:bg-accent/50 transition-colors cursor-pointer"
                                    />
                                </div>
                                <div className="flex items-center gap-2">
                                    <label className="text-xs font-medium text-muted-foreground">
                                        Até:
                                    </label>
                                    <input
                                        type="date"
                                        value={dateEnd}
                                        onChange={(e) =>
                                            handleDateEndChange(e.target.value)
                                        }
                                        className="px-2 py-1 text-sm border border-input rounded-md bg-background hover:bg-accent/50 transition-colors cursor-pointer"
                                    />
                                </div>
                            </div>

                            {/* Clear Filters */}
                            {(gravities.length > 0 ||
                                types.length > 0 ||
                                users.length > 0 ||
                                agents.length > 0 ||
                                dateStart ||
                                dateEnd) && (
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={clearAllFilters}
                                    className="gap-2"
                                >
                                    <XIcon className="size-4" />
                                    Limpar
                                </Button>
                            )}
                        </div>

                        {/* Active Filters Display */}
                        {(gravities.length > 0 ||
                            types.length > 0 ||
                            dateStart ||
                            dateEnd) && (
                            <div className="flex flex-wrap gap-2 pt-2">
                                {gravities.map((gravity) => (
                                    <Badge
                                        key={gravity}
                                        variant="secondary"
                                        className="gap-1"
                                    >
                                        {gravity}
                                        <XIcon
                                            className="size-3 cursor-pointer hover:text-destructive"
                                            onClick={() =>
                                                handleGravityChange(gravity, false)
                                            }
                                        />
                                    </Badge>
                                ))}
                                {types.map((type) => (
                                    <Badge
                                        key={type}
                                        variant="secondary"
                                        className="gap-1"
                                    >
                                        {type}
                                        <XIcon
                                            className="size-3 cursor-pointer hover:text-destructive"
                                            onClick={() =>
                                                handleTypeChange(type, false)
                                            }
                                        />
                                    </Badge>
                                ))}
                                {dateStart && (
                                    <Badge variant="secondary" className="gap-1">
                                        De: {dateStart}
                                        <XIcon
                                            className="size-3 cursor-pointer hover:text-destructive"
                                            onClick={() =>
                                                handleDateStartChange("")
                                            }
                                        />
                                    </Badge>
                                )}
                                {dateEnd && (
                                    <Badge variant="secondary" className="gap-1">
                                        Até: {dateEnd}
                                        <XIcon
                                            className="size-3 cursor-pointer hover:text-destructive"
                                            onClick={() => handleDateEndChange("")}
                                        />
                                    </Badge>
                                )}
                            </div>
                        )}
                    </div>
                </Card>
            )}

            {/* Timeline */}
            <div className="space-y-4">
                {Object.keys(filteredGroupedLogs).length === 0 ? (
                    <Card className="p-12 text-center border-dashed">
                        <WarningCircleIcon className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                        <h3 className="text-lg font-semibold mb-2">
                            Nenhum log encontrado
                        </h3>
                        <p className="text-muted-foreground">
                            {gravities.length > 0 ||
                            types.length > 0 ||
                            users.length > 0 ||
                            agents.length > 0 ||
                            dateStart ||
                            dateEnd
                                ? "Tente ajustar os filtros para encontrar mais logs."
                                : "Não há logs disponíveis no momento."}
                        </p>
                    </Card>
                ) : (
                    Object.entries(filteredGroupedLogs)
                        .sort(([dateA], [dateB]) => {
                            // Sort dates: Today first, then by date descending
                            if (dateA === "Hoje") return -1;
                            if (dateB === "Hoje") return 1;
                            if (dateA === "Ontem") return -1;
                            if (dateB === "Ontem") return 1;
                            return dateB.localeCompare(dateA);
                        })
                        .map(([dateGroup, logs]) => {
                            const isExpanded = expandedDates.has(dateGroup);
                            const sortedLogs = [...logs].sort(
                                (a, b) =>
                                    new Date(b.created_at).getTime() -
                                    new Date(a.created_at).getTime()
                            );

                            return (
                                <div key={dateGroup} className="space-y-3">
                                    {/* Date Header */}
                                    <button
                                        onClick={() =>
                                            toggleDateGroup(dateGroup)
                                        }
                                        className="flex items-center gap-3 w-full text-left px-4 py-3 bg-linear-to-r from-primary/5 to-transparent hover:from-primary/10 rounded-lg transition-all duration-200 group"
                                    >
                                        <div className="rounded-full bg-primary/10 p-1 group-hover:bg-primary/20 transition-colors">
                                            {isExpanded ? (
                                                <CaretDownIcon className="size-4 text-primary" />
                                            ) : (
                                                <CaretUpIcon className="size-4 text-primary" />
                                            )}
                                        </div>
                                        <div className="flex-1">
                                            <p className="font-semibold text-foreground">
                                                {dateGroup}
                                            </p>
                                        </div>
                                        <Badge
                                            variant="outline"
                                            className="ml-auto"
                                        >
                                            {logs.length} log
                                            {logs.length !== 1 ? "s" : ""}
                                        </Badge>
                                    </button>

                                    {/* Logs List */}
                                    {isExpanded && (
                                        <div className="space-y-2 pl-2">
                                            {sortedLogs.map((log, index) => {
                                                const userName =
                                                    log.user?.name ||
                                                    log.agente?.memo ||
                                                    "Desconhecido";
                                                const userEmail =
                                                    log.user?.email || "";
                                                const initials = getInitials(
                                                    userName,
                                                    userEmail
                                                );
                                                const isLogResolved =
                                                    isResolved(log);
                                                const timeAgo =
                                                    formatRelativeTime(
                                                        log.created_at
                                                    );
                                                const time = formatTime(
                                                    log.created_at
                                                );

                                                return (
                                                    <Card
                                                        key={`${log.created_at}-${index}`}
                                                        className="p-4 hover:shadow-md transition-all duration-200 border-l-4 border-l-primary/40 hover:border-l-primary bg-card/50 hover:bg-card/80 backdrop-blur-sm"
                                                    >
                                                        <div className="flex gap-4">
                                                            {/* Avatar */}
                                                            <div className="shrink-0">
                                                                <div className="size-10 rounded-full bg-linear-to-br from-primary to-primary/70 flex items-center justify-center text-primary-foreground font-semibold text-sm shadow-md">
                                                                    {initials}
                                                                </div>
                                                            </div>

                                                            {/* Content */}
                                                            <div className="flex-1 min-w-0 space-y-2">
                                                                {/* Header */}
                                                                <div className="flex flex-wrap items-start justify-between gap-2">
                                                                    <div className="flex-1 min-w-0">
                                                                        <p className="font-semibold text-foreground">
                                                                            {
                                                                                userName
                                                                            }
                                                                        </p>
                                                                        {log
                                                                            .agente
                                                                            ?.code && (
                                                                            <p className="text-xs text-muted-foreground">
                                                                                Agente:{" "}
                                                                                <span className="font-medium">
                                                                                    {
                                                                                        log
                                                                                            .agente
                                                                                            .code
                                                                                    }
                                                                                </span>
                                                                            </p>
                                                                        )}
                                                                        {userEmail && (
                                                                            <p className="text-xs text-muted-foreground">
                                                                                {
                                                                                    userEmail
                                                                                }
                                                                            </p>
                                                                        )}
                                                                    </div>
                                                                    <div className="flex items-center gap-2 flex-wrap justify-end">
                                                                        <Badge
                                                                            variant={getGravityVariant(
                                                                                log.gravity
                                                                            )}
                                                                            className="gap-1"
                                                                        >
                                                                            {getGravityIcon(
                                                                                log.gravity
                                                                            )}
                                                                            {log.gravity ||
                                                                                "Info"}
                                                                        </Badge>
                                                                        {isLogResolved ? (
                                                                            <Badge
                                                                                variant="default"
                                                                                className="bg-green-500/80 hover:bg-green-500 gap-1"
                                                                            >
                                                                                <CheckCircleIcon className="size-3" />
                                                                                Resolvido
                                                                            </Badge>
                                                                        ) : (
                                                                            <Badge
                                                                                variant="destructive"
                                                                                className="gap-1"
                                                                            >
                                                                                <XCircleIcon className="size-3" />
                                                                                Não
                                                                                Resolvido
                                                                            </Badge>
                                                                        )}
                                                                    </div>
                                                                </div>

                                                                {/* Message */}
                                                                {(log.data
                                                                    ?.titulo ||
                                                                    log.data
                                                                        ?.mensagem) && (
                                                                    <div className="bg-muted/30 rounded-lg p-3 border border-muted/50 space-y-1">
                                                                        {log
                                                                            .data
                                                                            ?.titulo && (
                                                                            <p className="font-medium text-sm text-foreground">
                                                                                {
                                                                                    log
                                                                                        .data
                                                                                        .titulo
                                                                                }
                                                                            </p>
                                                                        )}
                                                                        {log
                                                                            .data
                                                                            ?.mensagem && (
                                                                            <p className="text-sm text-foreground/80 leading-relaxed">
                                                                                {
                                                                                    log
                                                                                        .data
                                                                                        .mensagem
                                                                                }
                                                                            </p>
                                                                        )}
                                                                    </div>
                                                                )}

                                                                {/* Metadata */}
                                                                <div className="flex flex-wrap items-center gap-3 pt-2 text-xs text-muted-foreground border-t border-muted/30">
                                                                    <span className="font-medium">
                                                                        {time}
                                                                    </span>
                                                                    <span>
                                                                        •
                                                                    </span>
                                                                    <span>
                                                                        {
                                                                            timeAgo
                                                                        }
                                                                    </span>
                                                                    {log.type && (
                                                                        <>
                                                                            <span>
                                                                                •
                                                                            </span>
                                                                            <span>
                                                                                <span className="text-muted-foreground">
                                                                                    Tipo:
                                                                                </span>{" "}
                                                                                <span className="font-medium text-foreground/80">
                                                                                    {
                                                                                        log.type
                                                                                    }
                                                                                </span>
                                                                            </span>
                                                                        </>
                                                                    )}
                                                                </div>
                                                            </div>
                                                        </div>
                                                    </Card>
                                                );
                                            })}
                                        </div>
                                    )}
                                </div>
                            );
                        })
                )}
            </div>

            {/* Pagination */}
            {initialData.last_page > 1 && (
                <PaginationControls
                    currentPage={initialData.current_page}
                    lastPage={initialData.last_page}
                    hasNextPage={!!initialData.next_page_url}
                    hasPrevPage={!!initialData.prev_page_url}
                    baseUrl="/relatorios?tab=logs"
                    searchParams={params}
                />
            )}
        </div>
    );
}
