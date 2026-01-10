import { Metadata } from "next";
import WalletsClient from "./WalletsClient";
import OrdersClient from "./OrdersClient";
import SignaturesClient from "./SignaturesClient";
import { getWalletsData } from "@/actions/carteiras";
import { getOrdersData } from "@/actions/order";
import { getSignaturesData } from "@/actions/signatures";
import { getGgrData } from "@/actions/ggr";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export const metadata: Metadata = {
    title: "Pacotes",
    description: "Gerenciamento de carteiras, pedidos e assinaturas",
};

type PacotesSearchParams = Promise<
    Record<string, string | string[] | undefined>
>;

const getParamValue = (value?: string | string[]) =>
    Array.isArray(value) ? value[0] : value;

const parseArrayParam = (value?: string | string[]) => {
    const raw = getParamValue(value);
    if (!raw) return [];
    const trimmed = raw.replace(/^\[/, "").replace(/\]$/, "");
    if (!trimmed) return [];
    return trimmed
        .split(",")
        .map((item) => item.trim())
        .filter(Boolean);
};

const normalizeCollection = <T,>(payload: unknown): T[] => {
    if (!payload) return [];
    if (Array.isArray(payload)) {
        return payload as T[];
    }
    if (typeof payload === "object") {
        const dataField = (payload as { data?: unknown }).data;
        if (Array.isArray(dataField)) {
            return dataField as T[];
        }
        if (dataField && typeof dataField === "object") {
            return Object.values(dataField as Record<string, T>);
        }
        return Object.values(payload as Record<string, T>);
    }
    return [];
};

interface PaginationMeta {
    current_page: number;
    last_page: number;
    next_page_url: string | null;
    prev_page_url: string | null;
}

export default async function PacotesPage({
    searchParams,
}: {
    searchParams: PacotesSearchParams;
}) {
    const searchParamsRes = (await searchParams) ?? {};

    const walletsQueryKeys = {
        page: "walletsPage",
    };

    const ordersQueryKeys = {
        page: "ordersPage",
        users: "ordersUser",
        wallets: "ordersWallet",
        dateStart: "ordersDateStart",
        dateEnd: "ordersDateEnd",
    };

    const signaturesQueryKeys = {
        page: "signaturesPage",
        users: "signaturesUser",
        filter: "signaturesFilter",
    };

    const walletsFilters = {
        page: parseInt(
            getParamValue(searchParamsRes[walletsQueryKeys.page]) || "1",
            10
        ),
    };

    const ordersFilters = {
        page: parseInt(
            getParamValue(searchParamsRes[ordersQueryKeys.page]) || "1",
            10
        ),
        users: parseArrayParam(searchParamsRes[ordersQueryKeys.users]),
        wallets: parseArrayParam(searchParamsRes[ordersQueryKeys.wallets]),
        dateStart:
            getParamValue(searchParamsRes[ordersQueryKeys.dateStart]) ||
            undefined,
        dateEnd:
            getParamValue(searchParamsRes[ordersQueryKeys.dateEnd]) ||
            undefined,
    };

    const signaturesFilters = {
        page: parseInt(
            getParamValue(searchParamsRes[signaturesQueryKeys.page]) || "1",
            10
        ),
        users: parseArrayParam(searchParamsRes[signaturesQueryKeys.users]),
        filter:
            getParamValue(searchParamsRes[signaturesQueryKeys.filter]) ||
            undefined,
    };

    const [walletsResponse, ordersResponse, signaturesResponse, ggrData] =
        await Promise.all([
            getWalletsData(walletsFilters.page),
            getOrdersData(ordersFilters),
            getSignaturesData(signaturesFilters),
            getGgrData(),
        ]);

    const walletsList = walletsResponse.data.data;
    const ggrList = ggrData.data;
    const ordersList = normalizeCollection<AdminOrderProps>(
        ordersResponse.data
    );
    const signaturesList = normalizeCollection<AdminSignatureProps>(
        signaturesResponse.data
    );

    return (
        <main className="space-y-8">
            <Tabs defaultValue="wallets" className="space-y-4">
                <TabsList>
                    <TabsTrigger value="wallets">Carteiras</TabsTrigger>
                    <TabsTrigger value="orders">Pedidos</TabsTrigger>
                    <TabsTrigger value="signatures">Assinaturas</TabsTrigger>
                </TabsList>
                <TabsContent value="wallets">
                    <WalletsClient
                        wallets={walletsList}
                        ggrData={ggrList}
                        pagination={walletsResponse.data as PaginationMeta}
                        queryKeys={walletsQueryKeys}
                    />
                </TabsContent>
                <TabsContent value="orders">
                    <OrdersClient
                        orders={ordersList}
                        pagination={ordersResponse as PaginationMeta}
                        queryKeys={ordersQueryKeys}
                    />
                </TabsContent>
                <TabsContent value="signatures">
                    <SignaturesClient
                        signatures={signaturesList}
                        pagination={signaturesResponse as PaginationMeta}
                        queryKeys={signaturesQueryKeys}
                    />
                </TabsContent>
            </Tabs>
        </main>
    );
}
