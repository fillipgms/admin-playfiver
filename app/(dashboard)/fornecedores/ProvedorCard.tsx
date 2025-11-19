"use client";

import React from "react";
import Image from "next/image";
import { Card, CardContent, CardHeader } from "@/components/Card";
import { Badge } from "@/components/ui/badge";
import { EyeIcon } from "@phosphor-icons/react";
import Icon from "@/components/Icon";

interface ProvedorCardProps {
    provedor: ProvedorProps;
    onStatusChange?: (id: number, status: number) => void;
}

const ProvedorCard = ({ provedor, onStatusChange }: ProvedorCardProps) => {
    const isActive = provedor.status === 1;

    const handleStatusChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const newStatus = e.target.checked ? 1 : 0;
        onStatusChange?.(provedor.id, newStatus);
    };

    return (
        <Card className={!isActive ? "opacity-50" : ""}>
            <CardHeader>
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                    <div className="flex items-center gap-3">
                        <div className="relative w-12 h-12 rounded-md overflow-hidden bg-background-secondary border border-foreground/10 shrink-0">
                            {provedor.image_url ? (
                                <Image
                                    src={provedor.image_url}
                                    alt={provedor.name}
                                    fill
                                    className="object-contain p-1"
                                    sizes="48px"
                                    unoptimized
                                />
                            ) : (
                                <div className="w-full h-full flex items-center justify-center text-xs text-foreground/40">
                                    {provedor.name.charAt(0)}
                                </div>
                            )}
                        </div>
                        <div className="flex flex-col">
                            <h3 className="font-bold text-base">
                                {provedor.name}
                            </h3>
                            <p className="text-xs text-foreground/60">
                                Tipo de carteira: {provedor.type_wallet}
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
                <div className="flex items-center gap-2">
                    <Icon>
                        <EyeIcon />
                    </Icon>
                    <div className="flex-1">
                        <span className="text-xs text-foreground/50">
                            Visualizações
                        </span>
                        <p className="font-semibold text-sm">
                            {provedor.views.toLocaleString("pt-BR")}
                        </p>
                    </div>
                </div>
            </CardContent>
        </Card>
    );
};

export default ProvedorCard;
