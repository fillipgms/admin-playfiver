"use client";

import React, { useMemo, useState } from "react";
import Wallet from "@/components/Wallet";
import { usePermissions } from "@/hooks/usePermissions";
import { useRouter, useSearchParams } from "next/navigation";
import { toast } from "sonner";
import { createGGR, deleteGGR, editGGR } from "@/actions/ggr";
import PaginationControls from "@/components/PaginationControls";

interface WalletGgrProps {
    id: number;
    tax: number;
    above: string;
    wallet: string;
    revendedor: number;
}

interface PaginationMeta {
    current_page: number;
    last_page: number;
    next_page_url: string | null;
    prev_page_url: string | null;
}

const WalletsClient = ({
    wallets,
    ggrData,
    pagination,
    queryKeys,
}: {
    wallets: AdminWalletProps[];
    ggrData: WalletGgrProps[];
    pagination: PaginationMeta;
    queryKeys: {
        page: string;
    };
}) => {
    const { loading, hasPermission } = usePermissions();
    const router = useRouter();
    const searchParams = useSearchParams();
    const [isSubmitting, setIsSubmitting] = useState(false);

    const searchParamsRecord = useMemo(() => {
        const record: Record<string, string> = {};
        searchParams.forEach((value, key) => {
            record[key] = value;
        });
        return record;
    }, [searchParams]);

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
                    : "Ocorreu um erro ao criar a regra de GGR.",
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
                    : "Ocorreu um erro ao deletar a regra de GGR.",
            );
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleGgredited = async (ggrData: {
        id: string;
        tax: string;
        above: string;
        revendedor: string;
        type: string;
    }) => {
        setIsSubmitting(true);
        try {
            await editGGR(ggrData);
            toast.success("Regra de GGR editada com sucesso!");
            router.refresh();
        } catch (error) {
            toast.error(
                error instanceof Error
                    ? error.message
                    : "Ocorreu um erro ao editar a regra de GGR.",
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
                        onGgrEdited={handleGgredited}
                        isSubmitting={isSubmitting}
                    />
                ))}
            </div>
            <div className="px-2 sm:px-4 lg:px-0">
                <PaginationControls
                    baseUrl="/pacotes"
                    currentPage={pagination.current_page}
                    lastPage={pagination.last_page}
                    hasNextPage={!!pagination.next_page_url}
                    hasPrevPage={!!pagination.prev_page_url}
                    searchParams={searchParamsRecord}
                    paramKey={queryKeys.page}
                />
            </div>
        </section>
    );
};

export default WalletsClient;
