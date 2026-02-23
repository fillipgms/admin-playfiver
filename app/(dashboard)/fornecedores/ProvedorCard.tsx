"use client";

import React, { useState } from "react";
import Image from "next/image";
import { Card, CardContent, CardHeader } from "@/components/Card";
import { Badge } from "@/components/ui/badge";
import { EyeIcon } from "@phosphor-icons/react";
import Icon from "@/components/Icon";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

interface ProvedorCardProps {
    provedor: ProvedorProps;
    onStatusChange?: (id: number, status: number) => void;
    loading?: boolean;
    onEdit?: (payload: Record<string, string>) => Promise<void>;
    canEdit?: boolean;
}

const ProvedorCard = ({
    provedor,
    onStatusChange,
    loading = false,
    onEdit,
    canEdit = false,
}: ProvedorCardProps) => {
    const [editMode, setEditMode] = useState(false);
    const [form, setForm] = useState({
        id: String(provedor.id),
        name: provedor.name || "",
        image_url: provedor.image_url || "",
        status: String(provedor.status),
        provedor: String(provedor.id),
        distribuidor: "",
        game_code: "",
    });
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState<string | null>(null);

    const isActive = form.status === "1";

    const handleInput = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setForm((prev) => ({ ...prev, [name]: value }));
    };

    const handleStatusChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (!canEdit) return;
        const newStatus = e.target.checked ? "1" : "0";
        setForm((prev) => ({ ...prev, status: newStatus }));
        onStatusChange?.(provedor.id, Number(newStatus));
    };

    const handleEdit = () => {
        if (!canEdit) return;
        setEditMode(true);
        setError(null);
        setSuccess(null);
    };

    const handleCancel = () => {
        setEditMode(false);
        setForm({
            id: String(provedor.id),
            name: provedor.name || "",
            image_url: provedor.image_url || "",
            status: String(provedor.status),
            provedor: String(provedor.id),
            distribuidor: "",
            game_code: "",
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
            setSuccess("Provedor atualizado com sucesso!");
            setEditMode(false);
        } catch (err: any) {
            setError(err?.message || "Erro ao atualizar provedor");
        } finally {
            setSaving(false);
        }
    };

    return (
        <Card className={!isActive ? "opacity-50" : ""}>
            <CardHeader>
                <div className="flex flex-col sm:justify-between gap-3 w-full">
                    <div className="flex items-center gap-3">
                        <div className="flex items-center gap-3">
                            <label
                                className={`relative inline-flex items-center ${
                                    canEdit
                                        ? "cursor-pointer"
                                        : "cursor-default"
                                }`}
                            >
                                <input
                                    type="checkbox"
                                    className="sr-only peer"
                                    checked={isActive}
                                    onChange={handleStatusChange}
                                    disabled={!canEdit || editMode}
                                />
                                <div className="relative w-11 h-6 bg-foreground/20 rounded-full peer peer-focus:ring-4 peer-focus:ring-primary/20 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-0.5 after:bg-white after:border-foreground/20 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
                            </label>
                        </div>
                        <div className="relative w-12 h-12 rounded-md overflow-hidden bg-background-secondary border border-foreground/10 shrink-0">
                            {form.image_url ? (
                                <Image
                                    src={form.image_url}
                                    alt={form.name}
                                    fill
                                    className="object-contain p-1"
                                    sizes="48px"
                                    unoptimized
                                />
                            ) : (
                                <div className="w-full h-full flex items-center justify-center text-xs text-foreground/40">
                                    {form.name.charAt(0)}
                                </div>
                            )}
                        </div>
                        <div className="flex flex-col">
                            {editMode ? (
                                <Input
                                    name="name"
                                    value={form.name}
                                    onChange={handleInput}
                                    className="font-bold text-base"
                                    placeholder="Nome do provedor"
                                />
                            ) : (
                                <h3 className="font-bold text-base">
                                    {form.name}
                                </h3>
                            )}
                            {editMode ? (
                                <Input
                                    name="image_url"
                                    value={form.image_url}
                                    onChange={handleInput}
                                    className="text-xs font-mono"
                                    placeholder="URL da imagem"
                                />
                            ) : (
                                <p className="text-xs text-foreground/60">
                                    Tipo de carteira: {provedor.type_wallet}
                                </p>
                            )}
                        </div>
                    </div>
                    {!editMode && canEdit && (
                        <Button
                            variant="outline"
                            onClick={handleEdit}
                            disabled={loading}
                            className="w-full"
                        >
                            Editar
                        </Button>
                    )}
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
                {editMode && (
                    <div className="flex flex-col gap-2 mt-4">
                        <Input
                            name="provedor"
                            value={form.provedor}
                            onChange={handleInput}
                            className="font-mono"
                            placeholder="ID do provedor"
                        />
                        <Input
                            name="distribuidor"
                            value={form.distribuidor}
                            onChange={handleInput}
                            className="font-mono"
                            placeholder="ID do distribuidor"
                        />
                        <Input
                            name="game_code"
                            value={form.game_code}
                            onChange={handleInput}
                            className="font-mono"
                            placeholder="Código do jogo"
                        />
                        <Input
                            name="status"
                            value={form.status}
                            onChange={handleInput}
                            className="font-mono"
                            placeholder="Status (1 = ativo, 0 = inativo)"
                        />
                        <div className="flex gap-2 mt-2">
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
                    </div>
                )}
            </CardContent>
        </Card>
    );
};

export default ProvedorCard;
