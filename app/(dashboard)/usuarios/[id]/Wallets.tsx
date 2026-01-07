import { getSpecificUserWallets } from "@/actions/users";
import { Card, CardContent, CardHeader } from "@/components/Card";
import Icon from "@/components/Icon";
import { WalletIcon } from "@phosphor-icons/react/dist/ssr";
import React from "react";

const Wallets = async ({ id }: { id: string }) => {
    const data = (await getSpecificUserWallets(id)) as UserWalletResponse;

    if (!data || data.status !== 1) return <div>error</div>;

    const wallets = data.data;

    const walletsWithBalance = wallets.filter(
        (wallet) => parseFloat(wallet.saldo) > 0
    );

    function formatCurrency(value: number | string | null) {
        const num = Number(value) || 0;
        return new Intl.NumberFormat("pt-BR", {
            style: "currency",
            currency: "BRL",
        }).format(num);
    }

    return (
        <Card>
            <CardHeader>
                <div className="flex items-center w-full justify-between pb-4 border-b border-foreground/20">
                    <h2 className="font-semibold text-lg">Carteiras</h2>
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
                                        {formatCurrency(wallet.saldo)}
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
    );
};

export default Wallets;
