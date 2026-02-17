"use server";
import axios from "axios";
import { redirect } from "next/navigation";
import { getSession } from "./user";
import { getFriendlyHttpErrorMessage } from "@/lib/httpError";
import { getClientIp } from "@/lib/ip";

interface GetUsersParams {
    page?: number;
    search?: string;
    role?: string;
    filter?: string;
}

export async function getUsersData({
    page = 1,
    search = "",
    role,
    filter,
}: GetUsersParams = {}) {
    const session = await getSession();
    const myIp = await getClientIp();

    if (!session) {
        redirect("/login");
    }

    try {
        const params = new URLSearchParams();
        params.set("page", page.toString());

        if (search) {
            params.set("search", search);
        }

        if (role) {
            params.set("role", role);
        }

        if (filter) {
            params.set("filter", filter);
        }

        const { data } = await axios.get(
            `${process.env.API_ROUTES_BASE}/user?${params.toString()}`,
            {
                timeout: 10000,
                headers: {
                    Accept: "application/json",
                    Authorization: `Bearer ${session.accessToken}`,
                    myip: myIp,
                },
            },
        );

        if (!data) {
            throw new Error("No valid data received from API");
        }

        return data;
    } catch (error) {
        console.error("Failed to fetch players:", error);
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
                getFriendlyHttpErrorMessage(error, "Falha ao buscar jogadores"),
        );
    }
}

export async function updatePlayer(params: {
    id: number;
    rtp?: string;
    influencer?: number;
}) {
    const session = await getSession();
    const myIp = await getClientIp();

    if (!session) {
        redirect("/login");
    }

    try {
        const payload: { id: number; rtp?: string; influencer?: number } = {
            id: params.id,
        };

        if (typeof params.rtp !== "undefined") payload.rtp = params.rtp;
        if (typeof params.influencer !== "undefined")
            payload.influencer = params.influencer;

        const { data } = await axios.put(
            `${process.env.API_ROUTES_BASE}/player`,
            payload,
            {
                timeout: 10000,
                headers: {
                    Accept: "application/json",
                    Authorization: `Bearer ${session.accessToken}`,
                    myip: myIp,
                },
            },
        );

        return {
            success: true,
            message:
                (data && (data.msg || data.message)) ||
                "Jogador atualizado com sucesso",
            data,
        } as const;
    } catch (error) {
        console.error("Failed to update player:", error);
        const err = error as {
            response?: {
                status?: number;
                data?: { msg?: string; message?: string };
            };
        };
        const apiMessage =
            err?.response?.data?.msg || err?.response?.data?.message;

        if (
            axios.isAxiosError(error) &&
            (error.response?.status === 401 || error.response?.status === 403)
        ) {
            redirect("/login");
        }

        return {
            success: false,
            status: err?.response?.status,
            message:
                apiMessage ||
                getFriendlyHttpErrorMessage(
                    error,
                    "Falha ao atualizar jogador",
                ),
        } as const;
    }
}

export async function getSpecificUserInfos(id: string) {
    const session = await getSession();
    const myIp = await getClientIp();

    if (!session) {
        redirect("/login");
    }

    if (!id) {
        throw new Error("id incorreto");
    }

    try {
        const { data } = await axios.get(
            `${process.env.API_ROUTES_BASE}/user/details/infos/${id}`,
            {
                timeout: 10000,
                headers: {
                    Accept: "application/json",
                    Authorization: `Bearer ${session.accessToken}`,
                    myip: myIp,
                },
            },
        );

        if (!data) {
            throw new Error("No valid data received from API");
        }

        return data;
    } catch (error) {
        console.error("Failed to fetch user:", error);
        const apiMessage = (error as { response?: { data?: { msg?: string } } })
            ?.response?.data?.msg;

        if (
            axios.isAxiosError(error) &&
            (error.response?.status === 401 || error.response?.status === 403)
        ) {
            redirect("/login");
        }

        return {
            data: null,
            error:
                apiMessage ||
                getFriendlyHttpErrorMessage(error, "Falha ao buscar jogadores"),
        };
    }
}

