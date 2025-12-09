"use server";
import axios from "axios";
import { redirect } from "next/navigation";
import { getSession } from "./user";
import { getFriendlyHttpErrorMessage } from "@/lib/httpError";
import { unstable_cache } from "next/cache";
import { getClientIp } from "@/lib/ip";

const fetchHomeDataCached = unstable_cache(
    async (accessToken: string, myIp: string) => {
        const { data } = await axios.get(
            `${process.env.API_ROUTES_BASE}/home`,
            {
                timeout: 5000,
                headers: {
                    Accept: "application/json",
                    Authorization: `Bearer ${accessToken}`,
                    myip: myIp,
                },
            }
        );
        if (!data) throw new Error("No valid data received from API");
        return data;
    },
    ["home-data"],
    { revalidate: 60 }
);

export async function getHomeData() {
    const session = await getSession();
    const myIp = await getClientIp();

    if (!session) {
        redirect("/login");
    }

    try {
        return await fetchHomeDataCached(session.accessToken, myIp || "");
    } catch (error) {
        console.error("Failed to fetch home data:", error);
        const err = error as unknown;
        const apiMessage = (err as { response?: { data?: { msg?: string } } })
            ?.response?.data?.msg;

        // Check if it's an auth error and redirect
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
                    "Falha ao buscar dados da home"
                )
        );
    }
}
