import "./globals.css";
import localFont from "next/font/local";

import { Metadata, Viewport } from "next";
import { SessionProvider } from "@/contexts/SessionContext";
import { Toaster } from "@/components/ui/sonner";
import "dotenv/config";

const selawik = localFont({
    src: [
        { path: "../public/font/selawkl.woff", weight: "300", style: "normal" },
        { path: "../public/font/selawk.woff", weight: "350", style: "normal" },
        {
            path: "../public/font/selawksb.woff",
            weight: "600",
            style: "normal",
        },
        { path: "../public/font/selawkb.woff", weight: "700", style: "normal" },
    ],
    display: "swap",
});

export const metadata: Metadata = {
    title: {
        default: "Playfiver",
        template: "%s | Playfiver",
    },
    description:
        "Dashboard do sistema Playfiver - gerencie tudo em um só lugar.",
    applicationName: "Playfiver",
    keywords: [
        "Playfiver",
        "dashboard",
        "painel",
        "gestão",
        "administração",
        "sistema",
    ],
    authors: [{ name: "Playfiver Team", url: "https://playfiver.app/" }],
    creator: "Playfiver",
    publisher: "Playfiver",
    metadataBase: new URL("https://playfiver.app/"),
    alternates: {
        canonical: "/",
        languages: {
            "pt-BR": "/pt-BR",
        },
    },
    openGraph: {
        title: "Playfiver",
        description:
            "Dashboard do sistema Playfiver - gerencie tudo em um só lugar.",
        type: "website",
        locale: "pt_BR",
        url: "https://playfiver.app/",
        siteName: "Playfiver",
        images: [
            {
                url: "/logo.png",
                width: 512,
                height: 512,
                alt: "Playfiver logo",
            },
        ],
    },
    icons: {
        icon: "/favicon.ico",
        shortcut: "/favicon.ico",
        apple: "/apple-touch-icon.png",
    },
    manifest: "/site.webmanifest",

    category: "technology",
    robots: {
        index: true,
        follow: true,
        nocache: false,
        googleBot: {
            index: true,
            follow: true,
            "max-video-preview": -1,
            "max-image-preview": "large",
            "max-snippet": -1,
        },
    },
};

export const viewport: Viewport = {
    width: "device-width",
    initialScale: 1,
    maximumScale: 5,
    themeColor: "#009dd5",
};

export default function RootLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <html lang="pt-br">
            <body
                className={`${selawik.className} antialiased bg-background-secondary text-foreground`}
            >
                <SessionProvider>{children}</SessionProvider>
                <Toaster richColors closeButton />
            </body>
        </html>
    );
}
