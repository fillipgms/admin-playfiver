"use client";

import React from "react";
import DistribuidorCard from "./DistribuidorCard";

interface DistribuidoresClientProps {
    distribuidores: DistribuidorProps[];
}

const DistribuidoresClient = ({
    distribuidores,
}: DistribuidoresClientProps) => {
    const handleStatusChange = (id: number, status: number) => {
        // TODO: Implementar chamada à API
        console.log("Alterar status distribuidor:", { id, status });
    };

    return (
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4 sm:gap-6 lg:gap-8">
            {distribuidores.map((distribuidor) => (
                <DistribuidorCard
                    key={distribuidor.id}
                    distribuidor={distribuidor}
                    onStatusChange={handleStatusChange}
                />
            ))}
        </div>
    );
};

export default DistribuidoresClient;
