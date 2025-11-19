import { Card, CardContent, CardHeader } from "@/components/Card";
import { Badge } from "@/components/ui/badge";
import { EyeIcon, UsersIcon } from "@phosphor-icons/react/dist/ssr";
import Icon from "@/components/Icon";
import { getRelatorioData } from "@/actions/relatorio";

export default async function AgentesContent() {
    const { data, error } = await getRelatorioData();

    if (error) {
        return <div>{error}</div>;
    }
    const agentes = data.data as RelatorioAgenteProps[];

    return (
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4 sm:gap-6 lg:gap-8">
            {agentes.map((agente) => (
                <Card key={agente.id}>
                    <CardHeader>
                        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                            <div className="flex items-center gap-2">
                                <Icon>
                                    <UsersIcon />
                                </Icon>
                                <div className="flex flex-col">
                                    <h3 className="font-bold text-base">
                                        {agente.agent_memo || agente.agent_code}
                                    </h3>
                                    <p className="text-xs text-foreground/60 font-mono">
                                        {agente.agent_code}
                                    </p>
                                </div>
                            </div>
                            <div className="flex items-center gap-2">
                                <Badge
                                    variant={
                                        agente.hide === 0
                                            ? "default"
                                            : "secondary"
                                    }
                                    className="w-fit"
                                >
                                    {agente.hide === 0 ? "Visível" : "Oculto"}
                                </Badge>
                                {agente.countLogs > 0 && (
                                    <Badge
                                        variant="destructive"
                                        className="w-fit"
                                    >
                                        {agente.countLogs} erros
                                    </Badge>
                                )}
                            </div>
                        </div>
                    </CardHeader>

                    <CardContent className="space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-1">
                                <span className="text-xs text-foreground/50">
                                    RTP Agente
                                </span>
                                <p className="font-semibold text-sm">
                                    {agente.rtp}%
                                </p>
                            </div>
                            <div className="space-y-1">
                                <span className="text-xs text-foreground/50">
                                    RTP Usuário
                                </span>
                                <p className="font-semibold text-sm">
                                    {agente.rtp_user}%
                                </p>
                            </div>
                        </div>

                        <div className="border-t border-foreground/10 pt-4 space-y-3">
                            <div className="space-y-2">
                                <span className="text-xs text-foreground/50 font-medium">
                                    Usuário
                                </span>
                                <div>
                                    <p className="text-sm font-medium">
                                        {agente.usuario_name}
                                    </p>
                                    <p className="text-xs text-foreground/60">
                                        {agente.usuario_email}
                                    </p>
                                </div>
                            </div>

                            <div className="space-y-2">
                                <span className="text-xs text-foreground/50 font-medium">
                                    Webhook URL
                                </span>
                                <p className="text-sm font-mono bg-background-secondary p-2 rounded border border-foreground/10 break-all">
                                    {agente.url}
                                </p>
                            </div>

                            {agente.limit_enable === 1 && (
                                <div className="space-y-2">
                                    <span className="text-xs text-foreground/50 font-medium">
                                        Limite
                                    </span>
                                    <p className="text-sm">
                                        {agente.currency}{" "}
                                        {parseFloat(
                                            agente.limite_amount
                                        ).toLocaleString("pt-BR", {
                                            minimumFractionDigits: 2,
                                            maximumFractionDigits: 2,
                                        })}{" "}
                                        / {agente.limit_hours}h
                                    </p>
                                </div>
                            )}

                            <div className="flex items-center gap-2">
                                <Icon>
                                    <EyeIcon />
                                </Icon>
                                <div className="flex-1">
                                    <span className="text-xs text-foreground/50">
                                        Influencers
                                    </span>
                                    <p className="font-semibold text-sm">
                                        {agente.influencers}
                                    </p>
                                </div>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            ))}
        </div>
    );
}
