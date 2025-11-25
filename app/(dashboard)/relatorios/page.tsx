import { Metadata } from "next";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import LogsContent from "./LogsContent";
import AgentsContent from "./AgentsContent";
import GgrContent from "./GgrContent";
import { getLogsData } from "@/actions/logs";
import { getRelatorioData, getGGRRelatorioData } from "@/actions/relatorio";

export const metadata: Metadata = {
    title: "Relatórios",
    description: "Relatórios de logs, agentes e GGR",
};

type RelatoriosSearchParams = Promise<
    Record<string, string | string[] | undefined>
>;

export default async function RelatoriosPage({
    searchParams,
}: {
    searchParams: RelatoriosSearchParams;
}) {
    const params = await searchParams;

    const getParamValue = (param?: string | string[]) =>
        Array.isArray(param) ? param[0] : param;

    const activeTab = getParamValue(params.tab) || "logs";

    // Fetch logs data
    const page = parseInt(getParamValue(params.page) || "1", 10);
    const logsData = await getLogsData({
        page,
        users: getParamValue(params.user)
            ? [getParamValue(params.user)!]
            : undefined,
        agents: getParamValue(params.agent)
            ? [getParamValue(params.agent)!]
            : undefined,
        dateStart: getParamValue(params.dateStart),
        dateEnd: getParamValue(params.dateEnd),
        gravity: getParamValue(params.gravity)
            ? [getParamValue(params.gravity)!]
            : undefined,
        type: getParamValue(params.type)
            ? [getParamValue(params.type)!]
            : undefined,
    });

    // Fetch agents report data
    const agentsDataResult = await getRelatorioData({
        page: 1,
    });

    // Fetch GGR report data
    const ggrDataResult = await getGGRRelatorioData({});

    return (
        <main className="space-y-8">
            <div>
                <h1 className="mb-2 text-2xl font-bold">Relatórios</h1>
                <p className="text-foreground/60">
                    Visualize relatórios de logs, agentes e GGR
                </p>
            </div>

            <Tabs defaultValue={activeTab} className="w-full">
                <TabsList className="w-full">
                    <TabsTrigger value="logs">Logs</TabsTrigger>
                    <TabsTrigger value="agentes">Agentes</TabsTrigger>
                    <TabsTrigger value="ggr">GGR</TabsTrigger>
                </TabsList>
                <TabsContent value="logs">
                    <LogsContent
                        initialData={logsData as LogsResponse}
                        params={params}
                    />
                </TabsContent>
                <TabsContent value="agentes">
                    <AgentsContent initialData={agentsDataResult.data} />
                </TabsContent>
                <TabsContent value="ggr">
                    <GgrContent initialData={ggrDataResult.data} />
                </TabsContent>
            </Tabs>
        </main>
    );
}
