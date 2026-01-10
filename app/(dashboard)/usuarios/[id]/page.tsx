import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Metadata } from "next";
import UserHeader from "./UserHeader";
import Overview from "./Overview";
import Agents from "./Agents";
import Orders from "./Orders";
import Wallets from "./Wallets";
import Ips from "./Ips";
import Related from "./Related";
import Bets from "./Bets";

export const metadata: Metadata = {
    title: "Usuário",
    description: "Visualização de usuário",
};

export default async function UserPage({
    params,
    searchParams,
}: {
    params: Promise<{ id: string }>;
    searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
    const { id } = await params;

    const searchP = await searchParams;

    if (!id) {
        return (
            <main className="min-h-svh flex items-center justify-center">
                <p>Não foi fornecido o ID do usuário para pesquisa</p>
            </main>
        );
    }

    const searchParamsRecord = Object.fromEntries(
        Object.entries(searchP).map(([key, value]) => [
            key,
            Array.isArray(value) ? value[0] : value,
        ])
    );

    return (
        <main className="space-y-6">
            <UserHeader id={id} />

            <Tabs defaultValue="overview" className="w-full">
                <TabsList className="bg-background-primary w-full sm:w-auto">
                    <TabsTrigger value="overview">Visão Geral</TabsTrigger>
                    <TabsTrigger value="agents">Agentes</TabsTrigger>
                    <TabsTrigger value="orders">Pedidos</TabsTrigger>
                    <TabsTrigger value="wallets">Carteiras</TabsTrigger>
                    <TabsTrigger value="ips">Histórico de IPs</TabsTrigger>
                    <TabsTrigger value="related">
                        Usuários Relacionados
                    </TabsTrigger>
                    <TabsTrigger value="bets">Apostas</TabsTrigger>
                </TabsList>

                <TabsContent value="overview" className="mt-6 space-y-6">
                    <Overview id={id} />
                </TabsContent>

                <TabsContent value="agents" className="mt-6 space-y-6">
                    <Agents
                        key={searchParamsRecord.page}
                        id={id}
                        searchParamsRecord={searchParamsRecord}
                    />
                </TabsContent>

                <TabsContent value="orders" className="mt-6">
                    <Orders id={id} />
                </TabsContent>

                <TabsContent value="wallets" className="mt-6">
                    <Wallets id={id} />
                </TabsContent>

                <TabsContent value="ips" className="mt-6">
                    <Ips
                        id={id}
                        key={searchParamsRecord.page}
                        searchParamsRecord={searchParamsRecord}
                    />
                </TabsContent>

                <TabsContent value="related" className="mt-6">
                    <Related
                        id={id}
                        key={searchParamsRecord.page}
                        searchParamsRecord={searchParamsRecord}
                    />
                </TabsContent>

                <TabsContent value="bets" className="mt-6">
                    <Bets
                        id={id}
                        key={searchParamsRecord.page}
                        searchParamsRecord={searchParamsRecord}
                    />
                </TabsContent>
            </Tabs>
        </main>
    );
}
