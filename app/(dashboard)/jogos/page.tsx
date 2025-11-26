import { getGamesData } from "@/actions/jogos";
import JogosClient from "./JogosClient";
import { Metadata } from "next";

export const metadata: Metadata = {
    title: "Jogos",
    description: "Jogos do sistema",
};

export default async function JogosPage() {
    const gamesRes = await getGamesData();

    if (!gamesRes) {
        return (
            <div className="flex items-center justify-center h-64">
                <p className="text-red-500">Erro ao carregar jogos</p>
            </div>
        );
    }

    return <JogosClient initialData={gamesRes} />;
}
