"use client";

import { useState, useEffect, useRef, useCallback, useMemo } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Card, CardContent, CardHeader } from "@/components/Card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { MultiSelect } from "@/components/ui/multi-select";
import {
    UserIcon,
    CurrencyDollarIcon,
    ChartLineUpIcon,
    WarningCircleIcon,
    ScrollIcon,
    FunnelSimpleIcon,
    XIcon,
    MagnifyingGlassIcon,
} from "@phosphor-icons/react";
import Link from "next/link";
import PaginationControls from "@/components/PaginationControls";
import { searchUser } from "@/actions/user";

interface AgentsContentProps {
    initialData: RelatorioAgentesResponse | null;
    params: Record<string, string | string[] | undefined>;
}

interface FoundUser {
    id: number | string;
    name: string;
    email: string;
}

function formatCurrency(value: number | string | null): string {
    const num = Number(value) || 0;
    return new Intl.NumberFormat("pt-BR", {
        style: "currency",
        currency: "BRL",
    }).format(num);
}

function formatDate(dateString: string): string {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat("pt-BR", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
    }).format(date);
}

const parseArrayParam = (param?: string | string[]): string[] => {
    const value = Array.isArray(param) ? param[0] : param;
    if (!value) return [];
    try {
        return JSON.parse(value);
    } catch {
        // Handle format like "[1,2,3]" without JSON.parse
        if (value.startsWith("[") && value.endsWith("]")) {
            const content = value.slice(1, -1);
            return content ? content.split(",").map((id) => id.trim()) : [];
        }
        return [];
    }
};

// Opções de tipos disponíveis para filtro
const typeOptions = [
    {
        label: "Agentes com Mais Erros",
        value: "bigError",
    },
    // Adicione mais tipos aqui conforme necessário
];

