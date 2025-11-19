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
    FunnelSimpleIcon,
    MagnifyingGlassIcon,
} from "@phosphor-icons/react";

interface UsersFiltersProps {
    roles: string[];
}

const orderOptions = [
    { value: "", label: "Ordenação padrão" },
    { value: "balanceBig", label: "Saldo: maior para menor" },
    { value: "balanceLess", label: "Saldo: menor para maior" },
    { value: "last", label: "Recentes" },
    { value: "primary", label: "Primeiros criados" },
    { value: "modify", label: "Última modificação" },
];

export default function UsersFilters({ roles }: UsersFiltersProps) {
    const router = useRouter();
    const pathname = usePathname();
    const searchParams = useSearchParams();
    const [isPending, startTransition] = useTransition();

    const [searchValue, setSearchValue] = useState(
        searchParams.get("search") ?? ""
    );
    const [showFilters, setShowFilters] = useState(false);

    const debounceRef = useRef<NodeJS.Timeout | null>(null);

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

    useEffect(() => {
        setSearchValue(searchParams.get("search") ?? "");
    }, [searchParams]);

    const handleSearchChange = (value: string) => {
        setSearchValue(value);

        if (debounceRef.current) {
            clearTimeout(debounceRef.current);
        }

        debounceRef.current = setTimeout(() => {
            updateQuery({ search: value || undefined });
        }, 400);
    };

    const handleRoleChange = (value: string) => {
        updateQuery({ role: value || undefined });
    };

    const handleOrderChange = (value: string) => {
        updateQuery({ filter: value || undefined });
    };

    const clearFilters = () => {
        setSearchValue("");
        updateQuery({
            search: undefined,
            role: undefined,
            filter: undefined,
        });
    };

    const hasActiveFilters = useMemo(() => {
        return (
            !!searchParams.get("search") ||
            !!searchParams.get("role") ||
            !!searchParams.get("filter")
        );
    }, [searchParams]);

    return (
        <section className="space-y-4">
            <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
                <div className="relative w-full">
                    <MagnifyingGlassIcon className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                    <Input
                        value={searchValue}
                        onChange={(event) => handleSearchChange(event.target.value)}
                        placeholder="Pesquisar usuário por nome, email ou ID"
                        className="pl-9"
                        aria-label="Buscar usuários"
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
                        <label className="text-sm font-medium px-1">Função</label>
                        <Select
                            value={searchParams.get("role") ?? ""}
                            onValueChange={handleRoleChange}
                        >
                            <SelectTrigger className="w-full">
                                <SelectValue placeholder="Todas as funções" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem key="all-roles" value="">
                                    Todas as funções
                                </SelectItem>
                                {roles.map((role) => (
                                    <SelectItem key={role} value={role}>
                                        {role}
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
                            onValueChange={handleOrderChange}
                        >
                            <SelectTrigger className="w-full">
                                <SelectValue placeholder="Selecione a ordenação" />
                            </SelectTrigger>
                            <SelectContent>
                                {orderOptions.map((option) => (
                                    <SelectItem key={option.value} value={option.value}>
                                        {option.label}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>
                </div>
            )}
        </section>
    );
}

