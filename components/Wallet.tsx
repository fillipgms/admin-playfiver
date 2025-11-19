"use client";

import React, { useEffect, useState } from "react";
import { Card, CardContent, CardHeader } from "./Card";
import { WalletIcon, PlusIcon, TrashIcon } from "@phosphor-icons/react";
import Icon from "./Icon";
import { Badge } from "./ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "./ui/dialog";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Drawer, DrawerContent, DrawerTitle } from "./ui/drawer";
import { ScrollArea } from "./ui/scroll-area";
import { usePermissions } from "@/hooks/usePermissions";

interface WalletGgrProps {
    id: number;
    tax: number;
    above: string;
    wallet: string;
    revendedor: number;
}

interface WalletProps {
    wallet: AdminWalletProps;
    ggrData: WalletGgrProps[];
    onGgrAdded?: () => void;
    onGgrDeleted?: (id: number) => void;
}

const CreateGgrForm = ({
    wallet,
    onClose,
    onGgrAdded,
}: {
    wallet: AdminWalletProps;
    onClose: () => void;
    onGgrAdded?: () => void;
}) => {
    const [tax, setTax] = useState("");
    const [above, setAbove] = useState("");
    const [revendedor, setRevendedor] = useState(false);
    const [submitting, setSubmitting] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setSubmitting(true);

        // TODO: Implementar chamada à API
        console.log("Criar GGR:", {
            tax: parseFloat(tax),
            above,
            wallet: wallet.name_wallet,
            revendedor: revendedor ? 1 : 0,
        });

        setTimeout(() => {
            setSubmitting(false);
            onGgrAdded?.();
            onClose();
        }, 500);
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
                />
            </div>

            <div className="flex items-center space-x-2">
                <input
                    type="checkbox"
                    id="revendedor"
                    checked={revendedor}
                    onChange={(e) => setRevendedor(e.target.checked)}
                    className="rounded border-foreground/20"
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
                    type="button"
                    variant="outline"
                    onClick={onClose}
                    className="flex-1"
                >
                    Cancelar
                </Button>
                <Button type="submit" disabled={submitting} className="flex-1">
                    {submitting ? "Criando..." : "Criar GGR"}
                </Button>
            </div>
        </form>
    );
};

const Wallet = ({ wallet, ggrData, onGgrAdded, onGgrDeleted }: WalletProps) => {
    const [isDesktop, setIsDesktop] = useState(false);
    const [showCreateGgr, setShowCreateGgr] = useState(false);
    const isDisabled = wallet.status !== 1;
    const { hasPermission } = usePermissions();
    const canCreateGgr = hasPermission("ggr_create");
    const canDeleteGgr = hasPermission("ggr_delete");

    useEffect(() => {
        const checkDesktop = () => {
            setIsDesktop(window.innerWidth >= 768);
        };
        checkDesktop();
        window.addEventListener("resize", checkDesktop);
        return () => window.removeEventListener("resize", checkDesktop);
    }, []);

    const walletGgrs = ggrData.filter((ggr) => ggr.wallet === wallet.name);

    const handleDeleteGgr = (id: number) => {
        if (confirm("Tem certeza que deseja excluir esta regra de GGR?")) {
            onGgrDeleted?.(id);
        }
    };

    return (
        <>
            <Card className={isDisabled ? "opacity-50" : ""}>
                <CardHeader>
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
                        <Badge
                            variant={
                                wallet.status === 1 ? "default" : "destructive"
                            }
                            className="w-fit"
                        >
                            {wallet.status === 1 ? "Ativo" : "Inativo"}
                        </Badge>
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
                            <h4 className="text-sm font-semibold">
                                Regras de GGR
                            </h4>
                            {canCreateGgr && (
                                <Button
                                    size="sm"
                                    onClick={() => setShowCreateGgr(true)}
                                    className="h-8 text-xs"
                                    disabled={isDisabled}
                                >
                                    <PlusIcon size={14} className="mr-1" />
                                    Adicionar
                                </Button>
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
                                                        ggr.above || "0"
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
                                            {canDeleteGgr && (
                                                <div className="flex items-center justify-end">
                                                    <button
                                                        onClick={() =>
                                                            handleDeleteGgr(
                                                                ggr.id
                                                            )
                                                        }
                                                        className="text-destructive hover:text-destructive/80 p-1"
                                                        aria-label="Excluir GGR"
                                                    >
                                                        <TrashIcon size={18} />
                                                    </button>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </CardContent>
            </Card>

            {/* Dialog para Desktop */}
            <Dialog
                open={Boolean(isDesktop && showCreateGgr)}
                onOpenChange={setShowCreateGgr}
            >
                <DialogContent className="bg-background-primary max-w-md">
                    <DialogHeader>
                        <DialogTitle>Adicionar Regra de GGR</DialogTitle>
                    </DialogHeader>
                    <CreateGgrForm
                        wallet={wallet}
                        onClose={() => setShowCreateGgr(false)}
                        onGgrAdded={onGgrAdded}
                    />
                </DialogContent>
            </Dialog>

            {/* Drawer para Mobile */}
            <Drawer
                open={Boolean(!isDesktop && showCreateGgr)}
                onOpenChange={setShowCreateGgr}
            >
                <DrawerContent className="bg-background-primary max-w-[calc(100vw-2rem)] mx-auto p-5 max-h-[90vh]">
                    <DrawerTitle className="mb-4 text-lg font-semibold">
                        Adicionar Regra de GGR
                    </DrawerTitle>
                    <ScrollArea className="max-h-[60vh]">
                        <CreateGgrForm
                            wallet={wallet}
                            onClose={() => setShowCreateGgr(false)}
                            onGgrAdded={onGgrAdded}
                        />
                    </ScrollArea>
                </DrawerContent>
            </Drawer>
        </>
    );
};

export default Wallet;
