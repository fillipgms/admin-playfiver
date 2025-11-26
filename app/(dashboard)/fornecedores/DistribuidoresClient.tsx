"use client";

import React, { useState } from "react";
import DistribuidorCard from "./DistribuidorCard";
import { editDistributorData } from "@/actions/distribuidores";

interface DistribuidoresClientProps {
    distribuidores: DistribuidorProps[];
}

const DistribuidoresClient = ({
    distribuidores,
}: DistribuidoresClientProps) => {
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState<string | null>(null);
    const [loadingId, setLoadingId] = useState<number | null>(null);

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
                    />
                ))}
            </div>
        </>
    );
};

export default DistribuidoresClient;
