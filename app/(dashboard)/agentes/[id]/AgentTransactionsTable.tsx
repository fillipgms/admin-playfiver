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
import { CheckIcon, StarIcon, XIcon } from "@phosphor-icons/react";
import type { GridApi, GridReadyEvent } from "ag-grid-community";

ModuleRegistry.registerModules([AllCommunityModule]);

const cols: ColDef<TransactionItem>[] = [
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
        headerName: "Provedor",
        field: "provedor",
        flex: 1,
        minWidth: 120,
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
        headerName: "RTP Jogador",
        field: "rtpUser",
        flex: 1,
        minWidth: 100,
        cellRenderer: (p: ICellRendererParams) => {
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
            const value = `${p.value}%`;
            return <div className="text-foreground/50">{value}</div>;
        },
    },
    {
        headerName: "Carteira",
        field: "walletName",
        flex: 1,
        minWidth: 120,
    },
    {
        headerName: "Observação",
        field: "obs",
        minWidth: 120,
        suppressSizeToFit: true,
        cellRenderer: (p: ICellRendererParams) => {
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

const AgentTransactionsTable = ({
    transactions,
}: {
    transactions: TransactionItem[];
}) => {
    const gridRef = useRef<AgGridReact<TransactionItem>>(null);
    const [gridApi, setGridApi] = useState<GridApi | null>(null);

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
                        rowData={transactions}
                        getRowId={(params) =>
                            String((params.data as TransactionItem).id)
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
                        onGridReady={onGridReady}
                    />
                </div>
            </div>
        </div>
    );
};

export default AgentTransactionsTable;
