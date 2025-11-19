import "server-only";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";

interface SessionPayload {
    accessToken: string;
    tokenType: string;
    expires: string;
}

const cookie = {
    name: "session",
    options: {
        httpOnly: true,
        secure: process.env.NODE_ENV !== "development",
        sameSite: "lax" as const,
        path: "/",
    },
};

export async function createSession(
    accessToken: string,
    tokenType: string,
    expiresIn: number
) {
    const expires = new Date(Date.now() + expiresIn * 1000);
    const session = {
        accessToken,
        tokenType,
        expires: expires.toISOString(),
    };

    (await cookies()).set(cookie.name, JSON.stringify(session), {
        ...cookie.options,
        expires,
    });
}

export async function verifySession() {
    const cookie = (await cookies()).get("session")?.value;
    if (!cookie) {
        redirect("/login");
    }

    try {
        const session = JSON.parse(cookie) as SessionPayload;
        const expires = new Date(session.expires);

        if (expires < new Date()) {
            redirect("/login");
        }

        return session;
    } catch (error) {
        console.error(error);
        redirect("/login");
    }
}

export async function deleteSession() {
    const cookieStore = await cookies();
    cookieStore.delete("session");
    redirect("/login");
}

export async function clearSession() {
    const cookieStore = await cookies();
    cookieStore.delete("session");
}
