/* eslint-disable react-hooks/set-state-in-effect */
"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import {
    useCallback,
    useEffect,
    useMemo,
    useRef,
    useState,
    useTransition,
} from "react";
import AgentCard from "@/components/Agent";
import PaginationControls from "@/components/PaginationControls";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { FunnelSimpleIcon, MagnifyingGlassIcon } from "@phosphor-icons/react";

interface Option {
    value: string;
    label: string;
}

interface AgentesClientProps {
    agents: Agent[];
    pagination: AgentResponse;
    usersOptions: Option[];
}

const filterOptions = [
    { value: "", label: "Ordenação padrão" },
    { value: "last", label: "Últimos criados" },
    { value: "primary", label: "Primeiros criados" },
    { value: "modify", label: "Última modificação" },
];

export default function AgentesClient({
    agents,
    pagination,
    usersOptions,
}: AgentesClientProps) {
    const router = useRouter();
    const pathname = usePathname();
    const searchParams = useSearchParams();
    const [isPending, startTransition] = useTransition();

    const [searchValue, setSearchValue] = useState(
        searchParams.get("search") ?? ""
    );
    const [showFilters, setShowFilters] = useState(false);
    const debounceRef = useRef<NodeJS.Timeout | null>(null);

    useEffect(() => {
        setSearchValue(searchParams.get("search") ?? "");
    }, [searchParams]);

    const updateQuery = useCallback(
        (updates: Record<string, string | undefined>) => {
            const params = new URLSearchParams(searchParams.toString());

            Object.entries(updates).forEach(([key, value]) => {
                if (!value) {
                    params.delete(key);
                } else {
                    params.set(key, value);
                }
            });

            params.set("page", "1");
            const queryString = params.toString();

            startTransition(() => {
                router.replace(
                    queryString ? `${pathname}?${queryString}` : pathname,
                    { scroll: false }
                );
            });
        },
        [pathname, router, searchParams, startTransition]
    );

    const handleSearchChange = (value: string) => {
        setSearchValue(value);

        if (debounceRef.current) {
            clearTimeout(debounceRef.current);
        }

        debounceRef.current = setTimeout(() => {
            updateQuery({ search: value || undefined });
        }, 400);
    };

    const handleUserChange = (value: string) => {
        updateQuery({ user: value || undefined });
    };

    const handleFilterChange = (value: string) => {
        updateQuery({ filter: value || undefined });
    };

    const clearFilters = () => {
        setSearchValue("");
        updateQuery({
            search: undefined,
            user: undefined,
            filter: undefined,
        });
    };

    const hasActiveFilters = useMemo(() => {
        return (
            !!searchParams.get("search") ||
            !!searchParams.get("user") ||
            !!searchParams.get("filter")
        );
    }, [searchParams]);

    const searchParamsRecord = useMemo(() => {
        const record: Record<string, string> = {};
        searchParams.forEach((value, key) => {
            record[key] = value;
        });
        return record;
    }, [searchParams]);

    return (
        <section className="space-y-6">
            <div className="space-y-4">
                <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
                    <div className="relative w-full">
                        <MagnifyingGlassIcon className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                        <Input
                            value={searchValue}
                            onChange={(event) =>
                                handleSearchChange(event.target.value)
                            }
                            placeholder="Pesquisar agentes por nome ou código"
                            className="pl-9"
                            aria-label="Pesquisar agentes"
                        />
                    </div>

                    <div className="flex items-center gap-2">
                        <Button
                            type="button"
                            variant="outline"
                            onClick={() => setShowFilters((prev) => !prev)}
                            className="flex items-center gap-2"
                            aria-pressed={showFilters}
                        >
                            <FunnelSimpleIcon className="h-4 w-4" />
                            Filtros
                            {hasActiveFilters && (
                                <span className="h-2 w-2 rounded-full bg-primary" />
                            )}
                        </Button>

                        {hasActiveFilters && (
                            <Button
                                type="button"
                                variant="ghost"
                                onClick={clearFilters}
                                disabled={isPending}
                            >
                                Limpar
                            </Button>
                        )}
                    </div>
                </div>

                {showFilters && (
                    <div className="grid gap-4 rounded-lg border border-border/50 bg-background-secondary p-4 md:grid-cols-2">
                        <div className="space-y-2">
                            <label className="text-sm font-medium px-1">
                                Usuário
                            </label>
                            <Select
                                value={searchParams.get("user") ?? ""}
                                onValueChange={handleUserChange}
                            >
                                <SelectTrigger className="w-full">
                                    <SelectValue placeholder="Todos os usuários" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="">
                                        Todos os usuários
                                    </SelectItem>
                                    {usersOptions.map((option) => (
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
                            <label className="text-sm font-medium px-1">
                                Ordenar por
                            </label>
                            <Select
                                value={searchParams.get("filter") ?? ""}
                                onValueChange={handleFilterChange}
                            >
                                <SelectTrigger className="w-full">
                                    <SelectValue placeholder="Ordenação" />
                                </SelectTrigger>
                                <SelectContent>
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
                    </div>
                )}
            </div>

            {agents.length === 0 ? (
                <div className="flex items-center justify-center rounded-lg border border-dashed border-border/60 py-16 text-muted-foreground">
                    Nenhum agente encontrado com os filtros atuais.
                </div>
            ) : (
                <div className="grid grid-cols-1 gap-4 px-2 sm:grid-cols-2 sm:px-4 lg:grid-cols-3 lg:px-0">
                    {agents.map((agent) => (
                        <AgentCard
                            key={agent.id}
                            agent={agent}
                            onActionHappen={() => undefined}
                        />
                    ))}
                </div>
            )}

            <PaginationControls
                currentPage={pagination.current_page}
                lastPage={pagination.last_page}
                hasNextPage={!!pagination.next_page_url}
                hasPrevPage={!!pagination.prev_page_url}
                baseUrl="/agentes"
                searchParams={searchParamsRecord}
            />
        </section>
    );
}
