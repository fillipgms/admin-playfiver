"use client";

import { useState, useEffect, useRef, useMemo } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import {
    MagnifyingGlassIcon,
    CaretDownIcon,
    CaretUpIcon,
    WarningCircleIcon,
    XCircleIcon,
    InfoIcon,
    CheckCircleIcon,
} from "@phosphor-icons/react";
import PaginationControls from "@/components/PaginationControls";
import { Card } from "@/components/Card";
interface LogsContentProps {
    initialData: LogsResponse;
    params: Record<string, string | string[] | undefined>;
}

type FilterType = "all" | "error" | "warning" | "info" | "success";
type GravityFilter = "all" | string;

// Format relative time (e.g., "12 min ago", "Today")
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

// Format date for grouping (e.g., "Today", "Mon, 01 Dec 2021")
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

// Format time (e.g., "8:20 am")
function formatTime(dateString: string): string {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat("pt-BR", {
        hour: "2-digit",
        minute: "2-digit",
        hour12: false,
    }).format(date);
}

// Get user initials for avatar
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

// Get gravity badge variant
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

// Get gravity icon
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
    const searchTimeoutRef = useRef<NodeJS.Timeout | null>(null);

    const getParamValue = (param?: string | string[]) =>
        Array.isArray(param) ? param[0] : param;

    const [searchValue, setSearchValue] = useState(
        getParamValue(params.search) || ""
    );
    const [gravityFilter, setGravityFilter] = useState<GravityFilter>(
        getParamValue(params.gravity) || "all"
    );
    const [typeFilter, setTypeFilter] = useState<string>(
        getParamValue(params.type) || "all"
    );
    const [expandedDates, setExpandedDates] = useState<Set<string>>(new Set());
    const [data, setData] = useState<LogEntryProps[]>(initialData.data);

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
        if (gravityFilter && gravityFilter !== "all") {
            if (gravityFilter === "error") {
                filtered = filtered.filter(
                    (log) =>
                        log.gravity?.toLowerCase().includes("error") ||
                        log.gravity?.toLowerCase().includes("critical")
                );
            } else if (gravityFilter === "unresolved") {
                filtered = filtered.filter((log) => log.data?.status !== 1);
            } else if (gravityFilter === "resolved") {
                filtered = filtered.filter((log) => log.data?.status === 1);
            } else {
                filtered = filtered.filter(
                    (log) =>
                        log.gravity?.toLowerCase() ===
                        gravityFilter.toLowerCase()
                );
            }
        }

        // Filter by type
        if (typeFilter && typeFilter !== "all") {
            filtered = filtered.filter(
                (log) => log.type?.toLowerCase() === typeFilter.toLowerCase()
            );
        }

        // Filter by search
        if (searchValue) {
            const searchLower = searchValue.toLowerCase();
            filtered = filtered.filter((log) => {
                const userName = log.user?.name?.toLowerCase() || "";
                const userEmail = log.user?.email?.toLowerCase() || "";
                const agentCode = log.agente?.code?.toLowerCase() || "";
                const agentMemo = log.agente?.memo?.toLowerCase() || "";
                const message = log.data?.mensagem?.toLowerCase() || "";
                const title = log.data?.titulo?.toLowerCase() || "";
                const type = log.type?.toLowerCase() || "";
                const gravity = log.gravity?.toLowerCase() || "";

                return (
                    userName.includes(searchLower) ||
                    userEmail.includes(searchLower) ||
                    agentCode.includes(searchLower) ||
                    agentMemo.includes(searchLower) ||
                    message.includes(searchLower) ||
                    title.includes(searchLower) ||
                    type.includes(searchLower) ||
                    gravity.includes(searchLower)
                );
            });
        }

        return filtered;
    }, [data, gravityFilter, typeFilter, searchValue]);

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

    const handleSearch = (value: string) => {
        setSearchValue(value);

        if (searchTimeoutRef.current) {
            clearTimeout(searchTimeoutRef.current);
        }

        searchTimeoutRef.current = setTimeout(() => {
            const params = new URLSearchParams(searchParams?.toString() || "");

            if (value.trim()) {
                params.set("search", value.trim());
            } else {
                params.delete("search");
            }

            params.set("page", "1");
            params.set("tab", "logs");

            router.push(`/relatorios?${params.toString()}`);
        }, 500);
    };

    const handleGravityFilter = (value: GravityFilter) => {
        setGravityFilter(value);
        const params = new URLSearchParams(searchParams?.toString() || "");

        if (value && value !== "all") {
            params.set("gravity", value);
        } else {
            params.delete("gravity");
        }

        params.set("page", "1");
        params.set("tab", "logs");

        router.push(`/relatorios?${params.toString()}`);
    };

    const handleTypeFilter = (value: string) => {
        setTypeFilter(value);
        const params = new URLSearchParams(searchParams?.toString() || "");

        if (value && value !== "all") {
            params.set("type", value);
        } else {
            params.delete("type");
        }

        params.set("page", "1");
        params.set("tab", "logs");

        router.push(`/relatorios?${params.toString()}`);
    };

    const toggleDateGroup = (dateGroup: string) => {
        setExpandedDates((prev) => {
            const newSet = new Set(prev);
            if (newSet.has(dateGroup)) {
                newSet.delete(dateGroup);
            } else {
                newSet.add(dateGroup);
            }
            return newSet;
        });
    };

    // Auto-expand today's group
    useEffect(() => {
        const today = formatDateGroup(new Date().toISOString());
        setExpandedDates((prev) => new Set([...prev, today]));
    }, []);

    useEffect(() => {
        return () => {
            if (searchTimeoutRef.current) {
                clearTimeout(searchTimeoutRef.current);
            }
        };
    }, []);

    const isResolved = (log: LogEntryProps) => log.data?.status === 1;

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                    <h2 className="text-2xl font-bold">Logs de Erros</h2>
                    <p className="text-sm text-foreground/60 mt-1">
                        Visualize e gerencie logs do sistema
                    </p>
                </div>
            </div>

            {/* Filters */}
            <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center">
                <div className="flex flex-wrap gap-2 flex-1">
                    <button
                        onClick={() => handleGravityFilter("all")}
                        className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                            gravityFilter === "all"
                                ? "bg-primary text-primary-foreground"
                                : "bg-background border border-input hover:bg-accent"
                        }`}
                    >
                        Todos ({stats.all})
                    </button>
                    {stats.errors > 0 && (
                        <button
                            onClick={() => handleGravityFilter("error")}
                            className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                                gravityFilter === "error"
                                    ? "bg-destructive text-white"
                                    : "bg-background border border-input hover:bg-accent text-destructive"
                            }`}
                        >
                            Erros ({stats.errors})
                        </button>
                    )}
                    {stats.unresolved > 0 && (
                        <button
                            onClick={() => handleGravityFilter("unresolved")}
                            className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                                gravityFilter === "unresolved"
                                    ? "bg-destructive text-white"
                                    : "bg-background border border-input hover:bg-accent text-destructive"
                            }`}
                        >
                            Não Resolvidos ({stats.unresolved})
                        </button>
                    )}
                    {stats.resolved > 0 && (
                        <button
                            onClick={() => handleGravityFilter("resolved")}
                            className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                                gravityFilter === "resolved"
                                    ? "bg-primary text-primary-foreground"
                                    : "bg-background border border-input hover:bg-accent"
                            }`}
                        >
                            Resolvidos ({stats.resolved})
                        </button>
                    )}
                </div>

                {/* Search */}
                <div className="relative w-full sm:w-auto sm:min-w-[300px]">
                    <MagnifyingGlassIcon className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
                    <Input
                        type="search"
                        placeholder="Buscar por usuário, agente, mensagem..."
                        value={searchValue}
                        onChange={(e) => handleSearch(e.target.value)}
                        className="pl-9"
                    />
                </div>
            </div>

            {/* Additional Filters */}
            <div className="flex flex-wrap gap-3">
                {uniqueGravities.length > 0 && (
                    <Select
                        value={gravityFilter}
                        onValueChange={handleGravityFilter}
                    >
                        <SelectTrigger className="w-[180px]">
                            <SelectValue placeholder="Gravidade" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">
                                Todas as gravidades
                            </SelectItem>
                            {uniqueGravities.map((gravity) => (
                                <SelectItem
                                    key={gravity}
                                    value={gravity.toLowerCase()}
                                >
                                    {gravity}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                )}

                {uniqueTypes.length > 0 && (
                    <Select value={typeFilter} onValueChange={handleTypeFilter}>
                        <SelectTrigger className="w-[180px]">
                            <SelectValue placeholder="Tipo" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">Todos os tipos</SelectItem>
                            {uniqueTypes.map((type) => (
                                <SelectItem
                                    key={type}
                                    value={type.toLowerCase()}
                                >
                                    {type}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                )}
            </div>

            {/* Timeline */}
            <div className="space-y-4">
                {Object.keys(filteredGroupedLogs).length === 0 ? (
                    <Card className="p-12 text-center">
                        <WarningCircleIcon className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                        <h3 className="text-lg font-semibold mb-2">
                            Nenhum log encontrado
                        </h3>
                        <p className="text-muted-foreground">
                            {searchValue ||
                            gravityFilter !== "all" ||
                            typeFilter !== "all"
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
                                <div key={dateGroup} className="space-y-2">
                                    {/* Date Header */}
                                    <button
                                        onClick={() =>
                                            toggleDateGroup(dateGroup)
                                        }
                                        className="flex items-center gap-2 w-full text-left px-2 py-2 hover:bg-accent/50 rounded-md transition-colors"
                                    >
                                        {isExpanded ? (
                                            <CaretDownIcon className="size-4 text-muted-foreground" />
                                        ) : (
                                            <CaretUpIcon className="size-4 text-muted-foreground" />
                                        )}
                                        <span className="font-semibold text-foreground">
                                            {dateGroup}
                                        </span>
                                        <span className="text-sm text-muted-foreground">
                                            ({logs.length} log
                                            {logs.length !== 1 ? "s" : ""})
                                        </span>
                                    </button>

                                    {/* Logs List */}
                                    {isExpanded && (
                                        <div className="space-y-3 pl-6 border-l-2 border-muted ml-2">
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
                                                    <div
                                                        key={`${log.created_at}-${index}`}
                                                        className="flex gap-4 pb-4 last:pb-0"
                                                    >
                                                        {/* Avatar */}
                                                        <div className="shrink-0">
                                                            <div className="size-10 rounded-full bg-primary/10 flex items-center justify-center text-primary font-semibold text-sm">
                                                                {initials}
                                                            </div>
                                                        </div>

                                                        {/* Content */}
                                                        <div className="flex-1 min-w-0 space-y-2">
                                                            {/* Header */}
                                                            <div className="flex flex-wrap items-start gap-2">
                                                                <div className="flex-1 min-w-0">
                                                                    <p className="font-medium text-foreground">
                                                                        {
                                                                            userName
                                                                        }
                                                                        {log
                                                                            .agente
                                                                            ?.code && (
                                                                            <span className="text-muted-foreground font-normal">
                                                                                {" "}
                                                                                -
                                                                                Agente:{" "}
                                                                                {
                                                                                    log
                                                                                        .agente
                                                                                        .code
                                                                                }
                                                                            </span>
                                                                        )}
                                                                    </p>
                                                                    {userEmail && (
                                                                        <p className="text-sm text-muted-foreground">
                                                                            {
                                                                                userEmail
                                                                            }
                                                                        </p>
                                                                    )}
                                                                </div>
                                                                <div className="flex items-center gap-2">
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
                                                                            className="bg-green-500 hover:bg-green-600"
                                                                        >
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
                                                                <div className="bg-muted/50 rounded-md p-3">
                                                                    {log.data
                                                                        ?.titulo && (
                                                                        <p className="font-medium text-sm mb-1">
                                                                            {
                                                                                log
                                                                                    .data
                                                                                    .titulo
                                                                            }
                                                                        </p>
                                                                    )}
                                                                    {log.data
                                                                        ?.mensagem && (
                                                                        <p className="text-sm text-foreground/80">
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
                                                            <div className="flex flex-wrap items-center gap-4 text-xs text-muted-foreground">
                                                                <span>
                                                                    {time}
                                                                </span>
                                                                <span>•</span>
                                                                <span>
                                                                    {timeAgo}
                                                                </span>
                                                                {log.type && (
                                                                    <>
                                                                        <span>
                                                                            •
                                                                        </span>
                                                                        <span>
                                                                            Tipo:{" "}
                                                                            {
                                                                                log.type
                                                                            }
                                                                        </span>
                                                                    </>
                                                                )}
                                                            </div>
                                                        </div>
                                                    </div>
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
