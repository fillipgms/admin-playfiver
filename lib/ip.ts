import { headers } from "next/headers";

export async function getClientIp() {
    const headersList = await headers();

    const xForwardedFor = headersList.get("x-forwarded-for");
    let myIp: string | null = null;

    if (xForwardedFor) {
        const firstIp = xForwardedFor.split(",")[0].trim();
        if (firstIp && firstIp !== "127.0.0.1" && firstIp !== "::1") {
            myIp = firstIp;
        }
    }

    if (!myIp) {
        const xRealIp = headersList.get("x-real-ip");
        if (xRealIp && xRealIp !== "127.0.0.1" && xRealIp !== "::1") {
            myIp = xRealIp;
        }
    }

    if (!myIp) {
        const cfConnectingIp = headersList.get("cf-connecting-ip");
        if (
            cfConnectingIp &&
            cfConnectingIp !== "127.0.0.1" &&
            cfConnectingIp !== "::1"
        ) {
            myIp = cfConnectingIp;
        }
    }

    if (!myIp) {
        const xClientIp = headersList.get("x-client-ip");
        if (xClientIp && xClientIp !== "127.0.0.1" && xClientIp !== "::1") {
            myIp = xClientIp;
        }
    }

    if (!myIp && xForwardedFor) {
        myIp = xForwardedFor.split(",")[0].trim();
    }

    if (process.env.NODE_ENV === "development") {
        myIp = process.env.LOCAL_IP || null;
    }

    console.log("myIp", myIp);

    return myIp;
}
