"use client";

import React, {
    useCallback,
    useEffect,
    useMemo,
    useState,
    useTransition,
} from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { Card, CardContent, CardHeader } from "@/components/Card";
import Icon from "@/components/Icon";
import { StarIcon } from "@phosphor-icons/react/dist/ssr";
import { FunnelSimpleIcon } from "@phosphor-icons/react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import PaginationControls from "@/components/PaginationControls";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { usePermissions } from "@/hooks/usePermissions";

interface PaginationMeta {
    current_page: number;
    last_page: number;
    next_page_url: string | null;
    prev_page_url: string | null;
}

interface SignaturesClientProps {
    signatures: AdminSignatureProps[];
    pagination: PaginationMeta;
    queryKeys: {
        page: string;
        users: string;
        filter: string;
    };
}

const filterOptions = [
    { value: "default", label: "Ordenação padrão" },
    { value: "last", label: "Recentes" },
    { value: "primary", label: "Primeiros" },
    { value: "modify", label: "Última modificação" },
];

const parseArrayFromParam = (value: string | null) => {
    if (!value) return [];
    const trimmed = value.replace(/^\[/, "").replace(/\]$/, "");
    if (!trimmed) return [];
    return trimmed
        .split(",")
        .map((item) => item.trim())
        .filter(Boolean);
};

const formatArrayForInput = (value: string | null) =>
    parseArrayFromParam(value).join(", ");

const SignaturesClient = ({
    signatures,
    pagination,
    queryKeys,
}: SignaturesClientProps) => {
    const { loading, hasPermission } = usePermissions();
    const canViewSignatures = hasPermission("signature_view");

    const router = useRouter();
    const pathname = usePathname();
    const searchParams = useSearchParams();
    const [isPending, startTransition] = useTransition();

    const [showFilters, setShowFilters] = useState(false);
    const [usersInput, setUsersInput] = useState(
        formatArrayForInput(searchParams.get(queryKeys.users))
    );

    useEffect(() => {
        setUsersInput(formatArrayForInput(searchParams.get(queryKeys.users)));
    }, [queryKeys, searchParams]);

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

            params.set(queryKeys.page, "1");
            const queryString = params.toString();

            startTransition(() => {
                router.replace(
                    queryString ? `${pathname}?${queryString}` : pathname,
                    { scroll: false }
                );
            });
        },
        [pathname, queryKeys.page, router, searchParams, startTransition]
    );

    const parseInputValues = (value: string) =>
        value
            .split(",")
            .map((item) => item.trim())
            .filter(Boolean);

    const applyFilters = () => {
        const users = parseInputValues(usersInput);
        updateQuery({
            [queryKeys.users]:
                users.length > 0 ? `[${users.join(",")}]` : undefined,
        });
    };

    const clearFilters = () => {
        setUsersInput("");
        updateQuery({
            [queryKeys.users]: undefined,
            [queryKeys.filter]: undefined,
        });
    };

    const handleOrderChange = (value: string) => {
        updateQuery({
            [queryKeys.filter]: value || undefined,
        });
    };

    const hasActiveFilters = useMemo(() => {
        return (
            !!searchParams.get(queryKeys.users) ||
            !!searchParams.get(queryKeys.filter)
        );
    }, [queryKeys, searchParams]);

    const searchParamsRecord = useMemo(() => {
        const record: Record<string, string> = {};
        searchParams.forEach((value, key) => {
            record[key] = value;
        });
        return record;
    }, [searchParams]);

    if (loading || !canViewSignatures) {
        return null;
    }

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString("pt-BR", {
            day: "2-digit",
            month: "2-digit",
            year: "numeric",
        });
    };

    return (
        <section>
            <Card id="signatures-section">
                <CardHeader>
                    <div className="flex items-center justify-between gap-4">
                        <div className="flex items-center gap-3">
                            <Icon>
                                <StarIcon />
                            </Icon>
                            <span className="text-xl font-bold">
                                Assinaturas
                            </span>
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
                </CardHeader>

                {showFilters && (
                    <div className="border-t border-border/60 px-6 py-4 space-y-4">
                        <div className="space-y-2">
                            <label className="text-sm font-medium">
                                Usuários (IDs ou emails)
                            </label>
                            <Input
                                value={usersInput}
                                onChange={(event) =>
                                    setUsersInput(event.target.value)
                                }
                                placeholder="Ex.: 100,200,300"
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm font-medium">
                                Ordenar por
                            </label>
                            <Select
                                value={searchParams.get(queryKeys.filter) ?? ""}
                                onValueChange={handleOrderChange}
                            >
                                <SelectTrigger>
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
                        <div className="flex justify-end">
                            <Button
                                type="button"
                                onClick={applyFilters}
                                disabled={isPending}
                            >
                                Aplicar filtros
                            </Button>
                        </div>
                    </div>
                )}

                <CardContent className="space-y-4">
                    {signatures.length === 0 ? (
                        <div className="flex items-center justify-center py-8">
                            <p className="text-foreground/70">
                                Nenhuma assinatura encontrada
                            </p>
                        </div>
                    ) : (
                        <div className="space-y-3">
                            {signatures.map((signature) => (
                                <div
                                    key={signature.id}
                                    className="space-y-3 rounded-lg border border-foreground/10 bg-background-secondary p-4"
                                >
                                    <div className="flex items-start justify-between">
                                        <div className="flex-1">
                                            <div className="mb-2 flex items-center gap-2">
                                                <h3 className="text-base font-semibold">
                                                    {signature.name}
                                                </h3>
                                                <Badge
                                                    variant={
                                                        signature.status === 1
                                                            ? "default"
                                                            : "destructive"
                                                    }
                                                    className="text-xs"
                                                >
                                                    {signature.status === 1
                                                        ? "Ativo"
                                                        : "Inativo"}
                                                </Badge>
                                                {signature.expired === 1 && (
                                                    <Badge
                                                        variant="destructive"
                                                        className="text-xs"
                                                    >
                                                        Expirado
                                                    </Badge>
                                                )}
                                            </div>
                                            <p className="text-sm text-foreground/70">
                                                {signature.email}
                                            </p>
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-2 gap-4 border-t border-foreground/10 pt-2">
                                        <div className="space-y-1">
                                            <p className="text-xs text-foreground/50">
                                                Agente:
                                            </p>
                                            <p className="text-sm font-medium">
                                                {signature.agent}
                                            </p>
                                        </div>
                                        <div className="space-y-1">
                                            <p className="text-xs text-foreground/50">
                                                Tipo:
                                            </p>
                                            <p className="text-sm font-medium">
                                                {signature.type}
                                            </p>
                                        </div>
                                        <div className="space-y-1">
                                            <p className="text-xs text-foreground/50">
                                                Quantidade:
                                            </p>
                                            <p className="text-sm font-medium">
                                                {signature.quantity}
                                            </p>
                                        </div>
                                        <div className="space-y-1">
                                            <p className="text-xs text-foreground/50">
                                                Expira em:
                                            </p>
                                            <p className="text-sm font-medium">
                                                {formatDate(
                                                    signature.expired_at
                                                )}
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </CardContent>

                <div className="px-6 pb-6">
                    <PaginationControls
                        baseUrl="/pacotes"
                        currentPage={pagination.current_page}
                        lastPage={pagination.last_page}
                        hasNextPage={!!pagination.next_page_url}
                        hasPrevPage={!!pagination.prev_page_url}
                        searchParams={searchParamsRecord}
                        paramKey={queryKeys.page}
                    />
                </div>
            </Card>
        </section>
    );
};

export default SignaturesClient;
