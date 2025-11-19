import axios from "axios";
import { redirect } from "next/navigation";

export async function redirectOnAuthError(error: unknown) {
    if (axios.isAxiosError(error)) {
        const status = error.response?.status;
        if (status === 401 || status === 403) {
            // Just redirect to login - the middleware will handle invalid sessions
            redirect("/login");
        }
    }
}

export function getFriendlyHttpErrorMessage(error: unknown, context?: string) {
    const prefix = context ? `${context}: ` : "";

    if (axios.isAxiosError(error)) {
        const status = error.response?.status;
        const apiMessage = error.response?.data?.message;
        const base = apiMessage || error.message;

        if (status === 401) {
            return `${prefix}Não autorizado. Faça login novamente.`;
        }
        if (status === 403) {
            return `${prefix}Acesso negado. Você não tem permissão para essa ação.`;
        }
        if (status === 404) {
            return `${prefix}Recurso não encontrado.`;
        }
        if (status === 422) {
            return `${prefix}Dados inválidos. Verifique os campos e tente novamente.`;
        }
        if (status === 429) {
            return `${prefix}Muitas tentativas. Aguarde alguns minutos e tente novamente.`;
        }
        if (status && status >= 500) {
            return `${prefix}Erro no servidor. Por favor, tente novamente mais tarde.`;
        }

        if (error.code === "ECONNABORTED") {
            return `${prefix}Tempo de requisição esgotado. Tente novamente.`;
        }
        if (error.request && !error.response) {
            return `${prefix}Sem resposta do servidor. Verifique sua conexão.`;
        }

        return `${prefix}${base || "Erro na requisição."}`;
    }

    return `${prefix}Erro inesperado. Por favor, tente novamente.`;
}
