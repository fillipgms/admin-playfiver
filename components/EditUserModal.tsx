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
import { useMemo, useState, useEffect } from "react";
import { Select, SelectContent, SelectItem, SelectTrigger } from "./ui/select";
import { updateUser } from "@/actions/user";
import { toast } from "sonner";
import { Switch } from "./ui/switch";
import { Label } from "./ui/label";
import { MultiSelect } from "./ui/multi-select";
import { useRouter } from "next/navigation";
import { usePermissions } from "@/hooks/usePermissions";
import { getPermissions } from "@/actions/permission";
import { useMediaQuery } from "@/hooks/useMediaQuery";

const EditUserModal = ({ user }: { user: UserProps }) => {
    const isMobile = !useMediaQuery("(min-width: 768px)");
    const [isOpen, setIsOpen] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const { hasPermission } = usePermissions();

    const [name, setName] = useState(user.name);
    const [email, setEmail] = useState(user.email);
    const [password, setPassword] = useState("");
    const [ban, setBan] = useState(user.ban === 1);
    const [roles, setRoles] = useState<string[]>(user.role || []);
    const [permissions, setPermissions] = useState<string[]>(
        // backend may provide permissions array on the user
        // fall back to empty array if not present
        (user as any).permissions || []
    );

    const [wallets, setWallets] = useState<UserWalletProps[]>(
        user.wallets || []
    );
    const [walletSearch, setWalletSearch] = useState("");
    const router = useRouter();

    const canEditName = hasPermission("user_edit_name");
    const canEditEmail = hasPermission("user_edit_email");
    const canEditPassword = hasPermission("user_edit_password");
    const canEditBan = hasPermission("user_edit_banned");
    const canEditRole = hasPermission("user_edit_role");
    const canEditPermissions = hasPermission("user_edit_permission");
    const canEditWallet = hasPermission("user_edit_wallet");

    // State for permissions data from API
    const [permissionsData, setPermissionsData] = useState<{
        status: boolean;
        data: Array<{
            id: number;
            name: string;
            guard_name: string;
            created_at: string;
            updated_at: string;
            permissions: Array<{
                id: number;
                name: string;
                guard_name: string;
                created_at: string;
                updated_at: string;
                pivot: {
                    role_id: number;
                    permission_id: number;
                };
            }>;
        }>;
    } | null>(null);

    const hasEditPermission =
        canEditName ||
        canEditEmail ||
        canEditPassword ||
        canEditBan ||
        canEditRole ||
        canEditPermissions ||
        canEditWallet;

    // Fetch permissions when modal opens
    useEffect(() => {
        if (isOpen && canEditPermissions) {
            getPermissions()
                .then((data) => {
                    setPermissionsData(data);
                })
                .catch((error) => {
                    console.error("Failed to fetch permissions:", error);
                    toast.error("Erro ao carregar permissões");
                });
        }
    }, [isOpen, canEditPermissions]);

    // Calculate required permissions based on user roles
    const requiredPermissions = useMemo(() => {
        if (!permissionsData || !roles.length) return [];

        const required: string[] = [];
        roles.forEach((roleName) => {
            const role = permissionsData.data.find((r) => r.name === roleName);
            if (role) {
                role.permissions.forEach((perm) => {
                    if (!required.includes(perm.name)) {
                        required.push(perm.name);
                    }
                });
            }
        });
        return required;
    }, [permissionsData, roles]);

    // Ensure required permissions are always included
    useEffect(() => {
        if (requiredPermissions.length > 0 && canEditPermissions) {
            setPermissions((prev) => {
                const combined = [
                    ...new Set([...requiredPermissions, ...prev]),
                ];
                return combined;
            });
        }
    }, [requiredPermissions, canEditPermissions]);

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

    // Handle permissions change - prevent removing required permissions
    const handlePermissionsChange = (newPermissions: string[]) => {
        // Always include required permissions
        const combined = [
            ...new Set([...requiredPermissions, ...newPermissions]),
        ];
        setPermissions(combined);
    };

    // Build permissions options with disabled state for required permissions
    const permissionOptions = useMemo(() => {
        const allPermissions = [
            { label: "user_view", value: "user_view" },
            { label: "user_edit_name", value: "user_edit_name" },
            { label: "user_edit_email", value: "user_edit_email" },
            { label: "user_edit_password", value: "user_edit_password" },
            { label: "user_edit_banned", value: "user_edit_banned" },
            { label: "user_edit_role", value: "user_edit_role" },
            { label: "user_edit_wallet", value: "user_edit_wallet" },
            { label: "user_create", value: "user_create" },
            { label: "user_delete", value: "user_delete" },
            { label: "user_view_report", value: "user_view_report" },
            { label: "agent_view", value: "agent_view" },
            { label: "agent_edit_password", value: "agent_edit_password" },
            { label: "agent_edit_rtp", value: "agent_edit_rtp" },
            { label: "agent_edit_rtp_user", value: "agent_edit_rtp_user" },
            {
                label: "agent_edit_influencers",
                value: "agent_edit_influencers",
            },
            { label: "agent_edit_describe", value: "agent_edit_describe" },
            { label: "agent_edit_webhook", value: "agent_edit_webhook" },
            { label: "agent_edit_hide", value: "agent_edit_hide" },
            { label: "agent_edit_limits", value: "agent_edit_limits" },
            { label: "agent_view_report", value: "agent_view_report" },
            { label: "orders_view", value: "orders_view" },
            { label: "signature_view", value: "signature_view" },
            { label: "signature_create", value: "signature_create" },
            { label: "ggr_view", value: "ggr_view" },
            { label: "ggr_edit", value: "ggr_edit" },
            { label: "ggr_create", value: "ggr_create" },
            { label: "ggr_delete", value: "ggr_delete" },
            { label: "games_view", value: "games_view" },
            { label: "games_edit_name", value: "games_edit_name" },
            { label: "games_edit_game_code", value: "games_edit_game_code" },
            { label: "games_edit_status", value: "games_edit_status" },
            { label: "games_edit_link_image", value: "games_edit_link_image" },
            { label: "games_edit_provider", value: "games_edit_provider" },
            {
                label: "games_edit_distributor",
                value: "games_edit_distributor",
            },
            { label: "provider_view", value: "provider_view" },
            { label: "provider_edit", value: "provider_edit" },
            { label: "distributor_view", value: "distributor_view" },
            { label: "distributor_edit", value: "distributor_edit" },
            { label: "wallet_view", value: "wallet_view" },
            { label: "wallet_edit_status", value: "wallet_edit_status" },
            { label: "logs_view", value: "logs_view" },
            { label: "logs_agent_view", value: "logs_agent_view" },
            { label: "logs_ggr_view", value: "logs_ggr_view" },
            { label: "setting_view", value: "setting_view" },
            { label: "setting_edit", value: "setting_edit" },
            { label: "user_edit_permission", value: "user_edit_permission" },
        ];

        return allPermissions.map((perm) => ({
            ...perm,
            disabled: requiredPermissions.includes(perm.value),
        }));
    }, [requiredPermissions]);
    const handleSave = async () => {
        setIsLoading(true);
        try {
            const payload = {
                id_user: user.id,
                name: canEditName ? name : user.name,
                email: canEditEmail ? email : user.email,
                password: canEditPassword && password ? password : undefined,
                saldo: user.saldo || 0,
                ban: canEditBan ? (ban ? 1 : 0) : user.ban,
                role: canEditRole ? roles : user.role,
                permissions: canEditPermissions
                    ? permissions
                    : (user as any).permissions || [],
                wallets: canEditWallet ? wallets : user.wallets,
            };

            const result = await updateUser(payload);

            if (result.success) {
                toast.success("Usuário atualizado com sucesso!");
                setIsOpen(false);
                setPassword("");
                router.refresh();
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
                    className={isMobile ? "h-7 px-2" : "h-8 px-3"}
                    title="Editar usuário"
                >
                    <PencilIcon size={isMobile ? 12 : 14} />
                    <span className="sr-only">Editar</span>
                </Button>
            </CredenzaTrigger>
            <CredenzaContent className="bg-background-primary sm:max-w-[700px]">
                <CredenzaHeader>
                    <CredenzaTitle>Editando {user.name}</CredenzaTitle>
                </CredenzaHeader>
                {!hasEditPermission && (
                    <div className="px-6 py-3 bg-destructive/10 border-b border-destructive/20 text-sm text-destructive">
                        Você não tem permissão para editar este usuário.
                    </div>
                )}
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
                                disabled={!canEditName}
                                readOnly={!canEditName}
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
                                disabled={!canEditEmail}
                                readOnly={!canEditEmail}
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
                                disabled={!canEditPassword}
                            />
                        </div>
                    </div>

                    <div className="h-px bg-border w-full" />

                    <div className="grid grid-cols-12 gap-4">
                        <div className="col-span-6">
                            <Label className="text-xs font-medium text-muted-foreground block mb-1.5">
                                Cargos
                            </Label>
                            <MultiSelect
                                options={[
                                    { label: "Admin", value: "admin" },
                                    {
                                        label: "Revendedor",
                                        value: "revendedor",
                                    },
                                    { label: "Suporte", value: "suporte" },
                                ]}
                                onValueChange={(newRoles) => {
                                    setRoles(newRoles);
                                    // Update required permissions when roles change
                                    if (
                                        permissionsData &&
                                        newRoles.length > 0
                                    ) {
                                        const newRequired: string[] = [];
                                        newRoles.forEach((roleName) => {
                                            const role =
                                                permissionsData.data.find(
                                                    (r) => r.name === roleName
                                                );
                                            if (role) {
                                                role.permissions.forEach(
                                                    (perm) => {
                                                        if (
                                                            !newRequired.includes(
                                                                perm.name
                                                            )
                                                        ) {
                                                            newRequired.push(
                                                                perm.name
                                                            );
                                                        }
                                                    }
                                                );
                                            }
                                        });
                                        // Ensure required permissions are always included
                                        setPermissions((prev) => {
                                            const combined = [
                                                ...new Set([
                                                    ...newRequired,
                                                    ...prev,
                                                ]),
                                            ];
                                            return combined;
                                        });
                                    }
                                }}
                                defaultValue={roles}
                                placeholder="Selecione os cargos"
                                className="h-9"
                                disabled={!canEditRole}
                            />
                        </div>
                        <div className="col-span-6">
                            <Label className="text-xs font-medium text-muted-foreground block mb-1.5">
                                Permissões
                                {requiredPermissions.length > 0 && (
                                    <span className="text-[10px] text-muted-foreground ml-2">
                                        ({requiredPermissions.length}{" "}
                                        obrigatórias por cargo)
                                    </span>
                                )}
                            </Label>
                            <MultiSelect
                                options={permissionOptions}
                                onValueChange={handlePermissionsChange}
                                defaultValue={permissions}
                                placeholder="Selecione permissões"
                                className="h-9"
                                disabled={!canEditPermissions}
                            />
                        </div>
                        <div className="col-span-6 flex items-center gap-2">
                            <Switch
                                id="ban-user"
                                checked={ban}
                                onCheckedChange={setBan}
                                disabled={!canEditBan}
                            />
                            <Label
                                htmlFor="ban-user"
                                className={`text-sm font-medium ${
                                    !canEditBan ? "opacity-50" : ""
                                }`}
                            >
                                Banir usuário
                            </Label>
                        </div>
                    </div>

                    <div className="h-px bg-border w-full" />

                    <div className="space-y-3">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                                <WalletIcon
                                    className={`text-primary ${
                                        !canEditWallet ? "opacity-50" : ""
                                    }`}
                                    size={18}
                                />
                                <label
                                    className={`text-sm font-medium ${
                                        !canEditWallet ? "opacity-50" : ""
                                    }`}
                                >
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
                                                    disabled={!canEditWallet}
                                                    readOnly={!canEditWallet}
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
                        disabled={isLoading || !hasEditPermission}
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
