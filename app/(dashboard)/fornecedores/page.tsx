import { Metadata } from "next";
import FornecedoresTabsWrapper from "./FornecedoresTabsWrapper";
import { getProvidersData } from "@/actions/providers";
import { getDistributorsData } from "@/actions/distribuidores";

export const metadata: Metadata = {
    title: "Fornecedores",
    description: "Gerenciamento de distribuidores e provedores",
};

type FornecedoresSearchParams = Promise<
    Record<string, string | string[] | undefined>
>;

const getParamValue = (value?: string | string[]) =>
    Array.isArray(value) ? value[0] : value;

export default async function FornecedoresPage({
    searchParams,
}: {
    searchParams: FornecedoresSearchParams;
}) {
    const params = await searchParams;

    const activeTab = getParamValue(params.tab) || "distribuidores";
    const page = parseInt(getParamValue(params.page) || "1", 10);
    const search = getParamValue(params.search) || "";

    const distribuidoresData = await getDistributorsData();
    const provedoresData = await getProvidersData({
        page,
        search,
    });

    return (
        <main className="space-y-8">
            <div>
                <h1 className="text-2xl font-bold mb-2">Fornecedores</h1>
                <p className="text-foreground/60">
                    Gerencie distribuidores e provedores do sistema
                </p>
            </div>

            <FornecedoresTabsWrapper
                activeTab={activeTab}
                distribuidoresData={distribuidoresData}
                provedoresData={provedoresData}
                searchParams={params}
            />
        </main>
    );
}
