"use client";

import React, { useState } from "react";
import { Card, CardContent, CardHeader } from "./Card";
import {
    WalletIcon,
    PlusIcon,
    TrashIcon,
    PencilIcon,
} from "@phosphor-icons/react";
import Icon from "./Icon";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { usePermissions } from "@/hooks/usePermissions";
import { UpdateWallet } from "@/actions/carteiras";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import {
    Credenza,
    CredenzaBody,
    CredenzaContent,
    CredenzaHeader,
    CredenzaTitle,
    CredenzaTrigger,
} from "./ui/credenza";

interface WalletGgrProps {
    id: number;
    tax: number;
    above: string;
    wallet: string;
    revendedor: number;
}

interface CreateGgrFormData {
    tax: string;
    above: string;
    revendedor: string;
    type: string;
}

interface EditGgrFormData {
    id: string;
    tax: string;
    above: string;
    revendedor: string;
    type: string;
}

interface WalletProps {
    wallet: AdminWalletProps;
    ggrData: WalletGgrProps[];
    onGgrAdded?: (data: CreateGgrFormData) => void;
    onGgrDeleted?: (id: number) => void;
    onGgrEdited: (data: EditGgrFormData) => void;
    isSubmitting?: boolean;
}

const CreateGgrForm = ({
    wallet,
    onGgrAdded,
    isSubmitting,
}: {
    wallet: AdminWalletProps;
    onGgrAdded?: (data: CreateGgrFormData) => void;
    isSubmitting?: boolean;
}) => {
    const [tax, setTax] = useState("");
    const [above, setAbove] = useState("");
    const [revendedor, setRevendedor] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        onGgrAdded?.({
            tax,
            above,
            revendedor: revendedor ? "1" : "0",
            type: wallet.id.toString(),
        });
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
                <label htmlFor="tax" className="text-sm font-medium">
                    Taxa (%)
                </label>
                <Input
                    id="tax"
                    type="number"
                    step="0.01"
                    min="0"
                    max="100"
                    value={tax}
                    onChange={(e) => setTax(e.target.value)}
                    placeholder="Ex: 5.5"
                    required
                    disabled={isSubmitting}
                />
            </div>

            <div className="space-y-2">
                <label htmlFor="above" className="text-sm font-medium">
                    Acima de (R$)
                </label>
                <Input
                    id="above"
                    type="number"
                    step="0.01"
                    min="0"
                    value={above}
                    onChange={(e) => setAbove(e.target.value)}
                    placeholder="Ex: 1000.00"
                    required
                    disabled={isSubmitting}
                />
            </div>

            <div className="flex items-center space-x-2">
                <input
                    type="checkbox"
                    id="revendedor"
                    checked={revendedor}
                    onChange={(e) => setRevendedor(e.target.checked)}
                    className="rounded border-foreground/20"
                    disabled={isSubmitting}
                />
                <label
                    htmlFor="revendedor"
                    className="text-sm font-medium cursor-pointer"
                >
                    Aceita Revendedor?
                </label>
            </div>

            <div className="flex gap-2 pt-4">
                <Button
                    type="submit"
                    disabled={isSubmitting}
                    className="flex-1"
                >
                    {isSubmitting ? "Criando..." : "Criar GGR"}
                </Button>
            </div>
        </form>
    );
};

