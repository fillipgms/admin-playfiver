"use client";

import { Card, CardContent, CardHeader } from "@/components/Card";
import { Badge } from "@/components/ui/badge";
import {
    WalletIcon,
    CurrencyDollarIcon,
    TrendUpIcon,
    TrendDownIcon,
    ChartBarIcon,
    WarningCircleIcon,
} from "@phosphor-icons/react";
interface GgrContentProps {
    initialData: RelatorioGgrResponse | null;
}

function formatCurrency(value: number | string | null): string {
    const num = Number(value) || 0;
    return new Intl.NumberFormat("pt-BR", {
        style: "currency",
        currency: "BRL",
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
    }).format(num);
}

function formatNumber(value: number | string | null): string {
    const num = Number(value) || 0;
    return new Intl.NumberFormat("pt-BR", {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
    }).format(num);
}

export default function GgrContent({ initialData }: GgrContentProps) {
    if (!initialData || Object.keys(initialData).length === 0) {
        return (
            <Card className="p-12 text-center">
                <ChartBarIcon className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                <h3 className="text-lg font-semibold mb-2">
                    Nenhum dado GGR encontrado
                </h3>
                <p className="text-muted-foreground">
                    Não há dados de GGR disponíveis no momento.
                </p>
            </Card>
        );
    }

    const wallets = Object.entries(initialData);
    const totalBet = wallets.reduce(
        (sum, [, data]) => sum + parseFloat(data.bet || "0"),
        0
    );
    const totalWin = wallets.reduce(
        (sum, [, data]) => sum + parseFloat(data.win || "0"),
        0
    );
    const totalGgr = wallets.reduce(
        (sum, [, data]) => sum + parseFloat(data.ggrConsumido || "0"),
        0
    );
    const netGgr = totalBet - totalWin;

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                    <h2 className="text-2xl font-bold">Relatório GGR</h2>
                    <p className="text-sm text-foreground/60 mt-1">
                        Visualize dados de Gross Gaming Revenue por carteira
                    </p>
                </div>
            </div>

            {/* Summary Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <Card className="bg-gradient-to-br from-primary/10 to-primary/5 border-primary/20">
                    <CardHeader className="pb-2">
                        <div className="flex items-center gap-2">
                            <CurrencyDollarIcon className="size-5 text-primary" />
                            <p className="text-sm text-muted-foreground">
                                Total Apostas
                            </p>
                        </div>
                    </CardHeader>
                    <CardContent>
                        <p className="text-2xl font-bold text-primary">
                            {formatCurrency(totalBet)}
                        </p>
                    </CardContent>
                </Card>

                <Card className="bg-gradient-to-br from-red-500/10 to-red-500/5 border-red-500/20">
                    <CardHeader className="pb-2">
                        <div className="flex items-center gap-2">
                            <TrendDownIcon className="size-5 text-red-500" />
                            <p className="text-sm text-muted-foreground">
                                Total Ganhos
                            </p>
                        </div>
                    </CardHeader>
                    <CardContent>
                        <p className="text-2xl font-bold text-red-500">
                            {formatCurrency(totalWin)}
                        </p>
                    </CardContent>
                </Card>

                <Card className="bg-gradient-to-br from-green-500/10 to-green-500/5 border-green-500/20">
                    <CardHeader className="pb-2">
                        <div className="flex items-center gap-2">
                            <TrendUpIcon className="size-5 text-green-500" />
                            <p className="text-sm text-muted-foreground">
                                GGR Líquido
                            </p>
                        </div>
                    </CardHeader>
                    <CardContent>
                        <p className="text-2xl font-bold text-green-500">
                            {formatCurrency(netGgr)}
                        </p>
                    </CardContent>
                </Card>

                <Card className="bg-gradient-to-br from-blue-500/10 to-blue-500/5 border-blue-500/20">
                    <CardHeader className="pb-2">
                        <div className="flex items-center gap-2">
                            <ChartBarIcon className="size-5 text-blue-500" />
                            <p className="text-sm text-muted-foreground">
                                GGR Consumido
                            </p>
                        </div>
                    </CardHeader>
                    <CardContent>
                        <p className="text-2xl font-bold text-blue-500">
                            {formatCurrency(totalGgr)}
                        </p>
                    </CardContent>
                </Card>
            </div>

            {/* Wallets Grid */}
            <div>
                <h3 className="text-lg font-semibold mb-4">
                    Por Carteira ({wallets.length})
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
                    {wallets.map(([walletName, data]) => {
                        const bet = parseFloat(data.bet || "0");
                        const win = parseFloat(data.win || "0");
                        const ggr = parseFloat(data.ggrConsumido || "0");
                        const net = bet - win;
                        const margin = bet > 0 ? ((net / bet) * 100).toFixed(2) : "0.00";

                        return (
                            <Card
                                key={walletName}
                                className="hover:shadow-lg transition-shadow"
                            >
                                <CardHeader className="pb-3">
                                    <div className="flex items-center gap-2">
                                        <WalletIcon className="size-5 text-primary shrink-0" />
                                        <h4 className="text-lg font-semibold truncate">
                                            {walletName}
                                        </h4>
                                    </div>
                                </CardHeader>

                                <CardContent className="space-y-4">
                                    {/* Stats */}
                                    <div className="space-y-3">
                                        <div className="flex justify-between items-center">
                                            <span className="text-sm text-muted-foreground">
                                                Apostas:
                                            </span>
                                            <span className="text-sm font-semibold text-primary">
                                                {formatCurrency(bet)}
                                            </span>
                                        </div>

                                        <div className="flex justify-between items-center">
                                            <span className="text-sm text-muted-foreground">
                                                Ganhos:
                                            </span>
                                            <span className="text-sm font-semibold text-red-500">
                                                {formatCurrency(win)}
                                            </span>
                                        </div>

                                        <div className="flex justify-between items-center pt-2 border-t border-foreground/10">
                                            <span className="text-sm font-medium">
                                                GGR Líquido:
                                            </span>
                                            <span
                                                className={`text-sm font-bold ${
                                                    net >= 0
                                                        ? "text-green-500"
                                                        : "text-red-500"
                                                }`}
                                            >
                                                {formatCurrency(net)}
                                            </span>
                                        </div>

                                        <div className="flex justify-between items-center">
                                            <span className="text-sm text-muted-foreground">
                                                Margem:
                                            </span>
                                            <Badge
                                                variant={
                                                    parseFloat(margin) >= 0
                                                        ? "default"
                                                        : "destructive"
                                                }
                                            >
                                                {margin}%
                                            </Badge>
                                        </div>

                                        {ggr > 0 && (
                                            <div className="pt-2 border-t border-foreground/10">
                                                <div className="flex justify-between items-center">
                                                    <span className="text-sm text-muted-foreground">
                                                        GGR Consumido:
                                                    </span>
                                                    <span className="text-sm font-semibold text-blue-500">
                                                        {formatCurrency(ggr)}
                                                    </span>
                                                </div>
                                            </div>
                                        )}
                                    </div>

                                    {/* Visual Bar */}
                                    <div className="pt-3 border-t border-foreground/10">
                                        <div className="h-2 bg-muted rounded-full overflow-hidden">
                                            <div
                                                className={`h-full transition-all ${
                                                    net >= 0
                                                        ? "bg-green-500"
                                                        : "bg-red-500"
                                                }`}
                                                style={{
                                                    width: `${
                                                        bet > 0
                                                            ? Math.min(
                                                                  Math.abs(
                                                                      (net / bet) *
                                                                          100
                                                                  ),
                                                                  100
                                                              )
                                                            : 0
                                                    }%`,
                                                }}
                                            />
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        );
                    })}
                </div>
            </div>
        </div>
    );
}
