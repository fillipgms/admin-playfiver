import { getSpcificUser } from "@/actions/users";
import { Card, CardContent, CardHeader } from "@/components/Card";
import {
    ClockIcon,
    CoinIcon,
    GpsFixIcon,
    GraphIcon,
    MapPinIcon,
    MoneyWavyIcon,
    TrophyIcon,
    WalletIcon,
    ShoppingCartIcon,
    GlobeIcon,
    UserIcon,
    CalendarIcon,
} from "@phosphor-icons/react/dist/ssr";
import { twMerge } from "tailwind-merge";
import Icon from "@/components/Icon";
import AgentTable from "@/components/tables/AgentsTable";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Metadata } from "next";

export const metadata: Metadata = {
    title: "Usuário",
    description: "Visualização de usuário",
};
export default async function UserPage({
    params,
}: {
    params: Promise<{ id: string }>;
}) {
    const { id } = await params;

    const { data, error } = (await getSpcificUser(
        id
    )) as SpecificUserResponseProps;

    if (error) {
        return <div>{error}</div>;
    }

    const {
        user,
        agentesCount,
        agentesSumWin,
        agentesSumBet,
        agentesSumWin24,
        agentesSumBet24,
        agentes,
        orders,
        ip,
        wallets,
    } = data;

    const currentUser = user[0];

    interface IPItem {
        id: number;
        ip: string;
        created_at: string;
    }
    const ipList: IPItem[] =
        typeof ip === "string" ? JSON.parse(ip || "[]") : ip || [];

    function formatDate(dateString: string) {
        const date = new Date(dateString);
        return new Intl.DateTimeFormat("pt-BR", {
            day: "numeric",
            month: "short",
            year: "numeric",
        }).format(date);
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

    function formatRelativeTime(dateString: string) {
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
        if (diffDays < 7) return `há ${diffDays} dia${diffDays > 1 ? "s" : ""}`;
        if (diffDays < 14) return "há uma semana";

        return formatDate(dateString);
    }

    function getSaldoTotal(data: SpecificUserDataProps) {
        if (!data?.wallets) return 0;

        return data.wallets.reduce((total, wallet) => {
            const saldo = parseFloat(wallet.saldo) || 0;
            return total + saldo;
        }, 0);
    }

    function formatCurrency(value: number | string | null) {
        const num = Number(value) || 0;
        return new Intl.NumberFormat("pt-BR", {
            style: "currency",
            currency: "BRL",
        }).format(num);
    }

    const walletsWithBalance = wallets.filter(
        (wallet) => parseFloat(wallet.saldo) > 0
    );

    return (
        <main className="space-y-6">
            <Card className="p-6">
                <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-6">
                    <div className="space-y-4 flex-1">
                        <div className="flex flex-wrap items-center gap-3">
                            <div className="flex items-center justify-center size-12 rounded-full bg-primary/10">
                                <UserIcon className="text-primary" size={24} />
                            </div>
                            <div>
                                <h1 className="font-bold text-3xl">
                                    {currentUser.name}
                                </h1>
                                <p className="text-foreground/60 mt-1">
                                    {currentUser.email}
                                </p>
                            </div>
                        </div>

                        <div className="flex flex-wrap items-center gap-3">
                            <div
                                className={twMerge(
                                    currentUser.ban === 0
                                        ? "text-[#95BD2B] bg-[#95BD2B]/10 border-[#95BD2B]/20"
                                        : "text-[#E53935] bg-[#E53935]/10 border-[#E53935]/20",
                                    "py-1.5 px-4 rounded-lg border font-medium text-sm"
                                )}
                            >
                                {currentUser.ban === 0 ? "Ativo" : "Banido"}
                            </div>

                            <div
                                className={twMerge(
                                    currentUser.role?.length > 0 &&
                                        currentUser.role.some((r) =>
                                            r.includes("admin")
                                        )
                                        ? "text-primary bg-primary/10 border-primary/20"
                                        : currentUser.role?.length > 0 &&
                                          currentUser.role.some((r) =>
                                              r.includes("suporte")
                                          )
                                        ? "text-[#10B981] bg-[#10B981]/10 border-[#10B981]/20"
                                        : "text-[#9CA3AF] bg-[#9CA3AF]/10 border-[#9CA3AF]/20",
                                    "py-1.5 px-4 rounded-lg border font-medium text-sm"
                                )}
                            >
                                {currentUser.role?.length > 0
                                    ? currentUser.role.join(", ")
                                    : "Usuário"}
                            </div>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 pt-2">
                            <div className="flex items-center gap-2 text-sm">
                                <CalendarIcon
                                    className="text-foreground/50"
                                    size={18}
                                />
                                <div>
                                    <p className="text-foreground/60 text-xs">
                                        Criado em
                                    </p>
                                    <p className="font-medium">
                                        {formatDate(currentUser.created_at)}
                                    </p>
                                </div>
                            </div>
                            <div className="flex items-center gap-2 text-sm">
                                <ClockIcon
                                    className="text-foreground/50"
                                    size={18}
                                />
                                <div>
                                    <p className="text-foreground/60 text-xs">
                                        Última atualização
                                    </p>
                                    <p className="font-medium">
                                        {formatRelativeTime(
                                            currentUser.updated_at
                                        )}
                                    </p>
                                </div>
                            </div>
                            <div className="flex items-center gap-2 text-sm">
                                <MapPinIcon
                                    className="text-foreground/50"
                                    size={18}
                                />
                                <div>
                                    <p className="text-foreground/60 text-xs">
                                        IP Atual
                                    </p>
                                    <p className="font-medium font-mono">
                                        {currentUser.latest_ip || "—"}
                                    </p>
                                </div>
                            </div>
                            <div className="flex items-center gap-2 text-sm">
                                <GlobeIcon
                                    className="text-foreground/50"
                                    size={18}
                                />
                                <div>
                                    <p className="text-foreground/60 text-xs">
                                        IPs Relacionados
                                    </p>
                                    <p className="font-medium">
                                        {ipList?.length || 0}
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </Card>

            <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="bg-linear-to-br from-[#2460e8] to-[#1e51da] text-white p-6 rounded-lg shadow-lg">
                    <div className="flex items-center justify-between mb-2">
                        <p className="text-white/80 text-sm font-medium">
                            Saldo Total
                        </p>
                        <WalletIcon size={20} className="text-white/60" />
                    </div>
                    <p className="text-3xl font-bold">
                        {formatCurrency(getSaldoTotal(data))}
                    </p>
                </div>

                <div className="bg-linear-to-br from-[#9031e7] to-[#8024d1] text-white p-6 rounded-lg shadow-lg">
                    <div className="flex items-center justify-between mb-2">
                        <p className="text-white/80 text-sm font-medium">
                            Total Fichas
                        </p>
                        <CoinIcon size={20} className="text-white/60" />
                    </div>
                    <p className="text-3xl font-bold">
                        {formatCurrency(currentUser.totalFichas)}
                    </p>
                </div>

                <div className="bg-linear-to-br from-[#169f49] to-[#15833e] text-white p-6 rounded-lg shadow-lg">
                    <div className="flex items-center justify-between mb-2">
                        <p className="text-white/80 text-sm font-medium">
                            Agentes
                        </p>
                        <GpsFixIcon size={20} className="text-white/60" />
                    </div>
                    <p className="text-3xl font-bold">{agentesCount}</p>
                </div>

                <div className="bg-linear-to-br from-[#f59e0b] to-[#d97706] text-white p-6 rounded-lg shadow-lg">
                    <div className="flex items-center justify-between mb-2">
                        <p className="text-white/80 text-sm font-medium">
                            Pedidos
                        </p>
                        <ShoppingCartIcon size={20} className="text-white/60" />
                    </div>
                    <p className="text-3xl font-bold">{orders?.length || 0}</p>
                </div>
            </section>

            <Tabs defaultValue="overview" className="w-full">
                <TabsList className="bg-background-primary w-full sm:w-auto">
                    <TabsTrigger value="overview">Visão Geral</TabsTrigger>
                    <TabsTrigger value="agents">Agentes</TabsTrigger>
                    <TabsTrigger value="orders">Pedidos</TabsTrigger>
                    <TabsTrigger value="wallets">Carteiras</TabsTrigger>
                    <TabsTrigger value="ips">Histórico de IPs</TabsTrigger>
                    <TabsTrigger value="related">
                        Usuários Relacionados
                    </TabsTrigger>
                </TabsList>

                <TabsContent value="overview" className="mt-6 space-y-6">
                    <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                        <Card>
                            <CardHeader>
                                <Icon>
                                    <TrophyIcon />
                                </Icon>
                                Vitórias Totais
                            </CardHeader>
                            <CardContent>
                                <span className="text-2xl font-bold">
                                    {formatCurrency(
                                        agentesSumWin ||
                                            currentUser.agentesSumWin
                                    )}
                                </span>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardHeader>
                                <Icon>
                                    <CoinIcon />
                                </Icon>
                                Apostas Totais
                            </CardHeader>
                            <CardContent>
                                <span className="text-2xl font-bold">
                                    {formatCurrency(
                                        agentesSumBet ||
                                            currentUser.agentesSumBet
                                    )}
                                </span>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardHeader>
                                <Icon>
                                    <GraphIcon />
                                </Icon>
                                Vitórias 24h
                            </CardHeader>
                            <CardContent>
                                <span className="text-2xl font-bold">
                                    {formatCurrency(
                                        agentesSumWin24 ||
                                            currentUser.agentesSumWin24
                                    )}
                                </span>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardHeader>
                                <Icon>
                                    <MoneyWavyIcon />
                                </Icon>
                                Apostas 24h
                            </CardHeader>
                            <CardContent>
                                <span className="text-2xl font-bold">
                                    {formatCurrency(
                                        agentesSumBet24 ||
                                            currentUser.agentesSumBet24
                                    )}
                                </span>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardHeader>
                                <Icon>
                                    <ShoppingCartIcon />
                                </Icon>
                                Total Pedidos
                            </CardHeader>
                            <CardContent>
                                <span className="text-2xl font-bold">
                                    {formatCurrency(currentUser.ordersTotal)}
                                </span>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardHeader>
                                <Icon>
                                    <WalletIcon />
                                </Icon>
                                Fichas Adicionadas
                            </CardHeader>
                            <CardContent>
                                <span className="text-2xl font-bold">
                                    {formatCurrency(currentUser.fichasTotal)}
                                </span>
                            </CardContent>
                        </Card>
                    </section>
                </TabsContent>

                <TabsContent value="agents" className="mt-6">
                    <Card>
                        {agentes && agentes.length >= 1 ? (
                            <AgentTable agents={agentes} />
                        ) : (
                            <div className="p-8 text-center">
                                <GpsFixIcon
                                    className="mx-auto text-foreground/30 mb-4"
                                    size={48}
                                />
                                <p className="text-foreground/60">
                                    Nenhum agente encontrado
                                </p>
                            </div>
                        )}
                    </Card>
                </TabsContent>

                <TabsContent value="orders" className="mt-6">
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
                                            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                                                <div className="flex-1 space-y-2">
                                                    <div className="flex items-center gap-3">
                                                        <div
                                                            className={twMerge(
                                                                order.status ===
                                                                    1
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
                                                    <div className="space-y-1">
                                                        <p className="font-semibold">
                                                            {formatCurrency(
                                                                order.amount
                                                            )}
                                                        </p>
                                                        <div className="flex flex-wrap items-center gap-3 text-xs text-foreground/60">
                                                            <span>
                                                                {order.getaway}
                                                            </span>
                                                            {order.type_wallet && (
                                                                <>
                                                                    <span>
                                                                        •
                                                                    </span>
                                                                    <span>
                                                                        {
                                                                            order.type_wallet
                                                                        }
                                                                    </span>
                                                                </>
                                                            )}
                                                            <span>•</span>
                                                            <span>
                                                                {formatDateTime(
                                                                    order.created_at
                                                                )}
                                                            </span>
                                                        </div>
                                                    </div>
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
                </TabsContent>

                <TabsContent value="wallets" className="mt-6">
                    <Card>
                        <CardHeader>
                            <div className="flex items-center w-full justify-between pb-4 border-b border-foreground/20">
                                <h2 className="font-semibold text-lg">
                                    Carteiras
                                </h2>
                                <span className="text-sm text-foreground/60">
                                    {walletsWithBalance.length} com saldo
                                </span>
                            </div>
                        </CardHeader>
                        <CardContent>
                            {walletsWithBalance.length > 0 ? (
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                                    {walletsWithBalance.map((wallet, i) => (
                                        <div
                                            key={i}
                                            className="bg-background-secondary rounded-lg p-4 border border-foreground/10 hover:border-foreground/20 transition-colors"
                                        >
                                            <div className="flex items-start justify-between gap-4">
                                                <div className="flex items-center gap-3 flex-1">
                                                    <Icon>
                                                        <WalletIcon />
                                                    </Icon>
                                                    <div className="flex-1 min-w-0">
                                                        <h3 className="font-semibold text-base truncate">
                                                            {wallet.wallet}
                                                        </h3>
                                                        <p className="text-xs text-foreground/60 font-mono mt-1">
                                                            ID: {wallet.id}
                                                        </p>
                                                    </div>
                                                </div>
                                                <p className="text-lg font-bold whitespace-nowrap">
                                                    {formatCurrency(
                                                        wallet.saldo
                                                    )}
                                                </p>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <div className="p-8 text-center">
                                    <WalletIcon
                                        className="mx-auto text-foreground/30 mb-4"
                                        size={48}
                                    />
                                    <p className="text-foreground/60">
                                        Nenhuma carteira com saldo
                                    </p>
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </TabsContent>

                <TabsContent value="ips" className="mt-6">
                    <Card>
                        <CardHeader>
                            <div className="flex items-center w-full justify-between pb-4 border-b border-foreground/20">
                                <h2 className="font-semibold text-lg">
                                    Histórico de IPs
                                </h2>
                                <span className="text-sm text-foreground/60">
                                    {ipList?.length || 0} IPs
                                </span>
                            </div>
                        </CardHeader>
                        <CardContent>
                            {ipList && ipList.length > 0 ? (
                                <div className="space-y-2 mt-4">
                                    {ipList.map((ipItem, i: number) => (
                                        <div
                                            key={ipItem.id || i}
                                            className="bg-background-secondary rounded-lg p-4 border border-foreground/10 hover:border-foreground/20 transition-colors"
                                        >
                                            <div className="flex items-center justify-between">
                                                <div className="flex items-center gap-3">
                                                    <MapPinIcon
                                                        className="text-foreground/50"
                                                        size={20}
                                                    />
                                                    <div>
                                                        <p className="font-mono font-semibold">
                                                            {ipItem.ip}
                                                        </p>
                                                        <p className="text-xs text-foreground/60 mt-1">
                                                            {formatDateTime(
                                                                ipItem.created_at
                                                            )}
                                                        </p>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <div className="p-8 text-center">
                                    <GlobeIcon
                                        className="mx-auto text-foreground/30 mb-4"
                                        size={48}
                                    />
                                    <p className="text-foreground/60">
                                        Nenhum IP registrado
                                    </p>
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </TabsContent>

                <TabsContent value="related" className="mt-6"></TabsContent>
            </Tabs>
        </main>
    );
}
