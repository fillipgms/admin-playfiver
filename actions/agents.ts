"use server";
import axios from "axios";
import { redirect } from "next/navigation";
import { getSession } from "./user";
import { getFriendlyHttpErrorMessage } from "@/lib/httpError";
import { getClientIp } from "@/lib/ip";

interface GetAgentsParams {
    page?: number;
    search?: string;
    user?: string;
    filter?: string;
}

export async function getAgentsData(params: GetAgentsParams = {}) {
    const session = await getSession();
    const myIp = await getClientIp();

    if (!session) {
        redirect("/login");
    }

    try {
        const page = params.page || 1;
        const search = params.search || "";
        const user = params.user;
        const filter = params.filter;

        const query = new URLSearchParams();
        query.set("page", page.toString());

        if (search) {
            query.set("search", search);
        }

        if (user) {
            query.set("user", user);
        }

        if (filter) {
            query.set("filter", filter);
        }

        const { data } = await axios.get(
            `${process.env.API_ROUTES_BASE}/agentes?${query.toString()}`,
            {
                timeout: 10000,
                headers: {
                    Accept: "application/json",
                    Authorization: `Bearer ${session.accessToken}`,
                    myip: myIp,
                },
            }
        );

        if (!data) {
            throw new Error("No valid data received from API");
        }

        return data;
    } catch (error) {
        console.error("Failed to fetch agents:", error);
        const apiMessage = (error as { response?: { data?: { msg?: string } } })
            ?.response?.data?.msg;

        if (
            axios.isAxiosError(error) &&
            (error.response?.status === 401 || error.response?.status === 403)
        ) {
            redirect("/login");
        }

        throw new Error(
            apiMessage ||
                getFriendlyHttpErrorMessage(error, "Falha ao buscar agentes")
        );
    }
}

export interface UpdateAgentPayload {
    id_agente: number;
    agent_memo?: string;
    password?: string;
    rtp?: string | number;
    rtp_user?: string | number;
    url?: string;
    limit_enable?: number | boolean;
    limite_amount?: string;
    limit_hours?: string | number;
    influencers?: number;
    hide?: number | boolean;
}

export async function updateAgent(agentData: UpdateAgentPayload) {
    const session = await getSession();
    const myIp = await getClientIp();

    if (!session) {
        redirect("/login");
    }

    try {
        const payload: any = {
            ...agentData,
        };

        if (typeof payload.limit_enable === "boolean") {
            payload.limit_enable = payload.limit_enable ? 1 : 0;
        }
        if (typeof payload.hide === "boolean") {
            payload.hide = payload.hide ? 1 : 0;
        }

        console.log(payload);

        const { data } = await axios.put(
            `${process.env.API_ROUTES_BASE}/agentes`,
            payload,
            {
                timeout: 10000,
                headers: {
                    Accept: "application/json",
                    Authorization: `Bearer ${session.accessToken}`,
                    myip: myIp,
                },
            }
        );

        if (!data) {
            throw new Error("No valid data received from API");
        }

        return { success: true, data };
    } catch (error) {
        console.error("Failed to update agent:", error);
        const apiMessage = (error as { response?: { data?: { msg?: string } } })
            ?.response?.data?.msg;

        if (
            axios.isAxiosError(error) &&
            (error.response?.status === 401 || error.response?.status === 403)
        ) {
            redirect("/login");
        }

        let errorMessage = "Falha ao atualizar o agente";

        if (apiMessage) {
            errorMessage = apiMessage;
        } else {
            errorMessage = getFriendlyHttpErrorMessage(
                error,
                "Falha ao atualizar o agente"
            );
        }

        return {
            success: false,
            error: errorMessage,
        };
    }
}

interface GetAgentTransactionsParams {
    page?: number;
    filter?: string;
    dateStart?: string;
    dateEnd?: string;
    player?: string | string[];
    search?: string;
}

export async function getAgentTransactions(
    agentId: string,
    params: GetAgentTransactionsParams = {}
) {
    const session = await getSession();
    const myIp = await getClientIp();

    if (!session) {
        redirect("/login");
    }

    try {
        const page = params.page || 1;
        const filter = params.filter;
        const dateStart = params.dateStart;
        const dateEnd = params.dateEnd;
        const player = params.player;
        const search = params.search;

        const query = new URLSearchParams();
        query.set("page", page.toString());

        if (filter) {
            query.set("filter", filter);
        }

        if (dateStart) {
            query.set("dateStart", dateStart);
        }

        if (dateEnd) {
            query.set("dateEnd", dateEnd);
        }

        if (player) {
            if (Array.isArray(player)) {
                if (player.length > 0) {
                    query.set("player", `[${player.join(",")}]`);
                }
            } else {
                query.set("player", player);
            }
        }

        if (search) {
            query.set("search", search);
        }

        const queryString = query.toString();
        const url = `${
            process.env.API_ROUTES_BASE
        }/agentes/transactions/${agentId}${
            queryString ? `?${queryString}` : ""
        }`;

        const { data } = await axios.get(url, {
            timeout: 10000,
            headers: {
                Accept: "application/json",
                Authorization: `Bearer ${session.accessToken}`,
                myip: myIp,
            },
        });

        if (!data) {
            throw new Error("No valid data received from API");
        }

        return data;
    } catch (error) {
        console.error("Failed to fetch agent transactions:", error);
        const apiMessage = (error as { response?: { data?: { msg?: string } } })
            ?.response?.data?.msg;

        if (
            axios.isAxiosError(error) &&
            (error.response?.status === 401 || error.response?.status === 403)
        ) {
            redirect("/login");
        }

        throw new Error(
            apiMessage ||
                getFriendlyHttpErrorMessage(
                    error,
                    "Falha ao buscar transações do agente"
                )
        );
    }
}
