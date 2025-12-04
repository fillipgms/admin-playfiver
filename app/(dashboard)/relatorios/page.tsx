import { Metadata } from "next";
import RelatoriosTabs from "./RelatoriosTabs";
import { getLogsData } from "@/actions/logs";
import { getRelatorioData } from "@/actions/relatorio";

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

    const parseArrayParam = (param?: string | string[]): string[] => {
        const value = getParamValue(param);
        if (!value) return [];
        try {
            return JSON.parse(value);
        } catch {
            return [];
        }
    };

    const activeTab = getParamValue(params.tab) || "logs";
    const page = parseInt(getParamValue(params.page) || "1", 10);

    let logsData = null;
    let agentsDataResult = null;
    // GGR data is now fetched client-side for better performance
    const ggrDataResult = null;

    if (activeTab === "logs") {
        logsData = await getLogsData({
            page,
            users: parseArrayParam(params.user),
            agents: parseArrayParam(params.agent),
            dateStart: getParamValue(params.dateStart),
            dateEnd: getParamValue(params.dateEnd),
            gravity: parseArrayParam(params.gravity),
            type: parseArrayParam(params.type),
        });
    } else if (activeTab === "agentes") {
        agentsDataResult = await getRelatorioData({
            page,
            users: parseArrayParam(params.user),
            dateStart: getParamValue(params.dateStart),
            dateEnd: getParamValue(params.dateEnd),
            type: getParamValue(params.type),
        });
    }


    
    return (
        <main className="space-y-8">
            <div>
                <h1 className="mb-2 text-2xl font-bold">Relatórios</h1>
                <p className="text-foreground/60">
                    Visualize relatórios de logs, agentes e GGR
                </p>
            </div>

            <RelatoriosTabs
                logsData={logsData as LogsResponse}
                agentsData={agentsDataResult?.data}
                ggrData={null}
                params={params}
            />
        </main>
    );
}
