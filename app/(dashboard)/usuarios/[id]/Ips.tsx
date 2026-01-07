import { getSpecificUserIps } from "@/actions/users";
import { Card, CardContent, CardHeader } from "@/components/Card";
import PaginationControls from "@/components/PaginationControls";
import { GlobeIcon, MapPinIcon } from "@phosphor-icons/react/dist/ssr";

const Ips = async ({
    id,
    searchParamsRecord,
}: {
    id: string;
    searchParamsRecord: {
        [k: string]: string | undefined;
    };
}) => {
    const page = parseInt(searchParamsRecord.page || "1", 10);

    const { data } = (await getSpecificUserIps(id, page)) as IpResponse;

    const ipList = data.data;
    const { current_page, last_page, next_page_url, prev_page_url } = data;

    function formatDateTime(dateString: string) {
        const date = new Date(dateString);
        return new Intl.DateTimeFormat("pt-BR", {
            day: "2-digit",
            month: "2-digit",
            year: "numeric",
            hour: "2-digit",
            minute: "2-digit",
        }).format(date);
    }

    return (
        <div className="space-y-8">
            <Card>
                <CardHeader>
                    <div className="flex items-center w-full justify-between pb-4 border-b border-foreground/20">
                        <h2 className="font-semibold text-lg">
                            Histórico de IPs
                        </h2>
                        <span className="text-sm text-foreground/60">
                            {ipList?.length || 0} IPs
                        </span>
                    </div>
                </CardHeader>
                <CardContent>
                    {ipList && ipList.length > 0 ? (
                        <div className="space-y-2 mt-4">
                            {ipList.map((ipItem, i: number) => (
                                <div
                                    key={ipItem.id || i}
                                    className="bg-background-secondary rounded-lg p-4 border border-foreground/10 hover:border-foreground/20 transition-colors"
                                >
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-3">
                                            <MapPinIcon
                                                className="text-foreground/50"
                                                size={20}
                                            />
                                            <div>
                                                <p className="font-mono font-semibold">
                                                    {ipItem.ip}
                                                </p>
                                                <p className="text-xs text-foreground/60 mt-1">
                                                    {formatDateTime(
                                                        ipItem.created_at
                                                    )}
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="p-8 text-center">
                            <GlobeIcon
                                className="mx-auto text-foreground/30 mb-4"
                                size={48}
                            />
                            <p className="text-foreground/60">
                                Nenhum IP registrado
                            </p>
                        </div>
                    )}
                </CardContent>
            </Card>
            <PaginationControls
                currentPage={current_page}
                lastPage={last_page}
                hasNextPage={!!next_page_url}
                hasPrevPage={!!prev_page_url}
                baseUrl={`/usuarios/${id}`}
                searchParams={searchParamsRecord}
            />
        </div>
    );
};

export default Ips;
