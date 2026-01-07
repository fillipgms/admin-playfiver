import { getSpecificUserInfos } from "@/actions/users";
import { Card } from "@/components/Card";
import {
    CalendarIcon,
    ClockIcon,
    GlobeIcon,
    MapPinIcon,
    UserIcon,
    CoinIcon,
    GpsFixIcon,
    ShoppingCartIcon,
    WalletIcon,
} from "@phosphor-icons/react/dist/ssr";
import { twMerge } from "tailwind-merge";

const UserHeader = async ({ id }: { id: string }) => {
    const { data, status } = (await getSpecificUserInfos(
        id
    )) as UserInfosResponse;

    if (!data || status !== 1) return <div>error</div>;

    const { user, infos } = data;

    function formatDate(dateString: string) {
        const date = new Date(dateString);
        return new Intl.DateTimeFormat("pt-BR", {
            day: "numeric",
            month: "short",
            year: "numeric",
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

    interface IPItem {
        id: number;
        ip: string;
        created_at: string;
    }

    const ipList: IPItem[] =
        typeof user.ip === "string"
            ? JSON.parse(user.ip || "[]")
            : user.ip || [];

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

    return (
        <>
            <Card className="p-6">
                <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-6">
                    <div className="space-y-4 flex-1">
                        <div className="flex flex-wrap items-center gap-3">
                            <div className="flex items-center justify-center size-12 rounded-full bg-primary/10">
                                <UserIcon className="text-primary" size={24} />
                            </div>
                            <div>
                                <h1 className="font-bold text-3xl">
                                    {user.name}
                                </h1>
                                <p className="text-foreground/60 mt-1">
                                    {user.email}
                                </p>
                            </div>
                        </div>

                        <div className="flex flex-wrap items-center gap-3">
                            <div
                                className={twMerge(
                                    user.ban === 0
                                        ? "text-[#95BD2B] bg-[#95BD2B]/10 border-[#95BD2B]/20"
                                        : "text-[#E53935] bg-[#E53935]/10 border-[#E53935]/20",
                                    "py-1.5 px-4 rounded-lg border font-medium text-sm"
                                )}
                            >
                                {user.ban === 0 ? "Ativo" : "Banido"}
                            </div>

                            <div
                                className={twMerge(
                                    user.role?.length > 0 &&
                                        user.role.some((r: string) =>
                                            r.includes("admin")
                                        )
                                        ? "text-primary bg-primary/10 border-primary/20"
                                        : user.role?.length > 0 &&
                                          user.role.some((r: string) =>
                                              r.includes("suporte")
                                          )
                                        ? "text-[#10B981] bg-[#10B981]/10 border-[#10B981]/20"
                                        : "text-[#9CA3AF] bg-[#9CA3AF]/10 border-[#9CA3AF]/20",
                                    "py-1.5 px-4 rounded-lg border font-medium text-sm"
                                )}
                            >
                                {user.role?.length > 0
                                    ? user.role.join(", ")
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
                                        {formatDate(user.created_at)}
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
                                        {formatRelativeTime(user.updated_at)}
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
                                        {user.latest_ip || "—"}
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
                            Total Gasto
                        </p>
                        <WalletIcon size={20} className="text-white/60" />
                    </div>
                    <p className="text-3xl font-bold">
                        {formatCurrency(infos.balance_total)}
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
                        {formatCurrency(infos.fichas_total)}
                    </p>
                </div>

                <div className="bg-linear-to-br from-[#169f49] to-[#15833e] text-white p-6 rounded-lg shadow-lg">
                    <div className="flex items-center justify-between mb-2">
                        <p className="text-white/80 text-sm font-medium">
                            Agentes
                        </p>
                        <GpsFixIcon size={20} className="text-white/60" />
                    </div>
                    <p className="text-3xl font-bold">{infos.agentes_count}</p>
                </div>

                <div className="bg-linear-to-br from-[#f59e0b] to-[#d97706] text-white p-6 rounded-lg shadow-lg">
                    <div className="flex items-center justify-between mb-2">
                        <p className="text-white/80 text-sm font-medium">
                            Pedidos
                        </p>
                        <ShoppingCartIcon size={20} className="text-white/60" />
                    </div>
                    <p className="text-3xl font-bold">{infos.orders || 0}</p>
                </div>
            </section>
        </>
    );
};

export default UserHeader;
