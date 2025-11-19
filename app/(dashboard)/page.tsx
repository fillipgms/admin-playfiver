import { getHomeData } from "@/actions/home";
import { Card, CardContent, CardHeader } from "@/components/Card";
import Icon from "@/components/Icon";
import LineGraph from "@/components/LineGraph";
import {
    CurrencyDollarIcon,
    EyeIcon,
    GameControllerIcon,
    HandArrowUpIcon,
    SquaresFourIcon,
    UsersThreeIcon,
} from "@phosphor-icons/react/ssr";

export default async function Home() {
    const {
        user_count,
        agent_count,
        active_players,
        games_views,
        provedores_views,
        bets24,
        win24,
        saldoFiv,
    } = (await getHomeData()) as HomeResponse;

    return (
        <main className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-6 gap-4 sm:gap-6 lg:gap-8">
            <Card className="col-span-2">
                <CardHeader>
                    <Icon>
                        <UsersThreeIcon />
                    </Icon>
                    Usuários
                </CardHeader>
                <CardContent>
                    <span className="text-2xl font-bold">{user_count}</span>
                </CardContent>
            </Card>

            <Card className="col-span-2">
                <CardHeader>
                    <Icon>
                        <SquaresFourIcon />
                    </Icon>
                    Agentes
                </CardHeader>
                <CardContent>
                    <span className="text-2xl font-bold">{agent_count}</span>
                </CardContent>
            </Card>

            <Card className="col-span-2">
                <CardHeader>
                    <Icon>
                        <GameControllerIcon />
                    </Icon>
                    Players Ativos
                </CardHeader>
                <CardContent>
                    <span className="text-2xl font-bold">{active_players}</span>
                </CardContent>
            </Card>

            <Card className="col-span-2">
                <CardHeader>
                    <Icon>
                        <CurrencyDollarIcon />
                    </Icon>
                    Vitórias das últimas 24 Horas
                </CardHeader>
                <CardContent>
                    <span className="text-2xl font-bold">{bets24}</span>
                </CardContent>
            </Card>

            <Card className="col-span-2">
                <CardHeader>
                    <Icon>
                        <CurrencyDollarIcon />
                    </Icon>
                    Perdas das últimas 24 Horas
                </CardHeader>
                <CardContent>
                    <span className="text-2xl font-bold">{win24}</span>
                </CardContent>
            </Card>

            <Card className="col-span-2">
                <CardHeader>
                    <Icon>
                        <CurrencyDollarIcon />
                    </Icon>
                    Saldo da fivescan
                </CardHeader>
                <CardContent>
                    <span className="text-2xl font-bold">{saldoFiv}</span>
                </CardContent>
            </Card>

            <Card className="col-span-3">
                <CardHeader>
                    <Icon>
                        <EyeIcon />
                    </Icon>
                    <span className="text-lg sm:text-xl font-bold">
                        Principais Jogos
                    </span>
                </CardHeader>
                <CardContent>
                    <LineGraph
                        data={
                            Object.values(games_views) as Array<{
                                game_name: string;
                                count: number;
                            }>
                        }
                    />
                </CardContent>
            </Card>

            <Card className="col-span-3">
                <CardHeader>
                    <Icon>
                        <HandArrowUpIcon />
                    </Icon>
                    <span className="text-lg sm:text-xl font-bold">
                        Principais Provedores
                    </span>
                </CardHeader>
                <CardContent>
                    <ul className="flex flex-col gap-3">
                        {(() => {
                            const provedoresArray = Object.values(
                                provedores_views
                            ) as Array<{
                                game_name: string;
                                count: number;
                            }>;
                            const maxCount = provedoresArray.reduce(
                                (currentMax, provider) =>
                                    provider.count > currentMax
                                        ? provider.count
                                        : currentMax,
                                0
                            );
                            return provedoresArray.map((provider) => {
                                const percent =
                                    maxCount > 0
                                        ? (provider.count / maxCount) * 100
                                        : 0;

                                return (
                                    <li
                                        key={provider.game_name}
                                        className="flex flex-col sm:flex-row sm:items-center gap-2 w-full"
                                    >
                                        <span className="text-xs sm:text-sm font-medium min-w-0 shrink-0">
                                            {provider.game_name}
                                        </span>
                                        <div className="flex-1 flex items-center gap-2">
                                            <div className="flex-1 justify-end flex h-2">
                                                <div
                                                    className="h-full rounded-full justify-end bg-primary transition-all duration-300"
                                                    style={{
                                                        width: `${percent}%`,
                                                        minWidth:
                                                            provider.count > 0
                                                                ? "2px"
                                                                : "0px",
                                                    }}
                                                />
                                            </div>
                                            <span className="whitespace-nowrap text-xs text-muted-foreground min-w-[30px] text-right">
                                                {provider.count} visualizações
                                            </span>
                                        </div>
                                    </li>
                                );
                            });
                        })()}
                    </ul>
                </CardContent>
            </Card>
        </main>
    );
}
