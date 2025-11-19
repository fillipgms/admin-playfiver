import { Card, CardContent, CardHeader } from "@/components/Card";
import { WalletIcon } from "@phosphor-icons/react/dist/ssr";
import Icon from "@/components/Icon";
import { getGGRRelatorioData } from "@/actions/relatorio";

export default async function GgrContent() {
    const { data, error } = await getGGRRelatorioData();
    if (error) {
        return <div>{error}</div>;
    }
    const ggrData = data.data as RelatorioGgrProps[];

    return (
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4 sm:gap-6 lg:gap-8">
            {ggrData.map((ggr, index) => (
                <Card key={index}>
                    <CardHeader>
                        <div className="flex items-center gap-2">
                            <Icon>
                                <WalletIcon />
                            </Icon>
                            <div className="flex flex-col">
                                <h3 className="font-bold text-base">
                                    {ggr.walletName}
                                </h3>
                            </div>
                        </div>
                    </CardHeader>

                    <CardContent className="space-y-4">
                        <div className="grid grid-cols-1 gap-4">
                            <div className="space-y-2">
                                <span className="text-xs text-foreground/50 font-medium">
                                    Apostas
                                </span>
                                <p className="text-lg font-semibold text-destructive">
                                    R$ {ggr.bet}
                                </p>
                            </div>

                            <div className="space-y-2">
                                <span className="text-xs text-foreground/50 font-medium">
                                    Ganhos
                                </span>
                                <p className="text-lg font-semibold text-green-600 dark:text-green-400">
                                    R$ {ggr.win}
                                </p>
                            </div>

                            <div className="border-t border-foreground/10 pt-4 space-y-2">
                                <span className="text-xs text-foreground/50 font-medium">
                                    GGR Consumido
                                </span>
                                <p className="text-xl font-bold text-primary">
                                    R$ {ggr.ggrConsumido}
                                </p>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            ))}
        </div>
    );
}
