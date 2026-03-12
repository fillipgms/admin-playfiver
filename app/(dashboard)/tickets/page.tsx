import { getTickets } from "@/actions/tickets";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import SendTicket from "./SendTicket";
import ViewTickets from "./ViewTickets";

export default async function TicketsPage({
    searchParams,
}: {
    searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
    const params = await searchParams;

    const getParamValue = (param?: string | string[]) =>
        Array.isArray(param) ? param[0] : param;

    const user_id = getParamValue(params.user_id);
    const created_user_id = getParamValue(params.created_user_id);
    const resolved = getParamValue(params.resolved);
    const category = getParamValue(params.category);

    const res = await getTickets(user_id, created_user_id, resolved, category);

    console.log(res);

    return (
        <main className="space-y-8">
            <Tabs defaultValue="send" className="flex flex-col min-w-0">
                <TabsList className="w-full bg-background-primary">
                    <TabsTrigger value="send">Enviar</TabsTrigger>
                    <TabsTrigger value="view">Visualizar</TabsTrigger>
                </TabsList>
                <TabsContent value="send" className="mt-8">
                    <SendTicket />
                </TabsContent>
                <TabsContent value="view" className="mt-8 min-w-0">
                    <ViewTickets
                        tickets={res.data}
                        theresMore={res.last_page !== res.current_page}
                    />
                </TabsContent>
            </Tabs>
        </main>
    );
}
