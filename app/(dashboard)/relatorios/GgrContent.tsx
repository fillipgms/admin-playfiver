"use client";

import { Card, CardContent, CardHeader } from "@/components/Card";
import { Badge } from "@/components/ui/badge";
import { useMemo, useEffect, useState } from "react";
import {
    WalletIcon,
    CurrencyDollarIcon,
    TrendUpIcon,
    TrendDownIcon,
    ChartBarIcon,
} from "@phosphor-icons/react";
import { getGGRRelatorioData } from "@/actions/relatorio";

interface GgrContentProps {
    initialData?: RelatorioGgrResponse | null;
}

const currencyFormatter = new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
});

function formatCurrency(value: number | string | null): string {
    const num = Number(value) || 0;
    return currencyFormatter.format(num);
}

const parseBrazilianNumber = (
    value: string | number | null | undefined
): number => {
    if (value === null || value === undefined) return 0;
    if (typeof value === "number") return value;
    const s = String(value).trim();
    if (s === "") return 0;
    const normalized = s.replace(/\./g, "").replace(/,/g, ".");
    const n = Number(normalized);
    return Number.isFinite(n) ? n : 0;
};

export default function GgrContent({ initialData }: GgrContentProps) {
    const [data, setData] = useState<RelatorioGgrResponse | null>(
        initialData || null
    );
    const [loading, setLoading] = useState(!initialData);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (!initialData) {
            const fetchData = async () => {
                setLoading(true);
                setError(null);
                try {
                    const result = await getGGRRelatorioData({});
                    if (result.error) {
                        setError(result.error);
                    } else {
                        setData(result.data);
                    }
                } catch (err) {
                    setError("Erro ao carregar dados de GGR. Tente novamente.");
                    console.error("Error loading GGR data:", err);
                } finally {
                    setLoading(false);
                }
            };
            fetchData();
        }
    }, [initialData]);

    const walletEntries = useMemo(() => {
        if (!data || Object.keys(data).length === 0) return [];
        const raw: any = data as any;
        return Array.isArray(raw?.data)
            ? raw.data.map((w: any) => [w.walletName || "Unknown", w])
            : Array.isArray(raw)
            ? (raw as [string, any][])
            : Object.entries(raw || {});
    }, [data]);

    const aggregatedData = useMemo(() => {
        let totalBet = 0;
        let totalWin = 0;
        let totalGgr = 0;

        for (const [, walletData] of walletEntries) {
            totalBet += parseBrazilianNumber(walletData?.bet);
            totalWin += parseBrazilianNumber(walletData?.win);
            totalGgr += parseBrazilianNumber(walletData?.ggrConsumido);
        }

        return {
            totalBet,
            totalWin,
            totalGgr,
            netGgr: totalBet - totalWin,
        };
    }, [walletEntries]);

    interface ProcessedWallet {
        walletName: string;
        bet: number;
        win: number;
        ggr: number;
        net: number;
        margin: string;
        marginIsPositive: boolean;
        progressWidth: number;
    }

    const processedWallets = useMemo((): ProcessedWallet[] => {
        return walletEntries.map(([walletName, walletData]: [string, any]) => {
            const bet = parseBrazilianNumber(walletData?.bet);
            const win = parseBrazilianNumber(walletData?.win);
            const ggr = parseBrazilianNumber(walletData?.ggrConsumido);
            const net = bet - win;
            const margin = bet > 0 ? ((net / bet) * 100).toFixed(2) : "0.00";
            const marginIsPositive = parseFloat(margin) >= 0;
            const progressWidth =
                bet > 0 ? Math.min(Math.abs((net / bet) * 100), 100) : 0;

            return {
                walletName,
                bet,
                win,
                ggr,
                net,
                margin,
                marginIsPositive,
                progressWidth,
            };
        });
    }, [walletEntries]);

    if (loading) {
        return (
            <div className="space-y-6">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                    <div>
                        <h2 className="text-2xl font-bold">Relatório GGR</h2>
                        <p className="text-sm text-foreground/60 mt-1">
                            Visualize dados de Gross Gaming Revenue por carteira
                        </p>
                    </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                    {Array.from({ length: 4 }).map((_, i) => (
                        <Card key={i} className="animate-pulse">
                            <CardHeader className="pb-2">
                                <div className="h-4 w-24 bg-muted rounded" />
                            </CardHeader>
                            <CardContent>
                                <div className="h-8 w-32 bg-muted rounded" />
                            </CardContent>
                        </Card>
                    ))}
                </div>

                <div>
                    <h3 className="text-lg font-semibold mb-4">Por Carteira</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
                        {Array.from({ length: 6 }).map((_, i) => (
                            <Card key={i} className="animate-pulse">
                                <CardHeader className="pb-3">
                                    <div className="h-5 w-32 bg-muted rounded" />
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    <div className="space-y-3">
                                        {Array.from({ length: 4 }).map(
                                            (_, j) => (
                                                <div
                                                    key={j}
                                                    className="flex justify-between"
                                                >
                                                    <div className="h-4 w-20 bg-muted rounded" />
                                                    <div className="h-4 w-24 bg-muted rounded" />
                                                </div>
                                            )
                                        )}
                                    </div>
                                    <div className="h-2 bg-muted rounded-full" />
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <Card className="p-12 text-center">
                <ChartBarIcon className="h-12 w-12 mx-auto mb-4 text-destructive" />
                <h3 className="text-lg font-semibold mb-2 text-destructive">
                    Erro ao carregar dados
                </h3>
                <p className="text-muted-foreground">{error}</p>
            </Card>
        );
    }

    if (!data || Object.keys(data).length === 0 || walletEntries.length === 0) {
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

    const { totalBet, totalWin, totalGgr, netGgr } = aggregatedData;

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                    <h2 className="text-2xl font-bold">Relatório GGR</h2>
                    <p className="text-sm text-foreground/60 mt-1">
                        Visualize dados de Gross Gaming Revenue por carteira
                    </p>
                </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <Card className="bg-linear-to-br from-primary/10 to-primary/5 border-primary/20">
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

                <Card className="bg-linear-to-br from-red-500/10 to-red-500/5 border-red-500/20">
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

                <Card className="bg-linear-to-br from-green-500/10 to-green-500/5 border-green-500/20">
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

                <Card className="bg-linear-to-br from-blue-500/10 to-blue-500/5 border-blue-500/20">
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

            <div>
                <h3 className="text-lg font-semibold mb-4">Por Carteira</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
                    {processedWallets.map(
                        ({
                            walletName,
                            bet,
                            win,
                            ggr,
                            net,
                            margin,
                            marginIsPositive,
                            progressWidth,
                        }) => (
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
                                                    marginIsPositive
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

                                    <div className="pt-3 border-t border-foreground/10">
                                        <div className="h-2 bg-muted rounded-full overflow-hidden">
                                            <div
                                                className={`h-full transition-all ${
                                                    net >= 0
                                                        ? "bg-green-500"
                                                        : "bg-red-500"
                                                }`}
                                                style={{
                                                    width: `${progressWidth}%`,
                                                }}
                                            />
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        )
                    )}
                </div>
            </div>
        </div>
    );
}
