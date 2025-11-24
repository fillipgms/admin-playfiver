/* eslint-disable react-hooks/set-state-in-effect */
"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import {
    useCallback,
    useEffect,
    useMemo,
    useRef,
    useState,
    useTransition,
} from "react";
import AgentCard from "@/components/Agent";
import PaginationControls from "@/components/PaginationControls";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import {
    FunnelSimpleIcon,
    MagnifyingGlassIcon,
    XIcon,
} from "@phosphor-icons/react";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";

import { searchUser } from "@/actions/user";

interface Option {
    value: string;
    label: string;
}

interface FoundUser {
    id: number | string;
    name: string;
    email: string;
}

interface AgentesClientProps {
    agents: Agent[];
    pagination: AgentResponse;
    usersOptions: Option[];
}

const filterOptions = [
    { value: "", label: "Ordenação padrão" },
    { value: "last", label: "Últimos criados" },
    { value: "primary", label: "Primeiros criados" },
    { value: "modify", label: "Última modificação" },
];

export default function AgentesClient({
    agents,
    pagination,
    usersOptions,
}: AgentesClientProps) {
    const router = useRouter();
    const pathname = usePathname();
    const searchParams = useSearchParams();
    const [isPending, startTransition] = useTransition();

    const [searchValue, setSearchValue] = useState(
        searchParams.get("search") ?? ""
    );
    const [showFilters, setShowFilters] = useState(false);
    const debounceRef = useRef<NodeJS.Timeout | null>(null);
    const [isSearching, setIsSearching] = useState(false);

    const [userSearchTerm, setUserSearchTerm] = useState("");
    const [foundUsers, setFoundUsers] = useState<FoundUser[]>([]);
    const [isUserSearching, setIsUserSearching] = useState(false);
    const userSearchTimeoutRef = useRef<NodeJS.Timeout | null>(null);

    const currentUserId = searchParams.get("user");
    const currentUserName = usersOptions.find(
        (u) => String(u.value) === currentUserId
    )?.label;

    useEffect(() => {
        setSearchValue(searchParams.get("search") ?? "");
    }, [searchParams]);

    useEffect(() => {
        if (searchParams.get("user") || searchParams.get("filter")) {
            setShowFilters(true);
        }
    }, []);

    const updateQuery = useCallback(
        (updates: Record<string, string | undefined>) => {
            const params = new URLSearchParams(searchParams.toString());

            Object.entries(updates).forEach(([key, value]) => {
                if (!value) {
                    params.delete(key);
                } else {
                    params.set(key, value);
                }
            });

            params.set("page", "1");
            const queryString = params.toString();

            startTransition(() => {
                router.replace(
                    queryString ? `${pathname}?${queryString}` : pathname,
                    { scroll: false }
                );
            });
        },
        [pathname, router, searchParams, startTransition]
    );

    const handleSearch = (value: string) => {
        setSearchValue(value);

        if (debounceRef.current) {
            clearTimeout(debounceRef.current);
        }

        debounceRef.current = setTimeout(() => {
            setIsSearching(true);
            const params = new URLSearchParams(searchParams.toString() || "");

            if (value.trim()) {
                params.set("search", value.trim());
            } else {
                params.delete("search");
            }

            params.set("page", "1");

            router.push(`${pathname}?${params.toString()}`);
            setTimeout(() => setIsSearching(false), 100);
        }, 500);
    };

    const handleUserSearch = (value: string) => {
        setUserSearchTerm(value);

        if (userSearchTimeoutRef.current) {
            clearTimeout(userSearchTimeoutRef.current);
        }

        if (value.length < 3) {
            setFoundUsers([]);
            return;
        }

        userSearchTimeoutRef.current = setTimeout(async () => {
            setIsUserSearching(true);
            try {
                const result = await searchUser(value);

                if (
                    result.success &&
                    result.data &&
                    Array.isArray(result.data.data)
                ) {
                    setFoundUsers(
                        result.data.data.map((u: any) => ({
                            id: u.id,
                            name: u.email,
                            email: u.email,
                        })) as FoundUser[]
                    );
                } else {
                    setFoundUsers([]);
                }
            } catch (error) {
                setFoundUsers([]);
            } finally {
                setIsUserSearching(false);
            }
        }, 300);
    };

    const handleFilterChange = (value: string) => {
        updateQuery({ filter: value === "default" ? undefined : value });
    };

    const handleUserSelect = (user: FoundUser) => {
        updateQuery({ user: String(user.id) });

        setUserSearchTerm(user.name);
        setFoundUsers([]);
    };

    const clearUserFilter = () => {
        updateQuery({ user: undefined });
        setUserSearchTerm("");
    };

    const clearFilters = () => {
        setSearchValue("");
        clearUserFilter();
        updateQuery({
            search: undefined,
            user: undefined,
            filter: undefined,
        });
    };

    const hasActiveFilters = useMemo(() => {
        return (
            !!searchParams.get("search") ||
            !!searchParams.get("user") ||
            !!searchParams.get("filter")
        );
    }, [searchParams]);

    const searchParamsRecord = useMemo(() => {
        const record: Record<string, string> = {};
        searchParams.forEach((value, key) => {
            record[key] = value;
        });
        return record;
    }, [searchParams]);

    useEffect(() => {
        return () => {
            if (debounceRef.current) {
                clearTimeout(debounceRef.current);
            }
            if (userSearchTimeoutRef.current) {
                clearTimeout(userSearchTimeoutRef.current);
            }
        };
    }, []);

    useEffect(() => {
        if (currentUserId && currentUserName && userSearchTerm === "") {
            setUserSearchTerm(currentUserName);
        }
        if (
            !currentUserId &&
            userSearchTerm &&
            usersOptions.some((u) => u.label === userSearchTerm)
        ) {
            setUserSearchTerm("");
        }
    }, [currentUserId, currentUserName, userSearchTerm, usersOptions]);

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
                            placeholder="Pesquisar agentes..."
                            className="border py-1 rounded border-foreground/20 pl-8 w-full sm:w-64 focus:ring-1 focus:ring-primary focus:border-primary transition-colors bg-background-primary h-9 text-sm"
                        />
                        {isSearching && (
                            <div className="absolute right-2 top-1/2 -translate-y-1/2">
                                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary"></div>
                            </div>
                        )}
                    </div>

                    <div className="flex items-center gap-2">
                        {hasActiveFilters && (
                            <Button
                                variant="ghost"
                                size="sm"
                                onClick={clearFilters}
                                className="text-muted-foreground hover:text-destructive h-9"
                            >
                                Limpar filtros
                            </Button>
                        )}
                        <Button
                            variant="outline"
                            onClick={() => setShowFilters(!showFilters)}
                            className="flex items-center gap-2"
                        >
                            <FunnelSimpleIcon className="h-4 w-4" />
                            Filtros
                            {(searchParams.get("user") ||
                                searchParams.get("filter")) && (
                                <span className="flex h-1.5 w-1.5 rounded-full bg-primary" />
                            )}
                        </Button>
                    </div>
                </div>

                {/* Collapsible Filters Area */}
                {showFilters && (
                    <div className="grid grid-cols-1 gap-4 rounded-lg border border-border/50 bg-muted/20 p-4 sm:grid-cols-2 lg:grid-cols-3 animate-in fade-in slide-in-from-top-2">
                        {/* NOVO CAMPO DE PESQUISA DE USUÁRIOS */}
                        <div className="space-y-1.5">
                            <label className="text-xs font-medium text-muted-foreground ml-1">
                                Filtrar por Usuário
                            </label>
                            <div className="relative">
                                <Input
                                    name="userSearch"
                                    placeholder="Pesquise usuários"
                                    value={userSearchTerm}
                                    onChange={(e) =>
                                        handleUserSearch(e.target.value)
                                    }
                                    className="bg-background h-9"
                                />

                                {/* Dropdown/Scrollarea for Results */}
                                {(foundUsers.length > 0 || isUserSearching) &&
                                    userSearchTerm.length >= 3 && (
                                        <div className="absolute z-10 w-full mt-1 border rounded-md bg-popover shadow-lg max-h-48 overflow-y-auto">
                                            {isUserSearching && (
                                                <div className="flex items-center justify-center p-3 text-sm text-muted-foreground">
                                                    {/* <Loader2 className="animate-spin h-4 w-4 mr-2" /> */}
                                                    Buscando...
                                                </div>
                                            )}

                                            {foundUsers.map((user) => (
                                                <div
                                                    key={user.id}
                                                    className="p-3 cursor-pointer hover:bg-accent hover:text-accent-foreground text-sm flex flex-col transition-colors"
                                                    onClick={() =>
                                                        handleUserSelect(user)
                                                    }
                                                >
                                                    <span className="font-medium">
                                                        {user.name}
                                                    </span>
                                                    <span className="text-xs text-muted-foreground">
                                                        {user.email}
                                                    </span>
                                                </div>
                                            ))}

                                            {foundUsers.length === 0 &&
                                                !isUserSearching && (
                                                    <div className="p-3 text-sm text-muted-foreground">
                                                        Nenhum usuário
                                                        encontrado.
                                                    </div>
                                                )}
                                        </div>
                                    )}
                            </div>

                            {/* Exibe o usuário filtrado atualmente abaixo do campo */}
                            {currentUserId && (
                                <div className="mt-2 text-xs text-muted-foreground p-2 border rounded-md flex items-center justify-between bg-background-primary">
                                    <span className="truncate">
                                        Filtrando:{" "}
                                        <span className="font-semibold text-foreground">
                                            {currentUserName ||
                                                `ID: ${currentUserId}`}
                                        </span>
                                    </span>
                                    <Button
                                        variant="ghost"
                                        size="sm"
                                        onClick={clearUserFilter}
                                        className="h-5 px-1.5 text-xs"
                                    >
                                        <XIcon size={12} />
                                    </Button>
                                </div>
                            )}
                        </div>
                        {/* FIM NOVO CAMPO DE PESQUISA DE USUÁRIOS */}

                        <div className="space-y-1.5">
                            <label className="text-xs font-medium text-muted-foreground ml-1">
                                Ordenação
                            </label>
                            <Select
                                value={searchParams.get("filter") ?? "default"}
                                onValueChange={handleFilterChange}
                            >
                                <SelectTrigger className="bg-background h-9">
                                    <SelectValue placeholder="Ordenação padrão" />
                                </SelectTrigger>
                                <SelectContent>
                                    {filterOptions.map((opt) => (
                                        <SelectItem
                                            key={opt.value || "default"}
                                            value={opt.value || "default"}
                                        >
                                            {opt.label}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                    </div>
                )}
            </div>

            {/* Content Grid */}
            {agents.length === 0 ? (
                <div className="flex flex-col items-center justify-center rounded-lg border border-dashed border-border/60 py-16 text-center text-muted-foreground bg-muted/5">
                    <MagnifyingGlassIcon
                        size={32}
                        className="mb-2 opacity-20"
                    />
                    <p>Nenhum agente encontrado com os filtros atuais.</p>
                    {hasActiveFilters && (
                        <Button
                            variant="link"
                            onClick={clearFilters}
                            className="mt-2 text-primary"
                        >
                            Limpar filtros
                        </Button>
                    )}
                </div>
            ) : (
                <div className="grid grid-cols-1 gap-4 px-2 sm:grid-cols-2 sm:px-4 lg:grid-cols-3 lg:px-0">
                    {agents.map((agent) => (
                        <AgentCard
                            key={agent.id}
                            agent={agent}
                            onActionHappen={() => undefined}
                        />
                    ))}
                </div>
            )}

            <PaginationControls
                currentPage={pagination.current_page}
                lastPage={pagination.last_page}
                hasNextPage={!!pagination.next_page_url}
                hasPrevPage={!!pagination.prev_page_url}
                baseUrl="/agentes"
                searchParams={searchParamsRecord}
            />
        </section>
    );
}
