"use client";

import React, { useState } from "react";
import {
    Credenza,
    CredenzaBody,
    CredenzaClose,
    CredenzaContent,
    CredenzaFooter,
    CredenzaHeader,
    CredenzaTitle,
    CredenzaTrigger,
} from "@/components/ui/credenza";
import { Button } from "./ui/button";
import { PencilIcon } from "@phosphor-icons/react/dist/ssr";
import { Input } from "./ui/input";
import { Switch } from "./ui/switch";
import { Label } from "./ui/label";
import { updateAgent } from "@/actions/agents";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { usePermissions } from "@/hooks/usePermissions";

const EditAgentModal = ({ agent }: { agent: Agent }) => {
    const [isOpen, setIsOpen] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const { hasPermission } = usePermissions();

    const [agentMemo, setAgentMemo] = useState(agent.agent_memo || "");
    const [password, setPassword] = useState("");
    const [rtp, setRtp] = useState(String(agent.rtp ?? ""));
    const [rtpUser, setRtpUser] = useState(String(agent.rtp_user ?? ""));
    const [url, setUrl] = useState(agent.url || "");
    const [limitEnable, setLimitEnable] = useState(!!agent.limit_enable);
    const [limiteAmount, setLimiteAmount] = useState(
        agent.limite_amount ? String(agent.limite_amount) : ""
    );
    const [limitHours, setLimitHours] = useState(
        agent.limit_hours ? String(agent.limit_hours) : ""
    );
    const [influencers, setInfluencers] = useState(
        typeof agent.influencers === "number" ? agent.influencers : 0
    );
    const [hide, setHide] = useState(!!agent.hide);

    const router = useRouter();

    // Permission checks for each field
    const canEditMemo = hasPermission("agent_edit_describe");
    const canEditPassword = hasPermission("agent_edit_password");
    const canEditRtp = hasPermission("agent_edit_rtp");
    const canEditRtpUser = hasPermission("agent_edit_rtp_user");
    const canEditUrl = hasPermission("agent_edit_webhook");
    const canEditLimits = hasPermission("agent_edit_limits");
    const canEditInfluencers = hasPermission("agent_edit_influencers");
    const canEditHide = hasPermission("agent_edit_hide");

    // Check if user has any editable permission
    const hasEditPermission = canEditMemo || canEditPassword || canEditRtp || canEditRtpUser || canEditUrl || canEditLimits || canEditInfluencers || canEditHide;

    const handleSave = async () => {
        setIsLoading(true);
        try {
            const payload = {
                id_agente: agent.id,
                agent_memo: canEditMemo ? agentMemo : undefined,
                password: canEditPassword && password ? password : undefined,
                rtp: canEditRtp ? rtp : undefined,
                rtp_user: canEditRtpUser ? rtpUser : undefined,
                url: canEditUrl ? url : undefined,
                limit_enable: canEditLimits ? (limitEnable ? 1 : 0) : undefined,
                limite_amount: canEditLimits ? limiteAmount : undefined,
                limit_hours: canEditLimits ? limitHours : undefined,
                influencers: canEditInfluencers ? Number(influencers) || 0 : undefined,
                hide: canEditHide ? (hide ? 1 : 0) : undefined,
            } as any;

            // Remove undefined values
            Object.keys(payload).forEach(key => payload[key] === undefined && delete payload[key]);

            const result = await updateAgent(payload);

            if (result.success) {
                toast.success("Agente atualizado com sucesso!");
                setIsOpen(false);
                setPassword("");
                router.refresh();
            } else {
                toast.error(result.error || "Erro ao atualizar agente");
            }
        } catch (err) {
            console.error(err);
            toast.error("Erro inesperado ao salvar");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <Credenza open={isOpen} onOpenChange={setIsOpen}>
            <CredenzaTrigger asChild>
                <Button
                    size="sm"
                    variant="outline"
                    className="h-8 px-3"
                    title="Editar agente"
                >
                    <PencilIcon size={14} />
                    <span className="sr-only">Editar</span>
                </Button>
            </CredenzaTrigger>

            <CredenzaContent className="bg-background-primary sm:max-w-[700px]">
                <CredenzaHeader>
                    <CredenzaTitle>
                        Editando {agent.agent_memo || agent.agent_code}
                    </CredenzaTitle>
                </CredenzaHeader>
                {!hasEditPermission && (
                    <div className="px-6 py-3 bg-destructive/10 border-b border-destructive/20 text-sm text-destructive">
                        Você não tem permissão para editar este agente.
                    </div>
                )}
                <CredenzaBody className="space-y-6 py-4">
                    <div className="grid grid-cols-12 gap-4">
                        <div className="col-span-12 md:col-span-6">
                            <Label className="text-xs font-medium text-muted-foreground block mb-1.5">
                                Memo
                            </Label>
                            <Input
                                value={agentMemo}
                                onChange={(e) => setAgentMemo(e.target.value)}
                                className="h-9"
                                disabled={!canEditMemo}
                                readOnly={!canEditMemo}
                            />
                        </div>
                        <div className="col-span-12 md:col-span-6">
                            <Label className="text-xs font-medium text-muted-foreground block mb-1.5">
                                Senha (Opcional)
                            </Label>
                            <Input
                                type="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                className="h-9"
                                placeholder="******"
                                disabled={!canEditPassword}
                            />
                        </div>
                    </div>

                    <div className="grid grid-cols-12 gap-4">
                        <div className="col-span-6">
                            <Label className="text-xs font-medium text-muted-foreground block mb-1.5">
                                RTP (Sistema)
                            </Label>
                            <Input
                                value={rtp}
                                onChange={(e) => setRtp(e.target.value)}
                                className="h-9"
                                disabled={!canEditRtp}
                                readOnly={!canEditRtp}
                            />
                        </div>
                        <div className="col-span-6">
                            <Label className="text-xs font-medium text-muted-foreground block mb-1.5">
                                RTP (Usuário)
                            </Label>
                            <Input
                                value={rtpUser}
                                onChange={(e) => setRtpUser(e.target.value)}
                                className="h-9"
                                disabled={!canEditRtpUser}
                                readOnly={!canEditRtpUser}
                            />
                        </div>
                    </div>

                    <div className="grid grid-cols-12 gap-4">
                        <div className="col-span-12 md:col-span-8">
                            <Label className="text-xs font-medium text-muted-foreground block mb-1.5">
                                Callback URL
                            </Label>
                            <Input
                                value={url}
                                onChange={(e) => setUrl(e.target.value)}
                                className="h-9"
                                disabled={!canEditUrl}
                                readOnly={!canEditUrl}
                            />
                        </div>
                        <div className="col-span-12 md:col-span-4 flex items-center gap-3">
                            <Switch
                                id="hide-agent"
                                checked={hide}
                                onCheckedChange={(v: any) => setHide(!!v)}
                                disabled={!canEditHide}
                            />
                            <Label
                                htmlFor="hide-agent"
                                className={`text-sm font-medium ${!canEditHide ? "opacity-50" : ""}`}
                            >
                                Ocultar agente
                            </Label>
                        </div>
                    </div>

                    <div className="h-px bg-border w-full" />

                    <div className="grid grid-cols-12 gap-4">
                        <div className="col-span-12 md:col-span-4 flex items-center gap-3">
                            <Switch
                                id="limit-enable"
                                checked={limitEnable}
                                onCheckedChange={(v: any) =>
                                    setLimitEnable(!!v)
                                }
                                disabled={!canEditLimits}
                            />
                            <Label
                                htmlFor="limit-enable"
                                className={`text-sm font-medium ${!canEditLimits ? "opacity-50" : ""}`}
                            >
                                Limite habilitado
                            </Label>
                        </div>

                        {limitEnable && (
                            <>
                                <div className="col-span-6 md:col-span-4">
                                    <Label className="text-xs font-medium text-muted-foreground block mb-1.5">
                                        Valor do limite
                                    </Label>
                                    <Input
                                        value={limiteAmount}
                                        onChange={(e) =>
                                            setLimiteAmount(e.target.value)
                                        }
                                        className="h-9"
                                        placeholder="100.00"
                                        disabled={!canEditLimits}
                                        readOnly={!canEditLimits}
                                    />
                                </div>
                                <div className="col-span-6 md:col-span-4">
                                    <Label className="text-xs font-medium text-muted-foreground block mb-1.5">
                                        Horas do limite
                                    </Label>
                                    <Input
                                        value={limitHours}
                                        onChange={(e) =>
                                            setLimitHours(e.target.value)
                                        }
                                        className="h-9"
                                        placeholder="1"
                                        disabled={!canEditLimits}
                                        readOnly={!canEditLimits}
                                    />
                                </div>
                            </>
                        )}
                    </div>

                    <div className="grid grid-cols-12 gap-4">
                        <div className="col-span-12 md:col-span-6">
                            <Label className="text-xs font-medium text-muted-foreground block mb-1.5">
                                Influencers
                            </Label>
                            <Input
                                type="number"
                                value={String(influencers)}
                                onChange={(e) =>
                                    setInfluencers(Number(e.target.value))
                                }
                                className="h-9"
                                disabled={!canEditInfluencers}
                                readOnly={!canEditInfluencers}
                            />
                        </div>
                    </div>
                </CredenzaBody>

                <CredenzaFooter className="gap-2 border-t pt-4">
                    <CredenzaClose asChild>
                        <Button
                            variant="ghost"
                            type="button"
                            disabled={isLoading}
                        >
                            Cancelar
                        </Button>
                    </CredenzaClose>
                    <Button
                        onClick={handleSave}
                        disabled={isLoading || !hasEditPermission}
                        className="w-full sm:w-auto"
                    >
                        {isLoading ? "Salvando..." : "Salvar Alterações"}
                    </Button>
                </CredenzaFooter>
            </CredenzaContent>
        </Credenza>
    );
};

export default EditAgentModal;