export async function getSpecificUserOverview(id: string) {
    const session = await getSession();
    const myIp = await getClientIp();

    if (!session) {
        redirect("/login");
    }

    if (!id) {
        throw new Error("id incorreto");
    }

    try {
        const { data } = await axios.get(
            `${process.env.API_ROUTES_BASE}/user/details/overview/${id}`,
            {
                timeout: 10000,
                headers: {
                    Accept: "application/json",
                    Authorization: `Bearer ${session.accessToken}`,
                    myip: myIp,
                },
            },
        );

        if (!data) {
            throw new Error("No valid data received from API");
        }

        return data;
    } catch (error) {
        console.error("Failed to fetch user:", error);
        const apiMessage = (error as { response?: { data?: { msg?: string } } })
            ?.response?.data?.msg;

        if (
            axios.isAxiosError(error) &&
            (error.response?.status === 401 || error.response?.status === 403)
        ) {
            redirect("/login");
        }

        return {
            data: null,
            error:
                apiMessage ||
                getFriendlyHttpErrorMessage(error, "Falha ao buscar jogadores"),
        };
    }
}

export async function getSpecificUserAgents(id: string, page = 1) {
    const session = await getSession();
    const myIp = await getClientIp();

    if (!session) {
        redirect("/login");
    }

    if (!id) {
        throw new Error("id incorreto");
    }

    try {
        const { data } = await axios.get(
            `${process.env.API_ROUTES_BASE}/user/details/agentes/${id}?page=${page}`,
            {
                timeout: 10000,
                headers: {
                    Accept: "application/json",
                    Authorization: `Bearer ${session.accessToken}`,
                    myip: myIp,
                },
            },
        );

        if (!data) {
            throw new Error("No valid data received from API");
        }

        return data;
    } catch (error) {
        console.error("Failed to fetch user:", error);
        const apiMessage = (error as { response?: { data?: { msg?: string } } })
            ?.response?.data?.msg;

        if (
            axios.isAxiosError(error) &&
            (error.response?.status === 401 || error.response?.status === 403)
        ) {
            redirect("/login");
        }

        return {
            data: null,
            error:
                apiMessage ||
                getFriendlyHttpErrorMessage(error, "Falha ao buscar jogadores"),
        };
    }
}

export async function getSpecificUserOrders(id: string) {
    const session = await getSession();
    const myIp = await getClientIp();

    if (!session) {
        redirect("/login");
    }

    if (!id) {
        throw new Error("id incorreto");
    }

    try {
        const { data } = await axios.get(
            `${process.env.API_ROUTES_BASE}/user/details/orders/${id}`,
            {
                timeout: 10000,
                headers: {
                    Accept: "application/json",
                    Authorization: `Bearer ${session.accessToken}`,
                    myip: myIp,
                },
            },
        );

        if (!data) {
            throw new Error("No valid data received from API");
        }

        console.log(data);

        return data;
    } catch (error) {
        console.error("Failed to fetch user:", error);
        const apiMessage = (error as { response?: { data?: { msg?: string } } })
            ?.response?.data?.msg;

        if (
            axios.isAxiosError(error) &&
            (error.response?.status === 401 || error.response?.status === 403)
        ) {
            redirect("/login");
        }

        return {
            data: null,
            error:
                apiMessage ||
                getFriendlyHttpErrorMessage(error, "Falha ao buscar jogadores"),
        };
    }
}

export async function getSpecificUserWallets(id: string) {
    const session = await getSession();
    const myIp = await getClientIp();

    if (!session) {
        redirect("/login");
    }

    if (!id) {
        throw new Error("id incorreto");
    }

    try {
        const { data } = await axios.get(
            `${process.env.API_ROUTES_BASE}/user/details/wallets/${id}`,
            {
                timeout: 10000,
                headers: {
                    Accept: "application/json",
                    Authorization: `Bearer ${session.accessToken}`,
                    myip: myIp,
                },
            },
        );

        if (!data) {
            throw new Error("No valid data received from API");
        }

        return data;
    } catch (error) {
        console.error("Failed to fetch user:", error);
        const apiMessage = (error as { response?: { data?: { msg?: string } } })
            ?.response?.data?.msg;

        if (
            axios.isAxiosError(error) &&
            (error.response?.status === 401 || error.response?.status === 403)
        ) {
            redirect("/login");
        }

        return {
            data: null,
            error:
                apiMessage ||
                getFriendlyHttpErrorMessage(error, "Falha ao buscar jogadores"),
        };
    }
}

