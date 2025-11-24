"use client";

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
import {
    CheckIcon,
    MagnifyingGlassIcon,
    PencilIcon,
    WalletIcon,
    XIcon,
} from "@phosphor-icons/react/dist/ssr";
import { Input } from "./ui/input";
import { useMemo, useState } from "react";
import { Select, SelectContent, SelectItem, SelectTrigger } from "./ui/select";
import { updateUser } from "@/actions/user";
import { toast } from "sonner";

const EditUserModal = ({ user }: { user: UserProps }) => {
    const [isOpen, setIsOpen] = useState(false);
    const [isLoading, setIsLoading] = useState(false);

    const [name, setName] = useState(user.name);
    const [email, setEmail] = useState(user.email);
    const [password, setPassword] = useState("");

    const [wallets, setWallets] = useState<UserWalletProps[]>(
        user.wallets || []
    );
    const [walletSearch, setWalletSearch] = useState("");

    const filteredWallets = useMemo(() => {
        if (!walletSearch) return wallets;
        return wallets.filter((w) =>
            w.wallet.toLowerCase().includes(walletSearch.toLowerCase())
        );
    }, [wallets, walletSearch]);

    const handleWalletBalanceChange = (
        walletId: string,
        newBalance: string
    ) => {
        setWallets((prev) =>
            prev.map((w) => {
                if (w.id === walletId) {
                    return { ...w, saldo: newBalance };
                }
                return w;
            })
        );
    };
    const handleSave = async () => {
        setIsLoading(true);
        try {
            const payload = {
                id_user: user.id,
                name,
                email,
                password: password || undefined,
                saldo: user.saldo || 0,
                ban: user.ban || 0,
                role: user.role || [],
                wallets: wallets,
            };

            const result = await updateUser(payload);

            if (result.success) {
                toast.success("Usuário atualizado com sucesso!");
                setIsOpen(false);
                setPassword("");
            } else {
                toast.error(result.error || "Erro ao atualizar usuário");
            }
        } catch (err) {
            toast.error("Erro inesperado ao salvar");
        } finally {
            setIsLoading(false);
        }
    };

    const formatCurrencyBRL = (value: number): string =>
        new Intl.NumberFormat("pt-BR", {
            style: "currency",
            currency: "BRL",
        }).format(value);

    return (
        <Credenza open={isOpen} onOpenChange={setIsOpen}>
            <CredenzaTrigger asChild>
                <Button
                    size="sm"
                    variant="outline"
                    className="h-8 px-3"
                    title="Editar usuário"
                >
                    <PencilIcon size={14} />
                    <span className="sr-only">Editar</span>
                </Button>
            </CredenzaTrigger>
            <CredenzaContent className="bg-background-primary sm:max-w-[700px]">
                <CredenzaHeader>
                    <CredenzaTitle>Editando {user.name}</CredenzaTitle>
                </CredenzaHeader>
                <CredenzaBody className="space-y-6 py-4">
                    <div className="grid grid-cols-12 gap-4">
                        <div className="col-span-12 md:col-span-4">
                            <label className="text-xs font-medium text-muted-foreground block mb-1.5">
                                Nome
                            </label>
                            <Input
                                name="name"
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                className="h-9"
                            />
                        </div>
                        <div className="col-span-12 md:col-span-4">
                            <label className="text-xs font-medium text-muted-foreground block mb-1.5">
                                Email
                            </label>
                            <Input
                                name="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                className="h-9"
                            />
                        </div>
                        <div className="col-span-12 md:col-span-4">
                            <label className="text-xs font-medium text-muted-foreground block mb-1.5">
                                Senha (Opcional)
                            </label>
                            <Input
                                name="password"
                                type="password"
                                placeholder="******"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                className="h-9"
                            />
                        </div>
                    </div>

                    <div className="h-px bg-border w-full" />

                    <div className="space-y-3">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                                <WalletIcon
                                    className="text-primary"
                                    size={18}
                                />
                                <label className="text-sm font-medium">
                                    Saldos das Carteiras
                                </label>
                            </div>

                            <div className="relative w-48">
                                <MagnifyingGlassIcon
                                    size={14}
                                    className="absolute left-2 top-1/2 -translate-y-1/2 text-muted-foreground"
                                />
                                <Input
                                    placeholder="Buscar wallet..."
                                    className="h-8 pl-8 text-xs bg-muted/30"
                                    value={walletSearch}
                                    onChange={(e) =>
                                        setWalletSearch(e.target.value)
                                    }
                                />
                            </div>
                        </div>

                        <div className="border rounded-lg bg-background/50 h-50 overflow-y-auto p-2 space-y-2">
                            {filteredWallets.length === 0 ? (
                                <div className="h-full flex items-center justify-center text-sm text-muted-foreground">
                                    Nenhuma carteira encontrada.
                                </div>
                            ) : (
                                filteredWallets.map((wallet) => (
                                    <div
                                        key={wallet.id}
                                        className="flex items-center justify-between p-3 rounded-md border bg-card hover:bg-accent/5 transition-colors gap-4"
                                    >
                                        <div className="flex flex-col flex-1 min-w-0">
                                            <span
                                                className="font-medium text-sm truncate"
                                                title={wallet.wallet}
                                            >
                                                {wallet.wallet}
                                            </span>
                                            <span className="text-[10px] text-muted-foreground uppercase tracking-wider font-mono">
                                                {wallet.id}
                                            </span>
                                        </div>

                                        <div className="flex items-center gap-3">
                                            <div className="hidden sm:block text-xs font-medium text-muted-foreground bg-muted px-2 py-1 rounded">
                                                {formatCurrencyBRL(
                                                    Number(wallet.saldo)
                                                )}
                                            </div>

                                            <div className="relative w-32">
                                                <span className="absolute left-2 top-1/2 -translate-y-1/2 text-xs text-muted-foreground font-medium">
                                                    R$
                                                </span>
                                                <Input
                                                    type="number"
                                                    step="0.01"
                                                    min="0"
                                                    className="h-8 pl-7 text-right font-mono text-sm"
                                                    value={wallet.saldo}
                                                    onChange={(e) =>
                                                        handleWalletBalanceChange(
                                                            wallet.id,
                                                            e.target.value
                                                        )
                                                    }
                                                    placeholder="0.00"
                                                />
                                            </div>
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>
                        <p className="text-xs text-muted-foreground text-right px-1">
                            Mostrando {filteredWallets.length} de{" "}
                            {wallets.length} carteiras
                        </p>
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
                        disabled={isLoading}
                        className="w-full sm:w-auto"
                    >
                        {isLoading ? "Salvando..." : "Salvar Alterações"}
                    </Button>
                </CredenzaFooter>
            </CredenzaContent>
        </Credenza>
    );
};

export default EditUserModal;
