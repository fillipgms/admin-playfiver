import type { MetadataRoute } from "next";

export default function sitemap(): MetadataRoute.Sitemap {
    const baseUrl = "https://playfiver.com.br";
    const routes = [
        "/",
        "/agentes",
        "/pacotes",
        "/jogos",
        "/usuarios",
        "/transacoes",
        "/ipwhitelist",
    ];

    return routes.map((route) => ({
        url: `${baseUrl}${route}`,
        lastModified: new Date(),
        changeFrequency: "daily",
        priority: route === "/" ? 1 : 0.7,
    }));
}
