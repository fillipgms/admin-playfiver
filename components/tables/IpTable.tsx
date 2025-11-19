"use client";
import { AgGridReact } from "ag-grid-react";
import {
    AllCommunityModule,
    ModuleRegistry,
    ColDef,
    ICellRendererParams,
} from "ag-grid-community";
import React, { useRef, useState, useEffect } from "react";

import { MagnifyingGlassIcon, TrashIcon } from "@phosphor-icons/react";
import CreateIp from "../CreateIp";
import { useRouter, useSearchParams } from "next/navigation";

ModuleRegistry.registerModules([AllCommunityModule]);

interface IpWhitelistProps {
    id: number;
    ip: string;
    created_at: string;
}

const IpTable = ({
    whitelist,
    onIpCreated,
}: {
    whitelist: IpWhitelistProps[];
    onIpCreated?: () => void;
}) => {
    const [searchValue, setSearchValue] = useState("");
    const [isSearching, setIsSearching] = useState(false);
    const gridRef = useRef<AgGridReact<IpWhitelistProps>>(null);
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

            router.push(`/ipwhitelist?${params.toString()}`);

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

    const handleDeleteIp = async (id: number) => {
        if (!confirm("Tem certeza que deseja remover este IP da whitelist?")) {
            return;
        }

        try {
            const { deleteIp } = await import("@/actions/ipWhitelist");
            await deleteIp(id);
            onIpCreated?.(); // Refresh the list
        } catch (error) {
            console.error("Failed to delete IP:", error);
            alert("Erro ao deletar IP. Tente novamente.");
        }
    };

    const cols: ColDef<IpWhitelistProps>[] = [
        {
            headerName: "Ip",
            field: "ip",
            flex: 1,
            minWidth: 150,
            pinned: "left",
        },
        {
            headerName: "Adicionado Em",
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
        {
            headerName: "último acesso",
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
        {
            headerName: "Ações",
            minWidth: 100,
            cellRenderer: (params: ICellRendererParams) => (
                <button
                    className="p-1.5 border border-[#E53935] rounded text-[#E53935] cursor-pointer hover:bg-red-50 hover:border-red-300 transition-colors"
                    onClick={() => handleDeleteIp(params.data.id)}
                >
                    <TrashIcon />
                </button>
            ),
            pinned: "right",
            sortable: false,
            filter: false,
        },
    ];

    return (
        <div className="w-full overflow-hidden">
            <div className="flex flex-col sm:flex-row sm:justify-between bg-background-primary items-start sm:items-center p-4 rounded-t-md border-b border-b-foreground/20 gap-4">
                <h2 className="font-semibold">Controle de IPs</h2>
                <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
                    <div className="relative w-full sm:w-auto">
                        <MagnifyingGlassIcon className="absolute left-2 top-1/2 -translate-y-1/2" />
                        <input
                            type="text"
                            value={searchValue}
                            onChange={(e) => handleSearch(e.target.value)}
                            placeholder="Pesquisar IPs..."
                            className="border py-1 rounded border-foreground/20 pl-8 w-full sm:w-auto"
                        />
                        {isSearching && (
                            <div className="absolute right-2 top-1/2 -translate-y-1/2">
                                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary"></div>
                            </div>
                        )}
                    </div>
                    <CreateIp
                        onIpCreated={onIpCreated}
                        existingIps={whitelist.map((item) => item.ip)}
                    />
                </div>
            </div>
            <div className="overflow-x-auto">
                <div className="ag-theme-quartz" style={{ height: "auto" }}>
                    <AgGridReact<IpWhitelistProps>
                        ref={gridRef}
                        columnDefs={cols}
                        rowData={whitelist}
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

export default IpTable;
