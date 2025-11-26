"use client";
import { AgGridReact } from "ag-grid-react";
import {
    AllCommunityModule,
    ModuleRegistry,
    ColDef,
    ICellRendererParams,
} from "ag-grid-community";
import React, { useRef } from "react";
import { TrashIcon } from "@phosphor-icons/react";
import { usePermissions } from "@/hooks/usePermissions";

ModuleRegistry.registerModules([AllCommunityModule]);

interface GgrTableRowProps {
    id: number;
    tax: number;
    above: string;
    wallet: string;
    revendedor: number;
}

const GgrTable = ({
    ggrData,
    wallets,
}: {
    ggrData: GgrTableRowProps[];
    wallets: AdminWalletProps[];
}) => {
    const gridRef = useRef<AgGridReact<GgrTableRowProps>>(null);
    const { hasPermission } = usePermissions();

    const canView = hasPermission("ggr_view");
    const canEdit = hasPermission("ggr_edit");
    const canDelete = hasPermission("ggr_delete");

    if (!canView) return null;

    const getWalletName = (walletId: string) => {
        const wallet = wallets.find((w) => w.name_wallet === walletId);
        return wallet?.name || walletId;
    };

    const handleDelete = (id: number) => {
        if (confirm("Tem certeza que deseja excluir esta regra de GGR?")) {
            // TODO: Implementar exclusão via API
            console.log("Excluir GGR:", id);
        }
    };

    const cols: ColDef<GgrTableRowProps>[] = [
        {
            headerName: "Taxa",
            field: "tax",
            flex: 0.8,
            minWidth: 80,
            cellRenderer: (p: ICellRendererParams) => {
                return <div className="text-center">{p.value}%</div>;
            },
        },
        {
            headerName: "Acima",
            field: "above",
            flex: 1,
            minWidth: 120,
            cellRenderer: (p: ICellRendererParams) => {
                return (
                    <div className="text-center">
                        R${" "}
                        {parseFloat(p.value || "0").toLocaleString("pt-BR", {
                            minimumFractionDigits: 2,
                            maximumFractionDigits: 2,
                        })}
                    </div>
                );
            },
        },
        {
            headerName: "Carteira",
            field: "wallet",
            flex: 2,
            minWidth: 200,
            cellRenderer: (p: ICellRendererParams) => {
                const walletName = getWalletName(p.value);
                return (
                    <select
                        className="w-full border rounded px-2 py-1 bg-background-primary text-foreground"
                        defaultValue={p.value}
                        onChange={(e) => {
                            if (!canEdit) return;
                            // TODO: Implementar atualização via API
                            console.log("Atualizar carteira:", e.target.value);
                        }}
                        disabled={!canEdit}
                    >
                        {wallets.map((wallet) => (
                            <option key={wallet.id} value={wallet.name_wallet}>
                                {wallet.name}
                            </option>
                        ))}
                    </select>
                );
            },
        },
        {
            headerName: "Revendedor?",
            field: "revendedor",
            flex: 1,
            minWidth: 120,
            cellRenderer: (p: ICellRendererParams) => {
                const isReseller = p.value === 1;
                return (
                    <div className="flex items-center justify-center h-full w-full">
                        <input
                            type="checkbox"
                            checked={isReseller}
                            onChange={(e) => {
                                if (!canEdit) return;
                                // TODO: Implementar atualização via API
                                console.log(
                                    "Atualizar revendedor:",
                                    e.target.checked ? 1 : 0
                                );
                            }}
                            className={
                                canEdit ? "cursor-pointer" : "cursor-default"
                            }
                            disabled={!canEdit}
                            aria-label="Revendedor"
                        />
                    </div>
                );
            },
        },
        ...(canDelete
            ? [
                  {
                      headerName: "Ação",
                      field: "id",
                      flex: 0.8,
                      minWidth: 80,
                      cellRenderer: (p: ICellRendererParams) => {
                          return (
                              <div className="flex items-center justify-center h-full w-full">
                                  <button
                                      onClick={() => handleDelete(p.value)}
                                      className="text-destructive hover:text-destructive/80 p-1"
                                      aria-label="Excluir"
                                  >
                                      <TrashIcon size={20} />
                                  </button>
                              </div>
                          );
                      },
                  } as ColDef<GgrTableRowProps>,
              ]
            : []),
    ];

    return (
        <div className="space-y-4">
            <div className="flex items-center justify-between">
                <h2 className="font-semibold text-xl">Configuração de GGR</h2>
            </div>
            <div className="overflow-x-auto">
                <div className="ag-theme-quartz" style={{ height: "auto" }}>
                    <AgGridReact<GgrTableRowProps>
                        ref={gridRef}
                        columnDefs={cols}
                        rowData={ggrData}
                        getRowId={(params) =>
                            String((params.data as GgrTableRowProps).id)
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

export default GgrTable;
