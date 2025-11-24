"use client";
import { AgGridReact } from "ag-grid-react";
import {
    AllCommunityModule,
    ModuleRegistry,
    ColDef,
    ICellRendererParams,
    SortChangedEvent,
} from "ag-grid-community";
import React, { useRef, useState, useEffect } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { twMerge } from "tailwind-merge";
import RoleFilter from "./RoleFilter";

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

import { deleteUser } from "@/actions/user";

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

import { IFilterParams, IDoesFilterPassParams } from "ag-grid-community";
import { useImperativeHandle, forwardRef } from "react";
import EditUserModal from "../EditUserModal";
import UserLimits from "../UserLimits";

const UsersTable = ({ users }: { users: UserProps[] }) => {
    const router = useRouter();
    const searchParams = useSearchParams();
    const [isSearching, setIsSearching] = useState(false);
    const [showLimitsModal, setShowLimitsModal] = useState(false);
    const [selectedUser, setSelectedUser] = useState<UserProps | null>(null);
    const gridRef = useRef<AgGridReact<UserProps>>(null);
    const searchTimeoutRef = useRef<NodeJS.Timeout | null>(null);

    const [userToDelete, setUserToDelete] = useState<UserProps | null>(null);
    const [isDeleting, setIsDeleting] = useState(false);

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

    const handleDeleteClick = (user: UserProps) => {
        setUserToDelete(user);
    };

    const handleConfirmDelete = async () => {
        if (!userToDelete) return;

        setIsDeleting(true);
        try {
            const result = await deleteUser(userToDelete.id);

            if (result.success) {
                toast.success(
                    `Usuário ${userToDelete.name} excluído com sucesso`
                );
                router.refresh();
            } else {
                toast.error(result.error || "Erro ao excluir usuário");
            }
        } catch (error) {
            toast.error("Erro inesperado ao excluir");
        } finally {
            setIsDeleting(false);
            setUserToDelete(null);
        }
    };

    const handleDelete = (user: UserProps) => {
        if (confirm(`Tem certeza que deseja excluir o usuário ${user.name}?`)) {
            toast.success(`Usuário ${user.name} excluído`);
        }
    };

    const handleLimits = (user: UserProps) => {
        setSelectedUser(user);
        setShowLimitsModal(true);
    };

    const handleSortChanged = (event: SortChangedEvent) => {
        const sortState = event.api
            .getColumnState()
            .find((s) => s.sort !== null);
        const params = new URLSearchParams(searchParams?.toString() || "");

        params.set("page", "1");

        if (!sortState) {
            params.delete("filter");
        } else {
            const { colId, sort } = sortState;

            if (colId === "saldo") {
                if (sort === "desc") {
                    params.set("filter", "balanceBig");
                } else {
                    params.set("filter", "balanceLess");
                }
            } else if (colId === "created_at") {
                if (sort === "desc") {
                    params.set("filter", "last");
                } else {
                    params.set("filter", "primary");
                }
            } else {
                params.delete("filter");
            }
        }

        router.push(`/usuarios?${params.toString()}`);
    };

    const cols: ColDef<UserProps>[] = [
        {
            headerName: "ID",
            field: "id",
            width: 5,
            pinned: "left",
            sortable: true,
        },
        {
            headerName: "Nome",
            field: "name",
            flex: 1.5,
            minWidth: 180,
            pinned: "left",
            sortable: true,
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
            sortable: true,
            comparator: () => 0,
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
            filter: RoleFilter,
            filterParams: {},
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
                    revendedor: "Revendedor",
                };

                const mainRole = roles[0] || "user";

                let badgeClass = "bg-foreground/10 text-foreground";
                if (mainRole === "admin")
                    badgeClass = "bg-primary/20 text-primary";
                if (mainRole === "suporte")
                    badgeClass = "bg-blue-500/20 text-blue-500";
                if (mainRole === "revendedor")
                    badgeClass = "bg-purple-500/20 text-purple-500";

                return (
                    <div className="flex items-center justify-center h-full w-full">
                        <div
                            className={twMerge(
                                "flex items-center gap-1 justify-center max-w-32 py-1 w-full text-center px-3 rounded text-sm font-medium",
                                badgeClass
                            )}
                        >
                            {roles.length > 0
                                ? roleLabels[mainRole] || mainRole
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
            sortable: true,
            comparator: () => 0,
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
                        <EditUserModal user={user} />
                        {/* <UserLimits userId={user.id} initialData={{}} /> */}
                        <Button
                            size="sm"
                            variant="destructive"
                            onClick={() => handleDeleteClick(user)}
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
                        onSortChanged={handleSortChanged}
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

            <AlertDialog
                open={!!userToDelete}
                onOpenChange={(open) => !open && setUserToDelete(null)}
            >
                <AlertDialogContent className="bg-background-primary">
                    <AlertDialogHeader>
                        <AlertDialogTitle>
                            Tem certeza absoluta?
                        </AlertDialogTitle>
                        <AlertDialogDescription>
                            Essa ação não pode ser desfeita. Isso excluirá
                            permanentemente o usuário{" "}
                            <span className="font-bold text-foreground">
                                {userToDelete?.name}
                            </span>
                            e removerá seus dados dos servidores.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel disabled={isDeleting}>
                            Cancelar
                        </AlertDialogCancel>
                        <AlertDialogAction
                            onClick={(e) => {
                                e.preventDefault();
                                handleConfirmDelete();
                            }}
                            disabled={isDeleting}
                            className="bg-destructive hover:bg-destructive/90 text-destructive-foreground"
                        >
                            {isDeleting
                                ? "Excluindo..."
                                : "Sim, excluir usuário"}
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </div>
    );
};

export default UsersTable;
