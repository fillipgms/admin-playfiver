"use server";

import { getFriendlyHttpErrorMessage } from "@/lib/httpError";
import axios from "axios";
import { redirect } from "next/navigation";
import { getSession } from "./user";

const BASE_URL = process.env.API_ROUTES_BASE;

export async function getTickets(
    user_id?: string,
    created_user_id?: string,
    resolved?: string,
    category?: string,
) {
    const session = await getSession();

    if (!session) {
        redirect("/login");
    }

    try {
        const params = new URLSearchParams();

        if (user_id) {
            params.set("user_id", user_id);
        }

        if (created_user_id) {
            params.set("created_user_id", created_user_id);
        }

        if (resolved) {
            params.set("resolved", resolved);
        }

        if (category) {
            params.set("category", category);
        }

        const paramsString = params.toString();

        const { data } = await axios.get(`${BASE_URL}/ticket?${paramsString}`, {
            timeout: 30000,
            headers: {
                Accept: "application/json",
                Authorization: `Bearer ${session.accessToken}`,
            },
        });

        if (!data) {
            throw new Error("No valid data received from API");
        }

        return data;
    } catch (error: unknown) {
        if (error) {
            const apiMessage = (
                error as { response?: { data?: { msg?: string } } }
            )?.response?.data?.msg;

            // Check if it's an auth error and redirect
            if (
                axios.isAxiosError(error) &&
                (error.response?.status === 401 ||
                    error.response?.status === 403)
            ) {
                redirect("/login");
            }

            let errorMessage = "Falha ao criar agente";

            if (apiMessage) {
                if (
                    apiMessage.toLowerCase().includes("duplicate") ||
                    apiMessage.toLowerCase().includes("already exists") ||
                    apiMessage.toLowerCase().includes("já existe") ||
                    apiMessage.toLowerCase().includes("agent_code")
                ) {
                    errorMessage = "Este código de agente já existe";
                } else if (
                    apiMessage.toLowerCase().includes("invalid") ||
                    apiMessage.toLowerCase().includes("inválido")
                ) {
                    errorMessage = "Dados inválidos fornecidos";
                } else {
                    errorMessage = apiMessage;
                }
            } else {
                errorMessage = getFriendlyHttpErrorMessage(
                    error,
                    "Falha ao criar agente",
                );
            }

            return {
                success: false,
                error: errorMessage,
            };
        }
    }
}

export async function resolveTicket(id: number, resolved: 1 | 2) {
    const session = await getSession();

    if (!session) {
        redirect("/login");
    }

    try {
        const { data } = await axios.put(
            `${BASE_URL}/ticket/resolved`,
            { id, resolved, message: null },
            {
                timeout: 30000,
                headers: {
                    Accept: "application/json",
                    Authorization: `Bearer ${session.accessToken}`,
                },
            },
        );

        if (!data) {
            throw new Error("No valid data received from API");
        }

        return data;
    } catch (error: unknown) {
        if (
            axios.isAxiosError(error) &&
            (error.response?.status === 401 || error.response?.status === 403)
        ) {
            redirect("/login");
        }
        return {
            success: false,
            error: getFriendlyHttpErrorMessage(
                error,
                "Falha ao resolver ticket",
            ),
        };
    }
}

export async function checkTicket(id: number, checked: 0 | 1 | 2 | 3) {
    const session = await getSession();

    if (!session) {
        redirect("/login");
    }

    try {
        const { data } = await axios.put(
            `${BASE_URL}/ticket/checked`,
            { id, checked, message: null },
            {
                timeout: 30000,
                headers: {
                    Accept: "application/json",
                    Authorization: `Bearer ${session.accessToken}`,
                },
            },
        );

        if (!data) {
            throw new Error("No valid data received from API");
        }

        return data;
    } catch (error: unknown) {
        if (
            axios.isAxiosError(error) &&
            (error.response?.status === 401 || error.response?.status === 403)
        ) {
            redirect("/login");
        }
        return {
            success: false,
            error: getFriendlyHttpErrorMessage(
                error,
                "Falha ao atualizar ticket",
            ),
        };
    }
}

export async function deleteTicket(id: string) {
    const session = await getSession();

    if (!session) {
        redirect("/login");
    }

    try {
        console.log("isDeleting");

        const { data } = await axios.delete(`${BASE_URL}/ticket/${id}`, {
            timeout: 30000,
            headers: {
                Accept: "application/json",
                Authorization: `Bearer ${session.accessToken}`,
            },
        });

        if (!data) {
            throw new Error("No valid data received from API");
        }

        return data;
    } catch (error: unknown) {
        if (
            axios.isAxiosError(error) &&
            (error.response?.status === 401 || error.response?.status === 403)
        ) {
            redirect("/login");
        }
        return {
            success: false,
            error: getFriendlyHttpErrorMessage(
                error,
                "Falha ao deletar ticket",
            ),
        };
    }
}

export async function updateTicket(formData: {
    id: number;
    user_id: number;
    created_user_id: number;
    category: "ALL" | "BUG" | "UPDATE" | "INTERNAL";
    subject: string;
    contact: string;
    details: string;
}) {
    const session = await getSession();

    if (!session) {
        redirect("/login");
    }

    try {
        const { data } = await axios.put(`${BASE_URL}/ticket`, formData, {
            timeout: 30000,
            headers: {
                Accept: "application/json",
                Authorization: `Bearer ${session.accessToken}`,
            },
        });

        if (!data) {
            throw new Error("No valid data received from API");
        }

        return data;
    } catch (error: unknown) {
        if (
            axios.isAxiosError(error) &&
            (error.response?.status === 401 || error.response?.status === 403)
        ) {
            redirect("/login");
        }
        return {
            success: false,
            error: getFriendlyHttpErrorMessage(error, "Falha ao editar ticket"),
        };
    }
}

export async function createTicket(formData: {
    user_id: string;
    category: "ALL" | "BUG" | "UPDATE" | "INTERNAL";
    subject: string;
    contact: string;
    details: string;
}) {
    const session = await getSession();

    if (!session) {
        redirect("/login");
    }

    try {
        const { data } = await axios.post(`${BASE_URL}/ticket`, formData, {
            timeout: 30000,
            headers: {
                Accept: "application/json",
                Authorization: `Bearer ${session.accessToken}`,
            },
        });

        if (!data) {
            throw new Error("No valid data received from API");
        }

        return data;
    } catch (error: unknown) {
        if (error) {
            console.error("Failed to create agent:", error);

            const apiMessage = (
                error as { response?: { data?: { msg?: string } } }
            )?.response?.data?.msg;

            // Check if it's an auth error and redirect
            if (
                axios.isAxiosError(error) &&
                (error.response?.status === 401 ||
                    error.response?.status === 403)
            ) {
                redirect("/login");
            }

            let errorMessage = "Falha ao criar agente";

            if (apiMessage) {
                if (
                    apiMessage.toLowerCase().includes("duplicate") ||
                    apiMessage.toLowerCase().includes("already exists") ||
                    apiMessage.toLowerCase().includes("já existe") ||
                    apiMessage.toLowerCase().includes("agent_code")
                ) {
                    errorMessage = "Este código de agente já existe";
                } else if (
                    apiMessage.toLowerCase().includes("invalid") ||
                    apiMessage.toLowerCase().includes("inválido")
                ) {
                    errorMessage = "Dados inválidos fornecidos";
                } else {
                    errorMessage = apiMessage;
                }
            } else {
                errorMessage = getFriendlyHttpErrorMessage(
                    error,
                    "Falha ao criar agente",
                );
            }

            return {
                success: false,
                error: errorMessage,
            };
        }
    }
}
