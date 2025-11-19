import React from "react";
import { Card, CardContent, CardHeader } from "./Card";
import { LinkSimpleIcon, RobotIcon } from "@phosphor-icons/react/dist/ssr";
import Link from "next/link";
import Icon from "./Icon";
import { UserIcon } from "@phosphor-icons/react";
import { Badge } from "./ui/badge";

const Agent = React.forwardRef<
    HTMLDivElement,
    { agent: Agent; onActionHappen: () => void }
>(({ agent, onActionHappen }, ref) => {
    return (
        <Card ref={ref}>
            <CardHeader>
                <div className="flex items-center w-full justify-between">
                    <div className="flex items-center gap-2">
                        <Icon>
                            <RobotIcon />
                        </Icon>
                        <h2 className="font-bold text-lg">
                            {agent.agent_memo}
                        </h2>
                        <Badge
                            variant="outline"
                            className="ml-1 py-0.5 px-2 text-xs border-foreground/20"
                        >
                            {agent.agent_code}
                        </Badge>
                    </div>
                </div>
            </CardHeader>
            <CardContent className="space-y-4">
                {/* User Information */}
                <section className="flex items-center gap-2 p-3 bg-background-secondary rounded border">
                    <UserIcon className="text-primary" size={20} />
                    <div className="flex flex-col flex-1">
                        <p className="text-sm font-medium">
                            {agent.usuario_name}
                        </p>
                        <p className="text-xs text-foreground/50">
                            {agent.usuario_email}
                        </p>
                    </div>
                    {agent.hide === 1 && (
                        <Badge className="w-fit border-[#E53935]/30 text-[#E53935] bg-[#E53935]/10">
                            Oculto
                        </Badge>
                    )}
                </section>

                <section className="flex items-center w-full justify-between">
                    <div className="flex items-center gap-2">
                        <p className="text-3xl text-primary font-bold border-r-2 border-primary pr-2">
                            RTP
                        </p>
                        <div className="flex flex-col">
                            <p className=" text-sm text-foreground/50">
                                Sistema: {agent.rtp}%
                            </p>
                            <p>Usuário: {agent.rtp_user}%</p>
                        </div>
                    </div>
                    <div className="flex flex-col">
                        <p className=" text-sm text-foreground/50">Moeda</p>
                        <p>{agent.currency}</p>
                    </div>
                </section>

                <section className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="flex flex-col gap-1">
                        <p className="text-sm text-foreground/50">Secret</p>
                        <div className="relative group">
                            <p className="font-mono text-xs bg-background-secondary p-2 pr-16 rounded border break-all">
                                {agent.agent_secret}
                            </p>
                            <button
                                type="button"
                                onClick={() =>
                                    navigator.clipboard.writeText(
                                        agent.agent_secret
                                    )
                                }
                                className="absolute top-1/2 -translate-y-1/2 right-2 text-xs px-2 py-1 rounded border bg-background hover:bg-background/80"
                                aria-label="Copiar secret"
                                title="Copiar"
                            >
                                Copiar
                            </button>
                        </div>
                    </div>
                    <div className="flex flex-col gap-1">
                        <p className="text-sm text-foreground/50">Token</p>
                        <div className="relative group">
                            <p className="font-mono text-xs bg-background-secondary p-2 pr-16 rounded border break-all">
                                {agent.agent_token}
                            </p>
                            <button
                                type="button"
                                onClick={() =>
                                    navigator.clipboard.writeText(
                                        agent.agent_token
                                    )
                                }
                                className="absolute top-1/2 -translate-y-1/2 right-2 text-xs px-2 py-1 rounded border bg-background hover:bg-background/80"
                                aria-label="Copiar token"
                                title="Copiar"
                            >
                                Copiar
                            </button>
                        </div>
                    </div>
                </section>

                {/* Password */}
                <section className="flex flex-col">
                    <p className="text-sm text-foreground/50">Senha</p>
                    <p className="font-mono text-sm bg-background-secondary p-2 rounded border">
                        {agent.password}
                    </p>
                </section>

                {/* Callback URL */}
                <section className="flex flex-col">
                    <p className=" text-sm text-foreground/50">Callback URL</p>
                    <Link
                        href={agent.url}
                        target="_blank"
                        className="underline text-primary flex gap-1 items-center "
                    >
                        <span>
                            <LinkSimpleIcon />
                        </span>
                        <span className="truncate">{agent.url}</span>
                    </Link>
                </section>

                {/* Limits Configuration */}
                <section className="flex flex-col gap-1">
                    <p className="text-sm text-foreground/50">
                        Limite Habilitado
                    </p>
                    {agent.limit_enable ? (
                        <Badge className="w-fit border-[#95BD2B]/30 text-[#95BD2B] bg-[#95BD2B]/10">
                            Ativado
                        </Badge>
                    ) : (
                        <Badge className="w-fit border-[#E53935]/30 text-[#E53935] bg-[#E53935]/10">
                            Desativado
                        </Badge>
                    )}
                </section>

                {/* Limit Details */}
                {agent.limit_enable && (
                    <section className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="flex flex-col">
                            <p className="text-sm text-foreground/50">
                                Valor do Limite
                            </p>
                            <p className="text-sm font-medium">
                                {agent.currency} {agent.limite_amount}
                            </p>
                        </div>
                        <div className="flex flex-col">
                            <p className="text-sm text-foreground/50">
                                Horas do Limite
                            </p>
                            <p className="text-sm font-medium">
                                {agent.limit_hours} horas
                            </p>
                        </div>
                    </section>
                )}

                {/* Footer Info */}
                <section className="flex justify-between items-center text-foreground/50 text-sm pt-2 border-t border-foreground/10">
                    <div>
                        Criado em:{" "}
                        {new Date(agent.created_date).toLocaleDateString(
                            "pt-BR"
                        )}
                    </div>
                    <div>
                        {agent.influencers > 0 ? agent.influencers : 0}{" "}
                        influencers
                    </div>
                </section>
            </CardContent>
        </Card>
    );
});

Agent.displayName = "Agent";

export default Agent;
