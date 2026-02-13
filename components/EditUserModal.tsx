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
import { useMemo, useState, useEffect, useCallback } from "react";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "./ui/select";
import { updateUser } from "@/actions/user";
import { toast } from "sonner";
import { Switch } from "./ui/switch";
import { Label } from "./ui/label";
import { MultiSelect } from "./ui/multi-select";
import { useRouter } from "next/navigation";
import { usePermissions } from "@/hooks/usePermissions";
import { getPermissions } from "@/actions/permission";
import { useMediaQuery } from "@/hooks/useMediaQuery";
import { registerOptions } from "@/actions/meta";
import { ScrollArea } from "./ui/scroll-area";

interface Country {
    iso2: string;
    name_en: string;
    name_pt: string;
    value: string;
}

interface Language {
    code: string;
    name_en: string;
    name_pt: string;
    value: string;
}

interface CountryCode {
    cca2: string;
    callingCode: string;
    name_pt: string;
}

interface RestCountryIDD {
    cca2: string;
    idd: {
        root: string;
        suffixes: string[];
    };
}

let cachedCountryData: {
    countries: Country[];
    languages: Language[];
    countryCodes: CountryCode[];
} | null = null;

let countryDataPromise: Promise<any> | null = null;

async function fetchAndProcessCountryData() {
    if (cachedCountryData) {
        return cachedCountryData;
    }

    if (countryDataPromise) {
        return countryDataPromise;
    }

    countryDataPromise = (async () => {
        try {
            const [registerRes, codesRes] = await Promise.all([
                registerOptions(),
                fetch("https://restcountries.com/v3.1/all?fields=cca2,idd"),
            ]);

            const codesData = await codesRes.json();

            const processedCodes: CountryCode[] = codesData
                .map((item: RestCountryIDD) => {
                    const root = item.idd?.root || "";
                    const suffixes = item.idd?.suffixes || [];

                    if (!root || suffixes.length === 0) return null;

                    const callingCode = root + suffixes[0];
                    const country = registerRes.countries?.find(
                        (c: Country) => c.iso2 === item.cca2,
                    );

                    return {
                        cca2: item.cca2,
                        callingCode,
                        name_pt: country?.name_pt || item.cca2,
                    };
                })
                .filter(Boolean)
                .sort((a: CountryCode, b: CountryCode) =>
                    a.name_pt.localeCompare(b.name_pt),
                );

            const result = {
                countries: registerRes.countries || [],
                languages: registerRes.languages || [],
                countryCodes: processedCodes,
            };

            cachedCountryData = result;
            return result;
        } catch (err) {
            console.error(err);
            countryDataPromise = null;
            throw err;
        }
    })();

    return countryDataPromise;
}

const formatCPF = (value: string): string => {
    const numbers = value.replace(/\D/g, "");
    if (numbers.length <= 3) return numbers;
    if (numbers.length <= 6)
        return `${numbers.slice(0, 3)}.${numbers.slice(3)}`;
    if (numbers.length <= 9)
        return `${numbers.slice(0, 3)}.${numbers.slice(3, 6)}.${numbers.slice(6)}`;
    return `${numbers.slice(0, 3)}.${numbers.slice(3, 6)}.${numbers.slice(6, 9)}-${numbers.slice(9, 11)}`;
};

const formatPhoneBR = (value: string): string => {
    const numbers = value.replace(/\D/g, "");
    if (numbers.length <= 2) return numbers;
    if (numbers.length <= 6)
        return `(${numbers.slice(0, 2)}) ${numbers.slice(2)}`;
    if (numbers.length <= 10)
        return `(${numbers.slice(0, 2)}) ${numbers.slice(2, 6)}-${numbers.slice(6)}`;
    return `(${numbers.slice(0, 2)}) ${numbers.slice(2, 7)}-${numbers.slice(7, 11)}`;
};

const formatCurrencyBRL = (value: number): string =>
    new Intl.NumberFormat("pt-BR", {
        style: "currency",
        currency: "BRL",
    }).format(value);

