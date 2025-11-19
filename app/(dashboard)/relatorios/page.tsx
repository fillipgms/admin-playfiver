import { Metadata } from "next";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import LogsClient from "./LogsClient";
import LogsContent from "./LogsContent";
import AgentesContent from "./AgentesContent";
import GgrContent from "./GgrContent";
import {
    GGR_QUERY_KEYS,
    LOGS_QUERY_KEYS,
    RELATORIO_QUERY_KEYS,
} from "./queryKeys";

export const metadata: Metadata = {
    title: "Relatórios",
    description: "Relatórios de logs, agentes e GGR",
};

type RelatoriosSearchParams = Record<
    string,
    string | string[] | undefined
>;

export default function RelatoriosPage({
    searchParams,
}: {
    searchParams: RelatoriosSearchParams;
}) {
    return (
        <main className="space-y-8">
            <div>
                <h1 className="mb-2 text-2xl font-bold">Relatórios</h1>
                <p className="text-foreground/60">
                    Visualize relatórios de logs, agentes e GGR
                </p>
            </div>

            <Tabs defaultValue="logs" className="w-full">
                <TabsList>
                    <TabsTrigger value="logs">Logs de Erros</TabsTrigger>
                    <TabsTrigger value="agentes">
                        Relatório de Agentes
                    </TabsTrigger>
                    <TabsTrigger value="ggr">Relatório de GGR</TabsTrigger>
                </TabsList>

                <TabsContent value="logs" className="mt-6 space-y-6">
                    <LogsClient queryKeys={LOGS_QUERY_KEYS} />
                    <LogsContent
                        searchParams={searchParams}
                        queryKeys={LOGS_QUERY_KEYS}
                    />
                </TabsContent>

                <TabsContent value="agentes" className="mt-6 space-y-6">
                    <AgentesContent
                        searchParams={searchParams}
                        queryKeys={RELATORIO_QUERY_KEYS}
                    />
                </TabsContent>

                <TabsContent value="ggr" className="mt-6 space-y-6">
                    <GgrContent
                        searchParams={searchParams}
                        queryKeys={GGR_QUERY_KEYS}
                    />
                </TabsContent>
            </Tabs>
        </main>
    );
}
