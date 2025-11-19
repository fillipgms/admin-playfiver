"use server";

import { loginSchema } from "@/schemas";
import axios from "axios";
import { createSession, deleteSession } from "./session";
import { getSession } from "@/actions/user";
import { getClientIp } from "./ip";

export async function signIn(formData: FormData) {
    const validationResult = loginSchema.safeParse({
        email: formData.get("email"),
        password: formData.get("password"),
    });

    const myIp = await getClientIp();

    if (!validationResult.success) {
        return {
            success: false,
            message: "Por favor, corrija os erros abaixo:",
            errors: validationResult.error.flatten().fieldErrors,
        };
    }

    const { email, password } = validationResult.data;

    try {
        const response = await axios.post(
            `${process.env.API_ROUTES_BASE}/auth/login`,
            { email, password },
            {
                timeout: 5000,
                headers: {
                    Accept: "application/json",
                    myip: myIp,
                },
            }
        );

        if (response.status === 200 && response.data.access_token) {
            const { access_token, token_type, expires_in } = response.data;
            await createSession(access_token, token_type, expires_in);
            return {
                success: true,
                message: "Login realizado com sucesso.",
            };
        }

        return {
            success: false,
            message: "Resposta inesperada do servidor.",
        };
    } catch (error) {
        const apiMessage = (error as { response?: { data?: { msg?: string } } })
            ?.response?.data?.msg;
        if (axios.isAxiosError(error) && error.response?.status === 422) {
            const responseData = error.response.data;
            return {
                success: false,
                message: "Email ou senha inválidos.",
                errors: {
                    email: [responseData.messages?.email || "Email inválido."],
                    password: [
                        responseData.messages?.password || "Senha inválida.",
                    ],
                },
            };
        }

        return {
            success: false,
            message:
                apiMessage ||
                "Ocorreu um erro inesperado. Por favor, tente novamente.",
        };
    }
}

export async function logout(): Promise<{
    success: boolean;
    message?: string;
}> {
    try {
        const session = await getSession();
        const myIp = await getClientIp();

        if (!session?.accessToken) {
            await deleteSession();
            return {
                success: true,
                message: "No active session found. Cleared local session.",
            };
        }

        const response = await axios.post(
            `${process.env.API_ROUTES_BASE}/auth/logout`,
            {},
            {
                headers: {
                    Authorization: `Bearer ${session.accessToken}`,
                    "Content-Type": "application/json",
                    myip: myIp,
                },
            }
        );

        if (response.status === 200) {
            await deleteSession();
            return {
                success: true,
                message: "Logout successful",
            };
        }

        return {
            success: false,
            message: "Unexpected response from server",
        };
    } catch (error) {
        console.error("Error in logout:", error);
        if (axios.isAxiosError(error)) {
            if (error.response?.status === 401) {
                await deleteSession();
                return {
                    success: true,
                    message: "Session expired. Cleared local session.",
                };
            }

            return {
                success: false,
                message:
                    error.response?.data?.message ||
                    "Failed to logout from server",
            };
        }

        const apiMessage = (error as { response?: { data?: { msg?: string } } })
            ?.response?.data?.msg;
        return {
            success: false,
            message: apiMessage || "An unexpected error occurred during logout",
        };
    }
}
