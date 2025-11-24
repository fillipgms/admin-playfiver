"use client";

import {
    Credenza,
    CredenzaBody,
    CredenzaContent,
    CredenzaFooter,
    CredenzaHeader,
    CredenzaTitle,
    CredenzaTrigger,
    CredenzaClose,
} from "@/components/ui/credenza";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "./ui/switch";
import { FadersIcon } from "@phosphor-icons/react/dist/ssr";
import { useState } from "react";
import { updateUserLimits } from "@/actions/user";
import { toast } from "sonner";

interface UserLimitsModalProps {
    userId: number;
    initialData?: any;
}

const UserLimits = ({ userId, initialData = {} }: UserLimitsModalProps) => {
    const [isOpen, setIsOpen] = useState(false);
    const [isLoading, setIsLoading] = useState(false);

    const [formData, setFormData] = useState({
        limit_enable: initialData.limit_enable === 1,
        limit_enable_distribuidor: initialData.limit_enable_distribuidor === 1,

        number_of_hours: initialData.number_of_hours || "",
        number_of_hours_distribuidor:
            initialData.number_of_hours_distribuidor || "",
        max_win_amount: initialData.max_win_amount || "",
        bonus_hours: initialData.bonus_hours || "",
        free_spin_hours: initialData.free_spin_hours || "",

        limit_amount: initialData.limit_amount || "",
        limite_amount_distribuidor:
            initialData.limite_amount_distribuidor || "",
        max_win_amount_distribuidor:
            initialData.max_win_amount_distribuidor || "",
        limit_quantity_bonus: initialData.limit_quantity_bonus || "",
        quantity_rounds_free: initialData.quantity_rounds_free || "",
    });

    const handleChange = (field: string, value: string | boolean) => {
        setFormData((prev) => ({
            ...prev,
            [field]: value,
        }));
    };

    const handleSave = async () => {
        setIsLoading(true);
        try {
            const payload = {
                limit_enable: formData.limit_enable ? 1 : 0,
                limit_enable_distribuidor: formData.limit_enable_distribuidor
                    ? 1
                    : 0,

                number_of_hours: formData.number_of_hours,
                number_of_hours_distribuidor:
                    formData.number_of_hours_distribuidor,
                max_win_amount: formData.max_win_amount,
                bonus_hours: formData.bonus_hours,
                free_spin_hours: formData.free_spin_hours,

                limit_amount: formData.limit_amount,
                limite_amount_distribuidor: formData.limite_amount_distribuidor,
                max_win_amount_distribuidor:
                    formData.max_win_amount_distribuidor,
                limit_quantity_bonus: formData.limit_quantity_bonus,
                quantity_rounds_free: formData.quantity_rounds_free,
            };

            const result = await updateUserLimits(userId, payload);

            if (result.success) {
                toast.success("Limites atualizados com sucesso!");
                setIsOpen(false);
            } else {
                toast.error(result.error || "Erro ao atualizar limites");
            }
        } catch (err) {
            toast.error("Erro inesperado");
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
                    className="h-8 px-3 gap-2"
                    title="Configurar Limites"
                >
                    <FadersIcon size={14} />
                    <span className="sr-only">Limites</span>
                </Button>
            </CredenzaTrigger>
            <CredenzaContent className="bg-background-primary sm:max-w-[800px]">
                <CredenzaHeader>
                    <CredenzaTitle>Limites de Apostas</CredenzaTitle>
                </CredenzaHeader>
                <CredenzaBody className="py-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8">
                        <div className="space-y-4">
                            <div className="flex items-center justify-between border p-3 rounded-lg bg-muted/20">
                                <Label
                                    htmlFor="limit_enable"
                                    className="font-medium cursor-pointer"
                                >
                                    Limite de aposta?
                                </Label>
                                <Switch
                                    id="limit_enable"
                                    checked={formData.limit_enable}
                                    onCheckedChange={(v) =>
                                        handleChange("limit_enable", v)
                                    }
                                />
                            </div>

                            <div className="space-y-3">
                                <div className="space-y-1">
                                    <Label className="text-xs text-muted-foreground">
                                        Quantidade de horas
                                    </Label>
                                    <Input
                                        type="number"
                                        value={formData.number_of_hours}
                                        onChange={(e) =>
                                            handleChange(
                                                "number_of_hours",
                                                e.target.value
                                            )
                                        }
                                    />
                                </div>
                                <div className="space-y-1">
                                    <Label className="text-xs text-muted-foreground">
                                        Qtd. horas (Distribuidoras)
                                    </Label>
                                    <Input
                                        type="number"
                                        value={
                                            formData.number_of_hours_distribuidor
                                        }
                                        onChange={(e) =>
                                            handleChange(
                                                "number_of_hours_distribuidor",
                                                e.target.value
                                            )
                                        }
                                    />
                                </div>
                                <div className="space-y-1">
                                    <Label className="text-xs text-muted-foreground">
                                        Ganho máx. para somar ao saldo
                                    </Label>
                                    <Input
                                        type="number"
                                        value={formData.max_win_amount}
                                        onChange={(e) =>
                                            handleChange(
                                                "max_win_amount",
                                                e.target.value
                                            )
                                        }
                                    />
                                </div>
                                <div className="space-y-1">
                                    <Label className="text-xs text-muted-foreground">
                                        Qtd. horas do bônus
                                    </Label>
                                    <Input
                                        type="number"
                                        value={formData.bonus_hours}
                                        onChange={(e) =>
                                            handleChange(
                                                "bonus_hours",
                                                e.target.value
                                            )
                                        }
                                    />
                                </div>
                                <div className="space-y-1">
                                    <Label className="text-xs text-muted-foreground">
                                        Qtd. horas rodadas grátis
                                    </Label>
                                    <Input
                                        type="number"
                                        value={formData.free_spin_hours}
                                        onChange={(e) =>
                                            handleChange(
                                                "free_spin_hours",
                                                e.target.value
                                            )
                                        }
                                    />
                                </div>
                            </div>
                        </div>

                        <div className="space-y-4">
                            <div className="flex items-center justify-between border p-3 rounded-lg bg-muted/20">
                                <Label
                                    htmlFor="limit_enable_distribuidor"
                                    className="font-medium cursor-pointer"
                                >
                                    Limite (Distribuidoras)?
                                </Label>
                                <Switch
                                    id="limit_enable_distribuidor"
                                    checked={formData.limit_enable_distribuidor}
                                    onCheckedChange={(v) =>
                                        handleChange(
                                            "limit_enable_distribuidor",
                                            v
                                        )
                                    }
                                />
                            </div>

                            <div className="space-y-3">
                                <div className="space-y-1">
                                    <Label className="text-xs text-muted-foreground">
                                        Quantia de limite
                                    </Label>
                                    <Input
                                        type="number"
                                        value={formData.limit_amount}
                                        onChange={(e) =>
                                            handleChange(
                                                "limit_amount",
                                                e.target.value
                                            )
                                        }
                                    />
                                </div>
                                <div className="space-y-1">
                                    <Label className="text-xs text-muted-foreground">
                                        Quantia limite (Distribuidoras)
                                    </Label>
                                    <Input
                                        type="number"
                                        value={
                                            formData.limite_amount_distribuidor
                                        }
                                        onChange={(e) =>
                                            handleChange(
                                                "limite_amount_distribuidor",
                                                e.target.value
                                            )
                                        }
                                    />
                                </div>
                                <div className="space-y-1">
                                    <Label className="text-xs text-muted-foreground">
                                        Ganho máx. saldo (Distribuidor)
                                    </Label>
                                    <Input
                                        type="number"
                                        value={
                                            formData.max_win_amount_distribuidor
                                        }
                                        onChange={(e) =>
                                            handleChange(
                                                "max_win_amount_distribuidor",
                                                e.target.value
                                            )
                                        }
                                    />
                                </div>
                                <div className="space-y-1">
                                    <Label className="text-xs text-muted-foreground">
                                        Quantidade de bônus
                                    </Label>
                                    <Input
                                        type="number"
                                        value={formData.limit_quantity_bonus}
                                        onChange={(e) =>
                                            handleChange(
                                                "limit_quantity_bonus",
                                                e.target.value
                                            )
                                        }
                                    />
                                </div>
                                <div className="space-y-1">
                                    <Label className="text-xs text-muted-foreground">
                                        Quantidade rodadas grátis
                                    </Label>
                                    <Input
                                        type="number"
                                        value={formData.quantity_rounds_free}
                                        onChange={(e) =>
                                            handleChange(
                                                "quantity_rounds_free",
                                                e.target.value
                                            )
                                        }
                                    />
                                </div>
                            </div>
                        </div>
                    </div>
                </CredenzaBody>
                <CredenzaFooter className="gap-2">
                    <CredenzaClose asChild>
                        <Button
                            variant="outline"
                            type="button"
                            disabled={isLoading}
                        >
                            Cancelar
                        </Button>
                    </CredenzaClose>
                    <Button
                        onClick={handleSave}
                        disabled={isLoading}
                        className="bg-cyan-600 hover:bg-cyan-700"
                    >
                        {isLoading ? "Salvando..." : "Criar / Salvar"}
                    </Button>
                </CredenzaFooter>
            </CredenzaContent>
        </Credenza>
    );
};

export default UserLimits;
