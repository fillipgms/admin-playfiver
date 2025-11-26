"use client";

import { useRouter } from "next/navigation";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import DistribuidoresClient from "./DistribuidoresClient";
import ProvedoresClient from "./ProvedoresClient";

interface FornecedoresTabsWrapperProps {
    activeTab: string;
    distribuidoresData: any;
    provedoresData: any;
    searchParams: Record<string, string | string[] | undefined>;
}

export default function FornecedoresTabsWrapper({
    activeTab,
    distribuidoresData,
    provedoresData,
    searchParams,
}: FornecedoresTabsWrapperProps) {
    const router = useRouter();

    const handleTabChange = (value: string) => {
        const params = new URLSearchParams();
        params.set("tab", value);

        // Reset page and search when changing tabs
        params.set("page", "1");

        router.replace(`/fornecedores?${params.toString()}`);
    };

    return (
        <Tabs
            value={activeTab}
            onValueChange={handleTabChange}
            className="w-full"
        >
            <TabsList>
                <TabsTrigger value="distribuidores">Distribuidores</TabsTrigger>
                <TabsTrigger value="provedores">Provedores</TabsTrigger>
            </TabsList>

            <TabsContent value="distribuidores" className="mt-6">
                <DistribuidoresClient distribuidores={distribuidoresData} />
            </TabsContent>

            <TabsContent value="provedores" className="mt-6">
                <ProvedoresClient
                    paginationData={provedoresData}
                    provedores={provedoresData.data}
                    searchParams={searchParams}
                />
            </TabsContent>
        </Tabs>
    );
}
