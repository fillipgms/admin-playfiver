import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

interface SessionPayload {
    accessToken: string;
    tokenType: string;
    expires: string;
}

export function middleware(request: NextRequest) {
    const sessionCookie = request.cookies.get("session")?.value;

    let isLoggedIn = false;

    if (sessionCookie) {
        try {
            const session = JSON.parse(sessionCookie) as SessionPayload;
            const expires = new Date(session.expires);
            isLoggedIn = expires > new Date();
        } catch {
            isLoggedIn = false;
        }
    }

    const isLoginRoute = request.nextUrl.pathname === "/login";

    if (isLoggedIn && isLoginRoute) {
        return NextResponse.redirect(new URL("/", request.url));
    }

    if (!isLoggedIn && !isLoginRoute) {
        return NextResponse.redirect(new URL("/login", request.url));
    }

    return NextResponse.next();
}

export const config = {
    matcher: ["/((?!api|_next/static|_next/image|favicon.ico).*)"],
};
