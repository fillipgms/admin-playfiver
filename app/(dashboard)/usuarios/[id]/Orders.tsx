import { getSpecificUserOrders } from "@/actions/users";
import { Card, CardContent, CardHeader } from "@/components/Card";
import { ShoppingCartIcon } from "@phosphor-icons/react/dist/ssr";
import React from "react";
import { twMerge } from "tailwind-merge";

const Orders = async ({ id }: { id: string }) => {
    const data = (await getSpecificUserOrders(id)) as UserOrdersResponse;

    if (!data || data.status !== 1) return <div>error</div>;

    const orders = data.data;

    function formatCurrency(value: number | string | null) {
        const num = Number(value) || 0;
        return new Intl.NumberFormat("pt-BR", {
            style: "currency",
            currency: "BRL",
        }).format(num);
    }

    function formatDateTime(dateString: string) {
        const date = new Date(dateString);
        return new Intl.DateTimeFormat("pt-BR", {
            day: "2-digit",
            month: "2-digit",
            year: "numeric",
            hour: "2-digit",
            minute: "2-digit",
        }).format(date);
    }

    return (
        <Card>
            <CardHeader>
                <div className="flex items-center w-full justify-between pb-4 border-b border-foreground/20">
                    <h2 className="font-semibold text-lg">
                        Histórico de Pedidos
                    </h2>
                    <span className="text-sm text-foreground/60">
                        {orders?.length || 0} pedidos
                    </span>
                </div>
            </CardHeader>
            <CardContent>
                {orders && orders.length > 0 ? (
                    <div className="space-y-3 mt-4">
                        {orders.map((order) => (
                            <div
                                key={order.id}
                                className="bg-background-secondary rounded-lg p-4 border border-foreground/10 hover:border-foreground/20 transition-colors"
                            >
                                <div className="flex flex-col gap-4">
                                    <div className="flex items-center gap-3">
                                        <div
                                            className={twMerge(
                                                order.status === 1
                                                    ? "bg-[#10B981]/10 text-[#10B981] border-[#10B981]/20"
                                                    : "bg-[#f59e0b]/10 text-[#f59e0b] border-[#f59e0b]/20",
                                                "px-3 py-1 rounded-lg border text-xs font-medium"
                                            )}
                                        >
                                            {order.status === 1
                                                ? "Aprovado"
                                                : "Pendente"}
                                        </div>
                                        <span className="text-sm text-foreground/60 font-mono">
                                            #{order.id}
                                        </span>
                                    </div>
                                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                                        <div className="space-y-1">
                                            <p className="text-xs text-foreground/60">
                                                Valor do Pedido
                                            </p>
                                            <p className="text-base font-semibold">
                                                {order.amount}
                                            </p>
                                        </div>
                                        <div className="space-y-1">
                                            <p className="text-xs text-foreground/60">
                                                Fichas Adicionadas
                                            </p>
                                            <p className="text-base font-bold text-primary">
                                                {order.amount_add}
                                            </p>
                                        </div>
                                        <div className="space-y-1">
                                            <p className="text-xs text-foreground/60">
                                                Gateway
                                            </p>
                                            <p className="text-sm font-medium">
                                                {order.getaway}
                                            </p>
                                        </div>
                                    </div>
                                    <div className="flex flex-wrap items-center gap-3 text-xs text-foreground/60 pt-2 border-t border-foreground/10">
                                        {order.type_wallet && (
                                            <>
                                                <span>{order.type_wallet}</span>
                                                <span>•</span>
                                            </>
                                        )}
                                        <span>
                                            {formatDateTime(order.created_at)}
                                        </span>
                                        {order.payment_id && (
                                            <>
                                                <span>•</span>
                                                <span className="font-mono">
                                                    ID:{" "}
                                                    {order.payment_id.slice(
                                                        0,
                                                        8
                                                    )}
                                                    ...
                                                </span>
                                            </>
                                        )}
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="p-8 text-center">
                        <ShoppingCartIcon
                            className="mx-auto text-foreground/30 mb-4"
                            size={48}
                        />
                        <p className="text-foreground/60">
                            Nenhum pedido encontrado
                        </p>
                    </div>
                )}
            </CardContent>
        </Card>
    );
};

export default Orders;
