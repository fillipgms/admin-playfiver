"use server";

import { redirect } from "next/navigation";
import { getSession } from "./user";
import axios from "axios";
import { getClientIp } from "@/lib/ip";

export async function getPermissions() {
    const session = await getSession();
    const myIp = await getClientIp();
    if (!session) {
        redirect("/login");
    }
    try {
        const { data } = await axios.get(
            `${process.env.API_ROUTES_BASE}/permission`,
            {
                timeout: 5000,
                headers: {
                    Authorization: `Bearer ${session.accessToken}`,
                    myip: myIp,
                    Accept: "application/json",
                },
            }
        );
        return data;
    } catch (error) {
        console.error("Failed to get permissions:", error);
        const apiMessage = (error as { response?: { data?: { msg?: string } } })
            ?.response?.data?.msg;
        if (
            axios.isAxiosError(error) &&
            (error.response?.status === 401 || error.response?.status === 403)
        ) {
            redirect("/login");
        }
        throw new Error(apiMessage || "Falha ao buscar permissões");
    }
}