export default function AgentsContent({
    initialData,
    params,
}: AgentsContentProps) {
    const router = useRouter();
    const searchParams = useSearchParams();
    const userSearchTimeoutRef = useRef<NodeJS.Timeout | null>(null);

    const getParamValue = (param?: string | string[]) =>
        Array.isArray(param) ? param[0] : param;

    const [agentsData, setAgentsData] =
        useState<RelatorioAgentesResponse | null>(initialData);

    const [users, setUsers] = useState<string[]>(
        parseArrayParam(params.user) || []
    );
    const [dateStart, setDateStart] = useState(
        getParamValue(params.dateStart) || ""
    );
    const [dateEnd, setDateEnd] = useState(getParamValue(params.dateEnd) || "");
    const [types, setTypes] = useState<string[]>(
        parseArrayParam(params.type) || []
    );
    const [showFilters, setShowFilters] = useState(false);

    const [userSearchTerm, setUserSearchTerm] = useState("");
    const [foundUsers, setFoundUsers] = useState<FoundUser[]>([]);
    const [isUserSearching, setIsUserSearching] = useState(false);
    const [selectedUsersInfo, setSelectedUsersInfo] = useState<
        Record<string, FoundUser>
    >({});

    const currentPage = parseInt(getParamValue(params.page) || "1", 10);

    const updateUrlParams = useCallback(
        (updates: Record<string, string | string[]>) => {
            const params = new URLSearchParams(searchParams?.toString() || "");

            Object.entries(updates).forEach(([key, value]) => {
                if (Array.isArray(value)) {
                    if (value.length > 0) {
                        params.set(key, JSON.stringify(value));
                    } else {
                        params.delete(key);
                    }
                } else if (value && value.trim()) {
                    params.set(key, value.trim());
                } else {
                    params.delete(key);
                }
            });

            params.set("page", "1");
            params.set("tab", "agentes");

            router.replace(`/relatorios?${params.toString()}`);
            router.refresh();
        },
        [searchParams, router]
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

    const handleUserSelect = useCallback(
        (user: FoundUser) => {
            const userId = String(user.id);
            if (!users.includes(userId)) {
                const newUsers = [...users, userId];
                setUsers(newUsers);
                setSelectedUsersInfo((prev) => ({
                    ...prev,
                    [userId]: user,
                }));
                updateUrlParams({ user: newUsers });
            }
            setUserSearchTerm("");
            setFoundUsers([]);
        },
        [users, updateUrlParams]
    );

    const handleRemoveUser = useCallback(
        (userId: string) => {
            const newUsers = users.filter((id) => id !== userId);
            setUsers(newUsers);
            setSelectedUsersInfo((prev) => {
                const updated = { ...prev };
                delete updated[userId];
                return updated;
            });
            updateUrlParams({
                user: newUsers.length > 0 ? newUsers : [],
            });
        },
        [users, updateUrlParams]
    );

    const handleDateStartChange = (value: string) => {
        setDateStart(value);
        updateUrlParams({ dateStart: value });
    };

    const handleDateEndChange = (value: string) => {
        setDateEnd(value);
        updateUrlParams({ dateEnd: value });
    };

    const handleTypesChange = (value: string[]) => {
        setTypes(value);
        updateUrlParams({ type: value.length > 0 ? value : [] });
    };

    const clearAllFilters = () => {
        setUsers([]);
        setDateStart("");
        setDateEnd("");
        setTypes([]);
        setUserSearchTerm("");
        setFoundUsers([]);
        updateUrlParams({
            user: [],
            dateStart: "",
            dateEnd: "",
            type: [],
        });
    };

    const hasActiveFilters = useMemo(() => {
        return !!(users.length > 0 || dateStart || dateEnd || types.length > 0);
    }, [users, dateStart, dateEnd, types]);

    // Sync agentsData with initialData when it changes
    useEffect(() => {
        if (initialData) {
            setAgentsData(initialData);
        }
    }, [initialData]);

    // Sync state with URL params when they change
    useEffect(() => {
        const urlUsers = parseArrayParam(params.user) || [];
        const urlDateStart = getParamValue(params.dateStart) || "";
        const urlDateEnd = getParamValue(params.dateEnd) || "";
        const urlTypes = parseArrayParam(params.type) || [];

        setUsers(urlUsers);
        setDateStart(urlDateStart);
        setDateEnd(urlDateEnd);
        setTypes(urlTypes);
    }, [params.user, params.dateStart, params.dateEnd, params.type]);

    useEffect(() => {
        return () => {
            if (userSearchTimeoutRef.current) {
                clearTimeout(userSearchTimeoutRef.current);
            }
        };
    }, []);

    if (!agentsData || !agentsData.data || agentsData.data.length === 0) {
        return (
            <div className="space-y-6">
                <div className="space-y-6">
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                        <div>
                            <h2 className="text-2xl font-bold">
                                Relatório de Agentes
                            </h2>
                            <p className="text-sm text-foreground/60 mt-1">
                                Visualize informações e estatísticas dos agentes
                            </p>
                        </div>

                        <div className="flex flex-col sm:flex-row gap-3">
                            <Button
                                variant="outline"
                                onClick={() => setShowFilters(!showFilters)}
                                className="flex items-center gap-2"
                            >
                                <FunnelSimpleIcon className="h-4 w-4" />
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
                        <Card className="p-4 space-y-4">
                            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
                                <div className="space-y-2">
                                    <label className="text-sm font-medium">
                                        Usuário
                                    </label>
                                    <div className="relative">
                                        <MagnifyingGlassIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                                        <Input
                                            type="text"
                                            value={userSearchTerm}
                                            onChange={(e) =>
                                                handleUserSearch(e.target.value)
                                            }
                                            placeholder="Buscar usuário..."
                                            className="pl-10"
                                        />
                                        {isUserSearching && (
                                            <div className="absolute right-3 top-1/2 -translate-y-1/2">
                                                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary"></div>
                                            </div>
                                        )}
                                        {foundUsers.length > 0 && (
                                            <div className="absolute z-10 w-full mt-1 bg-popover border border-border rounded-md shadow-lg max-h-60 overflow-auto">
                                                {foundUsers.map((user) => (
                                                    <button
                                                        key={user.id}
                                                        onClick={() =>
                                                            handleUserSelect(
                                                                user
                                                            )
                                                        }
                                                        className="w-full text-left px-4 py-2 hover:bg-accent text-sm"
                                                    >
                                                        <div className="font-medium">
                                                            {user.name}
                                                        </div>
                                                        <div className="text-xs text-muted-foreground">
                                                            {user.email}
                                                        </div>
                                                    </button>
                                                ))}
                                            </div>
                                        )}
                                    </div>
                                    {users.length > 0 && (
                                        <div className="flex flex-wrap gap-2 mt-2">
                                            {users.map((userId) => {
                                                const user =
                                                    selectedUsersInfo[userId];
                                                return (
                                                    <Badge
                                                        key={userId}
                                                        variant="secondary"
                                                        className="gap-1"
                                                    >
                                                        {user?.name ||
                                                            user?.email ||
                                                            userId}
                                                        <button
                                                            onClick={() =>
                                                                handleRemoveUser(
                                                                    userId
                                                                )
                                                            }
                                                            className="ml-1 hover:text-destructive"
                                                        >
                                                            <XIcon className="h-3 w-3" />
                                                        </button>
                                                    </Badge>
                                                );
                                            })}
                                        </div>
                                    )}
                                </div>

                                <div className="space-y-2">
                                    <label className="text-sm font-medium">
                                        Data Inicial
                                    </label>
                                    <Input
                                        type="date"
                                        value={dateStart}
                                        onChange={(e) =>
                                            handleDateStartChange(
                                                e.target.value
                                            )
                                        }
                                    />
                                </div>

                                <div className="space-y-2">
                                    <label className="text-sm font-medium">
                                        Data Final
                                    </label>
                                    <Input
                                        type="date"
                                        value={dateEnd}
                                        onChange={(e) =>
                                            handleDateEndChange(e.target.value)
                                        }
                                    />
                                </div>

                                <div className="space-y-2">
                                    <label className="text-sm font-medium">
                                        Tipo
                                    </label>
                                    <MultiSelect
                                        options={typeOptions}
                                        onValueChange={handleTypesChange}
                                        defaultValue={types}
                                        placeholder="Selecione os tipos..."
                                        searchable={true}
                                    />
                                </div>
                            </div>
                        </Card>
                    )}
                </div>
                <Card className="p-12 text-center">
                    <UserIcon className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                    <h3 className="text-lg font-semibold mb-2">
                        Nenhum agente encontrado
                    </h3>
                    <p className="text-muted-foreground">
                        Não há dados de agentes disponíveis no momento.
                    </p>
                </Card>
            </div>
        );
    }

    const agents = agentsData.data;
    const total = (agentsData as any).total || agents.length;
    const perPage = (agentsData as any).per_page || 10;
    const lastPage =
        (agentsData as any).last_page || Math.ceil(total / perPage);
    const hasNextPage = (agentsData as any).next_page_url !== null;
    const hasPrevPage = (agentsData as any).prev_page_url !== null;

    const searchParamsRecord = Object.fromEntries(
        Array.from(searchParams?.entries() || []).map(([key, value]) => [
            key,
            Array.isArray(value) ? value[0] : value,
        ])
    );

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                    <h2 className="text-2xl font-bold">Relatório de Agentes</h2>
                    <p className="text-sm text-foreground/60 mt-1">
                        Visualize informações e estatísticas dos agentes
                    </p>
                </div>

                <div className="flex flex-col sm:flex-row gap-3">
                    <Button
                        variant="outline"
                        onClick={() => setShowFilters(!showFilters)}
                        className="flex items-center gap-2"
                    >
                        <FunnelSimpleIcon className="h-4 w-4" />
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
                <Card className="p-4 space-y-4">
                    <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
                        <div className="space-y-2">
                            <label className="text-sm font-medium">
                                Usuário
                            </label>
                            <div className="relative">
                                <MagnifyingGlassIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                                <Input
                                    type="text"
                                    value={userSearchTerm}
                                    onChange={(e) =>
                                        handleUserSearch(e.target.value)
                                    }
                                    placeholder="Buscar usuário..."
                                    className="pl-10"
                                />
                                {isUserSearching && (
                                    <div className="absolute right-3 top-1/2 -translate-y-1/2">
                                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary"></div>
                                    </div>
                                )}
                                {foundUsers.length > 0 && (
                                    <div className="absolute z-10 w-full mt-1 bg-popover border border-border rounded-md shadow-lg max-h-60 overflow-auto">
                                        {foundUsers.map((user) => (
                                            <button
                                                key={user.id}
                                                onClick={() =>
                                                    handleUserSelect(user)
                                                }
                                                className="w-full text-left px-4 py-2 hover:bg-accent text-sm"
                                            >
                                                <div className="font-medium">
                                                    {user.name}
                                                </div>
                                                <div className="text-xs text-muted-foreground">
                                                    {user.email}
                                                </div>
                                            </button>
                                        ))}
                                    </div>
                                )}
                            </div>
                            {users.length > 0 && (
                                <div className="flex flex-wrap gap-2 mt-2">
                                    {users.map((userId) => {
                                        const user = selectedUsersInfo[userId];
                                        return (
                                            <Badge
                                                key={userId}
                                                variant="secondary"
                                                className="gap-1"
                                            >
                                                {user?.name ||
                                                    user?.email ||
                                                    userId}
                                                <button
                                                    onClick={() =>
                                                        handleRemoveUser(userId)
                                                    }
                                                    className="ml-1 hover:text-destructive"
                                                >
                                                    <XIcon className="h-3 w-3" />
                                                </button>
                                            </Badge>
                                        );
                                    })}
                                </div>
                            )}
                        </div>

                        <div className="space-y-2">
                            <label className="text-sm font-medium">
                                Data Inicial
                            </label>
                            <Input
                                type="date"
                                value={dateStart}
                                onChange={(e) =>
                                    handleDateStartChange(e.target.value)
                                }
                            />
                        </div>

                        <div className="space-y-2">
                            <label className="text-sm font-medium">
                                Data Final
                            </label>
                            <Input
                                type="date"
                                value={dateEnd}
                                onChange={(e) =>
                                    handleDateEndChange(e.target.value)
                                }
                            />
                        </div>

                        <div className="space-y-2">
                            <label className="text-sm font-medium">Tipo</label>
                            <MultiSelect
                                options={typeOptions}
                                onValueChange={handleTypesChange}
                                defaultValue={types}
                                placeholder="Selecione os tipos..."
                                searchable={true}
                            />
                        </div>
                    </div>
                </Card>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
                {agents.map((agent) => {
                    const hasLogs = agent.countLogs > 0;

                    return (
                        <Card
                            key={agent.id}
                            className="hover:shadow-lg transition-shadow"
                        >
                            <CardHeader className="pb-3">
                                <div className="flex items-start w-full flex-wrap justify-between gap-2">
                                    <div className="flex-1 min-w-0">
                                        <h3 className="text-lg font-semibold truncate">
                                            {agent.agent_memo ||
                                                agent.agent_code}
                                        </h3>
                                        <p className="text-sm text-muted-foreground mt-1">
                                            {agent.agent_code}
                                        </p>
                                    </div>
                                    {hasLogs && (
                                        <Badge
                                            variant="destructive"
                                            className="gap-1 shrink-0"
                                        >
                                            <WarningCircleIcon className="size-3" />
                                            {agent.countLogs}
                                        </Badge>
                                    )}
                                    <Link
                                        href={`/relatorios?tab=logs&user=${encodeURIComponent(
                                            JSON.stringify([
                                                agent.usuario_id.toString(),
                                            ])
                                        )}&agent=${encodeURIComponent(
                                            JSON.stringify([
                                                agent.id.toString(),
                                            ])
                                        )}`}
                                    >
                                        <Button variant="outline">
                                            <ScrollIcon />
                                        </Button>
                                    </Link>
                                </div>
                            </CardHeader>

                            <CardContent className="space-y-4">
                                {agent.usuario_name && (
                                    <div className="flex items-center gap-2 pb-3 border-b border-foreground/10">
                                        <UserIcon className="size-4 text-muted-foreground shrink-0" />
                                        <div className="min-w-0 flex-1">
                                            <p className="text-sm font-medium truncate">
                                                {agent.usuario_name}
                                            </p>
                                            {agent.usuario_email && (
                                                <p className="text-xs text-muted-foreground truncate">
                                                    {agent.usuario_email}
                                                </p>
                                            )}
                                        </div>
                                    </div>
                                )}

                                <div className="grid grid-cols-2 gap-3">
                                    <div className="bg-muted/50 rounded-md p-3">
                                        <div className="flex items-center gap-1.5 mb-1">
                                            <CurrencyDollarIcon className="size-4 text-muted-foreground" />
                                            <p className="text-xs text-muted-foreground">
                                                Moeda
                                            </p>
                                        </div>
                                        <p className="text-sm font-semibold">
                                            {agent.currency || "N/A"}
                                        </p>
                                    </div>

                                    <div className="bg-muted/50 rounded-md p-3">
                                        <div className="flex items-center gap-1.5 mb-1">
                                            <ChartLineUpIcon className="size-4 text-muted-foreground" />
                                            <p className="text-xs text-muted-foreground">
                                                Influencers
                                            </p>
                                        </div>
                                        <p className="text-sm font-semibold">
                                            {agent.influencers || 0}
                                        </p>
                                    </div>
                                </div>

                                {agent.limit_enable && (
                                    <div className="bg-primary/5 rounded-md p-3 border border-primary/20">
                                        <p className="text-xs font-medium text-primary mb-2">
                                            Limites Configurados
                                        </p>
                                        <div className="space-y-1 text-sm">
                                            <div className="flex justify-between">
                                                <span className="text-muted-foreground">
                                                    Valor:
                                                </span>
                                                <span className="font-medium">
                                                    {agent.currency}{" "}
                                                    {agent.limite_amount || "0"}
                                                </span>
                                            </div>
                                            <div className="flex justify-between">
                                                <span className="text-muted-foreground">
                                                    Horas:
                                                </span>
                                                <span className="font-medium">
                                                    {agent.limit_hours || "0"}h
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                )}

                                {agent.rtp && (
                                    <div className="pt-2 border-t border-foreground/10">
                                        <p className="text-xs text-muted-foreground mb-1">
                                            RTP
                                        </p>
                                        <p className="text-sm font-medium">
                                            {agent.rtp}%
                                        </p>
                                    </div>
                                )}

                                <div className="pt-2 border-t border-foreground/10">
                                    <p className="text-xs text-muted-foreground">
                                        Criado em:{" "}
                                        {formatDate(agent.created_date)}
                                    </p>
                                    {agent.hide === 1 && (
                                        <Badge
                                            variant="outline"
                                            className="mt-2 text-xs"
                                        >
                                            Oculto
                                        </Badge>
                                    )}
                                </div>
                            </CardContent>
                        </Card>
                    );
                })}
            </div>

            <PaginationControls
                currentPage={currentPage}
                lastPage={lastPage}
                hasNextPage={hasNextPage}
                hasPrevPage={hasPrevPage}
                baseUrl="/relatorios"
                searchParams={searchParamsRecord}
            />
        </div>
    );
}
