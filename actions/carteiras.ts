"use server";
import axios from "axios";
import { redirect } from "next/navigation";
import { getSession } from "./user";
import { getFriendlyHttpErrorMessage } from "@/lib/httpError";
import { getClientIp } from "@/lib/ip";

export async function getWalletsData(page: number = 1) {
    const session = await getSession();
    const myIp = await getClientIp();

    if (!session) {
        redirect("/login");
    }

    try {
        const { data } = await axios.get(
            `${process.env.API_ROUTES_BASE}/wallet?page=${page}`,
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
        console.error("Failed to fetch wallets:", error);
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
                getFriendlyHttpErrorMessage(error, "Falha ao buscar carteiras")
        );
    }
}

export async function getAllWalletsData() {
    const session = await getSession();
    const myIp = await getClientIp();

    if (!session) {
        redirect("/login");
    }

    try {
        let allWallets: WalletProps[] = [];
        let currentPage = 1;
        let hasMore = true;

        while (hasMore) {
            const { data } = await axios.get(
                `${process.env.API_ROUTES_BASE}/wallet?page=${currentPage}`,
                {
                    timeout: 10000,
                    headers: {
                        Accept: "application/json",
                        Authorization: `Bearer ${session.accessToken}`,
                        myip: myIp,
                    },
                }
            );

            if (!data || !data.data) {
                throw new Error("No valid data received from API");
            }

            allWallets = [...allWallets, ...data.data.data];
            hasMore = !!data.next_page_url;
            currentPage++;
        }

        return {
            data: allWallets,
            total: allWallets.length,
            current_page: 1,
            last_page: 1,
            per_page: allWallets.length,
            from: 1,
            to: allWallets.length,
            next_page_url: null,
            prev_page_url: null,
        };
    } catch (error) {
        console.error("Failed to fetch all wallets:", error);
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
                    "Falha ao buscar todas as carteiras"
                )
        );
    }
}

export async function getWalletGGr(id: number) {
    const session = await getSession();
    const myIp = await getClientIp();

    if (!session) {
        redirect("/login");
    }

    try {
        const { data } = await axios.get(
            `${process.env.API_ROUTES_BASE}/ggr?type=${id}`,
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
        console.error("Failed to fetch GGR:", error);
        const apiMessage = (error as { response?: { data?: { msg?: string } } })
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
                getFriendlyHttpErrorMessage(error, "Falha ao buscar GGR")
        );
    }
}
