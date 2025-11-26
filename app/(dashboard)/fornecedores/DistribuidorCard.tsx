"use client";

import React, { useState } from "react";
import { Card, CardContent, CardHeader } from "@/components/Card";
import { Badge } from "@/components/ui/badge";
import { EyeIcon, LinkIcon, CurrencyDollarIcon } from "@phosphor-icons/react";
import Icon from "@/components/Icon";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

interface DistribuidorCardProps {
    distribuidor: DistribuidorProps;
    onStatusChange?: (id: number, status: number) => void;
    loading?: boolean;
    onEdit?: (payload: Record<string, string>) => Promise<void>;
}

const DistribuidorCard = ({
    distribuidor,
    onStatusChange,
    loading = false,
    onEdit,
}: DistribuidorCardProps) => {
    const [editMode, setEditMode] = useState(false);
    const [form, setForm] = useState({
        id: String(distribuidor.id),
        name: distribuidor.name || "",
        client_id: distribuidor.client_id || "",
        client_secret: distribuidor.client_secret || "",
        extra: distribuidor.extra || "",
        uri: distribuidor.uri || "",
        status: String(distribuidor.status),
        client_id_influencer: distribuidor.client_id_influencer || "",
        client_secret_influencer: distribuidor.client_secret_influencer || "",
        client_extra_influencer: distribuidor.client_extra_influencer || "",
    });
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState<string | null>(null);

    const isActive = form.status === "1";
    const hasInfluencer = Boolean(
        form.client_id_influencer && form.client_id_influencer !== "0"
    );

    const handleInput = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setForm((prev) => ({ ...prev, [name]: value }));
    };

    const handleStatusChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const newStatus = e.target.checked ? "1" : "0";
        setForm((prev) => ({ ...prev, status: newStatus }));
        onStatusChange?.(distribuidor.id, Number(newStatus));
    };

    const handleEdit = () => {
        setEditMode(true);
        setError(null);
        setSuccess(null);
    };

    const handleCancel = () => {
        setEditMode(false);
        setForm({
            id: String(distribuidor.id),
            name: distribuidor.name || "",
            client_id: distribuidor.client_id || "",
            client_secret: distribuidor.client_secret || "",
            extra: distribuidor.extra || "",
            uri: distribuidor.uri || "",
            status: String(distribuidor.status),
            client_id_influencer: distribuidor.client_id_influencer || "",
            client_secret_influencer:
                distribuidor.client_secret_influencer || "",
            client_extra_influencer: distribuidor.client_extra_influencer || "",
        });
        setError(null);
        setSuccess(null);
    };

    const handleSave = async () => {
        setSaving(true);
        setError(null);
        setSuccess(null);
        try {
            if (onEdit) await onEdit(form);
            setSuccess("Distribuidor atualizado com sucesso!");
            setEditMode(false);
        } catch (err: any) {
            setError(err?.message || "Erro ao atualizar distribuidor");
        } finally {
            setSaving(false);
        }
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
                            {editMode ? (
                                <Input
                                    name="name"
                                    value={form.name}
                                    onChange={handleInput}
                                    className="font-bold text-base capitalize"
                                    placeholder="Nome do distribuidor"
                                />
                            ) : (
                                <h3 className="font-bold text-base capitalize">
                                    {form.name}
                                </h3>
                            )}
                            {editMode ? (
                                <Input
                                    name="uri"
                                    value={form.uri}
                                    onChange={handleInput}
                                    className="text-xs font-mono max-w-[200px]"
                                    placeholder="URL"
                                />
                            ) : (
                                <p className="text-xs text-foreground/60 font-mono truncate max-w-[200px]">
                                    {form.uri}
                                </p>
                            )}
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
                                disabled={editMode}
                            />
                            <div className="relative w-11 h-6 bg-foreground/20 rounded-full peer peer-focus:ring-4 peer-focus:ring-primary/20 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-foreground/20 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
                        </label>
                        {!editMode && (
                            <Button
                                size="sm"
                                variant="outline"
                                onClick={handleEdit}
                                disabled={loading}
                            >
                                Editar
                            </Button>
                        )}
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
                            {editMode ? (
                                <Input
                                    name="client_id"
                                    value={form.client_id}
                                    onChange={handleInput}
                                    className="font-mono"
                                />
                            ) : (
                                <p className="text-sm font-mono bg-background-secondary p-2 rounded border border-foreground/10 break-all">
                                    {form.client_id}
                                </p>
                            )}
                        </div>
                        <div className="space-y-2">
                            <span className="text-xs text-foreground/50 font-medium">
                                Chaves extras
                            </span>
                            {editMode ? (
                                <Input
                                    name="extra"
                                    value={form.extra}
                                    onChange={handleInput}
                                    className="font-mono"
                                />
                            ) : (
                                <p className="text-sm font-mono bg-background-secondary p-2 rounded border border-foreground/10 break-all">
                                    {form.extra}
                                </p>
                            )}
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
                        {hasInfluencer && (
                            <>
                                <div className="space-y-2">
                                    <span className="text-xs text-foreground/50 font-medium">
                                        Segredo do cliente influencer
                                    </span>
                                    {editMode ? (
                                        <Input
                                            name="client_secret_influencer"
                                            value={
                                                form.client_secret_influencer
                                            }
                                            onChange={handleInput}
                                            className="font-mono"
                                        />
                                    ) : (
                                        <p className="text-sm font-mono bg-background-secondary p-2 rounded border border-foreground/10 break-all">
                                            {form.client_secret_influencer}
                                        </p>
                                    )}
                                </div>
                            </>
                        )}
                    </div>
                    {/* Coluna Direita */}
                    <div className="space-y-3">
                        <div className="space-y-2">
                            <span className="text-xs text-foreground/50 font-medium">
                                Segredo do cliente
                            </span>
                            {editMode ? (
                                <Input
                                    name="client_secret"
                                    value={form.client_secret}
                                    onChange={handleInput}
                                    className="font-mono"
                                />
                            ) : (
                                <p className="text-sm font-mono bg-background-secondary p-2 rounded border border-foreground/10 break-all">
                                    {form.client_secret}
                                </p>
                            )}
                        </div>
                        <div className="space-y-2">
                            <span className="text-xs text-foreground/50 font-medium">
                                Url
                            </span>
                            {editMode ? (
                                <Input
                                    name="uri"
                                    value={form.uri}
                                    onChange={handleInput}
                                    className="font-mono"
                                />
                            ) : (
                                <p className="text-sm font-mono bg-background-secondary p-2 rounded border border-foreground/10 break-all">
                                    {form.uri}
                                </p>
                            )}
                        </div>
                        {hasInfluencer && (
                            <>
                                <div className="space-y-2">
                                    <span className="text-xs text-foreground/50 font-medium">
                                        Id do cliente influencer
                                    </span>
                                    {editMode ? (
                                        <Input
                                            name="client_id_influencer"
                                            value={form.client_id_influencer}
                                            onChange={handleInput}
                                            className="font-mono"
                                        />
                                    ) : (
                                        <p className="text-sm font-mono bg-background-secondary p-2 rounded border border-foreground/10 break-all">
                                            {form.client_id_influencer}
                                        </p>
                                    )}
                                </div>
                                <div className="space-y-2">
                                    <span className="text-xs text-foreground/50 font-medium">
                                        Chave extra do influencer
                                    </span>
                                    {editMode ? (
                                        <Input
                                            name="client_extra_influencer"
                                            value={form.client_extra_influencer}
                                            onChange={handleInput}
                                            className="font-mono"
                                        />
                                    ) : (
                                        <p className="text-sm font-mono bg-background-secondary p-2 rounded border border-foreground/10 break-all">
                                            {form.client_extra_influencer}
                                        </p>
                                    )}
                                </div>
                            </>
                        )}
                    </div>
                </div>
                {editMode && (
                    <div className="flex gap-2 mt-4">
                        <Button
                            size="sm"
                            variant="default"
                            onClick={handleSave}
                            disabled={saving}
                        >
                            {saving ? "Salvando..." : "Salvar"}
                        </Button>
                        <Button
                            size="sm"
                            variant="outline"
                            onClick={handleCancel}
                            disabled={saving}
                        >
                            Cancelar
                        </Button>
                        {error && (
                            <span className="text-red-500 ml-2 text-sm">
                                {error}
                            </span>
                        )}
                        {success && (
                            <span className="text-emerald-600 dark:text-emerald-400 ml-2 text-sm">
                                {success}
                            </span>
                        )}
                    </div>
                )}
            </CardContent>
        </Card>
    );
};

export default DistribuidorCard;
