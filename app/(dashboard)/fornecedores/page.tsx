import { Metadata } from "next";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import DistribuidoresClient from "./DistribuidoresClient";
import ProvedoresClient from "./ProvedoresClient";
import { getProvidersData } from "@/actions/providers";
import { getDistributorsData } from "@/actions/distribuidores";

export const metadata: Metadata = {
    title: "Fornecedores",
    description: "Gerenciamento de distribuidores e provedores",
};

export default async function FornecedoresPage() {
    const distribuidoresData = await getDistributorsData();
    const provedoresData = await getProvidersData();

    return (
        <main className="space-y-8">
            <div>
                <h1 className="text-2xl font-bold mb-2">Fornecedores</h1>
                <p className="text-foreground/60">
                    Gerencie distribuidores e provedores do sistema
                </p>
            </div>

            <Tabs defaultValue="distribuidores" className="w-full">
                <TabsList>
                    <TabsTrigger value="distribuidores">
                        Distribuidores
                    </TabsTrigger>
                    <TabsTrigger value="provedores">Provedores</TabsTrigger>
                </TabsList>

                <TabsContent value="distribuidores" className="mt-6">
                    <DistribuidoresClient distribuidores={distribuidoresData} />
                </TabsContent>

                <TabsContent value="provedores" className="mt-6">
                    <ProvedoresClient provedores={provedoresData.data} />
                </TabsContent>
            </Tabs>
        </main>
    );
}
