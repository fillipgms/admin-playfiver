"use client";

import { Button } from "@/components/ui/button";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { useState, useEffect } from "react";
import { toast } from "sonner";

interface Wallet {
    wallet: string;
    saldo: string;
    id: string;
    status: number;
}

interface User {
    id: number;
    name: string;
    email: string;
    ban: number;
    saldo: number;
    wallets: Wallet[];
    role: string[];
    limit: boolean;
    limits: {
        limit_amount?: string;
        limit_hours?: string;
        max_gain_amount?: string;
        bonus_hours?: string;
        free_spins_hours?: string;
        distributor_limit_amount?: string;
        distributor_limit_hours?: string;
        distributor_max_gain_amount?: string;
        distributor_bonus_quantity?: string;
        distributor_free_spins_quantity?: string;
    } | null;
}

interface BettingLimitsModalProps {
    isOpen: boolean;
    onClose: () => void;
    user: User;
}

export default function BettingLimitsModal({
    isOpen,
    onClose,
    user,
}: BettingLimitsModalProps) {
    const [limitEnabled, setLimitEnabled] = useState(false);
    const [distributorLimitEnabled, setDistributorLimitEnabled] =
        useState(false);
    const [formData, setFormData] = useState({
        limit_hours: "",
        distributor_limit_hours: "",
        limit_amount: "",
        distributor_limit_amount: "",
        max_gain_amount: "",
        distributor_max_gain_amount: "",
        bonus_hours: "",
        free_spins_hours: "",
        distributor_bonus_quantity: "",
        distributor_free_spins_quantity: "",
    });

    useEffect(() => {
        if (isOpen) {
            setLimitEnabled(user.limit || false);
            setDistributorLimitEnabled(false);
            setFormData({
                limit_hours: user.limits?.limit_hours || "",
                distributor_limit_hours:
                    user.limits?.distributor_limit_hours || "",
                limit_amount: user.limits?.limit_amount || "",
                distributor_limit_amount:
                    user.limits?.distributor_limit_amount || "",
                max_gain_amount: user.limits?.max_gain_amount || "",
                distributor_max_gain_amount:
                    user.limits?.distributor_max_gain_amount || "",
                bonus_hours: user.limits?.bonus_hours || "",
                free_spins_hours: user.limits?.free_spins_hours || "",
                distributor_bonus_quantity:
                    user.limits?.distributor_bonus_quantity || "",
                distributor_free_spins_quantity:
                    user.limits?.distributor_free_spins_quantity || "",
            });
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [isOpen]);

    const handleSubmit = () => {
        // TODO: Implementar envio para API
        toast.success(`Limites de apostas configurados para ${user.name}`);
        onClose();
    };

    const handleInputChange = (field: string, value: string) => {
        setFormData((prev) => ({ ...prev, [field]: value }));
    };

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="sm:max-w-4xl bg-background-primary max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle>Limites de apostas</DialogTitle>
                    <DialogDescription>
                        Configure os limites de apostas para {user.name}
                    </DialogDescription>
                </DialogHeader>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 py-4">
                    {/* Coluna Esquerda - Limites Gerais */}
                    <div className="space-y-4">
                        <h3 className="font-semibold text-sm mb-3">
                            Limites Gerais
                        </h3>

                        <div className="flex items-center justify-between">
                            <label className="text-sm">Limite de aposta?</label>
                            <button
                                type="button"
                                onClick={() => setLimitEnabled(!limitEnabled)}
                                className={`
                                    relative inline-flex h-6 w-11 items-center rounded-full transition-colors
                                    ${
                                        limitEnabled
                                            ? "bg-primary"
                                            : "bg-foreground/20"
                                    }
                                `}
                            >
                                <span
                                    className={`
                                        inline-block h-4 w-4 transform rounded-full bg-white transition-transform
                                        ${
                                            limitEnabled
                                                ? "translate-x-6"
                                                : "translate-x-1"
                                        }
                                    `}
                                />
                            </button>
                        </div>

                        <div>
                            <label className="text-sm block mb-1">
                                Quantidade de horas
                            </label>
                            <Input
                                type="number"
                                value={formData.limit_hours}
                                onChange={(e) =>
                                    handleInputChange(
                                        "limit_hours",
                                        e.target.value
                                    )
                                }
                                placeholder="Ex: 24"
                                disabled={!limitEnabled}
                            />
                        </div>

                        <div>
                            <label className="text-sm block mb-1">
                                Quantia de limite
                            </label>
                            <Input
                                type="number"
                                step="0.01"
                                value={formData.limit_amount}
                                onChange={(e) =>
                                    handleInputChange(
                                        "limit_amount",
                                        e.target.value
                                    )
                                }
                                placeholder="Ex: 1000.00"
                                disabled={!limitEnabled}
                            />
                        </div>

                        <div>
                            <label className="text-sm block mb-1">
                                Quantia máxima para o ganho ser somado no saldo
                            </label>
                            <Input
                                type="number"
                                step="0.01"
                                value={formData.max_gain_amount}
                                onChange={(e) =>
                                    handleInputChange(
                                        "max_gain_amount",
                                        e.target.value
                                    )
                                }
                                placeholder="Ex: 5000.00"
                                disabled={!limitEnabled}
                            />
                        </div>

                        <div>
                            <label className="text-sm block mb-1">
                                Quantidade de horas do bônus
                            </label>
                            <Input
                                type="number"
                                value={formData.bonus_hours}
                                onChange={(e) =>
                                    handleInputChange(
                                        "bonus_hours",
                                        e.target.value
                                    )
                                }
                                placeholder="Ex: 48"
                                disabled={!limitEnabled}
                            />
                        </div>

                        <div>
                            <label className="text-sm block mb-1">
                                Quantidade de horas das rodadas grátis
                            </label>
                            <Input
                                type="number"
                                value={formData.free_spins_hours}
                                onChange={(e) =>
                                    handleInputChange(
                                        "free_spins_hours",
                                        e.target.value
                                    )
                                }
                                placeholder="Ex: 72"
                                disabled={!limitEnabled}
                            />
                        </div>
                    </div>

                    {/* Coluna Direita - Limites de Distribuidoras */}
                    <div className="space-y-4">
                        <h3 className="font-semibold text-sm mb-3">
                            Limites de Distribuidoras
                        </h3>

                        <div className="flex items-center justify-between">
                            <label className="text-sm">
                                Limite de aposta das distribuidoras?
                            </label>
                            <button
                                type="button"
                                onClick={() =>
                                    setDistributorLimitEnabled(
                                        !distributorLimitEnabled
                                    )
                                }
                                className={`
                                    relative inline-flex h-6 w-11 items-center rounded-full transition-colors
                                    ${
                                        distributorLimitEnabled
                                            ? "bg-primary"
                                            : "bg-foreground/20"
                                    }
                                `}
                            >
                                <span
                                    className={`
                                        inline-block h-4 w-4 transform rounded-full bg-white transition-transform
                                        ${
                                            distributorLimitEnabled
                                                ? "translate-x-6"
                                                : "translate-x-1"
                                        }
                                    `}
                                />
                            </button>
                        </div>

                        <div>
                            <label className="text-sm block mb-1">
                                Quantidade de horas das distribuidoras
                            </label>
                            <Input
                                type="number"
                                value={formData.distributor_limit_hours}
                                onChange={(e) =>
                                    handleInputChange(
                                        "distributor_limit_hours",
                                        e.target.value
                                    )
                                }
                                placeholder="Ex: 24"
                                disabled={!distributorLimitEnabled}
                            />
                        </div>

                        <div>
                            <label className="text-sm block mb-1">
                                Quantia de limite das distribuidoras
                            </label>
                            <Input
                                type="number"
                                step="0.01"
                                value={formData.distributor_limit_amount}
                                onChange={(e) =>
                                    handleInputChange(
                                        "distributor_limit_amount",
                                        e.target.value
                                    )
                                }
                                placeholder="Ex: 2000.00"
                                disabled={!distributorLimitEnabled}
                            />
                        </div>

                        <div>
                            <label className="text-sm block mb-1">
                                Quantia máxima para o ganho ser somado no saldo
                                (Distribuidor)
                            </label>
                            <Input
                                type="number"
                                step="0.01"
                                value={formData.distributor_max_gain_amount}
                                onChange={(e) =>
                                    handleInputChange(
                                        "distributor_max_gain_amount",
                                        e.target.value
                                    )
                                }
                                placeholder="Ex: 10000.00"
                                disabled={!distributorLimitEnabled}
                            />
                        </div>

                        <div>
                            <label className="text-sm block mb-1">
                                Quantidade de bônus
                            </label>
                            <Input
                                type="number"
                                value={formData.distributor_bonus_quantity}
                                onChange={(e) =>
                                    handleInputChange(
                                        "distributor_bonus_quantity",
                                        e.target.value
                                    )
                                }
                                placeholder="Ex: 10"
                                disabled={!distributorLimitEnabled}
                            />
                        </div>

                        <div>
                            <label className="text-sm block mb-1">
                                Quantidade de rodadas grátis
                            </label>
                            <Input
                                type="number"
                                value={formData.distributor_free_spins_quantity}
                                onChange={(e) =>
                                    handleInputChange(
                                        "distributor_free_spins_quantity",
                                        e.target.value
                                    )
                                }
                                placeholder="Ex: 20"
                                disabled={!distributorLimitEnabled}
                            />
                        </div>
                    </div>
                </div>

                <DialogFooter className="flex gap-2">
                    <Button variant="outline" onClick={onClose}>
                        Cancelar
                    </Button>
                    <Button
                        onClick={handleSubmit}
                        className="bg-primary hover:bg-primary/90"
                    >
                        Criar
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
