import { getSpecificUserAgents } from "@/actions/users";
import { Card } from "@/components/Card";
import PaginationControls from "@/components/PaginationControls";
import AgentTable from "@/components/tables/AgentsTable";
import { GpsFixIcon } from "@phosphor-icons/react/dist/ssr/GpsFix";

const Agents = async ({
    id,
    searchParamsRecord,
}: {
    id: string;
    searchParamsRecord: {
        [k: string]: string | undefined;
    };
}) => {
    const page = parseInt(searchParamsRecord.page || "1", 10);

    try {
        const { data, status } = await getSpecificUserAgents(id, page);

        if (!data || status !== 1) {
            return (
                <Card className="p-8">
                    <div className="text-center">
                        <p className="text-destructive">
                            Erro ao carregar agentes. Por favor, tente
                            novamente.
                        </p>
                    </div>
                </Card>
            );
        }

        const agentes = data.data;
        const { current_page, last_page, next_page_url, prev_page_url } = data;

        return (
            <div className="space-y-8">
                <Card>
                    {agentes && agentes.length >= 1 ? (
                        <AgentTable agents={agentes} />
                    ) : (
                        <div className="p-8 text-center">
                            <GpsFixIcon
                                className="mx-auto text-foreground/30 mb-4"
                                size={48}
                            />
                            <p className="text-foreground/60">
                                Nenhum agente encontrado
                            </p>
                        </div>
                    )}
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
    } catch (error) {
        return (
            <Card className="p-8">
                <div className="text-center">
                    <p className="text-destructive">
                        Erro inesperado ao carregar agentes.
                    </p>
                </div>
            </Card>
        );
    }
};

export default Agents;