const ALL_PERMISSION_OPTIONS = [
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
    { label: "agent_edit_influencers", value: "agent_edit_influencers" },
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
    { label: "games_edit_distributor", value: "games_edit_distributor" },
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
    { label: "user_edit_nationality", value: "user_edit_nationality" },
    { label: "user_edit_country", value: "user_edit_country" },
    { label: "user_edit_phone", value: "user_edit_phone" },
    { label: "user_edit_lang", value: "user_edit_lang" },
    { label: "user_edit_document", value: "user_edit_document" },
];

const BAN_REASON_OPTIONS = [
    "Praticar bug para aumentar saldo",
    "Não recarregar os agentes",
    "Integração errada causado vários erros",
];

const EditUserModal = ({ user }: { user: UserProps }) => {
    const isMobile = !useMediaQuery("(min-width: 768px)");
    const [isOpen, setIsOpen] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [isLoadingData, setIsLoadingData] = useState(false);
    const { hasPermission } = usePermissions();
    const router = useRouter();

    const [name, setName] = useState(user.name);
    const [email, setEmail] = useState(user.email);
    const [password, setPassword] = useState("");
    const [ban, setBan] = useState(user.ban === 1);
    const [roles, setRoles] = useState<string[]>(user.role || []);
    const [permissions, setPermissions] = useState<string[]>(
        (user as any).permissions || [],
    );

    const [countries, setCountries] = useState<Country[]>([]);
    const [languages, setLanguages] = useState<Language[]>([]);
    const [countryCodes, setCountryCodes] = useState<CountryCode[]>([]);
    const [selectedNationality, setSelectedNationality] = useState(
        user.nationality || "",
    );
    const [selectedCountryCode, setSelectedCountryCode] = useState(
        user.country || "",
    );
    const [selectedLang, setSelectedLang] = useState(user.lang || "");
    const [phone, setPhone] = useState(user.phone || "");
    const [document, setDocument] = useState("");

    const existingBanReason = (user as any).motived_ban as string | undefined;
    const isExistingPreset =
        existingBanReason && BAN_REASON_OPTIONS.includes(existingBanReason);

    const [banReasonSource, setBanReasonSource] = useState<"preset" | "custom">(
        isExistingPreset ? "preset" : existingBanReason ? "custom" : "preset",
    );
    const [presetBanReason, setPresetBanReason] = useState<string>(
        isExistingPreset ? existingBanReason : BAN_REASON_OPTIONS[0],
    );
    const [customBanReason, setCustomBanReason] = useState<string>(
        !isExistingPreset && existingBanReason ? existingBanReason : "",
    );

    const [wallets, setWallets] = useState<UserWalletProps[]>(
        user.wallets || [],
    );
    const [walletSearch, setWalletSearch] = useState("");

    const canEditName = hasPermission("user_edit_name");
    const canEditEmail = hasPermission("user_edit_email");
    const canEditPassword = hasPermission("user_edit_password");
    const canEditBan = hasPermission("user_edit_banned");
    const canEditRole = hasPermission("user_edit_role");
    const canEditPermissions = hasPermission("user_edit_permission");
    const canEditWallet = hasPermission("user_edit_wallet");
    const canEditNationality = hasPermission("user_edit_nationality");
    const canEditCountry = hasPermission("user_edit_country");
    const canEditPhone = hasPermission("user_edit_phone");
    const canEditLang = hasPermission("user_edit_lang");
    const canEditDocument = hasPermission("user_edit_document");

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
        canEditWallet ||
        canEditNationality ||
        canEditCountry ||
        canEditPhone ||
        canEditLang ||
        canEditDocument;

    useEffect(() => {
        if (!isOpen) return;

        const loadData = async () => {
            setIsLoadingData(true);
            try {
                const promises: Promise<any>[] = [];

                if (canEditPermissions) {
                    promises.push(
                        getPermissions().then((data) => {
                            setPermissionsData(data);
                        }),
                    );
                }

                promises.push(
                    fetchAndProcessCountryData().then((data) => {
                        setCountries(data.countries);
                        setLanguages(data.languages);
                        setCountryCodes(data.countryCodes);
                    }),
                );

                await Promise.all(promises);
            } catch (error) {
                console.error("Failed to load data:", error);
                toast.error("Erro ao carregar dados");
            } finally {
                setIsLoadingData(false);
            }
        };

        loadData();
    }, [isOpen, canEditPermissions]);

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

    const filteredWallets = useMemo(() => {
        if (!walletSearch) return wallets;
        const searchLower = walletSearch.toLowerCase();
        return wallets.filter((w) =>
            w.wallet.toLowerCase().includes(searchLower),
        );
    }, [wallets, walletSearch]);

    const permissionOptions = useMemo(() => {
        return ALL_PERMISSION_OPTIONS.map((perm) => ({
            ...perm,
            disabled: requiredPermissions.includes(perm.value),
        }));
    }, [requiredPermissions]);

    const isBrazilian = useMemo(
        () => selectedNationality === "Brazil",
        [selectedNationality],
    );

    useEffect(() => {
        if (
            selectedNationality &&
            countryCodes.length > 0 &&
            !selectedCountryCode
        ) {
            const nationalityCountry = countries.find(
                (c) => c.name_en === selectedNationality,
            );
            if (nationalityCountry) {
                const matchingCode = countryCodes.find(
                    (cc) => cc.cca2 === nationalityCountry.iso2,
                );
                if (matchingCode) {
                    setSelectedCountryCode(matchingCode.cca2);
                }
            }
        }
    }, [selectedNationality, countryCodes, countries, selectedCountryCode]);

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

    const handleWalletBalanceChange = useCallback(
        (walletId: string, newBalance: string) => {
            setWallets((prev) =>
                prev.map((w) => {
                    if (w.id === walletId) {
                        return { ...w, saldo: newBalance };
                    }
                    return w;
                }),
            );
        },
        [],
    );

    const handlePermissionsChange = useCallback(
        (newPermissions: string[]) => {
            const combined = [
                ...new Set([...requiredPermissions, ...newPermissions]),
            ];
            setPermissions(combined);
        },
        [requiredPermissions],
    );

    const handlePhoneChange = useCallback(
        (e: React.ChangeEvent<HTMLInputElement>) => {
            const numbers = e.target.value.replace(/\D/g, "");
            const formatted =
                selectedCountryCode === "BR" ? formatPhoneBR(numbers) : numbers;
            setPhone(formatted);
        },
        [selectedCountryCode],
    );

    const handleCPFChange = useCallback(
        (e: React.ChangeEvent<HTMLInputElement>) => {
            const formatted = formatCPF(e.target.value);
            setDocument(formatted);
        },
        [],
    );

    const handleRolesChange = useCallback(
        (newRoles: string[]) => {
            setRoles(newRoles);

            if (permissionsData && newRoles.length > 0) {
                const newRequired: string[] = [];
                newRoles.forEach((roleName) => {
                    const role = permissionsData.data.find(
                        (r) => r.name === roleName,
                    );
                    if (role) {
                        role.permissions.forEach((perm) => {
                            if (!newRequired.includes(perm.name)) {
                                newRequired.push(perm.name);
                            }
                        });
                    }
                });

                setPermissions((prev) => {
                    const combined = [...new Set([...newRequired, ...prev])];
                    return combined;
                });
            }
        },
        [permissionsData],
    );

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
                motived_ban: canEditBan
                    ? ban
                        ? banReasonSource === "preset"
                            ? presetBanReason
                            : customBanReason || undefined
                        : undefined
                    : (user as any).motived_ban,
                role: canEditRole ? roles : user.role,
                permission: canEditPermissions
                    ? permissions
                    : (user as any).permissions || [],
                wallets: canEditWallet ? wallets : user.wallets,
                nationality:
                    (canEditNationality
                        ? selectedNationality
                        : user.nationality) ?? undefined,
                country:
                    (canEditCountry ? selectedCountryCode : user.country) ??
                    undefined,
                phone: (canEditPhone ? phone : user.phone) ?? undefined,
                lang: (canEditLang ? selectedLang : user.lang) ?? undefined,
                document:
                    (canEditDocument ? document : (user as any).document) ??
                    undefined,
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
                <ScrollArea className="h-full max-h-[70vh]">
                    <CredenzaHeader>
                        <CredenzaTitle>Editando {user.name}</CredenzaTitle>
                    </CredenzaHeader>
                    {!hasEditPermission && (
                        <div className="px-6 py-3 bg-destructive/10 border-b border-destructive/20 text-sm text-destructive">
                            Você não tem permissão para editar este usuário.
                        </div>
                    )}
                    {isLoadingData ? (
                        <div className="px-6 py-12 flex items-center justify-center">
                            <div className="text-sm text-muted-foreground">
                                Carregando dados...
                            </div>
                        </div>
                    ) : (
                        <CredenzaBody className="space-y-6 py-4">
                            <div className="grid grid-cols-12 gap-4">
                                <div className="col-span-12 md:col-span-4">
                                    <label className="text-xs font-medium text-muted-foreground block mb-1.5">
                                        Nome
                                    </label>
                                    <Input
                                        name="name"
                                        value={name}
                                        onChange={(e) =>
                                            setName(e.target.value)
                                        }
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
                                        onChange={(e) =>
                                            setEmail(e.target.value)
                                        }
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
                                        onChange={(e) =>
                                            setPassword(e.target.value)
                                        }
                                        className="h-9"
                                        disabled={!canEditPassword}
                                    />
                                </div>
                            </div>

                            <div className="h-px bg-border w-full" />

                            <div className="grid grid-cols-12 gap-4 items-center">
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
                                            {
                                                label: "Suporte",
                                                value: "suporte",
                                            },
                                        ]}
                                        onValueChange={handleRolesChange}
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
                                        className="min-h-9"
                                        disabled={!canEditPermissions}
                                    />
                                </div>
                                <div className="col-span-6 space-y-2">
                                    <div className="flex items-center gap-2">
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

                                    {ban && (
                                        <div className="space-y-2 mt-1">
                                            <Label className="text-xs font-medium text-muted-foreground block">
                                                Motivo do banimento
                                            </Label>
                                            <div className="flex flex-col gap-2">
                                                <Select
                                                    value={
                                                        banReasonSource ===
                                                        "preset"
                                                            ? presetBanReason
                                                            : "custom"
                                                    }
                                                    onValueChange={(value) => {
                                                        if (
                                                            value === "custom"
                                                        ) {
                                                            setBanReasonSource(
                                                                "custom",
                                                            );
                                                        } else {
                                                            setBanReasonSource(
                                                                "preset",
                                                            );
                                                            setPresetBanReason(
                                                                value,
                                                            );
                                                        }
                                                    }}
                                                    disabled={!canEditBan}
                                                >
                                                    <SelectTrigger className="h-9 w-full max-w-xs">
                                                        <SelectValue placeholder="Selecione o motivo" />
                                                    </SelectTrigger>
                                                    <SelectContent>
                                                        {BAN_REASON_OPTIONS.map(
                                                            (reason) => (
                                                                <SelectItem
                                                                    key={reason}
                                                                    value={
                                                                        reason
                                                                    }
                                                                >
                                                                    {reason}
                                                                </SelectItem>
                                                            ),
                                                        )}
                                                        <SelectItem value="custom">
                                                            Outro motivo
                                                            (digitar)
                                                        </SelectItem>
                                                    </SelectContent>
                                                </Select>

                                                {banReasonSource ===
                                                    "custom" && (
                                                    <Input
                                                        placeholder="Descreva o motivo do banimento"
                                                        value={customBanReason}
                                                        onChange={(e) =>
                                                            setCustomBanReason(
                                                                e.target.value,
                                                            )
                                                        }
                                                        className="h-9 max-w-xs"
                                                        disabled={!canEditBan}
                                                    />
                                                )}
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>

                            <div className="h-px bg-border w-full" />

                            <div className="grid grid-cols-12 gap-4">
                                <div className="col-span-12 md:col-span-6">
                                    <label className="text-xs font-medium text-muted-foreground block mb-1.5">
                                        Nacionalidade
                                    </label>
                                    <Select
                                        value={selectedNationality}
                                        onValueChange={setSelectedNationality}
                                        disabled={!canEditNationality}
                                    >
                                        <SelectTrigger className="h-9 w-full">
                                            <SelectValue placeholder="Selecione a nacionalidade" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {countries.map((country) => (
                                                <SelectItem
                                                    key={country.iso2}
                                                    value={country.name_en}
                                                >
                                                    {country.name_pt}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>

                                <div className="col-span-12 md:col-span-6">
                                    <label className="text-xs font-medium text-muted-foreground block mb-1.5">
                                        Idioma
                                    </label>
                                    <Select
                                        value={selectedLang}
                                        onValueChange={setSelectedLang}
                                        disabled={!canEditLang}
                                    >
                                        <SelectTrigger className="h-9 w-full">
                                            <SelectValue placeholder="Selecione o idioma" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {languages.map((language) => (
                                                <SelectItem
                                                    key={language.code}
                                                    value={language.code}
                                                >
                                                    {language.name_pt}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>

                                <div className="col-span-12 md:col-span-4">
                                    <label className="text-xs font-medium text-muted-foreground block mb-1.5">
                                        Código do País
                                    </label>
                                    <Select
                                        value={selectedCountryCode}
                                        onValueChange={setSelectedCountryCode}
                                        disabled={!canEditCountry}
                                    >
                                        <SelectTrigger className="h-9 w-full">
                                            <SelectValue placeholder="+00">
                                                {selectedCountryCode &&
                                                    countryCodes.find(
                                                        (c) =>
                                                            c.cca2 ===
                                                            selectedCountryCode,
                                                    )?.callingCode}
                                            </SelectValue>
                                        </SelectTrigger>
                                        <SelectContent>
                                            {countryCodes.map((country) => (
                                                <SelectItem
                                                    key={country.cca2}
                                                    value={country.cca2}
                                                >
                                                    <div className="flex items-center justify-between w-full gap-3">
                                                        <span className="font-medium">
                                                            {
                                                                country.callingCode
                                                            }
                                                        </span>
                                                        <span className="text-muted-foreground text-xs">
                                                            {country.name_pt}
                                                        </span>
                                                    </div>
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>

                                <div className="col-span-12 md:col-span-8">
                                    <label className="text-xs font-medium text-muted-foreground block mb-1.5">
                                        Telefone
                                    </label>
                                    <Input
                                        type="tel"
                                        value={phone}
                                        onChange={handlePhoneChange}
                                        placeholder={
                                            selectedCountryCode === "BR"
                                                ? "(00) 00000-0000"
                                                : "Número sem código do país"
                                        }
                                        className="h-9"
                                        disabled={!canEditPhone}
                                    />
                                </div>

                                {isBrazilian && (
                                    <div className="col-span-12">
                                        <label className="text-xs font-medium text-muted-foreground block mb-1.5">
                                            CPF (opcional)
                                        </label>
                                        <Input
                                            type="text"
                                            value={document}
                                            onChange={handleCPFChange}
                                            placeholder="000.000.000-00"
                                            maxLength={14}
                                            className="h-9"
                                            disabled={!canEditDocument}
                                        />
                                    </div>
                                )}
                            </div>

                            <div className="h-px bg-border w-full" />

                            <div className="space-y-3">
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-2">
                                        <WalletIcon
                                            className={`text-primary ${
                                                !canEditWallet
                                                    ? "opacity-50"
                                                    : ""
                                            }`}
                                            size={18}
                                        />
                                        <label
                                            className={`text-sm font-medium ${
                                                !canEditWallet
                                                    ? "opacity-50"
                                                    : ""
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
                                                            Number(
                                                                wallet.saldo,
                                                            ),
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
                                                                    e.target
                                                                        .value,
                                                                )
                                                            }
                                                            placeholder="0.00"
                                                            disabled={
                                                                !canEditWallet
                                                            }
                                                            readOnly={
                                                                !canEditWallet
                                                            }
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
                    )}
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
                            disabled={
                                isLoading || !hasEditPermission || isLoadingData
                            }
                            className="w-full sm:w-auto"
                        >
                            {isLoading ? "Salvando..." : "Salvar Alterações"}
                        </Button>
                    </CredenzaFooter>
                </ScrollArea>
            </CredenzaContent>
        </Credenza>
    );
};

export default EditUserModal;
