"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import LogsContent from "./LogsContent";
import AgentsContent from "./AgentsContent";
import GgrContent from "./GgrContent";

interface RelatoriosTabsProps {
    logsData: LogsResponse | null;
    agentsData: RelatorioAgentesResponse | null;
    ggrData: RelatorioGgrResponse | null;
    params: Record<string, string | string[] | undefined>;
}

export default function RelatoriosTabs({
    logsData,
    agentsData,
    ggrData,
    params,
}: RelatoriosTabsProps) {
    const router = useRouter();
    const searchParams = useSearchParams();

    console.log(logsData);

    const getParamValue = (param?: string | string[]) =>
        Array.isArray(param) ? param[0] : param;

    const activeTab = getParamValue(params.tab) || "logs";

    const handleTabChange = (value: string) => {
        const params = new URLSearchParams(searchParams?.toString() || "");
        params.set("tab", value);
        router.replace(`/relatorios?${params.toString()}`);
    };

    if (
        typeof logsData === null ||
        typeof agentsData === null ||
        typeof ggrData === null
    ) {
        return null;
    }

    console.log(logsData?.data[6]);

    return (
        <Tabs
            value={activeTab}
            onValueChange={handleTabChange}
            className="w-full"
        >
            <TabsList className="w-full">
                <TabsTrigger value="logs">Logs</TabsTrigger>
                <TabsTrigger value="agentes">Agentes</TabsTrigger>
                <TabsTrigger value="ggr">GGR</TabsTrigger>
            </TabsList>
            <TabsContent value="logs">
                <LogsContent initialData={logsData} params={params} />
            </TabsContent>
            <TabsContent value="agentes">
                <AgentsContent initialData={agentsData} params={params} />
            </TabsContent>
            <TabsContent value="ggr">
                <GgrContent initialData={ggrData} />
            </TabsContent>
        </Tabs>
    );
}
