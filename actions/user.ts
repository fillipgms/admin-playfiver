"use server";

import axios from "axios";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { getClientIp } from "@/lib/ip";
import { getFriendlyHttpErrorMessage } from "@/lib/httpError";

export async function getUser() {
    const cookie = (await cookies()).get("session")?.value;
    const myIp = await getClientIp();

    if (!cookie) {
        return null;
    }

    try {
        const session = JSON.parse(cookie) as SessionPayload;

        const { data } = await axios.get(
            `${process.env.API_ROUTES_BASE}/auth/me`,
            {
                headers: {
                    Authorization: `Bearer ${session.accessToken}`,
                    myip: myIp,
                },
            }
        );

        return data as User;
    } catch (error) {
        if (axios.isAxiosError(error)) {
            if (error.response?.status === 401) {
                await clearExpiredSession();
                throw new Error(
                    "Sessão expirada. Por favor, faça login novamente."
                );
            }
        }

        console.error("Failed to get user:", error);

        return null;
    }
}

export async function getSession() {
    const cookie = (await cookies()).get("session")?.value;
    if (!cookie) {
        return null;
    }

    try {
        const session = JSON.parse(cookie) as SessionPayload;

        const expires = new Date(session.expires);
        if (expires < new Date()) {
            await clearExpiredSession();
            return null;
        }

        return session;
    } catch (error: unknown) {
        console.error("Failed to get session:", error);
        await clearExpiredSession();
        return null;
    }
}

export async function clearExpiredSession() {
    "use server";
    const cookieStore = await cookies();
    cookieStore.delete("session");
}

export async function clearSessionAndRedirect() {
    "use server";
    const cookieStore = await cookies();
    cookieStore.delete("session");
    redirect("/login");
}

