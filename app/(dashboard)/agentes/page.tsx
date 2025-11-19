import { Metadata } from "next";
import { getAgentsData } from "@/actions/agents";
import AgentesClient from "./AgentesClient";

export const metadata: Metadata = {
    title: "Agentes",
    description: "Gerenciamento de agentes",
};

type AgentesSearchParams = Record<string, string | string[] | undefined>;

const getParamValue = (value?: string | string[]) =>
    Array.isArray(value) ? value[0] : value;

export default async function AgentesPage({
    searchParams,
}: {
    searchParams: AgentesSearchParams;
}) {
    const page = parseInt(getParamValue(searchParams.page) || "1", 10);
    const search = getParamValue(searchParams.search) || "";
    const user = getParamValue(searchParams.user) || undefined;
    const filter = getParamValue(searchParams.filter) || undefined;

    const response = (await getAgentsData({
        page,
        search,
        user,
        filter,
    })) as AgentResponse & { data: Agent[] | Record<string, Agent> };

    const rawAgents = response.data || [];
    const agentsArray = Array.isArray(rawAgents)
        ? (rawAgents as Agent[])
        : Object.values(rawAgents as Record<string, Agent>);

    const usersOptions = Array.from(
        new Map(
            agentsArray.map((agent) => [
                String(agent.usuario_id),
                agent.usuario_name,
            ])
        ).entries()
    ).map(([value, label]) => ({ value, label }));

    return (
        <main className="space-y-6">
            <AgentesClient
                agents={agentsArray}
                pagination={response}
                usersOptions={usersOptions}
            />
        </main>
    );
}