const EditGgrForm = ({
    ggr,
    wallet,
    onGgrEdited,
    isSubmitting,
}: {
    ggr: WalletGgrProps;
    wallet: AdminWalletProps;
    onGgrEdited?: (data: EditGgrFormData) => void;
    isSubmitting?: boolean;
}) => {
    const [tax, setTax] = useState(String(ggr.tax));
    const [above, setAbove] = useState(ggr.above);
    const [revendedor, setRevendedor] = useState(ggr.revendedor === 1);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        onGgrEdited?.({
            id: String(ggr.id),
            tax: tax,
            above,
            revendedor: revendedor ? "1" : "0",
            type: wallet.id.toString(),
        });
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
                <label htmlFor="tax" className="text-sm font-medium">
                    Taxa (%)
                </label>
                <Input
                    id="tax"
                    type="number"
                    step="0.01"
                    min="0"
                    max="100"
                    value={tax}
                    onChange={(e) => setTax(e.target.value)}
                    placeholder="Ex: 5.5"
                    required
                    disabled={isSubmitting}
                />
            </div>

            <div className="space-y-2">
                <label htmlFor="above" className="text-sm font-medium">
                    Acima de (R$)
                </label>
                <Input
                    id="above"
                    type="number"
                    step="0.01"
                    min="0"
                    value={above}
                    onChange={(e) => setAbove(e.target.value)}
                    placeholder="Ex: 1000.00"
                    required
                    disabled={isSubmitting}
                />
            </div>

            <div className="flex items-center space-x-2">
                <input
                    type="checkbox"
                    id="revendedor"
                    checked={revendedor}
                    onChange={(e) => setRevendedor(e.target.checked)}
                    className="rounded border-foreground/20"
                    disabled={isSubmitting}
                />
                <label
                    htmlFor="revendedor"
                    className="text-sm font-medium cursor-pointer"
                >
                    Aceita Revendedor?
                </label>
            </div>

            <div className="flex gap-2 pt-4">
                <Button
                    type="submit"
                    disabled={isSubmitting}
                    className="flex-1"
                >
                    {isSubmitting ? "Atualizando..." : "Atualizar"}
                </Button>
            </div>
        </form>
    );
};

