import { Metadata } from "next";
import { configuracoes } from "@/data/placeholder";
import ConfiguracoesClient from "./ConfiguracoesClient";

export const metadata: Metadata = {
    title: "Configurações",
    description: "Configure limites, manutenção e gateways de pagamento",
};

export default async function ConfiguracoesPage() {
    const config = configuracoes as ConfiguracoesProps;

    return (
        <main className="space-y-8">
            <div>
                <h1 className="text-2xl font-bold mb-2">Configurações</h1>
                <p className="text-foreground/60">
                    Gerencie as configurações gerais do sistema
                </p>
            </div>

            <ConfiguracoesClient config={config} />
        </main>
    );
}
