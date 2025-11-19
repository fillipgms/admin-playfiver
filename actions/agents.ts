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
                timeout: 5000,
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
