"use server";
import axios from "axios";
import { redirect } from "next/navigation";
import { getSession } from "./user";
import { getFriendlyHttpErrorMessage } from "@/lib/httpError";
import { getClientIp } from "@/lib/ip";

interface GetSignaturesParams {
    page?: number;
    users?: string[];
    filter?: string;
}

export async function getSignaturesData({
    page = 1,
    users = [],
    filter,
}: GetSignaturesParams = {}) {
    const session = await getSession();
    const myIp = await getClientIp();

    if (!session) {
        redirect("/login");
    }

    try {
        const params = new URLSearchParams();
        params.set("page", page.toString());

        if (users.length > 0) {
            params.set("user", `[${users.join(",")}]`);
        }

        if (filter) {
            params.set("filter", filter);
        }

        const { data } = await axios.get(
            `${process.env.API_ROUTES_BASE}/signatures?${params.toString()}`,
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
        console.error("Failed to fetch signatures:", error);
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
                    "Falha ao buscar assinaturas"
                )
        );
    }
}
