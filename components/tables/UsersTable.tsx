"use client";
import { AgGridReact } from "ag-grid-react";
import {
    AllCommunityModule,
    ModuleRegistry,
    ColDef,
    ICellRendererParams,
} from "ag-grid-community";
import React, { useRef, useState, useEffect } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { twMerge } from "tailwind-merge";
import {
    MagnifyingGlassIcon,
    PencilIcon,
    TrashIcon,
    ShieldCheckIcon,
    EyeIcon,
} from "@phosphor-icons/react";
import { useRouter, useSearchParams } from "next/navigation";
import BettingLimitsModal from "@/components/BettingLimitsModal";
import Link from "next/link";

ModuleRegistry.registerModules([AllCommunityModule]);

const UsersTable = ({ users }: { users: UserProps[] }) => {
    const router = useRouter();
    const searchParams = useSearchParams();
    const [isSearching, setIsSearching] = useState(false);
    const [showLimitsModal, setShowLimitsModal] = useState(false);
    const [selectedUser, setSelectedUser] = useState<UserProps | null>(null);
    const gridRef = useRef<AgGridReact<UserProps>>(null);
    const searchTimeoutRef = useRef<NodeJS.Timeout | null>(null);

    const urlSearch = searchParams?.get("search") || "";
    const [searchValue, setSearchValue] = useState(urlSearch);

    const formatCurrency = (value: number) => {
        return new Intl.NumberFormat("pt-BR", {
            style: "currency",
            currency: "BRL",
        }).format(value);
    };

    const formatDate = (dateString: string) => {
        const date = new Date(dateString);
        return new Intl.DateTimeFormat("pt-BR", {
            day: "2-digit",
            month: "2-digit",
            year: "numeric",
        }).format(date);
    };

    const handleEdit = (user: UserProps) => {
        toast.info(`Editando usuário: ${user.name}`);
        // TODO: Implementar edição
    };

    const handleDelete = (user: UserProps) => {
        if (confirm(`Tem certeza que deseja excluir o usuário ${user.name}?`)) {
            toast.success(`Usuário ${user.name} excluído`);
            // TODO: Implementar exclusão
        }
    };

    const handleLimits = (user: UserProps) => {
        setSelectedUser(user);
        setShowLimitsModal(true);
    };

    const handleLimitsClose = () => {
        setShowLimitsModal(false);
        setSelectedUser(null);
    };

    const cols: ColDef<UserProps>[] = [
        {
            headerName: "ID",
            field: "id",
            width: 5,
            pinned: "left",
        },
        {
            headerName: "Nome",
            field: "name",
            flex: 1.5,
            minWidth: 180,
            pinned: "left",
            cellRenderer: (p: ICellRendererParams) => {
                const { name, email } = p.data;
                return (
                    <div className="flex flex-col h-full w-full justify-center">
                        <p className="leading-none font-medium">{name}</p>
                        <p className="text-xs text-foreground/50 truncate">
                            {email}
                        </p>
                    </div>
                );
            },
        },
        {
            headerName: "Saldo",
            field: "saldo",
            flex: 1,
            minWidth: 120,
            valueFormatter: (p) => formatCurrency(p.value || 0),
            cellClass: (p) => {
                const value = p.value || 0;
                const colorClass =
                    value > 0
                        ? "text-[#95BD2B]"
                        : value < 0
                        ? "text-[#E53935]"
                        : "text-foreground";
                return `bg-background-primary ${colorClass}`;
            },
        },
        {
            headerName: "Status",
            field: "ban",
            flex: 1,
            minWidth: 120,
            cellRenderer: (p: ICellRendererParams) => {
                const isBanned = p.value === 1;
                return (
                    <div className="flex items-center justify-center h-full w-full">
                        <div
                            className={twMerge(
                                "flex items-center gap-1 justify-center max-w-32 py-1 w-full text-center px-3 rounded text-sm font-medium",
                                isBanned
                                    ? "bg-[#E53935]/20 text-[#E53935]"
                                    : "bg-[#95BD2B]/20 text-[#95BD2B]"
                            )}
                        >
                            {isBanned ? "Banido" : "Ativo"}
                        </div>
                    </div>
                );
            },
        },
        {
            headerName: "Cargo",
            field: "role",
            flex: 1,
            minWidth: 120,
            valueFormatter: (p) => {
                const roles = p.value || [];
                return roles.length > 0 ? roles.join(", ") : "N/A";
            },
            cellRenderer: (p: ICellRendererParams) => {
                const roles = p.value || [];
                const roleLabels: Record<string, string> = {
                    admin: "Admin",
                    suporte: "Suporte",
                    user: "Usuário",
                };
                return (
                    <div className="flex items-center justify-center h-full w-full">
                        <div
                            className={twMerge(
                                "flex items-center gap-1 justify-center max-w-32 py-1 w-full text-center px-3 rounded text-sm font-medium ",
                                roles.length > 0
                                    ? roleLabels[roles[0]] ||
                                      roles[0] === "admin"
                                        ? "bg-primary/20 text-primary"
                                        : "bg-"
                                    : "Usuário"
                            )}
                        >
                            {roles.length > 0
                                ? roleLabels[roles[0]] || roles[0]
                                : "Usuário"}
                        </div>
                    </div>
                );
            },
        },
        {
            headerName: "Data de Criação",
            field: "created_at",
            flex: 1,
            minWidth: 140,
            valueFormatter: (p) => formatDate(p.value || ""),
        },
        {
            headerName: "Limite",
            field: "limit",
            flex: 0.8,
            minWidth: 100,
            cellRenderer: (p: ICellRendererParams) => {
                const hasLimit = p.value === true;
                return (
                    <div className="flex items-center justify-center h-full w-full">
                        <div
                            className={twMerge(
                                "flex items-center gap-1 justify-center max-w-24 py-1 w-full text-center px-2 rounded text-xs font-medium",
                                hasLimit
                                    ? "bg-primary/20 text-primary"
                                    : "bg-foreground/10 text-foreground/50"
                            )}
                        >
                            {hasLimit ? "Sim" : "Não"}
                        </div>
                    </div>
                );
            },
        },
        {
            headerName: "Ações",
            field: "id",
            flex: 1.5,
            minWidth: 200,
            pinned: "right",
            cellRenderer: (p: ICellRendererParams) => {
                const user = p.data as UserProps;
                return (
                    <div className="flex items-center justify-center gap-2 h-full w-full">
                        <Button
                            size="sm"
                            variant="outline"
                            className="h-8 px-3"
                            title="Ver Completo"
                            asChild
                        >
                            <Link href={`/usuarios/${user.id}`}>
                                <EyeIcon size={14} />
                                <span className="sr-only">Ver Completo</span>
                            </Link>
                        </Button>
                        <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleEdit(user)}
                            className="h-8 px-3"
                            title="Editar usuário"
                        >
                            <PencilIcon size={14} />
                            <span className="sr-only">Editar</span>
                        </Button>
                        <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleLimits(user)}
                            className="h-8 px-3"
                            title="Configurar limites de apostas"
                        >
                            <ShieldCheckIcon size={14} />
                            <span className="sr-only">Limites</span>
                        </Button>
                        <Button
                            size="sm"
                            variant="destructive"
                            onClick={() => handleDelete(user)}
                            className="h-8 px-3"
                            title="Excluir usuário"
                        >
                            <TrashIcon size={14} />
                            <span className="sr-only">Excluir</span>
                        </Button>
                    </div>
                );
            },
        },
    ];

    useEffect(() => {
        const urlSearch = searchParams?.get("search") || "";
        if (urlSearch !== searchValue) {
            setSearchValue(urlSearch);
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [searchParams]);

    const handleSearch = (value: string) => {
        setSearchValue(value);

        if (searchTimeoutRef.current) {
            clearTimeout(searchTimeoutRef.current);
        }

        searchTimeoutRef.current = setTimeout(() => {
            setIsSearching(true);
            const params = new URLSearchParams(searchParams?.toString() || "");

            if (value.trim()) {
                params.set("search", value.trim());
            } else {
                params.delete("search");
            }

            params.set("page", "1");

            router.push(`/usuarios?${params.toString()}`);
            setTimeout(() => setIsSearching(false), 100);
        }, 500);
    };

    useEffect(() => {
        return () => {
            if (searchTimeoutRef.current) {
                clearTimeout(searchTimeoutRef.current);
            }
        };
    }, []);

    return (
        <div className="w-full overflow-hidden">
            <div className="flex flex-col sm:flex-row sm:justify-between bg-background-primary items-start sm:items-center p-4 rounded-t-md border-b border-b-foreground/20 gap-4">
                <h2 className="font-semibold">Usuários</h2>
                <div className="relative w-full sm:w-auto">
                    <MagnifyingGlassIcon className="absolute left-2 top-1/2 -translate-y-1/2" />
                    <input
                        type="text"
                        value={searchValue}
                        onChange={(e) => handleSearch(e.target.value)}
                        placeholder="Pesquisar usuários..."
                        className="border py-1 rounded border-foreground/20 pl-8 w-full sm:w-auto"
                    />
                    {isSearching && (
                        <div className="absolute right-2 top-1/2 -translate-y-1/2">
                            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary"></div>
                        </div>
                    )}
                </div>
            </div>
            <div className="overflow-x-auto">
                <div className="ag-theme-quartz" style={{ height: "auto" }}>
                    <AgGridReact<UserProps>
                        ref={gridRef}
                        columnDefs={cols}
                        rowData={users}
                        getRowId={(params) =>
                            String((params.data as UserProps).id)
                        }
                        domLayout="autoHeight"
                        defaultColDef={{
                            flex: 1,
                            cellClass: "bg-background-primary text-foreground",
                            minWidth: 100,
                            resizable: true,
                            headerClass:
                                "bg-background-secondary text-foreground/50 font-semibold",
                        }}
                        suppressMenuHide={true}
                    />
                </div>
            </div>

            {selectedUser && (
                <BettingLimitsModal
                    isOpen={showLimitsModal}
                    onClose={handleLimitsClose}
                    user={selectedUser}
                />
            )}
        </div>
    );
};

export default UsersTable;
