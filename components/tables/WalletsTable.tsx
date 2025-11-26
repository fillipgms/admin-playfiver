"use client";
import { AgGridReact } from "ag-grid-react";
import {
    AllCommunityModule,
    ModuleRegistry,
    ColDef,
    ICellRendererParams,
} from "ag-grid-community";
import React, { useRef } from "react";
import { usePermissions } from "@/hooks/usePermissions";

ModuleRegistry.registerModules([AllCommunityModule]);

const WalletsTable = ({ wallets }: { wallets: AdminWalletProps[] }) => {
    const gridRef = useRef<AgGridReact<AdminWalletProps>>(null);
    const { hasPermission } = usePermissions();

    const canView = hasPermission("wallet_view");
    const canEditStatus = hasPermission("wallet_edit_status");

    if (!canView) return null;

    const cols: ColDef<AdminWalletProps>[] = [
        {
            headerName: "Id",
            field: "id",
            flex: 0.5,
            minWidth: 60,
        },
        {
            headerName: "Nome",
            field: "name",
            flex: 2,
            minWidth: 200,
        },
        {
            headerName: "Carteira",
            field: "name_wallet",
            flex: 1.5,
            minWidth: 150,
            cellRenderer: (p: ICellRendererParams) => {
                return (
                    <div className="font-mono text-sm">{p.value || "-"}</div>
                );
            },
        },
        {
            headerName: "Status",
            field: "status",
            flex: 1,
            minWidth: 100,
            cellRenderer: (p: ICellRendererParams) => {
                const isActive = p.value === 1;
                return (
                    <div className="flex items-center justify-center h-full w-full">
                        <input
                            type="checkbox"
                            checked={isActive}
                            readOnly={!canEditStatus}
                            disabled={!canEditStatus}
                            className={
                                canEditStatus
                                    ? "cursor-pointer"
                                    : "cursor-default"
                            }
                            aria-label={`Status ${
                                isActive ? "ativo" : "inativo"
                            }`}
                        />
                    </div>
                );
            },
        },
    ];

    return (
        <div className="space-y-4">
            <div className="flex items-center justify-between">
                <h2 className="font-semibold text-xl">Carteiras</h2>
            </div>
            <div className="overflow-x-auto">
                <div className="ag-theme-quartz" style={{ height: "auto" }}>
                    <AgGridReact<AdminWalletProps>
                        ref={gridRef}
                        columnDefs={cols}
                        rowData={wallets}
                        getRowId={(params) =>
                            String((params.data as AdminWalletProps).id)
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
        </div>
    );
};

export default WalletsTable;
