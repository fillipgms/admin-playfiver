import { Metadata } from "next";
import { getSettingsData } from "@/actions/settings";
import ConfiguracoesClient from "./ConfiguracoesClient";
import { usePermissions } from "@/hooks/usePermissions";

export const metadata: Metadata = {
    title: "Configurações",
    description: "Configure limites, manutenção e gateways de pagamento",
};

export default async function ConfiguracoesPage() {
    const config = (await getSettingsData()) as SettingsResponse;

    return (
        <main className="space-y-8">
            <div>
                <h1 className="text-2xl font-bold mb-2">Configurações</h1>
                <p className="text-foreground/60">
                    Gerencie as configurações gerais do sistema
                </p>
            </div>

            <ConfiguracoesClient config={config.data} />
        </main>
    );
}
