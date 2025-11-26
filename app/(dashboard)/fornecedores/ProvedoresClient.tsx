"use client";

import React, {
    useCallback,
    useEffect,
    useRef,
    useState,
    useTransition,
} from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import ProvedorCard from "./ProvedorCard";
import { usePermissions } from "@/hooks/usePermissions";
import { Card } from "@/components/Card";
import { WarningCircleIcon, MagnifyingGlassIcon } from "@phosphor-icons/react";
import { editProviderData } from "@/actions/providers";
import PaginationControls from "@/components/PaginationControls";
import { Button } from "@/components/ui/button";

interface ProvedoresClientProps {
    paginationData: ProvedoresResponse;
    provedores: ProvedorProps[];
    searchParams: Record<string, string | string[] | undefined>;
}

const ProvedoresClient = ({
    paginationData,
    provedores,
    searchParams,
}: ProvedoresClientProps) => {
    const router = useRouter();
    const pathname = usePathname();
    const currentSearchParams = useSearchParams();
    const [isPending, startTransition] = useTransition();

    const [error, setError] = React.useState<string | null>(null);
    const [success, setSuccess] = React.useState<string | null>(null);
    const [loadingId, setLoadingId] = React.useState<number | null>(null);
    const { hasPermission, loading } = usePermissions();

    const canViewProviders = hasPermission("provider_view");
    const canEditProviders = hasPermission("provider_edit");

    const [searchValue, setSearchValue] = useState(
        (Array.isArray(searchParams.search)
            ? searchParams.search[0]
            : searchParams.search) ?? ""
    );
    const [isSearching, setIsSearching] = useState(false);
    const debounceRef = useRef<NodeJS.Timeout | null>(null);

    const getParamValue = (value?: string | string[]) =>
        Array.isArray(value) ? value[0] : value;

    const currentPage = parseInt(getParamValue(searchParams.page) || "1", 10);

    const searchParamsRecord = React.useMemo(() => {
        const record: Record<string, string> = {};
        currentSearchParams.forEach((value, key) => {
            record[key] = value;
        });
        return record;
    }, [currentSearchParams]);

    useEffect(() => {
        return () => {
            if (debounceRef.current) {
                clearTimeout(debounceRef.current);
            }
        };
    }, []);

    if (loading) return null;

    if (!canViewProviders) {
        return (
            <Card className="p-8 flex items-center justify-center min-h-[200px]">
                <div className="text-center space-y-3">
                    <WarningCircleIcon className="w-10 h-10 text-destructive mx-auto" />
                    <div>
                        <h3 className="text-lg font-semibold">Acesso Negado</h3>
                        <p className="text-sm text-muted-foreground">
                            Você não tem permissão para visualizar provedores.
                        </p>
                    </div>
                </div>
            </Card>
        );
    }

    const handleSearch = (value: string) => {
        setSearchValue(value);

        if (debounceRef.current) {
            clearTimeout(debounceRef.current);
        }

        debounceRef.current = setTimeout(() => {
            setIsSearching(true);
            const params = new URLSearchParams(
                currentSearchParams.toString() || ""
            );

            if (value.trim()) {
                params.set("search", value.trim());
            } else {
                params.delete("search");
            }

            params.set("page", "1");
            params.set("tab", "provedores");

            startTransition(() => {
                router.replace(`${pathname}?${params.toString()}`, {
                    scroll: false,
                });
            });

            setTimeout(() => setIsSearching(false), 100);
        }, 500);
    };

    const handleStatusChange = async (id: number, status: number) => {
        setLoadingId(id);
        setError(null);
        setSuccess(null);
        const provedor = provedores.find((p) => p.id === id);
        if (!provedor) return;

        const payload: Record<string, string> = {
            id: String(provedor.id),
            name: provedor.name,
            image_url: provedor.image_url,
            status: String(status),
            provedor: String(provedor.id),
            distribuidor: "",
            game_code: "",
        };

        try {
            await editProviderData(payload);
            setSuccess("Status atualizado com sucesso!");
        } catch (err: any) {
            setError(err?.message || "Erro ao atualizar provedor");
        } finally {
            setLoadingId(null);
        }
    };

    const handleEdit = async (payload: Record<string, string>) => {
        setLoadingId(Number(payload.id));
        setError(null);
        setSuccess(null);
        try {
            await editProviderData(payload);
            setSuccess("Provedor atualizado com sucesso!");
        } catch (err: any) {
            setError(err?.message || "Erro ao atualizar provedor");
            throw err;
        } finally {
            setLoadingId(null);
        }
    };

    useEffect(() => {
        return () => {
            if (debounceRef.current) {
                clearTimeout(debounceRef.current);
            }
        };
    }, []);

    return (
        <section className="space-y-6">
            <div className="flex flex-col gap-4">
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                    <div className="relative w-full sm:w-auto">
                        <MagnifyingGlassIcon
                            className="absolute left-2 top-1/2 -translate-y-1/2 text-muted-foreground"
                            size={16}
                        />
                        <input
                            type="text"
                            value={searchValue}
                            onChange={(e) => handleSearch(e.target.value)}
                            placeholder="Pesquisar provedores..."
                            disabled={isPending}
                            className="border py-1 rounded border-foreground/20 pl-8 w-full sm:w-64 focus:ring-1 focus:ring-primary focus:border-primary transition-colors bg-background-primary h-9 text-sm disabled:opacity-50"
                        />
                        {isSearching && (
                            <div className="absolute right-2 top-1/2 -translate-y-1/2">
                                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary"></div>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {(success || error) && (
                <div className="mb-4">
                    {success && (
                        <span className="text-emerald-600 dark:text-emerald-400">
                            {success}
                        </span>
                    )}
                    {error && <span className="text-red-500">{error}</span>}
                </div>
            )}

            {provedores && provedores.length > 0 ? (
                <>
                    <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4 sm:gap-6 lg:gap-8">
                        {provedores.map((provedor) => (
                            <ProvedorCard
                                key={provedor.id}
                                provedor={provedor}
                                onStatusChange={handleStatusChange}
                                loading={loadingId === provedor.id}
                                onEdit={handleEdit}
                                canEdit={canEditProviders}
                            />
                        ))}
                    </div>

                    <PaginationControls
                        currentPage={paginationData.current_page}
                        lastPage={paginationData.last_page}
                        hasNextPage={!!paginationData.next_page_url}
                        hasPrevPage={!!paginationData.prev_page_url}
                        baseUrl="/fornecedores"
                        searchParams={{
                            ...searchParamsRecord,
                            tab: "provedores",
                        }}
                    />
                </>
            ) : (
                <Card className="p-8 flex items-center justify-center min-h-[200px]">
                    <div className="text-center">
                        <p className="text-muted-foreground">
                            Nenhum provedor encontrado
                        </p>
                    </div>
                </Card>
            )}
        </section>
    );
};

export default ProvedoresClient;