const Wallet = ({
    wallet,
    ggrData,
    onGgrAdded,
    onGgrDeleted,
    onGgrEdited,
    isSubmitting,
}: WalletProps) => {
    const isDisabled = wallet.status !== 1;
    const { hasPermission } = usePermissions();
    const canCreateGgr = hasPermission("ggr_create");
    const canDeleteGgr = hasPermission("ggr_delete");
    const canEditGgr = hasPermission("ggr_edit");

    const walletGgrs = ggrData.filter((ggr) => ggr.wallet === wallet.name);

    const handleDeleteGgr = (id: number) => {
        if (confirm("Tem certeza que deseja excluir esta regra de GGR?")) {
            onGgrDeleted?.(id);
        }
    };

    const router = useRouter();

    const isActive = wallet.status === 1;

    const canEdit = hasPermission("wallet_edit_status");

    const handleStatusChange = async (
        e: React.ChangeEvent<HTMLInputElement>,
    ) => {
        if (!canEdit) return;
        const newStatus = e.target.checked;
        const res = await UpdateWallet(wallet.id, newStatus);

        if (res.status == 1) {
            toast.success("carteira atualizada com sucesso");
            router.refresh();
        } else {
            toast.error(res.msg);
        }
    };

    return (
        <Card className={isDisabled ? "opacity-50" : ""}>
            <CardHeader>
                <div className="flex items-center gap-3">
                    <div className="flex items-center gap-3">
                        <label
                            className={`relative inline-flex items-center ${
                                canEdit ? "cursor-pointer" : "cursor-default"
                            }`}
                        >
                            <input
                                type="checkbox"
                                className="sr-only peer"
                                checked={isActive}
                                onChange={handleStatusChange}
                                disabled={!canEdit}
                            />
                            <div className="relative w-11 h-6 bg-foreground/20 rounded-full peer peer-focus:ring-4 peer-focus:ring-primary/20 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-0.5 after:bg-white after:border-foreground/20 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
                        </label>
                    </div>
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                        <div className="flex items-center gap-2">
                            <Icon>
                                <WalletIcon />
                            </Icon>
                            <div className="flex flex-col">
                                <h3 className="font-bold text-base">
                                    {wallet.name}
                                </h3>
                                <p className="text-xs text-foreground/60 font-mono">
                                    {wallet.name_wallet}
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </CardHeader>

            <CardContent className="space-y-4">
                {wallet.description && (
                    <div className="text-sm text-foreground/70">
                        {wallet.description}
                    </div>
                )}

                <div className="border-t border-foreground/10 pt-4">
                    <div className="flex items-center justify-between mb-3">
                        <h4 className="text-sm font-semibold">Regras de GGR</h4>
                        {canCreateGgr && (
                            <Credenza>
                                <CredenzaTrigger asChild>
                                    <Button
                                        size="sm"
                                        className="h-8 text-xs"
                                        disabled={isDisabled || isSubmitting}
                                    >
                                        <PlusIcon size={14} className="mr-1" />
                                        Adicionar
                                    </Button>
                                </CredenzaTrigger>
                                <CredenzaContent className="bg-background-primary">
                                    <CredenzaHeader>
                                        <CredenzaTitle>
                                            Adicionar Regra de GGR
                                        </CredenzaTitle>
                                    </CredenzaHeader>
                                    <CredenzaBody>
                                        <CreateGgrForm
                                            wallet={wallet}
                                            onGgrAdded={onGgrAdded}
                                            isSubmitting={isSubmitting}
                                        />
                                    </CredenzaBody>
                                </CredenzaContent>
                            </Credenza>
                        )}
                    </div>

                    {walletGgrs.length === 0 ? (
                        <div className="text-sm text-foreground/50 text-center py-4 border border-dashed border-foreground/20 rounded">
                            Nenhuma regra de GGR configurada
                        </div>
                    ) : (
                        <div className="space-y-2">
                            {walletGgrs.map((ggr) => (
                                <div
                                    key={ggr.id}
                                    className="flex items-center justify-between p-3 bg-background-secondary rounded border border-foreground/10"
                                >
                                    <div className="flex-1 grid grid-cols-2 sm:grid-cols-4 gap-2 text-sm">
                                        <div>
                                            <span className="text-foreground/50 text-xs">
                                                Taxa:
                                            </span>
                                            <p className="font-medium">
                                                {ggr.tax}%
                                            </p>
                                        </div>
                                        <div>
                                            <span className="text-foreground/50 text-xs">
                                                Acima de:
                                            </span>
                                            <p className="font-medium">
                                                R${" "}
                                                {parseFloat(
                                                    ggr.above || "0",
                                                ).toLocaleString("pt-BR", {
                                                    minimumFractionDigits: 2,
                                                    maximumFractionDigits: 2,
                                                })}
                                            </p>
                                        </div>
                                        <div>
                                            <span className="text-foreground/50 text-xs">
                                                Revendedor:
                                            </span>
                                            <p className="font-medium">
                                                {ggr.revendedor === 1
                                                    ? "Sim"
                                                    : "Não"}
                                            </p>
                                        </div>
                                        <div className="flex items-center gap-4">
                                            {canEditGgr && (
                                                <Credenza>
                                                    <CredenzaTrigger asChild>
                                                        <button
                                                            className="text-yellow-400 hover:text-yellow-400/80 p-1"
                                                            title="Editar agente"
                                                        >
                                                            <PencilIcon
                                                                size={14}
                                                            />
                                                            <span className="sr-only">
                                                                Editar
                                                            </span>
                                                        </button>
                                                    </CredenzaTrigger>
                                                    <CredenzaContent className="bg-background-primary">
                                                        <CredenzaHeader>
                                                            <CredenzaTitle>
                                                                Editar Regra de
                                                                GGR
                                                            </CredenzaTitle>
                                                        </CredenzaHeader>
                                                        <CredenzaBody>
                                                            <EditGgrForm
                                                                ggr={ggr}
                                                                wallet={wallet}
                                                                onGgrEdited={
                                                                    onGgrEdited
                                                                }
                                                                isSubmitting={
                                                                    isSubmitting
                                                                }
                                                            />
                                                        </CredenzaBody>
                                                    </CredenzaContent>
                                                </Credenza>
                                            )}
                                            {canDeleteGgr && (
                                                <div className="flex items-center justify-end">
                                                    <button
                                                        onClick={() =>
                                                            handleDeleteGgr(
                                                                ggr.id,
                                                            )
                                                        }
                                                        className="text-destructive hover:text-destructive/80 p-1"
                                                        aria-label="Excluir GGR"
                                                        disabled={isSubmitting}
                                                    >
                                                        <TrashIcon size={18} />
                                                    </button>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </CardContent>
        </Card>
    );
};

export default Wallet;
