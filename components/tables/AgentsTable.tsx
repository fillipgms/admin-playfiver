"use client";

import { AgGridReact } from "ag-grid-react";
import {
    AllCommunityModule,
    ColDef,
    ICellRendererParams,
    ModuleRegistry,
} from "ag-grid-community";
import { useRef } from "react";

ModuleRegistry.registerModules([AllCommunityModule]);

interface AgentTableProps {
    id: number;
    rtp: string;
    url: string;
    rtp_user: string;
    agent_code: string;
    limit_hours: string;
    bonus_enable: number;
    created_date: string;
    limit_enable: number;
    limite_amount: number;
}

const AgentTable = ({ agents }: { agents: SpecificUserAgent[] }) => {
    const gridRef = useRef<AgGridReact<AgentTableProps>>(null);

    const cols: ColDef<AgentTableProps>[] = [
        {
            headerName: "Código",
            field: "agent_code",
            flex: 1,
            minWidth: 150,
            suppressMovable: true,
            pinned: "left",
        },
        {
            headerName: "Rtp",
            suppressMovable: true,
            field: "rtp_user",
            flex: 1,
            minWidth: 150,
            valueFormatter: (p) => `${p.value}%`,
        },
        {
            headerName: "Limite",
            field: "limit_enable",
            suppressMovable: true,
            flex: 1,
            minWidth: 100,
            cellRenderer: (p: ICellRendererParams) => {
                const isEnabled = p.value === 1;
                const enabledValue = p.data.limite_amount;

                return (
                    <div className="flex items-center justify-center h-full w-full">
                        {isEnabled ? `R$ ${enabledValue}` : "-"}
                    </div>
                );
            },
        },
        {
            headerName: "Criado Em",
            field: "created_date",
            flex: 1,
            suppressMovable: true,
            minWidth: 150,
            cellRenderer: (p: ICellRendererParams) => {
                const date = new Date(p.value);

                if (isNaN(date.getTime())) return "—";

                const formattedDate = new Intl.DateTimeFormat("pt-BR", {
                    day: "numeric",
                    month: "short",
                    year: "numeric",
                }).format(date);

                return (
                    <div className="flex items-center justify-center h-full w-full">
                        {formattedDate}
                    </div>
                );
            },
        },
    ];

    return (
        <div className="w-full overflow-hidden">
            <div className="flex flex-col sm:flex-row sm:justify-between bg-background-primary items-start sm:items-center pl-1 pb-4 rounded-t-md border-b border-b-foreground/20 gap-4">
                <h2 className="font-semibold">Agentes</h2>
            </div>
            <div className="overflow-x-auto">
                <div className="ag-theme-quartz" style={{ height: "auto" }}>
                    <AgGridReact<AgentTableProps>
                        ref={gridRef}
                        columnDefs={cols}
                        rowData={agents}
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

export default AgentTable;
