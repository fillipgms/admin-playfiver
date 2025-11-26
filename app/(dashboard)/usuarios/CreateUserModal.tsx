"use client";
import React, { useState } from "react";
import {
    Credenza,
    CredenzaBody,
    CredenzaContent,
    CredenzaHeader,
    CredenzaTitle,
    CredenzaTrigger,
    CredenzaFooter,
} from "@/components/ui/credenza";
import Button from "@/components/Button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { createUser } from "@/actions/user";
import { createUserSchema } from "@/schemas";
import { usePermissions } from "@/hooks/usePermissions";

const initial = { name: "", email: "", password: "", confirmPassword: "" };

const CreateUserModal = () => {
    const { hasPermission } = usePermissions();
    const canCreate = hasPermission("user_create");

    if (!canCreate) return null;
    const [open, setOpen] = useState(false);
    const [values, setValues] = useState(initial);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [fieldErrors, setFieldErrors] = useState<Record<string, string[]>>(
        {}
    );

    const handleChange = (k: string, v: string) => {
        setValues((s) => ({ ...s, [k]: v }));
    };

    const handleSubmit = async (e?: React.FormEvent) => {
        e?.preventDefault();
        setError(null);
        setFieldErrors({});

        if (values.password !== values.confirmPassword) {
            setFieldErrors({ confirmPassword: ["As senhas não coincidem"] });
            const msg = "As senhas não coincidem";
            setError(msg);
            toast.error(msg);
            return;
        }

        const validationResult = createUserSchema.safeParse({
            name: values.name,
            email: values.email,
            password: values.password,
        });

        if (!validationResult.success) {
            const flat = validationResult.error.flatten();
            setFieldErrors(flat.fieldErrors);
            const msg = "Por favor, corrija os erros abaixo:";
            setError(msg);
            toast.error(msg);
            return;
        }

        setIsLoading(true);

        try {
            const result = await createUser(validationResult.data as any);

            if (!result || result.success === false) {
                const msg =
                    (result && (result as any).error) ||
                    "Falha ao criar usuário";
                setError(msg);
                toast.error(msg);
            } else {
                toast.success("Usuário criado com sucesso");
                setValues(initial);
                setOpen(false);
            }
        } catch (err) {
            console.error(err);
            const msg = (err as Error).message || "Erro inesperado";
            setError(msg);
            toast.error(msg);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <Credenza open={open} onOpenChange={setOpen}>
            <CredenzaTrigger asChild>
                <Button>Criar Usuário</Button>
            </CredenzaTrigger>

            <CredenzaContent className="bg-background-primary">
                <CredenzaHeader>
                    <CredenzaTitle>Criar Usuário</CredenzaTitle>
                </CredenzaHeader>

                <form onSubmit={handleSubmit} className="space-y-4 py-4">
                    <CredenzaBody>
                        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                            <div>
                                <label className="text-sm block mb-1">
                                    Nome
                                </label>
                                <Input
                                    value={values.name}
                                    onChange={(e) =>
                                        handleChange("name", e.target.value)
                                    }
                                    placeholder="Nome do usuário"
                                    disabled={isLoading}
                                />
                                {fieldErrors.name && (
                                    <p className="text-sm text-[#E53935]">
                                        {fieldErrors.name[0]}
                                    </p>
                                )}
                            </div>

                            <div>
                                <label className="text-sm block mb-1">
                                    Email
                                </label>
                                <Input
                                    value={values.email}
                                    onChange={(e) =>
                                        handleChange("email", e.target.value)
                                    }
                                    placeholder="email@exemplo.com"
                                    type="email"
                                    disabled={isLoading}
                                />
                                {fieldErrors.email && (
                                    <p className="text-sm text-[#E53935]">
                                        {fieldErrors.email[0]}
                                    </p>
                                )}
                            </div>

                            <div>
                                <label className="text-sm block mb-1">
                                    Senha
                                </label>
                                <Input
                                    value={values.password}
                                    onChange={(e) =>
                                        handleChange("password", e.target.value)
                                    }
                                    placeholder="Digite uma senha segura"
                                    type="password"
                                    disabled={isLoading}
                                />
                                {fieldErrors.password && (
                                    <p className="text-sm text-[#E53935]">
                                        {fieldErrors.password[0]}
                                    </p>
                                )}
                            </div>

                            <div>
                                <label className="text-sm block mb-1">
                                    Confirmar Senha
                                </label>
                                <Input
                                    value={values.confirmPassword}
                                    onChange={(e) =>
                                        handleChange(
                                            "confirmPassword",
                                            e.target.value
                                        )
                                    }
                                    placeholder="Repita a senha"
                                    type="password"
                                    disabled={isLoading}
                                />
                            </div>
                        </div>

                        {error && (
                            <div className="text-sm text-destructive mt-2">
                                {error}
                            </div>
                        )}
                    </CredenzaBody>

                    <CredenzaFooter className="flex gap-2">
                        <Button
                            variant="secondary"
                            type="button"
                            onClick={() => setOpen(false)}
                        >
                            Cancelar
                        </Button>

                        <Button
                            type="submit"
                            className="bg-primary"
                            disabled={isLoading}
                        >
                            {isLoading ? "Criando..." : "Criar Usuário"}
                        </Button>
                    </CredenzaFooter>
                </form>
            </CredenzaContent>
        </Credenza>
    );
};

export default CreateUserModal;
