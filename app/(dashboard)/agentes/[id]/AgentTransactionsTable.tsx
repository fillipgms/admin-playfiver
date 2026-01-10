"use client";
import { AgGridReact } from "ag-grid-react";

import {
    AllCommunityModule,
    ModuleRegistry,
    ColDef,
    ICellRendererParams,
} from "ag-grid-community";

import React, { useEffect, useRef, useState } from "react";
import { twMerge } from "tailwind-merge";
import {
    CaretDownIcon,
    CaretRightIcon,
    CheckIcon,
    StarIcon,
    XIcon,
} from "@phosphor-icons/react";
import type { GridApi, GridReadyEvent } from "ag-grid-community";

ModuleRegistry.registerModules([AllCommunityModule]);
const DetailRenderer = (props: any) => {
    const d = props.data;

    return (
        <div className="px-6 py-4 bg-background-secondary border-t border-foreground/10 grid grid-cols-1 sm:grid-cols-2 gap-6 text-sm">
            <div className="text-foreground">
                <p className="font-medium mb-2 text-foreground/80">
                    Saldo do jogador
                </p>
                <div className="flex gap-2">
                    <span className="text-foreground/50">Antes:</span>
                    <span>R$ {d.balance_player_before}</span>
                </div>
                <div className="flex gap-2">
                    <span className="text-foreground/50">Depois:</span>
                    <span>R$ {d.balance_player_after}</span>
                </div>
            </div>

            <div className="text-foreground">
                <p className="font-medium mb-2 text-foreground/80">
                    Saldo da carteira
                </p>
                <div className="flex gap-2">
                    <span className="text-foreground/50">Antes:</span>
                    <span>R$ {d.balance_wallet_before}</span>
                </div>
                <div className="flex gap-2">
                    <span className="text-foreground/50">Depois:</span>
                    <span>R$ {d.balance_wallet_after}</span>
                </div>
            </div>
        </div>
    );
};

