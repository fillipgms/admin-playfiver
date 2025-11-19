"use client";

import React from "react";
import Wallet from "@/components/Wallet";
import { usePermissions } from "@/hooks/usePermissions";

interface WalletGgrProps {
    id: number;
    tax: number;
    above: string;
    wallet: string;
    revendedor: number;
}

const WalletsClient = ({
    wallets,
    ggrData,
}: {
    wallets: AdminWalletProps[];
    ggrData: WalletGgrProps[];
}) => {
    const { loading, hasPermission } = usePermissions();
    const canViewWallets = hasPermission(["wallet_view", "ggr_view"], {
        any: true,
    });

    if (loading) {
        return null;
    }

    if (!canViewWallets) {
        return null;
    }

    const handleGgrAdded = () => {
        // TODO: Recarregar dados após adicionar GGR
        console.log("GGR adicionado, recarregar dados");
    };

    const handleGgrDeleted = (id: number) => {
        // TODO: Recarregar dados após deletar GGR
        console.log("GGR deletado:", id);
    };

    return (
        <section className="space-y-4">
            <div className="flex items-center justify-between">
                <h2 className="text-2xl font-bold">Carteiras</h2>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4 sm:gap-6 lg:gap-8 px-2 sm:px-4 lg:px-0">
                {wallets.map((wallet) => (
                    <Wallet
                        key={wallet.id}
                        wallet={wallet}
                        ggrData={ggrData}
                        onGgrAdded={handleGgrAdded}
                        onGgrDeleted={handleGgrDeleted}
                    />
                ))}
            </div>
        </section>
    );
};

export default WalletsClient;
