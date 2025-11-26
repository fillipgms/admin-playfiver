"use client";

import React, { useState } from "react";
import DistribuidorCard from "./DistribuidorCard";
import { editDistributorData } from "@/actions/distribuidores";
import { usePermissions } from "@/hooks/usePermissions";
import { Card } from "@/components/Card";
import { WarningCircleIcon } from "@phosphor-icons/react";

interface DistribuidoresClientProps {
    distribuidores: DistribuidorProps[];
}

const DistribuidoresClient = ({
    distribuidores,
}: DistribuidoresClientProps) => {
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState<string | null>(null);
    const [loadingId, setLoadingId] = useState<number | null>(null);
    const { hasPermission, loading } = usePermissions();

    const canViewDistributors = hasPermission("distributor_view");
    const canEditDistributors = hasPermission("distributor_edit");

    if (loading) return null;

    if (!canViewDistributors) {
        return (
            <Card className="p-8 flex items-center justify-center min-h-[200px]">
                <div className="text-center space-y-3">
                    <WarningCircleIcon className="w-10 h-10 text-destructive mx-auto" />
                    <div>
                        <h3 className="text-lg font-semibold">Acesso Negado</h3>
                        <p className="text-sm text-muted-foreground">Você não tem permissão para visualizar distribuidores.</p>
                    </div>
                </div>
            </Card>
        );
    }

    const handleStatusChange = async (id: number, status: number) => {
        setLoadingId(id);
        setError(null);
        setSuccess(null);
        const distribuidor = distribuidores.find((d) => d.id === id);
        if (!distribuidor) return;

        // Prepare payload: all values as string, update status
        const payload: Record<string, string> = {};
        Object.entries({ ...distribuidor, status }).forEach(([key, value]) => {
            payload[key] =
                value !== undefined && value !== null ? String(value) : "";
        });

        try {
            await editDistributorData(payload);
            setSuccess("Status atualizado com sucesso!");
        } catch (err: any) {
            setError(err?.message || "Erro ao atualizar distribuidor");
        } finally {
            setLoadingId(null);
        }
    };

    const handleEdit = async (payload: Record<string, string>) => {
        setLoadingId(Number(payload.id));
        setError(null);
        setSuccess(null);
        try {
            await editDistributorData(payload);
            setSuccess("Distribuidor atualizado com sucesso!");
        } catch (err: any) {
            setError(err?.message || "Erro ao atualizar distribuidor");
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
                {distribuidores.map((distribuidor) => (
                    <DistribuidorCard
                        key={distribuidor.id}
                        distribuidor={distribuidor}
                        onStatusChange={handleStatusChange}
                        loading={loadingId === distribuidor.id}
                        onEdit={handleEdit}
                        canEdit={canEditDistributors}
                    />
                ))}
            </div>
        </>
    );
};

export default DistribuidoresClient;