export async function getSpecificUserIps(id: string, page = 1) {
    const session = await getSession();
    const myIp = await getClientIp();

    if (!session) {
        redirect("/login");
    }

    if (!id) {
        throw new Error("id incorreto");
    }

    try {
        const { data } = await axios.get(
            `${process.env.API_ROUTES_BASE}/user/details/ips/${id}?page=${page}`,
            {
                timeout: 10000,
                headers: {
                    Accept: "application/json",
                    Authorization: `Bearer ${session.accessToken}`,
                    myip: myIp,
                },
            },
        );

        if (!data) {
            throw new Error("No valid data received from API");
        }

        return data;
    } catch (error) {
        console.error("Failed to fetch user:", error);
        const apiMessage = (error as { response?: { data?: { msg?: string } } })
            ?.response?.data?.msg;

        if (
            axios.isAxiosError(error) &&
            (error.response?.status === 401 || error.response?.status === 403)
        ) {
            redirect("/login");
        }

        return {
            data: null,
            error:
                apiMessage ||
                getFriendlyHttpErrorMessage(error, "Falha ao buscar jogadores"),
        };
    }
}

export async function getSpecificUserUsers(id: string, page = 1) {
    const session = await getSession();
    const myIp = await getClientIp();

    if (!session) {
        redirect("/login");
    }

    if (!id) {
        throw new Error("id incorreto");
    }

    try {
        const { data } = await axios.get(
            `${process.env.API_ROUTES_BASE}/user/details/users/${id}?page=${page}`,
            {
                timeout: 10000,
                headers: {
                    Accept: "application/json",
                    Authorization: `Bearer ${session.accessToken}`,
                    myip: myIp,
                },
            },
        );

        if (!data) {
            throw new Error("No valid data received from API");
        }

        return data;
    } catch (error) {
        console.error("Failed to fetch user:", error);
        const apiMessage = (error as { response?: { data?: { msg?: string } } })
            ?.response?.data?.msg;

        if (
            axios.isAxiosError(error) &&
            (error.response?.status === 401 || error.response?.status === 403)
        ) {
            redirect("/login");
        }

        return {
            data: null,
            error:
                apiMessage ||
                getFriendlyHttpErrorMessage(error, "Falha ao buscar jogadores"),
        };
    }
}

export async function getSpecificUserBets(
    id: string,
    page = 1,
    filter?: string,
    dateStart?: string,
    dateEnd?: string,
    search?: string,
) {
    const session = await getSession();
    const myIp = await getClientIp();

    if (!session) {
        redirect("/login");
    }

    if (!id) {
        throw new Error("id incorreto");
    }

    try {
        const query = new URLSearchParams();
        query.set("page", page.toString());

        if (filter) {
            query.set("filter", filter);
        }

        if (dateStart) {
            query.set("dateStart", dateStart);
        }

        if (dateEnd) {
            query.set("dateEnd", dateEnd);
        }

        if (search) {
            query.set("search", search);
        }

        const queryString = query.toString();
        const url = `${process.env.API_ROUTES_BASE}/user/details/bets/${id}?${queryString}`;

        const { data } = await axios.get(url, {
            timeout: 10000,
            headers: {
                Accept: "application/json",
                Authorization: `Bearer ${session.accessToken}`,
                myip: myIp,
            },
        });

        if (!data) {
            throw new Error("No valid data received from API");
        }

        return data;
    } catch (error) {
        console.error("Failed to fetch user:", error);
        const apiMessage = (error as { response?: { data?: { msg?: string } } })
            ?.response?.data?.msg;

        if (
            axios.isAxiosError(error) &&
            (error.response?.status === 401 || error.response?.status === 403)
        ) {
            redirect("/login");
        }

        return {
            data: null,
            error:
                apiMessage ||
                getFriendlyHttpErrorMessage(error, "Falha ao buscar jogadores"),
        };
    }
}
