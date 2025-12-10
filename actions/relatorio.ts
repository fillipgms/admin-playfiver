"use server";

import axios from "axios";
import { getSession } from "./user";
import { getClientIp } from "@/lib/ip";
import { redirect } from "next/navigation";
import { getFriendlyHttpErrorMessage } from "@/lib/httpError";

interface GetRelatorioParams {
    page?: number;
    users?: string[];
    dateStart?: string;
    dateEnd?: string;
    type?: string[];
}

interface GetGgrRelatorioParams {
    dateStart?: string;
    dateEnd?: string;
}

export async function getRelatorioData(filters: GetRelatorioParams = {}) {
    const session = await getSession();
    const myIp = await getClientIp();

    if (!session) {
        redirect("/login");
    }

    try {
        const params = new URLSearchParams();
        const queryParts: string[] = [];

        if (filters.page) {
            params.set("page", filters.page.toString());
        }

        if (filters.dateStart) {
            params.set("dateStart", filters.dateStart);
        }

        if (filters.dateEnd) {
            params.set("dateEnd", filters.dateEnd);
        }

        // Construir query string base (parâmetros normais)
        const baseQuery = params.toString();
        if (baseQuery) {
            queryParts.push(baseQuery);
        }

        // Adicionar user sem codificação (com colchetes literais)
        if (filters.users && filters.users.length > 0) {
            const userValue = `[${filters.users.join(",")}]`;
            queryParts.push(`user=${userValue}`);
        }

        // Adicionar type sem codificação (com colchetes e aspas literais)
        if (filters.type && filters.type.length > 0) {
            const typeValue = `["${filters.type.join('","')}"]`;
            queryParts.push(`type=${typeValue}`);
        }

        const query = queryParts.join("&");

        const { data } = await axios.get(
            `${process.env.API_ROUTES_BASE}/relatorio${
                query ? `?${query}` : ""
            }`,
            {
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

        return {
            data: data,
            error: null,
        };
    } catch (error) {
        console.error("Failed to fetch relatorio data:", error);
        const err = error as unknown;
        const apiMessage = (err as { response?: { data?: { msg?: string } } })
            ?.response?.data?.msg;

        if (
            axios.isAxiosError(error) &&
            (error.response?.status === 401 || error.response?.status === 403)
        ) {
            redirect("/login");
        }

        return {
            data: null,
            error:
                apiMessage ||
                getFriendlyHttpErrorMessage(
                    error,
                    "Falha ao buscar dados do relatorio"
                ),
        };
    }
}

export async function getGGRRelatorioData(filters: GetGgrRelatorioParams = {}) {
    const session = await getSession();
    const myIp = await getClientIp();

    if (!session) {
        redirect("/login");
    }

    try {
        const params = new URLSearchParams();

        if (filters.dateStart) {
            params.set("dateStart", filters.dateStart);
        }

        if (filters.dateEnd) {
            params.set("dateEnd", filters.dateEnd);
        }

        const query = params.toString();

        const { data } = await axios.get(
            `${process.env.API_ROUTES_BASE}/ggr/relatorio${
                query ? `?${query}` : ""
            }`,
            {
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

        return {
            data: data,
            error: null,
        };
    } catch (error) {
        console.error("Failed to fetch relatorio data:", error);
        const err = error as unknown;
        const apiMessage = (err as { response?: { data?: { msg?: string } } })
            ?.response?.data?.msg;

        if (
            axios.isAxiosError(error) &&
            (error.response?.status === 401 || error.response?.status === 403)
        ) {
            redirect("/login");
        }

        return {
            data: null,
            error:
                apiMessage ||
                getFriendlyHttpErrorMessage(
                    error,
                    "Falha ao buscar dados do relatorio"
                ),
        };
    }
}
