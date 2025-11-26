"use client";

import React from "react";
import ProvedorCard from "./ProvedorCard";
import { usePermissions } from "@/hooks/usePermissions";
import { Card } from "@/components/Card";
import { WarningCircleIcon } from "@phosphor-icons/react";

interface ProvedoresClientProps {
    provedores: ProvedorProps[];
}

import { editProviderData } from "@/actions/providers";

const ProvedoresClient = ({ provedores }: ProvedoresClientProps) => {
    const [error, setError] = React.useState<string | null>(null);
    const [success, setSuccess] = React.useState<string | null>(null);
    const [loadingId, setLoadingId] = React.useState<number | null>(null);
    const { hasPermission, loading } = usePermissions();

    const canViewProviders = hasPermission("provider_view");
    const canEditProviders = hasPermission("provider_edit");

    if (loading) return null;

    if (!canViewProviders) {
        return (
            <Card className="p-8 flex items-center justify-center min-h-[200px]">
                <div className="text-center space-y-3">
                    <WarningCircleIcon className="w-10 h-10 text-destructive mx-auto" />
                    <div>
                        <h3 className="text-lg font-semibold">Acesso Negado</h3>
                        <p className="text-sm text-muted-foreground">Você não tem permissão para visualizar provedores.</p>
                    </div>
                </div>
            </Card>
        );
    }

    const handleStatusChange = async (id: number, status: number) => {
        setLoadingId(id);
        setError(null);
        setSuccess(null);
        const provedor = provedores.find((p) => p.id === id);
        if (!provedor) return;

        // Prepare payload: all values as string, update status
        const payload: Record<string, string> = {
            id: String(provedor.id),
            name: provedor.name,
            image_url: provedor.image_url,
            status: String(status),
            provedor: String(provedor.id),
            distribuidor: "",
            game_code: "",
        };

        try {
            await editProviderData(payload);
            setSuccess("Status atualizado com sucesso!");
        } catch (err: any) {
            setError(err?.message || "Erro ao atualizar provedor");
        } finally {
            setLoadingId(null);
        }
    };

    const handleEdit = async (payload: Record<string, string>) => {
        setLoadingId(Number(payload.id));
        setError(null);
        setSuccess(null);
        try {
            await editProviderData(payload);
            setSuccess("Provedor atualizado com sucesso!");
        } catch (err: any) {
            setError(err?.message || "Erro ao atualizar provedor");
            throw err;
        } finally {
            setLoadingId(null);
        }
    };

    return (
        <>
            {(success || error) && (
                <div className="mb-4">
                    {success && (
                        <span className="text-emerald-600 dark:text-emerald-400">
                            {success}
                        </span>
                    )}
                    {error && <span className="text-red-500">{error}</span>}
                </div>
            )}
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4 sm:gap-6 lg:gap-8">
                {provedores.map((provedor) => (
                    <ProvedorCard
                        key={provedor.id}
                        provedor={provedor}
                        onStatusChange={handleStatusChange}
                        loading={loadingId === provedor.id}
                        onEdit={handleEdit}
                        canEdit={canEditProviders}
                    />
                ))}
            </div>
        </>
    );
};

export default ProvedoresClient;