export async function createUser({
    email,
    name,
    password,
}: {
    email: string;
    name: string;
    password: string;
}) {
    const session = await getSession();
    const myIp = await getClientIp();

    if (!session) {
        redirect("/login");
    }

    try {
        const { data } = await axios.post(
            `${process.env.API_ROUTES_BASE}/user`,
            { email, name, password },
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
        console.error("Failed to create new user :", error);
        const apiMessage = (error as { response?: { data?: { msg?: string } } })
            ?.response?.data?.msg;

        if (
            axios.isAxiosError(error) &&
            (error.response?.status === 401 || error.response?.status === 403)
        ) {
            redirect("/login");
        }

        let errorMessage = "Falha ao criar esse usuário";

        if (apiMessage) {
            if (
                apiMessage.toLowerCase().includes("duplicate") ||
                apiMessage.toLowerCase().includes("already exists") ||
                apiMessage.toLowerCase().includes("já existe")
            ) {
                errorMessage = "Este endereço usuário já existe na whitelist";
            } else if (
                apiMessage.toLowerCase().includes("invalid") ||
                apiMessage.toLowerCase().includes("inválido")
            ) {
                errorMessage = "Usuário inválido";
            } else {
                errorMessage = apiMessage;
            }
        } else {
            errorMessage = getFriendlyHttpErrorMessage(
                error,
                "Falha ao criar essa usuário de IP"
            );
        }

        return {
            success: false,
            error: errorMessage,
        };
    }
}

interface UpdateUserPayload {
    id_user: number;
    name: string;
    email: string;
    password?: string;
    saldo?: number;
    ban?: number;
    role?: any[];
    motived_ban?: string;
    permissions?: string[];
    wallets: UserWalletProps[];
}

export async function updateUser(userData: UpdateUserPayload) {
    const session = await getSession();
    const myIp = await getClientIp();

    if (!session) {
        redirect("/login");
    }

    try {
        const payload = {
            ...userData,
        };

        if (!payload.password) {
            delete payload.password;
        }

        const { data } = await axios.put(
            `${process.env.API_ROUTES_BASE}/user`,
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

        console.log(payload);

        if (!data) {
            throw new Error("No valid data received from API");
        }

        return { success: true, data };
    } catch (error) {
        console.error("Failed to Update user :", error);
        const apiMessage = (error as { response?: { data?: { msg?: string } } })
            ?.response?.data?.msg;

        if (
            axios.isAxiosError(error) &&
            (error.response?.status === 401 || error.response?.status === 403)
        ) {
            redirect("/login");
        }

        let errorMessage = "Falha ao atualizar esse usuário";

        if (apiMessage) {
            if (
                apiMessage.toLowerCase().includes("duplicate") ||
                apiMessage.toLowerCase().includes("already exists") ||
                apiMessage.toLowerCase().includes("já existe")
            ) {
                errorMessage = "Este endereço usuário já existe na whitelist";
            } else if (
                apiMessage.toLowerCase().includes("invalid") ||
                apiMessage.toLowerCase().includes("inválido")
            ) {
                errorMessage = "Usuário inválido";
            } else {
                errorMessage = apiMessage;
            }
        } else {
            errorMessage = getFriendlyHttpErrorMessage(
                error,
                "Falha ao criar essa usuário de IP"
            );
        }

        return {
            success: false,
            error: errorMessage,
        };
    }
}

export async function updateUserLimits(userId: number, limitsData: any) {
    const session = await getSession();
    const myIp = await getClientIp();

    if (!session) {
        redirect("/login");
    }

    try {
        const payload = {
            id_user: userId,
            ...limitsData,
        };

        const { data } = await axios.put(
            `${process.env.API_ROUTES_BASE}/user/limits`,
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

        return { success: true, data };
    } catch (error) {
        console.error("Failed to update user limits:", error);
        const apiMessage = (error as { response?: { data?: { msg?: string } } })
            ?.response?.data?.msg;

        if (
            axios.isAxiosError(error) &&
            (error.response?.status === 401 || error.response?.status === 403)
        ) {
            redirect("/login");
        }

        return {
            success: false,
            error: apiMessage || "Falha ao atualizar os limites do usuário",
        };
    }
}

export async function deleteUserLimits(userId: number) {
    const session = await getSession();
    const myIp = await getClientIp();

    if (!session) {
        redirect("/login");
    }

    try {
        const { data } = await axios.delete(
            `${process.env.API_ROUTES_BASE}/user/limits/${userId}`,
            {
                timeout: 10000,
                headers: {
                    Accept: "application/json",
                    Authorization: `Bearer ${session.accessToken}`,
                    myip: myIp,
                },
            }
        );

        return { success: true, data };
    } catch (error) {
        console.error("Failed to delete user limits:", error);
        const apiMessage = (error as { response?: { data?: { msg?: string } } })
            ?.response?.data?.msg;

        if (
            axios.isAxiosError(error) &&
            (error.response?.status === 401 || error.response?.status === 403)
        ) {
            redirect("/login");
        }

        return {
            success: false,
            error: apiMessage || "Falha ao deletar os limites do usuário",
        };
    }
}

export async function deleteUser(userId: number) {
    const session = await getSession();
    const myIp = await getClientIp();

    if (!session) {
        redirect("/login");
    }

    try {
        const { data } = await axios.delete(
            `${process.env.API_ROUTES_BASE}/user/${userId}`,
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
        console.error("Failed to delete user :", error);
        const apiMessage = (error as { response?: { data?: { msg?: string } } })
            ?.response?.data?.msg;

        if (
            axios.isAxiosError(error) &&
            (error.response?.status === 401 || error.response?.status === 403)
        ) {
            redirect("/login");
        }

        let errorMessage = "Falha ao deletar esse usuário";

        errorMessage = getFriendlyHttpErrorMessage(
            error,
            "Falha ao deletar essa usuário "
        );

        return {
            success: false,
            error: errorMessage,
        };
    }
}

export async function searchUser(query: string) {
    const session = await getSession();
    const myIp = await getClientIp();

    if (!session) {
        redirect("/login");
    }
    try {
        const { data } = await axios.get(
            `${process.env.API_ROUTES_BASE}/users?search=${encodeURIComponent(
                query
            )}`,
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
        console.error("Failed to search user :", error);
        const apiMessage = (error as { response?: { data?: { msg?: string } } })
            ?.response?.data?.msg;
        if (
            axios.isAxiosError(error) &&
            (error.response?.status === 401 || error.response?.status === 403)
        ) {
            redirect("/login");
        }

        let errorMessage = "Falha ao buscar esse usuário";

        errorMessage = getFriendlyHttpErrorMessage(
            error,
            "Falha ao buscar esse usuário"
        );

        return {
            success: false,
            error: errorMessage,
        };
    }
}
