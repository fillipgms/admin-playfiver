import { getSpecificUserOverview } from "@/actions/users";
import { Card, CardContent, CardHeader } from "@/components/Card";
import Icon from "@/components/Icon";
import {
    CoinIcon,
    GraphIcon,
    MoneyWavyIcon,
    ShoppingCartIcon,
    TrophyIcon,
    WalletIcon,
} from "@phosphor-icons/react/dist/ssr";

const Overview = async ({ id }: { id: string }) => {
    const { data, status } = (await getSpecificUserOverview(
        id
    )) as UserOverviewResponse;

    if (!data || status !== 1) return <div>error</div>;

    function formatCurrency(value: number | string | null) {
        const num = Number(value) || 0;
        return new Intl.NumberFormat("pt-BR", {
            style: "currency",
            currency: "BRL",
        }).format(num);
    }

    return (
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
                        {formatCurrency(data.winTotal)}
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
                        {formatCurrency(data.betTotal)}
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
                        {formatCurrency(data.last24HoursWins)}
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
                        {formatCurrency(data.last24HoursBets)}
                    </span>
                </CardContent>
            </Card>

            {/* <Card>
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
            </Card> */}
        </section>
    );
};

export default Overview;
