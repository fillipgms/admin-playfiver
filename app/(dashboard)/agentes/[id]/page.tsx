import { getAgentTransactions } from "@/actions/agents";
import { TransactionResponse } from "@/interfaces/types";
import AgentTransactionsClient from "./AgentTransactionsClient";
import { Metadata } from "next";

type Props = {
    params: Promise<{ id: string }>;
    searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
};

export const metadata: Metadata = {
    title: "Transações do Agente",
    description: "Visualize e filtre as transações do agente",
};

interface GetAgentTransactionsParams {
    page?: number;
    filter?: string;
    dateStart?: string;
    dateEnd?: string;
    player?: string;
    search?: string;
}

export default async function AgentTransactionsPage({
    params,
    searchParams,
}: Props) {
    const { id } = await params;
    const searchP = await searchParams;

    const getParamValue = (param?: string | string[]) =>
        Array.isArray(param) ? param[0] : param;

    const page = parseInt(getParamValue(searchP.page) || "1", 10);

    const filter = getParamValue(searchP.filter) || undefined;
    const dateStart = getParamValue(searchP.dateStart) || "";
    const dateEnd = getParamValue(searchP.dateEnd) || "";

    const player = getParamValue(searchP.player) || undefined;
    const search = getParamValue(searchP.search) || undefined;

    const transactionData = (await getAgentTransactions(id, {
        page,
        filter,
        dateStart,
        dateEnd,
        player,
        search,
    })) as TransactionResponse;

    const searchParamsRecord = Object.fromEntries(
        Object.entries(searchP).map(([key, value]) => [
            key,
            Array.isArray(value) ? value[0] : value,
        ])
    );

    return (
        <main className="space-y-8">
            <AgentTransactionsClient
                initialData={transactionData}
                agentId={id}
                params={searchParamsRecord}
            />
        </main>
    );
}
