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
import { ShoppingCartIcon } from "@phosphor-icons/react/dist/ssr";
import { FunnelSimpleIcon } from "@phosphor-icons/react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import PaginationControls from "@/components/PaginationControls";
import { usePermissions } from "@/hooks/usePermissions";

interface PaginationMeta {
    current_page: number;
    last_page: number;
    next_page_url: string | null;
    prev_page_url: string | null;
}

interface OrdersClientProps {
    orders: AdminOrderProps[];
    pagination: PaginationMeta;
    queryKeys: {
        page: string;
        users: string;
        wallets: string;
        dateStart: string;
        dateEnd: string;
    };
}

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

const OrdersClient = ({ orders, pagination, queryKeys }: OrdersClientProps) => {
    const { loading, hasPermission } = usePermissions();
    const canViewOrders = hasPermission("orders_view");

    const router = useRouter();
    const pathname = usePathname();
    const searchParams = useSearchParams();
    const [isPending, startTransition] = useTransition();

    const [showFilters, setShowFilters] = useState(false);
    const [usersInput, setUsersInput] = useState(
        formatArrayForInput(searchParams.get(queryKeys.users))
    );
    const [walletsInput, setWalletsInput] = useState(
        formatArrayForInput(searchParams.get(queryKeys.wallets))
    );
    const [dateStartValue, setDateStartValue] = useState(
        searchParams.get(queryKeys.dateStart) ?? ""
    );
    const [dateEndValue, setDateEndValue] = useState(
        searchParams.get(queryKeys.dateEnd) ?? ""
    );

    useEffect(() => {
        setUsersInput(formatArrayForInput(searchParams.get(queryKeys.users)));
        setWalletsInput(formatArrayForInput(searchParams.get(queryKeys.wallets)));
        setDateStartValue(searchParams.get(queryKeys.dateStart) ?? "");
        setDateEndValue(searchParams.get(queryKeys.dateEnd) ?? "");
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
        const updates: Record<string, string | undefined> = {};
        const users = parseInputValues(usersInput);
        const wallets = parseInputValues(walletsInput);

        updates[queryKeys.users] =
            users.length > 0 ? `[${users.join(",")}]` : undefined;
        updates[queryKeys.wallets] =
            wallets.length > 0 ? `[${wallets.join(",")}]` : undefined;
        updates[queryKeys.dateStart] = dateStartValue || undefined;
        updates[queryKeys.dateEnd] = dateEndValue || undefined;

        updateQuery(updates);
    };

    const clearFilters = () => {
        setUsersInput("");
        setWalletsInput("");
        setDateStartValue("");
        setDateEndValue("");

        updateQuery({
            [queryKeys.users]: undefined,
            [queryKeys.wallets]: undefined,
            [queryKeys.dateStart]: undefined,
            [queryKeys.dateEnd]: undefined,
        });
    };

    const hasActiveFilters = useMemo(() => {
        return (
            !!searchParams.get(queryKeys.users) ||
            !!searchParams.get(queryKeys.wallets) ||
            !!searchParams.get(queryKeys.dateStart) ||
            !!searchParams.get(queryKeys.dateEnd)
        );
    }, [queryKeys, searchParams]);

    const searchParamsRecord = useMemo(() => {
        const record: Record<string, string> = {};
        searchParams.forEach((value, key) => {
            record[key] = value;
        });
        return record;
    }, [searchParams]);

    if (loading || !canViewOrders) {
        return null;
    }

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString("pt-BR", {
            day: "2-digit",
            month: "2-digit",
            year: "numeric",
            hour: "2-digit",
            minute: "2-digit",
        });
    };

    const formatCurrency = (value: string) => {
        return `R$ ${value}`;
    };

    return (
        <section>
            <Card id="orders-section">
                <CardHeader>
                    <div className="flex items-center justify-between gap-4">
                        <div className="flex items-center gap-3">
                            <Icon>
                                <ShoppingCartIcon />
                            </Icon>
                            <span className="text-xl font-bold">Pedidos</span>
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
                    <div className="border-t border-border/60 px-6 py-4">
                        <div className="grid gap-4 md:grid-cols-2">
                            <div className="space-y-2">
                                <label className="text-sm font-medium">
                                    Usuários (IDs ou emails)
                                </label>
                                <Input
                                    value={usersInput}
                                    onChange={(event) =>
                                        setUsersInput(event.target.value)
                                    }
                                    placeholder="Ex.: 123,456,789"
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-medium">
                                    Carteiras
                                </label>
                                <Input
                                    value={walletsInput}
                                    onChange={(event) =>
                                        setWalletsInput(event.target.value)
                                    }
                                    placeholder="Ex.: main,oficial"
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-medium">
                                    Data Inicial
                                </label>
                                <Input
                                    type="date"
                                    value={dateStartValue}
                                    onChange={(event) =>
                                        setDateStartValue(event.target.value)
                                    }
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-medium">
                                    Data Final
                                </label>
                                <Input
                                    type="date"
                                    value={dateEndValue}
                                    onChange={(event) =>
                                        setDateEndValue(event.target.value)
                                    }
                                />
                            </div>
                        </div>
                        <div className="mt-4 flex justify-end gap-2">
                            <Button
                                type="button"
                                variant="outline"
                                onClick={clearFilters}
                                disabled={isPending}
                            >
                                Limpar
                            </Button>
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
                    {orders.length === 0 ? (
                        <div className="flex items-center justify-center py-8">
                            <p className="text-foreground/70">
                                Nenhum pedido encontrado
                            </p>
                        </div>
                    ) : (
                        <div className="space-y-3">
                            {orders.map((order) => (
                                <div
                                    key={order.id}
                                    className="space-y-3 rounded-lg border border-foreground/10 bg-background-secondary p-4"
                                >
                                    <div className="flex items-start justify-between">
                                        <div className="flex-1">
                                            <div className="mb-2 flex items-center gap-2">
                                                <h3 className="text-base font-semibold">
                                                    {order.user.name}
                                                </h3>
                                                <Badge
                                                    variant={
                                                        order.status === 1
                                                            ? "default"
                                                            : "destructive"
                                                    }
                                                    className="text-xs"
                                                >
                                                    {order.status === 1
                                                        ? "Aprovado"
                                                        : "Pendente"}
                                                </Badge>
                                            </div>
                                            <p className="text-sm text-foreground/70">
                                                {order.user.email}
                                            </p>
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-2 gap-4 border-t border-foreground/10 pt-2">
                                        <div className="space-y-1">
                                            <p className="text-xs text-foreground/50">
                                                Carteira:
                                            </p>
                                            <p className="text-sm font-medium">
                                                {order.wallet}
                                            </p>
                                        </div>
                                        <div className="space-y-1">
                                            <p className="text-xs text-foreground/50">
                                                Tipo:
                                            </p>
                                            <p className="text-sm font-medium">
                                                {order.type}
                                            </p>
                                        </div>
                                        <div className="space-y-1">
                                            <p className="text-xs text-foreground/50">
                                                Valor:
                                            </p>
                                            <p className="text-sm font-medium">
                                                {formatCurrency(order.amount)}
                                            </p>
                                        </div>
                                        <div className="space-y-1">
                                            <p className="text-xs text-foreground/50">
                                                Valor Adicional:
                                            </p>
                                            <p className="text-sm font-medium">
                                                {formatCurrency(order.amount_add)}
                                            </p>
                                        </div>
                                        <div className="space-y-1">
                                            <p className="text-xs text-foreground/50">
                                                Gateway:
                                            </p>
                                            <p className="text-sm font-medium">
                                                {order.getaway}
                                            </p>
                                        </div>
                                        <div className="space-y-1">
                                            <p className="text-xs text-foreground/50">
                                                Data:
                                            </p>
                                            <p className="text-sm font-medium">
                                                {formatDate(order.created_at)}
                                            </p>
                                        </div>
                                    </div>

                                    <div className="border-t border-foreground/10 pt-2">
                                        <p className="text-xs text-foreground/50">
                                            Payment ID
                                        </p>
                                        <p className="break-all font-mono text-xs">
                                            {order.payment_id}
                                        </p>
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

export default OrdersClient;
