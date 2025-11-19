"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import Game from "@/components/Game";
import {
    MagnifyingGlassIcon,
    XIcon,
    GameControllerIcon,
    SpinnerGapIcon,
    WarningCircleIcon,
    FunnelSimpleIcon,
} from "@phosphor-icons/react";

import {
    Select,
    SelectItem,
    SelectContent,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { useRouter, usePathname, useSearchParams } from "next/navigation";
import { getGamesData } from "@/actions/jogos";
import { getAllWalletsData } from "@/actions/carteiras";
import { MultiSelect } from "@/components/ui/multi-select";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/Card";
import { useGameTourStep } from "@/data/toursteps";

interface JogosClientProps {
    initialData: GamesResponse;
}

export default function JogosClient({ initialData }: JogosClientProps) {
    const [games, setGames] = useState<GameProps[]>(initialData.data);
    const [loading, setLoading] = useState(false);
    const [loadingMore, setLoadingMore] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [currentPage, setCurrentPage] = useState(initialData.current_page);
    const [hasMore, setHasMore] = useState(!!initialData.next_page_url);
    const [searchTerm, setSearchTerm] = useState("");
    const [filters, setFilters] = useState<GamesFilters>({});
    const [provedores] = useState(initialData.provedor);
    const [carteiras, setCarteiras] = useState<WalletProps[]>([]);
    const [showFilters, setShowFilters] = useState(false);
    const [totalGames, setTotalGames] = useState(initialData.total);

    const isGameTourStep = useGameTourStep();

    const observerRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const fetchCarteiras = async () => {
            try {
                const carteirasData = await getAllWalletsData();
                setCarteiras(carteirasData?.data || []);
            } catch (error) {
                console.error("Error loading carteiras:", error);
            }
        };

        fetchCarteiras();
    }, []);

    const searchTimeoutRef = useRef<NodeJS.Timeout | null>(null);
    const router = useRouter();
    const pathname = usePathname();
    const searchParams = useSearchParams();

    const loadGames = useCallback(
        async (newFilters: GamesFilters, page = 1) => {
            setLoading(true);
            setError(null);

            try {
                const data = await getGamesData({ ...newFilters, page });

                if (data) {
                    setGames(data.data);
                    setCurrentPage(page);
                    setHasMore(!!data.next_page_url);
                    setTotalGames(data.total);
                }
            } catch (error) {
                console.error("Error loading games:", error);
                setError("Erro ao carregar jogos. Tente novamente.");
            } finally {
                setLoading(false);
            }
        },
        []
    );

    const loadMoreGames = useCallback(async () => {
        if (loadingMore || !hasMore) return;

        setLoadingMore(true);
        setError(null);
        const nextPage = currentPage + 1;

        try {
            const data = await getGamesData({ ...filters, page: nextPage });

            if (data) {
                setGames((prev) => [...prev, ...data.data]);
                setCurrentPage(nextPage);
                setHasMore(!!data.next_page_url);
            }
        } catch (error) {
            console.error("Error loading more games:", error);
            setError("Erro ao carregar mais jogos. Tente novamente.");
        } finally {
            setLoadingMore(false);
        }
    }, [currentPage, hasMore, loadingMore, filters]);

    useEffect(() => {
        const observer = new IntersectionObserver(
            (entries) => {
                if (entries[0].isIntersecting && hasMore && !loadingMore) {
                    loadMoreGames();
                }
            },
            {
                threshold: 0.1,
                rootMargin: "200px 0px",
            }
        );

        if (observerRef.current) {
            observer.observe(observerRef.current);
        }

        return () => observer.disconnect();
    }, [loadMoreGames, hasMore, loadingMore]);

    useEffect(() => {
        const params = new URLSearchParams(searchParams.toString());

        const parseArray = (key: string): string[] => {
            const raw = params.get(key);
            if (!raw) return [];

            try {
                return JSON.parse(raw);
            } catch {
                return [];
            }
        };

        const parsedFilters: GamesFilters = {
            provedor: parseArray("provedor").map(String),
            typeGame: parseArray("typeGame").map(String),
            carteira: parseArray("carteira").map(String),
            bonus: params.get("bonus") || undefined,
            search: params.get("search") || undefined,
            page: params.get("page") ? Number(params.get("page")) : 1,
        };

        // Se carteira está na URL, converter para provedores
        if (parsedFilters.carteira?.length && carteiras.length > 0) {
            const selectedCarteiras = carteiras.filter((c) =>
                parsedFilters.carteira?.includes(String(c.id))
            );
            const provedoresFromCarteiras = selectedCarteiras.flatMap((c) =>
                c.provedores.map((p) => String(p.id))
            );

            // Remover duplicatas e combinar com provedores existentes
            const uniqueProvedores = [
                ...new Set([
                    ...(parsedFilters.provedor || []),
                    ...provedoresFromCarteiras,
                ]),
            ];

            parsedFilters.provedor = uniqueProvedores;
        }

        setFilters(parsedFilters);
        setSearchTerm(parsedFilters.search || "");

        const hasFilters =
            parsedFilters.provedor?.length ||
            parsedFilters.typeGame?.length ||
            parsedFilters.carteira?.length ||
            parsedFilters.bonus ||
            parsedFilters.search;

        if (hasFilters) {
            loadGames(parsedFilters, parsedFilters.page || 1);
        }
    }, [searchParams, loadGames, carteiras]);

    const createQueryString = useCallback((filters: GamesFilters) => {
        const params = new URLSearchParams();

        if (filters.search) params.set("search", filters.search);

        if (filters.provedor?.length) {
            params.set("provedor", `[${filters.provedor.join(",")}]`);
        }

        if (filters.typeGame?.length) {
            params.set("typeGame", `[${filters.typeGame.join(",")}]`);
        }

        if (filters.carteira?.length) {
            params.set("carteira", `[${filters.carteira.join(",")}]`);
        }

        if (filters.bonus) params.set("bonus", filters.bonus);

        if (filters.page) params.set("page", filters.page.toString());

        return params.toString();
    }, []);

    const handleFilterChange = (newFilters: Partial<GamesFilters>) => {
        const updatedFilters = { ...filters, ...newFilters };

        if (newFilters.carteira !== undefined) {
            const selectedCarteiras = carteiras.filter((c) =>
                newFilters.carteira?.includes(String(c.id))
            );
            const provedoresFromCarteiras = selectedCarteiras.flatMap((c) =>
                c.provedores.map((p) => String(p.id))
            );

            const uniqueProvedores = [...new Set(provedoresFromCarteiras)];

            updatedFilters.provedor = uniqueProvedores;
        }

        setFilters(updatedFilters);
        setCurrentPage(1);

        const query = createQueryString({ ...updatedFilters, page: 1 });
        router.push(pathname + "?" + query);

        loadGames(updatedFilters, 1);
    };

    const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value;
        setSearchTerm(value);

        if (searchTimeoutRef.current) {
            clearTimeout(searchTimeoutRef.current);
        }

        searchTimeoutRef.current = setTimeout(() => {
            handleFilterChange({ search: value });
        }, 500);
    };

    const clearSearch = () => {
        setSearchTerm("");
        handleFilterChange({ search: "" });
    };

    const clearAllFilters = () => {
        setSearchTerm("");
        setFilters({});
        setCurrentPage(1);
        const query = createQueryString({ page: 1 });
        router.push(pathname + "?" + query);
        loadGames({}, 1);
    };

    const hasActiveFilters = () => {
        return !!(
            searchTerm ||
            filters.provedor?.length ||
            filters.typeGame?.length ||
            filters.carteira?.length ||
            filters.bonus
        );
    };

    const provedorOptions = provedores.map((p) => ({
        label: p.name,
        value: String(p.id),
    }));

    const carteiraOptions = carteiras.map((c) => ({
        label: c.name,
        value: String(c.id),
    }));

    return (
        <div className="space-y-6">
            <div className="space-y-4">
                <div className="flex flex-col lg:flex-row gap-4 items-start lg:items-center justify-between">
                    <div className="flex-1 w-full">
                        <div className="relative">
                            <MagnifyingGlassIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                            <input
                                type="text"
                                value={searchTerm}
                                onChange={handleSearchChange}
                                placeholder="Pesquisar jogos por nome..."
                                className="w-full pl-10 pr-10 py-3 rounded-lg border border-input bg-background-primary text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                                aria-label="Pesquisar jogos"
                            />
                            {searchTerm && (
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={clearSearch}
                                    className="absolute right-2 top-1/2 -translate-y-1/2 h-6 w-6 p-0 hover:bg-muted"
                                    aria-label="Limpar pesquisa"
                                >
                                    <XIcon className="h-4 w-4" />
                                </Button>
                            )}
                        </div>
                    </div>

                    <div className="flex flex-col sm:flex-row gap-3 w-full lg:w-auto">
                        <Button
                            variant="outline"
                            onClick={() => setShowFilters(!showFilters)}
                            className="flex items-center gap-2"
                        >
                            <FunnelSimpleIcon className="h-4 w-4" />
                            Filtros
                            {hasActiveFilters() && (
                                <div className="h-2 w-2 rounded-full bg-primary" />
                            )}
                        </Button>

                        {hasActiveFilters() && (
                            <Button
                                variant="ghost"
                                onClick={clearAllFilters}
                                className="text-muted-foreground hover:text-foreground"
                            >
                                Limpar filtros
                            </Button>
                        )}
                    </div>
                </div>

                {showFilters && (
                    <Card className="p-4 space-y-4">
                        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
                            <div className="space-y-2">
                                <label className="text-sm font-medium">
                                    Provedores
                                </label>
                                <MultiSelect
                                    options={provedorOptions}
                                    defaultValue={filters.provedor || []}
                                    onValueChange={(values) => {
                                        handleFilterChange({
                                            provedor:
                                                values.length > 0 ? values : [],
                                        });
                                    }}
                                    className="w-full"
                                    placeholder="Selecionar provedores"
                                    animationConfig={{
                                        badgeAnimation: "none",
                                        popoverAnimation: "none",
                                        optionHoverAnimation: "none",
                                    }}
                                />
                            </div>

                            <div className="space-y-2">
                                <label className="text-sm font-medium">
                                    Carteiras
                                </label>
                                <MultiSelect
                                    options={carteiraOptions}
                                    defaultValue={filters.carteira || []}
                                    onValueChange={(values) => {
                                        handleFilterChange({
                                            carteira:
                                                values.length > 0 ? values : [],
                                        });
                                    }}
                                    className="w-full"
                                    placeholder="Selecionar carteiras"
                                    animationConfig={{
                                        badgeAnimation: "none",
                                        popoverAnimation: "none",
                                        optionHoverAnimation: "none",
                                    }}
                                />
                            </div>

                            <div className="space-y-2">
                                <label className="text-sm font-medium">
                                    Tipo de Jogo
                                </label>
                                <Select
                                    value={filters.typeGame?.[0] ?? "all"}
                                    onValueChange={(value) =>
                                        handleFilterChange({
                                            typeGame:
                                                value === "all" ? [] : [value],
                                        })
                                    }
                                >
                                    <SelectTrigger className="w-full">
                                        <SelectValue placeholder="Selecionar tipo" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="all">
                                            Todos os tipos
                                        </SelectItem>
                                        <SelectItem value="0">
                                            Não original
                                        </SelectItem>
                                        <SelectItem value="1">
                                            Original
                                        </SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>

                            <div className="space-y-2">
                                <label className="text-sm font-medium">
                                    Rodadas Grátis
                                </label>
                                <Select
                                    value={
                                        filters.bonus !== undefined
                                            ? String(filters.bonus)
                                            : "all"
                                    }
                                    onValueChange={(value) =>
                                        handleFilterChange({
                                            bonus:
                                                value === "all"
                                                    ? undefined
                                                    : value,
                                        })
                                    }
                                >
                                    <SelectTrigger className="w-full">
                                        <SelectValue placeholder="Selecionar opção" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="all">
                                            Todos os jogos
                                        </SelectItem>
                                        <SelectItem value="0">
                                            Sem rodadas grátis
                                        </SelectItem>
                                        <SelectItem value="1">
                                            Com rodadas grátis
                                        </SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>
                    </Card>
                )}

                <div className="flex items-center justify-between text-sm text-muted-foreground">
                    <div className="flex items-center gap-2">
                        <GameControllerIcon className="h-4 w-4" />
                        <span>
                            {loading
                                ? "Carregando..."
                                : `${totalGames} jogos encontrados`}
                        </span>
                    </div>
                    {hasActiveFilters() && (
                        <div className="text-xs bg-muted px-2 py-1 rounded">
                            Filtros ativos
                        </div>
                    )}
                </div>
            </div>

            {error && (
                <Card className="p-4 border-destructive/50 bg-destructive/5">
                    <div className="flex items-center gap-2 text-destructive">
                        <WarningCircleIcon className="h-4 w-4" />
                        <span className="text-sm">{error}</span>
                    </div>
                </Card>
            )}

            {loading && (
                <div className="flex flex-col items-center justify-center py-12 space-y-4">
                    <SpinnerGapIcon className="h-8 w-8 animate-spin text-primary" />
                    <p className="text-sm text-muted-foreground">
                        Carregando jogos...
                    </p>
                </div>
            )}

            {!loading && !error && (
                <>
                    {games.length === 0 ? (
                        <Card className="p-12 text-center">
                            <GameControllerIcon className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                            <h3 className="text-lg font-semibold mb-2">
                                Nenhum jogo encontrado
                            </h3>
                            <p className="text-muted-foreground mb-4">
                                {hasActiveFilters()
                                    ? "Tente ajustar os filtros para encontrar mais jogos."
                                    : "Não há jogos disponíveis no momento."}
                            </p>
                            {hasActiveFilters() && (
                                <Button
                                    onClick={clearAllFilters}
                                    variant="outline"
                                >
                                    Limpar filtros
                                </Button>
                            )}
                        </Card>
                    ) : (
                        <main className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4 md:gap-6">
                            {games.map((game, i) => (
                                <Game
                                    id={`game-${i}`}
                                    key={game.id}
                                    game={game}
                                    isPinnedForced={isGameTourStep && i === 0}
                                />
                            ))}
                        </main>
                    )}
                </>
            )}

            {loadingMore && (
                <div className="flex justify-center py-8">
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <SpinnerGapIcon className="h-4 w-4 animate-spin" />
                        Carregando mais jogos...
                    </div>
                </div>
            )}

            <div ref={observerRef} className="h-4" />
        </div>
    );
}
