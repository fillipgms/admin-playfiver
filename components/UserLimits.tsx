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
import { useState, useEffect } from "react";
import { updateUserLimits, deleteUserLimits } from "@/actions/user";
import { toast } from "sonner";
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from "@/components/ui/alert-dialog";

interface UserLimitsModalProps {
    userId: number;
    initialData?: any;
}

const UserLimits = ({ userId, initialData = {} }: UserLimitsModalProps) => {
    const [isOpen, setIsOpen] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [showDeleteDialog, setShowDeleteDialog] = useState(false);
    const [isDeleting, setIsDeleting] = useState(false);

    const [formData, setFormData] = useState({
        limit_enable: initialData.limit_enable === 1,
        limit_enable_distribuidor: initialData.limit_enable_distribuidor === 1,
        limit_hours: initialData.limit_hours || "",
        limite_amount: initialData.limite_amount || "",
        limit_hours_distribuidor: initialData.limit_hours_distribuidor || "",
        limite_amount_distribuidor:
            initialData.limite_amount_distribuidor || "",
        limit_max: initialData.limit_max || "",
        limit_max_distribuidor: initialData.limit_max_distribuidor || "",
        limit_hours_bonus: initialData.limit_hours_bonus || "",
        limit_quantity_bonus: initialData.limit_quantity_bonus || "",
        number_of_hours: initialData.number_of_hours || "",
        quantity_rounds_free: initialData.quantity_rounds_free || "",
    });

    useEffect(() => {
        setFormData({
            limit_enable: initialData.limit_enable === 1,
            limit_enable_distribuidor:
                initialData.limit_enable_distribuidor === 1,
            limit_hours: initialData.limit_hours || "",
            limite_amount: initialData.limite_amount || "",
            limit_hours_distribuidor:
                initialData.limit_hours_distribuidor || "",
            limite_amount_distribuidor:
                initialData.limite_amount_distribuidor || "",
            limit_max: initialData.limit_max || "",
            limit_max_distribuidor: initialData.limit_max_distribuidor || "",
            limit_hours_bonus: initialData.limit_hours_bonus || "",
            limit_quantity_bonus: initialData.limit_quantity_bonus || "",
            number_of_hours: initialData.number_of_hours || "",
            quantity_rounds_free: initialData.quantity_rounds_free || "",
        });
    }, [initialData]);

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
                limit_hours: formData.limit_hours,
                limite_amount: formData.limite_amount,
                limit_hours_distribuidor: formData.limit_hours_distribuidor,
                limite_amount_distribuidor: formData.limite_amount_distribuidor,
                limit_max: formData.limit_max,
                limit_max_distribuidor: formData.limit_max_distribuidor,
                limit_hours_bonus: formData.limit_hours_bonus,
                limit_quantity_bonus: formData.limit_quantity_bonus,
                number_of_hours: formData.number_of_hours,
                quantity_rounds_free: formData.quantity_rounds_free,
            };

            const result = await updateUserLimits(userId, payload);

            if (result.success) {
                toast.success("Limites aplicados com sucesso!");
                setIsOpen(false);
                // Refresh the page to get updated data
                window.location.reload();
            } else {
                toast.error(result.error || "Erro ao atualizar limites");
            }
        } catch (err) {
            toast.error("Erro inesperado");
        } finally {
            setIsLoading(false);
        }
    };

    const handleDelete = async () => {
        setIsDeleting(true);
        try {
            const result = await deleteUserLimits(userId);

            if (result.success) {
                toast.success("Limite excluído com sucesso!");
                setShowDeleteDialog(false);
                setIsOpen(false);
                // Refresh the page to get updated data
                window.location.reload();
            } else {
                toast.error(result.error || "Erro ao deletar limite");
            }
        } catch (err) {
            toast.error("Erro inesperado ao deletar limite");
        } finally {
            setIsDeleting(false);
        }
    };

    return (
        <>
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
                        <div className="space-y-6">
                            {/* Toggle Switches */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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

                                <div className="flex items-center justify-between border p-3 rounded-lg bg-muted/20">
                                    <Label
                                        htmlFor="limit_enable_distribuidor"
                                        className="font-medium cursor-pointer"
                                    >
                                        Limite de aposta das distribuidoras?
                                    </Label>
                                    <Switch
                                        id="limit_enable_distribuidor"
                                        checked={
                                            formData.limit_enable_distribuidor
                                        }
                                        onCheckedChange={(v) =>
                                            handleChange(
                                                "limit_enable_distribuidor",
                                                v,
                                            )
                                        }
                                    />
                                </div>
                            </div>

                            {/* Regular User Limits */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="space-y-1">
                                    <Label className="text-sm font-medium">
                                        Quantidade de horas
                                    </Label>
                                    <Input
                                        type="number"
                                        value={formData.limit_hours}
                                        onChange={(e) =>
                                            handleChange(
                                                "limit_hours",
                                                e.target.value,
                                            )
                                        }
                                        disabled={!formData.limit_enable}
                                        className="disabled:opacity-50 disabled:cursor-not-allowed"
                                    />
                                </div>
                                <div className="space-y-1">
                                    <Label className="text-sm font-medium">
                                        Quantia de limite
                                    </Label>
                                    <Input
                                        type="number"
                                        value={formData.limite_amount}
                                        onChange={(e) =>
                                            handleChange(
                                                "limite_amount",
                                                e.target.value,
                                            )
                                        }
                                        disabled={!formData.limit_enable}
                                        className="disabled:opacity-50 disabled:cursor-not-allowed"
                                    />
                                </div>
                            </div>

                            {/* Distributor Limits */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="space-y-1">
                                    <Label className="text-sm font-medium">
                                        Quantidade de horas das distribuidoras
                                    </Label>
                                    <Input
                                        type="number"
                                        value={
                                            formData.limit_hours_distribuidor
                                        }
                                        onChange={(e) =>
                                            handleChange(
                                                "limit_hours_distribuidor",
                                                e.target.value,
                                            )
                                        }
                                        disabled={
                                            !formData.limit_enable_distribuidor
                                        }
                                        className="disabled:opacity-50 disabled:cursor-not-allowed"
                                    />
                                </div>
                                <div className="space-y-1">
                                    <Label className="text-sm font-medium">
                                        Quantia de limite das distribuidoras
                                    </Label>
                                    <Input
                                        type="number"
                                        value={
                                            formData.limite_amount_distribuidor
                                        }
                                        onChange={(e) =>
                                            handleChange(
                                                "limite_amount_distribuidor",
                                                e.target.value,
                                            )
                                        }
                                        disabled={
                                            !formData.limit_enable_distribuidor
                                        }
                                        className="disabled:opacity-50 disabled:cursor-not-allowed"
                                    />
                                </div>
                            </div>

                            {/* Max Win Amounts */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="space-y-1">
                                    <Label className="text-sm font-medium">
                                        Quantia máxima para o ganho ser somado
                                        no saldo?
                                    </Label>
                                    <Input
                                        type="number"
                                        value={formData.limit_max}
                                        onChange={(e) =>
                                            handleChange(
                                                "limit_max",
                                                e.target.value,
                                            )
                                        }
                                    />
                                </div>
                                <div className="space-y-1">
                                    <Label className="text-sm font-medium">
                                        Quantia máxima para o ganho ser somado
                                        no saldo (Distribuidor)
                                    </Label>
                                    <Input
                                        type="number"
                                        value={formData.limit_max_distribuidor}
                                        onChange={(e) =>
                                            handleChange(
                                                "limit_max_distribuidor",
                                                e.target.value,
                                            )
                                        }
                                    />
                                </div>
                            </div>

                            {/* Bonus Settings */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="space-y-1">
                                    <Label className="text-sm font-medium">
                                        Quantidade de horas do bônus
                                    </Label>
                                    <Input
                                        type="number"
                                        value={formData.limit_hours_bonus}
                                        onChange={(e) =>
                                            handleChange(
                                                "limit_hours_bonus",
                                                e.target.value,
                                            )
                                        }
                                    />
                                </div>
                                <div className="space-y-1">
                                    <Label className="text-sm font-medium">
                                        Quantidade de bônus
                                    </Label>
                                    <Input
                                        type="number"
                                        value={formData.limit_quantity_bonus}
                                        onChange={(e) =>
                                            handleChange(
                                                "limit_quantity_bonus",
                                                e.target.value,
                                            )
                                        }
                                    />
                                </div>
                            </div>

                            {/* Free Spins Settings */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="space-y-1">
                                    <Label className="text-sm font-medium">
                                        Quantidade de horas da rodadas grátis
                                    </Label>
                                    <Input
                                        type="number"
                                        value={formData.number_of_hours}
                                        onChange={(e) =>
                                            handleChange(
                                                "number_of_hours",
                                                e.target.value,
                                            )
                                        }
                                    />
                                </div>
                                <div className="space-y-1">
                                    <Label className="text-sm font-medium">
                                        Quantidade de rodadas grátis
                                    </Label>
                                    <Input
                                        type="number"
                                        value={formData.quantity_rounds_free}
                                        onChange={(e) =>
                                            handleChange(
                                                "quantity_rounds_free",
                                                e.target.value,
                                            )
                                        }
                                    />
                                </div>
                            </div>
                        </div>
                    </CredenzaBody>
                    <CredenzaFooter className="gap-2">
                        <Button
                            variant="destructive"
                            type="button"
                            onClick={() => setShowDeleteDialog(true)}
                            disabled={isLoading || isDeleting}
                        >
                            Deletar
                        </Button>
                        <div className="flex-1" />
                        <CredenzaClose asChild>
                            <Button
                                variant="outline"
                                type="button"
                                disabled={isLoading || isDeleting}
                            >
                                Cancelar
                            </Button>
                        </CredenzaClose>
                        <Button
                            onClick={handleSave}
                            disabled={isLoading || isDeleting}
                        >
                            {isLoading ? "Salvando..." : "Salvar"}
                        </Button>
                    </CredenzaFooter>
                </CredenzaContent>
            </Credenza>

            <AlertDialog
                open={showDeleteDialog}
                onOpenChange={setShowDeleteDialog}
            >
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Você tem certeza?</AlertDialogTitle>
                        <AlertDialogDescription>
                            Esta ação não pode ser desfeita! Isso irá excluir
                            permanentemente os limites deste usuário.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel disabled={isDeleting}>
                            Cancelar
                        </AlertDialogCancel>
                        <AlertDialogAction
                            onClick={handleDelete}
                            disabled={isDeleting}
                            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                        >
                            {isDeleting ? "Excluindo..." : "Sim, excluir!"}
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </>
    );
};

export default UserLimits;
