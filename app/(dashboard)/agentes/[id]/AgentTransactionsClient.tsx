"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { MultiSelect } from "@/components/ui/multi-select";
import { Card } from "@/components/Card";
import {
    MagnifyingGlassIcon,
    FunnelSimpleIcon,
    XIcon,
} from "@phosphor-icons/react";
import AgentTransactionsTable from "./AgentTransactionsTable";
import PaginationControls from "@/components/PaginationControls";

interface AgentTransactionsClientProps {
    initialData: TransactionResponse;
    agentId: string;
    params: Record<string, string | string[] | undefined>;
}

const filterOptions = [
    { label: "Últimas apostas", value: "last" },
    { label: "Primeiras apostas", value: "primary" },
    { label: "Apostas ganhadoras", value: "win" },
    { label: "Apostas perdedoras", value: "bet" },
    { label: "Maiores ganhos", value: "amountBig" },
    { label: "Menores ganhos", value: "amountSmall" },
    { label: "Maiores perdas", value: "amountBetBig" },
    { label: "Menores perdas", value: "amountBetSmall" },
    { label: "Apostas com erros", value: "error" },
];

export default function AgentTransactionsClient({
    initialData,
    agentId,
    params,
}: AgentTransactionsClientProps) {
    const router = useRouter();
    const searchParams = useSearchParams();
    const searchTimeoutRef = useRef<NodeJS.Timeout | null>(null);

    const getParamValue = (param?: string | string[]) =>
        Array.isArray(param) ? param[0] : param;

    const parsePlayerArray = (param?: string | string[]): string[] => {
        const raw = getParamValue(param);
        if (!raw) return [];
        // Handle format like "[118325,119799]"
        if (raw.startsWith("[") && raw.endsWith("]")) {
            const content = raw.slice(1, -1);
            return content ? content.split(",").map((id) => id.trim()) : [];
        }
        // Handle single value
        return [raw];
    };

    const [searchValue, setSearchValue] = useState(
        getParamValue(params.search) || ""
    );
    const [filter, setFilter] = useState(getParamValue(params.filter) || "");
    const [dateStart, setDateStart] = useState(
        getParamValue(params.dateStart) || ""
    );
    const [dateEnd, setDateEnd] = useState(getParamValue(params.dateEnd) || "");
    const [players, setPlayers] = useState<string[]>(
        parsePlayerArray(params.player)
    );
    const [showFilters, setShowFilters] = useState(false);
    const [isSearching, setIsSearching] = useState(false);

    const updateUrlParams = useCallback(
        (updates: Record<string, string | string[]>) => {
            const params = new URLSearchParams(searchParams?.toString() || "");

            Object.entries(updates).forEach(([key, value]) => {
                if (Array.isArray(value)) {
                    if (value.length > 0) {
                        // Format as [id1,id2,id3]
                        params.set(key, `[${value.join(",")}]`);
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

            router.push(`/agentes/${agentId}?${params.toString()}`);
        },
        [searchParams, router, agentId]
    );

    const handleSearch = (value: string) => {
        setSearchValue(value);

        if (searchTimeoutRef.current) {
            clearTimeout(searchTimeoutRef.current);
        }

        searchTimeoutRef.current = setTimeout(() => {
            setIsSearching(true);
            updateUrlParams({ search: value });
            setTimeout(() => setIsSearching(false), 100);
        }, 500);
    };

    const handleFilterChange = (value: string) => {
        setFilter(value);
        updateUrlParams({ filter: value === "all" ? "" : value });
    };

    const handleDateStartChange = (value: string) => {
        setDateStart(value);
        updateUrlParams({ dateStart: value });
    };

    const handleDateEndChange = (value: string) => {
        setDateEnd(value);
        updateUrlParams({ dateEnd: value });
    };

    const handlePlayerChange = (values: string[]) => {
        setPlayers(values);
        updateUrlParams({ player: values });
    };

    const clearAllFilters = () => {
        setSearchValue("");
        setFilter("");
        setDateStart("");
        setDateEnd("");
        setPlayers([]);
        const params = new URLSearchParams();
        params.set("page", "1");
        router.push(`/agentes/${agentId}?${params.toString()}`);
    };

    const hasActiveFilters = () => {
        return !!(
            searchValue ||
            filter ||
            dateStart ||
            dateEnd ||
            players.length > 0
        );
    };

    useEffect(() => {
        return () => {
            if (searchTimeoutRef.current) {
                clearTimeout(searchTimeoutRef.current);
            }
        };
    }, []);

    const playerOptions =
        initialData.players?.map((p) => ({
            label: p.username,
            value: String(p.id),
        })) || [];

    const searchParamsRecord = Object.fromEntries(
        Array.from(searchParams?.entries() || []).map(([key, value]) => [
            key,
            Array.isArray(value) ? value[0] : value,
        ])
    );

    return (
        <div className="space-y-6">
            <div className="space-y-4">
                <div className="flex flex-col lg:flex-row gap-4 items-start lg:items-center justify-between">
                    <div className="flex-1 w-full">
                        <div className="relative">
                            <MagnifyingGlassIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                            <input
                                type="text"
                                value={searchValue}
                                onChange={(e) => handleSearch(e.target.value)}
                                placeholder="Pesquisar transações..."
                                className="w-full pl-10 pr-10 py-3 rounded-lg border border-input bg-background-primary text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                                aria-label="Pesquisar transações"
                            />
                            {searchValue && (
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => {
                                        setSearchValue("");
                                        updateUrlParams({ search: "" });
                                    }}
                                    className="absolute right-2 top-1/2 -translate-y-1/2 h-6 w-6 p-0 hover:bg-muted"
                                    aria-label="Limpar pesquisa"
                                >
                                    <XIcon className="h-4 w-4" />
                                </Button>
                            )}
                            {isSearching && (
                                <div className="absolute right-10 top-1/2 -translate-y-1/2">
                                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary"></div>
                                </div>
                            )}
                        </div>
                    </div>

                    <div className="flex flex-col sm:flex-row gap-3 w-full lg:w-auto">
                        <Button
                            variant="outline"
                            onClick={() => setShowFilters(!showFilters)}
                            className="flex items-center gap-2"
                        >
                            <FunnelSimpleIcon className="h-4 w-4" />
                            Filtros
                            {hasActiveFilters() && (
                                <div className="h-2 w-2 rounded-full bg-primary" />
                            )}
                        </Button>

                        {hasActiveFilters() && (
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
                                    Filtro
                                </label>
                                <Select
                                    value={filter || "all"}
                                    onValueChange={handleFilterChange}
                                >
                                    <SelectTrigger className="w-full">
                                        <SelectValue placeholder="Selecionar filtro" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="all">
                                            Todos
                                        </SelectItem>
                                        {filterOptions.map((option) => (
                                            <SelectItem
                                                key={option.value}
                                                value={option.value}
                                            >
                                                {option.label}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>

                            <div className="space-y-2">
                                <label className="text-sm font-medium">
                                    Jogadores
                                </label>
                                <MultiSelect
                                    options={playerOptions}
                                    defaultValue={players}
                                    onValueChange={handlePlayerChange}
                                    placeholder="Selecionar jogadores"
                                    className="w-full"
                                    animationConfig={{
                                        badgeAnimation: "none",
                                        popoverAnimation: "none",
                                        optionHoverAnimation: "none",
                                    }}
                                />
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
                        </div>
                    </Card>
                )}

                <div className="flex items-center justify-between text-sm text-muted-foreground">
                    <div className="flex items-center gap-2">
                        <span>{initialData.total} transações encontradas</span>
                    </div>
                    {hasActiveFilters() && (
                        <div className="text-xs bg-muted px-2 py-1 rounded">
                            Filtros ativos
                        </div>
                    )}
                </div>
            </div>

            <AgentTransactionsTable transactions={initialData.data} />

            <PaginationControls
                currentPage={initialData.current_page}
                lastPage={initialData.last_page}
                hasNextPage={!!initialData.next_page_url}
                hasPrevPage={!!initialData.prev_page_url}
                baseUrl={`/agentes/${agentId}`}
                searchParams={searchParamsRecord}
            />
        </div>
    );
}
