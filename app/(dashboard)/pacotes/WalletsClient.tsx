"use client";

import React, { useState } from "react";
import Wallet from "@/components/Wallet";
import { usePermissions } from "@/hooks/usePermissions";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { createGGR, deleteGGR } from "@/actions/ggr";

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
    const router = useRouter();
    const [isSubmitting, setIsSubmitting] = useState(false);

    const canViewWallets = hasPermission(["wallet_view", "ggr_view"], {
        any: true,
    });

    if (loading) {
        return null;
    }

    if (!canViewWallets) {
        return null;
    }

    const handleGgrAdded = async (ggrData: {
        above: string;
        revendedor: string;
        tax: string;
        type: string;
    }) => {
        setIsSubmitting(true);
        try {
            await createGGR(ggrData);
            toast.success("Regra de GGR criada com sucesso!");
            router.refresh();
        } catch (error) {
            toast.error(
                error instanceof Error
                    ? error.message
                    : "Ocorreu um erro ao criar a regra de GGR."
            );
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleGgrDeleted = async (id: number) => {
        setIsSubmitting(true);
        try {
            await deleteGGR(String(id));
            toast.success("Regra de GGR deletada com sucesso!");
            router.refresh();
        } catch (error) {
            toast.error(
                error instanceof Error
                    ? error.message
                    : "Ocorreu um erro ao deletar a regra de GGR."
            );
        } finally {
            setIsSubmitting(false);
        }
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
                        isSubmitting={isSubmitting}
                    />
                ))}
            </div>
        </section>
    );
};

export default WalletsClient;
