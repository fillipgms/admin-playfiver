"use client";

import React from "react";
import { Card, CardContent, CardHeader } from "@/components/Card";
import { Badge } from "@/components/ui/badge";
import { EyeIcon, LinkIcon, CurrencyDollarIcon } from "@phosphor-icons/react";
import Icon from "@/components/Icon";

interface DistribuidorCardProps {
    distribuidor: DistribuidorProps;
    onStatusChange?: (id: number, status: number) => void;
}

const DistribuidorCard = ({
    distribuidor,
    onStatusChange,
}: DistribuidorCardProps) => {
    const isActive = distribuidor.status === 1;
    const hasInfluencer = Boolean(
        distribuidor.client_id_influencer &&
            distribuidor.client_id_influencer !== "0"
    );

    const handleStatusChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const newStatus = e.target.checked ? 1 : 0;
        onStatusChange?.(distribuidor.id, newStatus);
    };

    return (
        <Card className={!isActive ? "opacity-50" : ""}>
            <CardHeader>
                <div className="flex flex-col flex-wrap sm:flex-row sm:items-center sm:justify-between gap-3">
                    <div className="flex items-center gap-2">
                        <Icon>
                            <LinkIcon />
                        </Icon>
                        <div className="flex flex-col">
                            <h3 className="font-bold text-base capitalize">
                                {distribuidor.name}
                            </h3>
                            <p className="text-xs text-foreground/60 font-mono truncate max-w-[200px]">
                                {distribuidor.uri}
                            </p>
                        </div>
                    </div>
                    <div className="flex items-center gap-3">
                        <Badge
                            variant={isActive ? "default" : "destructive"}
                            className="w-fit"
                        >
                            {isActive ? "Ativo" : "Inativo"}
                        </Badge>
                        <label className="relative inline-flex items-center cursor-pointer">
                            <input
                                type="checkbox"
                                className="sr-only peer"
                                checked={isActive}
                                onChange={handleStatusChange}
                            />
                            <div className="relative w-11 h-6 bg-foreground/20 rounded-full peer peer-focus:ring-4 peer-focus:ring-primary/20 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-foreground/20 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
                        </label>
                    </div>
                </div>
            </CardHeader>

            <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* Coluna Esquerda */}
                    <div className="space-y-3">
                        <div className="space-y-2">
                            <span className="text-xs text-foreground/50 font-medium">
                                Id do cliente
                            </span>
                            <p className="text-sm font-mono bg-background-secondary p-2 rounded border border-foreground/10 break-all">
                                {distribuidor.client_id}
                            </p>
                        </div>

                        <div className="space-y-2">
                            <span className="text-xs text-foreground/50 font-medium">
                                Chaves extras
                            </span>
                            <p className="text-sm font-mono bg-background-secondary p-2 rounded border border-foreground/10 break-all">
                                {distribuidor.extra}
                            </p>
                        </div>

                        <div className="space-y-2">
                            <span className="text-xs text-foreground/50 font-medium">
                                Visualizações
                            </span>
                            <div className="flex items-center gap-1">
                                <EyeIcon
                                    size={16}
                                    className="text-foreground/60"
                                />
                                <p className="font-semibold text-sm">
                                    {distribuidor.views.toLocaleString("pt-BR")}
                                </p>
                            </div>
                        </div>

                        <div className="space-y-2">
                            <span className="text-xs text-foreground/50 font-medium">
                                Saldo
                            </span>
                            <div className="flex items-center gap-1">
                                <CurrencyDollarIcon
                                    size={16}
                                    className="text-foreground/60"
                                />
                                <p className="font-semibold text-sm">
                                    R${" "}
                                    {parseFloat(
                                        distribuidor.saldo
                                    ).toLocaleString("pt-BR", {
                                        minimumFractionDigits: 2,
                                        maximumFractionDigits: 2,
                                    })}
                                </p>
                            </div>
                        </div>

                        {hasInfluencer &&
                            distribuidor.client_secret_influencer && (
                                <div className="space-y-2">
                                    <span className="text-xs text-foreground/50 font-medium">
                                        Segredo do cliente influencer
                                    </span>
                                    <p className="text-sm font-mono bg-background-secondary p-2 rounded border border-foreground/10 break-all">
                                        {distribuidor.client_secret_influencer}
                                    </p>
                                </div>
                            )}
                    </div>

                    {/* Coluna Direita */}
                    <div className="space-y-3">
                        <div className="space-y-2">
                            <span className="text-xs text-foreground/50 font-medium">
                                Segredo do cliente
                            </span>
                            <p className="text-sm font-mono bg-background-secondary p-2 rounded border border-foreground/10 break-all">
                                {distribuidor.client_secret}
                            </p>
                        </div>

                        <div className="space-y-2">
                            <span className="text-xs text-foreground/50 font-medium">
                                Url
                            </span>
                            <p className="text-sm font-mono bg-background-secondary p-2 rounded border border-foreground/10 break-all">
                                {distribuidor.uri}
                            </p>
                        </div>

                        {hasInfluencer && (
                            <>
                                <div className="space-y-2">
                                    <span className="text-xs text-foreground/50 font-medium">
                                        Id do cliente influencer
                                    </span>
                                    <p className="text-sm font-mono bg-background-secondary p-2 rounded border border-foreground/10 break-all">
                                        {distribuidor.client_id_influencer}
                                    </p>
                                </div>

                                {distribuidor.client_extra_influencer && (
                                    <div className="space-y-2">
                                        <span className="text-xs text-foreground/50 font-medium">
                                            Chave extra do influencer
                                        </span>
                                        <p className="text-sm font-mono bg-background-secondary p-2 rounded border border-foreground/10 break-all">
                                            {
                                                distribuidor.client_extra_influencer
                                            }
                                        </p>
                                    </div>
                                )}
                            </>
                        )}
                    </div>
                </div>
            </CardContent>
        </Card>
    );
};

export default DistribuidorCard;
