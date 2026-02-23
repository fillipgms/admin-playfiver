"use client";

import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { CheckCircleIcon, XCircleIcon } from "@phosphor-icons/react";
import { Card, CardContent, CardFooter, CardHeader } from "@/components/Card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { editSettingsData } from "@/actions/settings";
import { usePermissions } from "@/hooks/usePermissions";

interface ConfiguracoesClientProps {
    config: ConfiguracoesProps;
}

const ToggleSwitch = ({
    label,
    checked,
    onChange,
    canEdit,
}: {
    label: string;
    checked: boolean;
    onChange: () => void;
    canEdit: boolean;
}) => (
    <div className="flex items-center justify-between ">
        <label className="text-sm font-medium text-foreground">{label}</label>
        <label className=" relative inline-flex items-center cursor-pointer ">
            <input
                type="checkbox"
                className="sr-only peer"
                checked={checked}
                onChange={onChange}
                disabled={!canEdit}
            />
            <div className="peer-disabled:opacity-50 peer-disabled:cursor-not-allowed relative w-11 h-6 bg-foreground/20 rounded-full peer peer-focus:ring-4 peer-focus:ring-primary/20 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-foreground/20 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
        </label>
    </div>
);

const InputField = ({
    label,
    value,
    onChange,
    type = "text",
    step,
    canEdit,
}: {
    label: string;
    value: string | number;
    onChange: (value: string) => void;
    type?: string;
    step?: string;
    canEdit: boolean;
}) => (
    <div className="space-y-2">
        <label
            htmlFor={label.replace(/\s+/g, "-").toLowerCase()}
            className="text-sm font-medium text-foreground"
        >
            {label}
        </label>
        <input
            id={label.replace(/\s+/g, "-").toLowerCase()}
            type={type}
            value={value}
            onChange={(e) => onChange(e.target.value)}
            step={step}
            disabled={!canEdit}
            className="disabled:opacity-50 disabled:cursor-not-allowed w-full h-10 px-3 border border-foreground/20 rounded-lg bg-background-secondary focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-colors"
        />
    </div>
);

