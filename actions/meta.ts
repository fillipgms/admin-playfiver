"use server";
import { getFriendlyHttpErrorMessage } from "@/lib/httpError";
import axios from "axios";
import { redirect } from "next/navigation";
import { getSession } from "./user";

export async function registerOptions() {
    try {
        const { data } = await axios.get(
            `https://api.testeplayfiver.com/api/auth/meta/register-options`,
            {
                timeout: 30000,
            },
        );

        if (!data) {
            throw new Error("No valid data received from API");
        }

        return data;
    } catch (error) {
        console.error("Failed to fetch agents:", error);
        const apiMessage = (error as { response?: { data?: { msg?: string } } })
            ?.response?.data?.msg;

        throw new Error(
            apiMessage ||
                getFriendlyHttpErrorMessage(error, "Falha ao buscar agentes"),
        );
    }
}
