"use server";

import axios from "axios";
import { getSession } from "./user";
import { getClientIp } from "@/lib/ip";
import { redirect } from "next/navigation";
import { getFriendlyHttpErrorMessage } from "@/lib/httpError";

interface GetLogsParams {
    page?: number;
    users?: string[];
    agents?: string[];
    dateStart?: string;
    dateEnd?: string;
    gravity?: string[];
    type?: string[];
}

export async function getLogsData(filters: GetLogsParams = {}) {
    const session = await getSession();
    const myIp = await getClientIp();

    if (!session) {
        redirect("/login");
    }

    try {
        const params = new URLSearchParams();

        if (filters.page) {
            params.set("page", filters.page.toString());
        }

        if (filters.users && filters.users.length > 0) {
            const formattedUsers = filters.users.map((u) => `"${u}"`).join(",");
            params.set("user", `[${formattedUsers}]`);
        }

        if (filters.agents && filters.agents.length > 0) {
            const formattedAgents = filters.agents
                .map((a) => `"${a}"`)
                .join(",");
            params.set("agent", `[${formattedAgents}]`);
        }

        if (filters.dateStart) {
            params.set("dateStart", filters.dateStart);
        }

        if (filters.dateEnd) {
            params.set("dateEnd", filters.dateEnd);
        }

        if (filters.gravity && filters.gravity.length > 0) {
            const formattedGravity = filters.gravity
                .map((g) => `"${g}"`)
                .join(",");
            params.set("gravity", `[${formattedGravity}]`);
        }

        if (filters.type && filters.type.length > 0) {
            const formattedType = filters.type.map((t) => `"${t}"`).join(",");
            params.set("type", `[${formattedType}]`);
        }

        const queryString = params
            .toString()
            .replace(/%5B/g, "[")
            .replace(/%5D/g, "]")
            .replace(/%22/g, '"')
            .replace(/%2C/g, ",");

        const { data } = await axios.get(
            `${process.env.API_ROUTES_BASE}/logs${
                queryString ? `?${queryString}` : ""
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

        return data;
    } catch (error) {
        console.error("Failed to fetch custom data:", error);
        const err = error as unknown;
        const apiMessage = (err as { response?: { data?: { msg?: string } } })
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
                    err,
                    "Falha ao buscar dados da customização"
                )
        );
    }
}