const ConfiguracoesClient = ({ config }: ConfiguracoesClientProps) => {
    const [formData, setFormData] = useState<ConfiguracoesProps>(config);
    const [isSaving, setIsSaving] = useState(false);
    const [success, setSuccess] = useState<string | null>(null);
    const [error, setError] = useState<string | null>(null);
    const { hasPermission, loading } = usePermissions();

    const canViewSettings = hasPermission("setting_view");
    const canEditSettings = false;

    if (loading) return null;

    const handleInputChange = (
        field: keyof ConfiguracoesProps,
        value: string | number,
    ) => {
        setFormData((prev) => ({
            ...prev,
            [field]: value,
        }));
    };

    const handleToggle = (field: keyof ConfiguracoesProps) => {
        setFormData((prev) => ({
            ...prev,
            [field]: prev[field] === 1 ? 0 : 1,
        }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSaving(true);
        setError(null);
        setSuccess(null);

        try {
            const payload: Record<string, string> = {};
            Object.entries(formData).forEach(([key, value]) => {
                payload[key] =
                    value !== undefined && value !== null ? String(value) : "";
            });

            await editSettingsData(payload);
            setSuccess("Configurações atualizadas com sucesso!");
        } catch (err: any) {
            setError(err?.message || "Erro ao atualizar configurações");
        } finally {
            setIsSaving(false);
        }
    };

    if (!canViewSettings) {
        return <p>Você não tem permissão para ver esse conteúdo</p>;
    }

    return (
        <form onSubmit={handleSubmit} className="space-y-6">
            <Tabs defaultValue="limits" className="space-y-6">
                <TabsList className="w-full flex flex-wrap gap-2 bg-background-primary">
                    <TabsTrigger value="limits">Limites</TabsTrigger>
                    <TabsTrigger value="maintenance">Manutenção</TabsTrigger>
                    <TabsTrigger value="gateways">Gateways</TabsTrigger>
                </TabsList>

                <TabsContent
                    value="limits"
                    className="mt-4 space-y-6 border border-foreground/10 rounded-xl bg-background"
                >
                    <Card className="shadow-none border-0">
                        <CardHeader>
                            <div className="space-y-1">
                                <h3 className="text-lg font-semibold">
                                    Limites do Sistema
                                </h3>
                                <p className="text-sm text-foreground/60 max-w-3xl">
                                    Controle como usuários e distribuidores
                                    podem apostar, ganhar e utilizar bônus
                                    dentro da plataforma.
                                </p>
                            </div>
                        </CardHeader>
                        <CardContent>
                            <div className="grid gap-6 lg:grid-cols-2">
                                <section className="rounded-xl border border-foreground/10 bg-background-primary/80 p-5 space-y-5">
                                    <header>
                                        <h4 className="font-semibold">
                                            Limites do Usuário
                                        </h4>
                                        <p className="text-xs text-foreground/60">
                                            Configure o comportamento padrão dos
                                            usuários finais.
                                        </p>
                                    </header>
                                    <div className="space-y-4">
                                        <ToggleSwitch
                                            label="Limite de aposta?"
                                            checked={
                                                formData.limit_enable === 1
                                            }
                                            onChange={() =>
                                                handleToggle("limit_enable")
                                            }
                                            canEdit={canEditSettings}
                                        />
                                        <InputField
                                            label="Quantidade de horas"
                                            value={formData.limit_hours}
                                            onChange={(value) =>
                                                handleInputChange(
                                                    "limit_hours",
                                                    value,
                                                )
                                            }
                                            type="number"
                                            canEdit={canEditSettings}
                                        />
                                        <InputField
                                            label="Quantia de limite"
                                            value={formData.limite_amount}
                                            onChange={(value) =>
                                                handleInputChange(
                                                    "limite_amount",
                                                    value,
                                                )
                                            }
                                            type="number"
                                            step="0.01"
                                            canEdit={canEditSettings}
                                        />
                                        <InputField
                                            label="Quantia máxima somada ao saldo"
                                            value={formData.limit_max}
                                            onChange={(value) =>
                                                handleInputChange(
                                                    "limit_max",
                                                    value,
                                                )
                                            }
                                            type="number"
                                            step="0.01"
                                            canEdit={canEditSettings}
                                        />
                                        <InputField
                                            label="Horas do bônus"
                                            value={formData.limit_hours_bonus}
                                            onChange={(value) =>
                                                handleInputChange(
                                                    "limit_hours_bonus",
                                                    parseInt(value) || 0,
                                                )
                                            }
                                            type="number"
                                            canEdit={canEditSettings}
                                        />
                                        <InputField
                                            label="Horas das rodadas grátis"
                                            value={formData.number_of_hours}
                                            onChange={(value) =>
                                                handleInputChange(
                                                    "number_of_hours",
                                                    parseInt(value) || 0,
                                                )
                                            }
                                            type="number"
                                            canEdit={canEditSettings}
                                        />
                                    </div>
                                </section>

                                <section className="rounded-xl border border-foreground/10 bg-background-primary/80 p-5 space-y-5">
                                    <header>
                                        <h4 className="font-semibold">
                                            Limites do Distribuidor
                                        </h4>
                                        <p className="text-xs text-foreground/60">
                                            Determine como os distribuidores
                                            podem operar.
                                        </p>
                                    </header>
                                    <div className="space-y-4">
                                        <ToggleSwitch
                                            label="Limite de aposta das distribuidoras?"
                                            checked={
                                                formData.limit_enable_distribuidor ===
                                                1
                                            }
                                            onChange={() =>
                                                handleToggle(
                                                    "limit_enable_distribuidor",
                                                )
                                            }
                                            canEdit={canEditSettings}
                                        />
                                        <InputField
                                            label="Horas das distribuidoras"
                                            value={
                                                formData.limit_hours_distribuidor
                                            }
                                            onChange={(value) =>
                                                handleInputChange(
                                                    "limit_hours_distribuidor",
                                                    value,
                                                )
                                            }
                                            type="number"
                                            canEdit={canEditSettings}
                                        />
                                        <InputField
                                            label="Quantia de limite"
                                            value={
                                                formData.limite_amount_distribuidor
                                            }
                                            onChange={(value) =>
                                                handleInputChange(
                                                    "limite_amount_distribuidor",
                                                    value,
                                                )
                                            }
                                            type="number"
                                            step="0.01"
                                            canEdit={canEditSettings}
                                        />
                                        <InputField
                                            label="Quantia máxima somada ao saldo"
                                            value={
                                                formData.limit_max_distribuidor
                                            }
                                            onChange={(value) =>
                                                handleInputChange(
                                                    "limit_max_distribuidor",
                                                    value,
                                                )
                                            }
                                            type="number"
                                            step="0.01"
                                            canEdit={canEditSettings}
                                        />
                                        <InputField
                                            label="Quantidade de bônus"
                                            value={
                                                formData.limit_quantity_bonus
                                            }
                                            onChange={(value) =>
                                                handleInputChange(
                                                    "limit_quantity_bonus",
                                                    parseInt(value) || 0,
                                                )
                                            }
                                            type="number"
                                            canEdit={canEditSettings}
                                        />
                                        <InputField
                                            label="Quantidade de rodadas grátis"
                                            value={
                                                formData.quantity_rounds_free
                                            }
                                            onChange={(value) =>
                                                handleInputChange(
                                                    "quantity_rounds_free",
                                                    parseInt(value) || 0,
                                                )
                                            }
                                            type="number"
                                            canEdit={canEditSettings}
                                        />
                                    </div>
                                </section>
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>

                <TabsContent
                    value="maintenance"
                    className="mt-4 space-y-6 border border-foreground/10 rounded-xl bg-background"
                >
                    <Card className="shadow-none border-0">
                        <CardHeader>
                            <div className="space-y-1">
                                <h3 className="text-lg font-semibold">
                                    Janela de manutenção
                                </h3>
                                <p className="text-sm text-foreground/60">
                                    Pause rapidamente apenas a API ou todo o
                                    painel quando necessário.
                                </p>
                            </div>
                        </CardHeader>
                        <CardContent>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="rounded-xl border border-foreground/10 p-4 bg-background-primary/80">
                                    <ToggleSwitch
                                        label="Manutenção da API?"
                                        checked={formData.maintenance_api === 1}
                                        onChange={() =>
                                            handleToggle("maintenance_api")
                                        }
                                        canEdit={canEditSettings}
                                    />
                                </div>
                                <div className="rounded-xl border border-foreground/10 p-4 bg-background-primary/80">
                                    <ToggleSwitch
                                        label="Manutenção do Painel?"
                                        checked={
                                            formData.maintenance_panel === 1
                                        }
                                        onChange={() =>
                                            handleToggle("maintenance_panel")
                                        }
                                        canEdit={canEditSettings}
                                    />
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>

                <TabsContent
                    value="gateways"
                    className="mt-4 space-y-6 border border-foreground/10 rounded-xl bg-background"
                >
                    <Card className="shadow-none border-0">
                        <CardHeader>
                            <div className="space-y-1">
                                <h3 className="text-lg font-semibold">
                                    Gateways de pagamento
                                </h3>
                                <p className="text-sm text-foreground/60">
                                    Centralize as credenciais e URLs de cada
                                    parceiro financeiro.
                                </p>
                            </div>
                        </CardHeader>
                        <CardContent>
                            <div className="grid gap-6 md:grid-cols-2">
                                {/* EzzePay */}
                                <section className="rounded-xl border border-foreground/10 bg-background-primary/80 p-5 space-y-4">
                                    <header>
                                        <h4 className="font-semibold">
                                            EzzePay
                                        </h4>
                                        <p className="text-xs text-foreground/60">
                                            Credenciais do cliente e webhook.
                                        </p>
                                    </header>
                                    <InputField
                                        label="Id do cliente EzzePay"
                                        value={formData.ezzepay_client_id}
                                        onChange={(value) =>
                                            handleInputChange(
                                                "ezzepay_client_id",
                                                value,
                                            )
                                        }
                                        canEdit={canEditSettings}
                                    />
                                    <InputField
                                        label="Segredo do cliente EzzePay"
                                        value={formData.ezzepay_client_secret}
                                        onChange={(value) =>
                                            handleInputChange(
                                                "ezzepay_client_secret",
                                                value,
                                            )
                                        }
                                        type="password"
                                        canEdit={canEditSettings}
                                    />
                                    <InputField
                                        label="Usuário Webhook"
                                        value={formData.ezzepay_user}
                                        onChange={(value) =>
                                            handleInputChange(
                                                "ezzepay_user",
                                                value,
                                            )
                                        }
                                        canEdit={canEditSettings}
                                    />
                                    <InputField
                                        label="Senha Webhook"
                                        value={formData.ezzepay_senha}
                                        onChange={(value) =>
                                            handleInputChange(
                                                "ezzepay_senha",
                                                value,
                                            )
                                        }
                                        type="password"
                                        canEdit={canEditSettings}
                                    />
                                    <InputField
                                        label="URL EzzePay"
                                        value={formData.ezzepay_uri}
                                        onChange={(value) =>
                                            handleInputChange(
                                                "ezzepay_uri",
                                                value,
                                            )
                                        }
                                        canEdit={canEditSettings}
                                    />
                                </section>

                                {/* SuitPay */}
                                <section className="rounded-xl border border-foreground/10 bg-background-primary/80 p-5 space-y-4">
                                    <header>
                                        <h4 className="font-semibold">
                                            SuitPay
                                        </h4>
                                        <p className="text-xs text-foreground/60">
                                            Configure o gateway SuitPay.
                                        </p>
                                    </header>
                                    <InputField
                                        label="Id do cliente Suitpay"
                                        value={formData.suitpay_client_id}
                                        onChange={(value) =>
                                            handleInputChange(
                                                "suitpay_client_id",
                                                value,
                                            )
                                        }
                                        canEdit={canEditSettings}
                                    />
                                    <InputField
                                        label="Segredo do cliente Suitpay"
                                        value={formData.suitpay_client_secret}
                                        onChange={(value) =>
                                            handleInputChange(
                                                "suitpay_client_secret",
                                                value,
                                            )
                                        }
                                        type="password"
                                        canEdit={canEditSettings}
                                    />
                                    <InputField
                                        label="URL SuitPay"
                                        value={formData.suitpay_uri}
                                        onChange={(value) =>
                                            handleInputChange(
                                                "suitpay_uri",
                                                value,
                                            )
                                        }
                                        canEdit={canEditSettings}
                                    />
                                </section>

                                <section className="rounded-xl border border-foreground/10 bg-background-primary/80 p-5 space-y-4">
                                    <header>
                                        <h4 className="font-semibold">
                                            NowPayment
                                        </h4>
                                        <p className="text-xs text-foreground/60">
                                            Token de webhook e API key.
                                        </p>
                                    </header>
                                    <InputField
                                        label="Token webhook NowPayment"
                                        value={formData.nowpayment_id}
                                        onChange={(value) =>
                                            handleInputChange(
                                                "nowpayment_id",
                                                value,
                                            )
                                        }
                                        type="password"
                                        canEdit={canEditSettings}
                                    />
                                    <InputField
                                        label="Api Key NowPayment"
                                        value={formData.nowpayment_secretNow}
                                        onChange={(value) =>
                                            handleInputChange(
                                                "nowpayment_secretNow",
                                                value,
                                            )
                                        }
                                        type="password"
                                        canEdit={canEditSettings}
                                    />
                                    <InputField
                                        label="URL NowPayment"
                                        value={formData.nowpayment_uriNow}
                                        onChange={(value) =>
                                            handleInputChange(
                                                "nowpayment_uriNow",
                                                value,
                                            )
                                        }
                                        canEdit={canEditSettings}
                                    />
                                </section>

                                <section className="rounded-xl border border-foreground/10 bg-background-primary/80 p-5 space-y-4">
                                    <header>
                                        <h4 className="font-semibold">
                                            DigitoPay
                                        </h4>
                                        <p className="text-xs text-foreground/60">
                                            Informações da conta e API Pix.
                                        </p>
                                    </header>
                                    <InputField
                                        label="Id do cliente DigitoPay"
                                        value={formData.digitopay_cliente_id}
                                        onChange={(value) =>
                                            handleInputChange(
                                                "digitopay_cliente_id",
                                                value,
                                            )
                                        }
                                        canEdit={canEditSettings}
                                    />
                                    <InputField
                                        label="Segredo do cliente DigitoPay"
                                        value={
                                            formData.digitopay_cliente_secret
                                        }
                                        onChange={(value) =>
                                            handleInputChange(
                                                "digitopay_cliente_secret",
                                                value,
                                            )
                                        }
                                        type="password"
                                        canEdit={canEditSettings}
                                    />
                                    <InputField
                                        label="Id da conta DigitoPay"
                                        value={formData.digitopay_id_conta}
                                        onChange={(value) =>
                                            handleInputChange(
                                                "digitopay_id_conta",
                                                value,
                                            )
                                        }
                                        canEdit={canEditSettings}
                                    />
                                    <InputField
                                        label="URL DigitoPay"
                                        value={formData.digitopay_uri}
                                        onChange={(value) =>
                                            handleInputChange(
                                                "digitopay_uri",
                                                value,
                                            )
                                        }
                                        canEdit={canEditSettings}
                                    />
                                    <InputField
                                        label="API Pix principal"
                                        value={formData.primary}
                                        onChange={(value) =>
                                            handleInputChange("primary", value)
                                        }
                                        canEdit={canEditSettings}
                                    />
                                </section>
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>
            </Tabs>

            <Card>
                <CardFooter className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                    <div className="flex flex-col gap-2 text-sm min-h-[20px]">
                        {success && (
                            <span className="flex items-center gap-2 text-emerald-600 dark:text-emerald-400">
                                <CheckCircleIcon className="w-4 h-4" />
                                {success}
                            </span>
                        )}
                        {error && (
                            <span className="flex items-center gap-2 text-red-500">
                                <XCircleIcon className="w-4 h-4" />
                                {error}
                            </span>
                        )}
                        {!success && !error && (
                            <span className="text-foreground/60">
                                Revise as alterações antes de salvar.
                            </span>
                        )}
                    </div>
                    <div className="flex w-full md:w-auto justify-end">
                        <Button
                            type="submit"
                            disabled={isSaving}
                            className="min-w-[150px]"
                        >
                            {isSaving ? "Salvando..." : "ATUALIZAR"}
                        </Button>
                    </div>
                </CardFooter>
            </Card>
        </form>
    );
};

export default ConfiguracoesClient;