const AgentTransactionsTable = ({
    transactions,
}: {
    transactions: TransactionItem[];
}) => {
    const cols: ColDef<TransactionItem>[] = [
        {
            headerName: "",
            field: "id",
            width: 20,
            pinned: "left",
            sortable: false,
            cellRenderer: (p: ICellRendererParams) => {
                if (p.data.__detail) return null;

                const id = p.data.id as number;
                const isOpen = expandedRows.has(id);

                return (
                    <button
                        onClick={() => {
                            setExpandedRows((prev) => {
                                const next = new Set(prev);
                                isOpen ? next.delete(id) : next.add(id);
                                return next;
                            });
                        }}
                        className="flex items-center justify-center h-full w-full hover:text-primary transition-colors"
                    >
                        {isOpen ? (
                            <CaretDownIcon size={16} weight="bold" />
                        ) : (
                            <CaretRightIcon size={16} weight="bold" />
                        )}
                    </button>
                );
            },
        },
        {
            headerName: "Jogador",
            field: "user",
            flex: 1,
            minWidth: 150,
            pinned: "left",
            cellRenderer: (p: ICellRendererParams) => {
                if (p.data.__detail) return null;

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
                if (p.data.__detail) return null;

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
            cellRenderer: (p: ICellRendererParams) => {
                if (p.data?.__detail) return null;

                return p.value;
            },
        },
        {
            headerName: "Provedor",
            field: "provedor",
            flex: 1,
            minWidth: 120,
            cellRenderer: (p: ICellRendererParams) => {
                if (p.data?.__detail) return null;

                return p.value;
            },
        },
        {
            headerName: "Aposta",
            field: "bet_amount",
            flex: 1,
            minWidth: 120,
            cellRenderer: (p: ICellRendererParams) => {
                if (p.data?.__detail) return null;

                return p.value;
            },
        },
        {
            headerName: "Resultado",
            field: "win_amount",
            flex: 1,
            minWidth: 120,
            cellRenderer: (p: ICellRendererParams) => {
                if (p.data?.__detail) return null;

                const { tipo, bet_amount, win_amount } = p.data;
                const value = tipo === "Perca" ? bet_amount : win_amount;

                return (
                    <p
                        className={
                            tipo === "Perca"
                                ? "text-[#E53935]"
                                : "text-[#95BD2B]"
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
                if (p.data?.__detail) return null;

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
            headerName: "RTP Jogador",
            field: "rtpUser",
            flex: 1,
            minWidth: 100,
            cellRenderer: (p: ICellRendererParams) => {
                if (p.data?.__detail) return null;

                const value = `${p.value}%`;
                return <div className="text-foreground/50">{value}</div>;
            },
        },
        {
            headerName: "RTP Agente",
            field: "rtpAgent",
            flex: 1,
            minWidth: 100,
            cellRenderer: (p: ICellRendererParams) => {
                if (p.data?.__detail) return null;

                const value = `${p.value}%`;
                return <div className="text-foreground/50">{value}</div>;
            },
        },
        {
            headerName: "Carteira",
            field: "walletName",
            flex: 1,
            minWidth: 120,
            cellRenderer: (p: ICellRendererParams) => {
                if (p.data?.__detail) return null;

                return p.value;
            },
        },
        {
            headerName: "Observação",
            field: "obs",
            minWidth: 120,
            suppressSizeToFit: true,
            cellRenderer: (p: ICellRendererParams) => {
                if (p.data?.__detail) return null;

                if (!p.value)
                    return (
                        <div className="flex justify-center">
                            <p className="text-center text-foreground/50">-</p>
                        </div>
                    );

                return p.value;
            },
        },
        {
            headerName: "Data e Hora",
            field: "created_at",
            flex: 1,
            minWidth: 150,
            cellRenderer: (p: ICellRendererParams) => {
                if (p.data?.__detail) return null;

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

    const gridRef = useRef<AgGridReact<TransactionItem>>(null);
    const [gridApi, setGridApi] = useState<GridApi | null>(null);
    const [expandedRows, setExpandedRows] = useState<Set<number>>(new Set());

    useEffect(() => {
        if (transactions && transactions.length) {
            gridApi?.autoSizeColumns(["obs"]);
        }
    }, [transactions]);

    const onGridReady = (params: GridReadyEvent) => {
        setGridApi(params.api);

        if (transactions.length) {
            params.api.autoSizeColumns(["obs"]);
        }
    };

    const rowData = transactions.flatMap((t) => {
        const rows: any[] = [t];

        if (expandedRows.has(t.id)) {
            rows.push({
                __detail: true,
                parentId: t.id,
                id: `detail-${t.id}`,
                balance_player_before: t.balance_player_before,
                balance_player_after: t.balance_player_after,
                balance_wallet_before: t.balance_wallet_before,
                balance_wallet_after: t.balance_wallet_after,
            });
        }

        return rows;
    });

    return (
        <div className="w-full overflow-hidden">
            <div className="flex flex-col sm:flex-row sm:justify-between bg-background-primary items-start sm:items-center p-4 rounded-t-md border-b border-b-foreground/20 gap-4">
                <h2 className="font-semibold">Transações do Agente</h2>
            </div>
            <div className="overflow-x-auto">
                <div className="ag-theme-quartz" style={{ height: "auto" }}>
                    <AgGridReact<TransactionItem>
                        ref={gridRef}
                        columnDefs={cols}
                        rowData={rowData}
                        getRowId={(params) => String(params.data.id)}
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
                        onGridReady={onGridReady}
                        isFullWidthRow={(params) => {
                            return Boolean(
                                (params.rowNode.data as any)?.__detail
                            );
                        }}
                        fullWidthCellRenderer={DetailRenderer}
                        getRowHeight={(params) => {
                            if ((params.data as any)?.__detail) {
                                return 100;
                            }
                            return undefined;
                        }}
                    />
                </div>
            </div>
        </div>
    );
};

export default AgentTransactionsTable;
