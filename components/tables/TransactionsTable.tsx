"use client";
import { AgGridReact } from "ag-grid-react";
import {
    AllCommunityModule,
    ModuleRegistry,
    ColDef,
    ICellRendererParams,
} from "ag-grid-community";
import React, { useRef, useState, useEffect } from "react";
import { twMerge } from "tailwind-merge";
import {
    CheckIcon,
    MagnifyingGlassIcon,
    StarIcon,
    XIcon,
} from "@phosphor-icons/react";
import { useRouter, useSearchParams } from "next/navigation";

ModuleRegistry.registerModules([AllCommunityModule]);

interface TransactionProps {
    id: number;
    game: string;
    game_original: number;
    provedor: string;
    user: string;
    agente: string;
    id_transaction: string;
    bet_amount: string;
    win_amount: string;
    tipo: string;
    status: number;
    balance_wallet_before: string;
    balance_wallet_after: string;
    balance_player_before: string;
    balance_player_after: string;
    walletName: string;
    influencer: number;
    reembolsada: number;
    rtpUser: string;
    rtpAgent: string;
    status_code: number;
    obs: string | null;
    created_at: string;
}

const cols: ColDef<TransactionProps>[] = [
    {
        headerName: "Jogador",
        field: "user",
        flex: 1,
        minWidth: 150,
        pinned: "left",

        cellRenderer: (p: ICellRendererParams) => {
            const { id_transaction, user } = p.data;

            return (
                <div className="flex flex-col h-full w-full justify-center">
                    <div className="flex gap-1 items-center">
                        <p className="leading-none">{user}</p>
                    </div>
                    <p className="text-xs text-foreground/50 truncate">
                        {id_transaction}
                    </p>
                </div>
            );
        },
    },
    {
        headerName: "Tipo",
        field: "influencer",
        flex: 1,
        minWidth: 130,
        valueFormatter: (p) => (p.value === 1 ? "Influencer" : "Padrão"),
        cellRenderer: (p: ICellRendererParams) => {
            const isInfluencer = p.value === 1;

            return (
                <div className="flex items-center justify-center h-full w-full">
                    <div
                        className={twMerge(
                            "flex items-center gap-1 justify-center max-w-40 py-1 w-full text-center px-3 rounded text-sm font-medium",
                            isInfluencer
                                ? "bg-primary/20 text-primary"
                                : "bg-foreground/20 text-foreground/50"
                        )}
                    >
                        {isInfluencer && (
                            <div className="size-fit">
                                <StarIcon size={12} />
                            </div>
                        )}
                        <p className="truncate">
                            {isInfluencer ? "Influencer" : "Padrão"}
                        </p>
                    </div>
                </div>
            );
        },
    },
    {
        headerName: "Jogo",
        field: "game",
        flex: 1,
        minWidth: 120,
        cellStyle: () => {
            return {
                fontWeight: "medium",
            };
        },
    },
    {
        headerName: "Aposta",
        field: "bet_amount",
        flex: 1,
        minWidth: 120,
    },
    {
        headerName: "Resultado",
        field: "win_amount",
        flex: 1,
        minWidth: 120,
        cellRenderer: (p: ICellRendererParams) => {
            const { tipo, bet_amount, win_amount } = p.data;
            const value = tipo === "Perca" ? bet_amount : win_amount;

            return (
                <p
                    className={
                        tipo === "Perca" ? "text-[#E53935]" : "text-[#95BD2B]"
                    }
                >
                    {tipo === "Perca" ? "-" : "+"} {value}
                </p>
            );
        },
    },
    {
        headerName: "Status",
        field: "status",
        flex: 1,
        minWidth: 120,
        cellRenderer: (p: ICellRendererParams) => {
            const isSuccess = p.value === 1;

            return (
                <div className="flex items-center justify-center h-full w-full">
                    <div
                        className={twMerge(
                            "flex items-center gap-1 justify-center max-w-40 py-1 w-full text-center px-3 rounded text-sm font-medium",
                            isSuccess
                                ? "bg-[#95BD2B]/20 text-[#95BD2B]"
                                : "bg-[#E53935]/20 text-[#E53935]"
                        )}
                    >
                        {isSuccess ? (
                            <div className="size-fit">
                                <CheckIcon size={12} />
                            </div>
                        ) : (
                            <div className="size-fit">
                                <XIcon size={12} />
                            </div>
                        )}
                        <p className="truncate">
                            {isSuccess ? "Sucesso" : "Erro"}
                        </p>
                    </div>
                </div>
            );
        },
    },
    {
        headerName: "RPT",
        field: "rtpUser",
        flex: 1,
        minWidth: 100,
        cellRenderer: (p: ICellRendererParams) => {
            const value = `${p.value}%`;
            return <div className="text-foreground/50">{value}</div>;
        },
    },
    {
        headerName: "Agente",
        field: "agente",
        flex: 1,
        minWidth: 100,
    },
    {
        headerName: "Data e Hora",
        field: "created_at",
        flex: 1,
        minWidth: 150,
        cellRenderer: (p: ICellRendererParams) => {
            if (!p.value) return null;
            const date = new Date(p.value);
            const formatted = `${date.toLocaleDateString(
                "pt-BR"
            )} às ${date.toLocaleTimeString("pt-BR", {
                hour: "2-digit",
                minute: "2-digit",
            })}`;
            return <div className="text-foreground/50">{formatted}</div>;
        },
    },
];

const TransactionsTable = ({
    transactions,
}: {
    transactions: TransactionProps[];
}) => {
    const [searchValue, setSearchValue] = useState("");
    const [isSearching, setIsSearching] = useState(false);
    const gridRef = useRef<AgGridReact<TransactionProps>>(null);
    const router = useRouter();
    const searchParams = useSearchParams();
    const searchTimeoutRef = useRef<NodeJS.Timeout>(null);

    useEffect(() => {
        const urlSearch = searchParams?.get("search") || "";
        setSearchValue(urlSearch);
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

            router.push(`/transacoes?${params.toString()}`);

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
                <h2 className="font-semibold">Transações</h2>
                <div className="relative w-full sm:w-auto">
                    <MagnifyingGlassIcon className="absolute left-2 top-1/2 -translate-y-1/2" />
                    <input
                        type="text"
                        value={searchValue}
                        onChange={(e) => handleSearch(e.target.value)}
                        placeholder="Pesquisar transações..."
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
                    <AgGridReact<TransactionProps>
                        ref={gridRef}
                        columnDefs={cols}
                        rowData={transactions}
                        domLayout="autoHeight"
                        defaultColDef={{
                            flex: 1,
                            cellClass: "bg-background-primary text-foreground",
                            minWidth: 100,
                            resizable: true,
                            headerClass:
                                "bg-background-secondary text-foreground/50 font-semibold",
                        }}
                    />
                </div>
            </div>
        </div>
    );
};

export default TransactionsTable;
