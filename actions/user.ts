"use server";

import axios from "axios";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { getClientIp } from "@/lib/ip";

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

        console.log(data);

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
