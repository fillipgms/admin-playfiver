"use client";

import React from "react";
import ProvedorCard from "./ProvedorCard";

interface ProvedoresClientProps {
    provedores: ProvedorProps[];
}

const ProvedoresClient = ({ provedores }: ProvedoresClientProps) => {
    const handleStatusChange = (id: number, status: number) => {
        // TODO: Implementar chamada à API
        console.log("Alterar status provedor:", { id, status });
    };

    return (
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4 sm:gap-6 lg:gap-8">
            {provedores.map((provedor) => (
                <ProvedorCard
                    key={provedor.id}
                    provedor={provedor}
                    onStatusChange={handleStatusChange}
                />
            ))}
        </div>
    );
};

export default ProvedoresClient;
