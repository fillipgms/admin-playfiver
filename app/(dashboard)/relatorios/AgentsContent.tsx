"use client";

import { Card, CardContent, CardHeader } from "@/components/Card";
import { Badge } from "@/components/ui/badge";
import {
    UserIcon,
    CurrencyDollarIcon,
    ChartLineUpIcon,
    WarningCircleIcon,
} from "@phosphor-icons/react";
interface AgentsContentProps {
    initialData: RelatorioAgentesResponse | null;
}

function formatCurrency(value: number | string | null): string {
    const num = Number(value) || 0;
    return new Intl.NumberFormat("pt-BR", {
        style: "currency",
        currency: "BRL",
    }).format(num);
}

function formatDate(dateString: string): string {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat("pt-BR", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
    }).format(date);
}

export default function AgentsContent({ initialData }: AgentsContentProps) {
    if (!initialData || !initialData.data || initialData.data.length === 0) {
        return (
            <Card className="p-12 text-center">
                <UserIcon className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                <h3 className="text-lg font-semibold mb-2">
                    Nenhum agente encontrado
                </h3>
                <p className="text-muted-foreground">
                    Não há dados de agentes disponíveis no momento.
                </p>
            </Card>
        );
    }

    const agents = initialData.data;

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                    <h2 className="text-2xl font-bold">Relatório de Agentes</h2>
                    <p className="text-sm text-foreground/60 mt-1">
                        Visualize informações e estatísticas dos agentes
                    </p>
                </div>
                <Badge variant="outline" className="text-lg px-4 py-1.5">
                    Total: {agents.length} agente{agents.length !== 1 ? "s" : ""}
                </Badge>
            </div>

            {/* Agents Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
                {agents.map((agent) => {
                    const hasLogs = agent.countLogs > 0;

                    return (
                        <Card key={agent.id} className="hover:shadow-lg transition-shadow">
                            <CardHeader className="pb-3">
                                <div className="flex items-start justify-between gap-2">
                                    <div className="flex-1 min-w-0">
                                        <h3 className="text-lg font-semibold truncate">
                                            {agent.agent_memo || agent.agent_code}
                                        </h3>
                                        <p className="text-sm text-muted-foreground mt-1">
                                            {agent.agent_code}
                                        </p>
                                    </div>
                                    {hasLogs && (
                                        <Badge
                                            variant="destructive"
                                            className="gap-1 shrink-0"
                                        >
                                            <WarningCircleIcon className="size-3" />
                                            {agent.countLogs}
                                        </Badge>
                                    )}
                                </div>
                            </CardHeader>

                            <CardContent className="space-y-4">
                                {/* User Info */}
                                {agent.usuario_name && (
                                    <div className="flex items-center gap-2 pb-3 border-b border-foreground/10">
                                        <UserIcon className="size-4 text-muted-foreground shrink-0" />
                                        <div className="min-w-0 flex-1">
                                            <p className="text-sm font-medium truncate">
                                                {agent.usuario_name}
                                            </p>
                                            {agent.usuario_email && (
                                                <p className="text-xs text-muted-foreground truncate">
                                                    {agent.usuario_email}
                                                </p>
                                            )}
                                        </div>
                                    </div>
                                )}

                                {/* Stats Grid */}
                                <div className="grid grid-cols-2 gap-3">
                                    <div className="bg-muted/50 rounded-md p-3">
                                        <div className="flex items-center gap-1.5 mb-1">
                                            <CurrencyDollarIcon className="size-4 text-muted-foreground" />
                                            <p className="text-xs text-muted-foreground">
                                                Moeda
                                            </p>
                                        </div>
                                        <p className="text-sm font-semibold">
                                            {agent.currency || "N/A"}
                                        </p>
                                    </div>

                                    <div className="bg-muted/50 rounded-md p-3">
                                        <div className="flex items-center gap-1.5 mb-1">
                                            <ChartLineUpIcon className="size-4 text-muted-foreground" />
                                            <p className="text-xs text-muted-foreground">
                                                Influencers
                                            </p>
                                        </div>
                                        <p className="text-sm font-semibold">
                                            {agent.influencers || 0}
                                        </p>
                                    </div>
                                </div>

                                {/* Limits */}
                                {agent.limit_enable && (
                                    <div className="bg-primary/5 rounded-md p-3 border border-primary/20">
                                        <p className="text-xs font-medium text-primary mb-2">
                                            Limites Configurados
                                        </p>
                                        <div className="space-y-1 text-sm">
                                            <div className="flex justify-between">
                                                <span className="text-muted-foreground">
                                                    Valor:
                                                </span>
                                                <span className="font-medium">
                                                    {agent.currency}{" "}
                                                    {agent.limite_amount || "0"}
                                                </span>
                                            </div>
                                            <div className="flex justify-between">
                                                <span className="text-muted-foreground">
                                                    Horas:
                                                </span>
                                                <span className="font-medium">
                                                    {agent.limit_hours || "0"}h
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                )}

                                {/* RTP Info */}
                                {agent.rtp && (
                                    <div className="pt-2 border-t border-foreground/10">
                                        <p className="text-xs text-muted-foreground mb-1">
                                            RTP
                                        </p>
                                        <p className="text-sm font-medium">
                                            {agent.rtp}%
                                        </p>
                                    </div>
                                )}

                                {/* Footer */}
                                <div className="pt-2 border-t border-foreground/10">
                                    <p className="text-xs text-muted-foreground">
                                        Criado em: {formatDate(agent.created_date)}
                                    </p>
                                    {agent.hide === 1 && (
                                        <Badge
                                            variant="outline"
                                            className="mt-2 text-xs"
                                        >
                                            Oculto
                                        </Badge>
                                    )}
                                </div>
                            </CardContent>
                        </Card>
                    );
                })}
            </div>
        </div>
    );
}
