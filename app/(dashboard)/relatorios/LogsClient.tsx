"use client";

import React, { useState, useEffect, useCallback } from "react";
import { FunnelSimpleIcon, CalendarBlankIcon } from "@phosphor-icons/react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/Card";
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import {
    Select,
    SelectValue,
    SelectTrigger,
    SelectContent,
    SelectItem,
    SelectGroup,
    SelectLabel,
} from "@/components/ui/select";
import { agentes } from "@/data/placeholder";

const LogsClient = () => {
    const router = useRouter();
    const pathname = usePathname();
    const searchParams = useSearchParams();

    const [showFilters, setShowFilters] = useState(false);
    const [filters, setFilters] = useState<LogsFilters>({});

    const agentesData = Object.values(agentes) as Agent[];

    const createQueryString = useCallback((f: TransactionFilters) => {
        const params = new URLSearchParams();

        if (f.search) params.set("search", f.search);
        if (f.page && f.page > 1) params.set("page", f.page.toString());
        if (f.dateStart) params.set("dateStart", f.dateStart.toString());
        if (f.dateEnd) params.set("dateEnd", f.dateEnd.toString());
        if (f.agent) params.set("agent", f.agent.toString());

        return params.toString();
    }, []);

    useEffect(() => {
        const params = new URLSearchParams(searchParams.toString());

        const parsedFilters: LogsFilters = {
            page: params.get("page") ? Number(params.get("page")) : 1,
            dateStart: params.get("dateStart") || undefined,
            dateEnd: params.get("dateEnd") || undefined,
            agent: params.get("agent") || undefined,
        };

        // eslint-disable-next-line react-hooks/set-state-in-effect
        setFilters((prev) => {
            const prevQS = createQueryString(prev);
            const nextQS = createQueryString(parsedFilters);
            return prevQS === nextQS ? prev : parsedFilters;
        });
    }, [searchParams, createQueryString]);

    const handleFilterChange = (newFilters: Partial<LogsFilters>) => {
        const updatedFilters = { ...filters, ...newFilters };

        (["dateStart", "dateEnd", "agent"] as Array<keyof LogsFilters>).forEach(
            (key) => {
                if (updatedFilters[key] === "") {
                    updatedFilters[key] = undefined;
                }
            }
        );

        const nextFilters: TransactionFilters = { ...updatedFilters, page: 1 };

        const prevQS = createQueryString(filters);
        const nextQS = createQueryString(nextFilters);

        if (prevQS === nextQS) return;

        setFilters(nextFilters);
        router.push(nextQS ? pathname + "?" + nextQS : pathname);
    };

    const formatDateTime = (d?: Date) => {
        if (!d) return undefined;
        const datePart = d.toLocaleDateString("en-US", {
            month: "2-digit",
            day: "2-digit",
            year: "numeric",
        });

        const timePart = d.toLocaleTimeString("en-US", {
            hour12: false,
            hour: "2-digit",
            minute: "2-digit",
            second: "2-digit",
        });
        return `${datePart} ${timePart}`;
    };

    const parseDate = (value?: string) => {
        if (!value) return undefined;
        const d = new Date(value);
        return isNaN(d.getTime()) ? undefined : d;
    };

    const handleDateRangeChange = (startDate?: string, endDate?: string) => {
        if (!startDate && !endDate) {
            handleFilterChange({ dateStart: undefined, dateEnd: undefined });
            return;
        }

        handleFilterChange({
            dateStart: startDate
                ? formatDateTime(new Date(startDate))
                : undefined,
            dateEnd: endDate ? formatDateTime(new Date(endDate)) : undefined,
        });
    };

    const clearAllFilters = () => {
        handleFilterChange({
            dateStart: undefined,
            dateEnd: undefined,
            agent: undefined,
        });
    };

    const hasActiveFilters = () => {
        return !!(filters.dateStart || filters.dateEnd || filters.agent);
    };

    return (
        <section>
            <div className="space-y-4">
                <div className="flex flex-col lg:flex-row gap-4 items-start lg:items-center justify-between">
                    <div className="flex-1 w-full">
                        <div className="relative">
                            <h2 className="font-semibold text-xl">
                                Logs de Erros
                            </h2>
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
                                onClick={() => {
                                    clearAllFilters();
                                }}
                                className="text-muted-foreground hover:text-foreground"
                            >
                                Limpar filtros
                            </Button>
                        )}
                    </div>
                </div>

                {showFilters && (
                    <Card className="p-4 space-y-4 grid grid-cols-1 md:grid-cols-3">
                        <div className="space-y-2">
                            <label className="text-sm font-medium px-1">
                                Agente
                            </label>
                            <Select
                                value={filters.agent || ""}
                                onValueChange={(value) =>
                                    handleFilterChange({
                                        agent: value || undefined,
                                    })
                                }
                            >
                                <SelectTrigger className="w-full">
                                    <SelectValue placeholder="Selecione um Agente" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectGroup>
                                        <SelectLabel className="sr-only">
                                            Agentes
                                        </SelectLabel>
                                        {agentesData?.map((a) => (
                                            <SelectItem
                                                key={a.id}
                                                value={a.agent_code}
                                            >
                                                {a.agent_memo || a.agent_code}
                                            </SelectItem>
                                        ))}
                                    </SelectGroup>
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="space-y-2 md:col-span-2">
                            <label className="text-sm font-medium px-1">
                                Período
                            </label>
                            <Popover>
                                <PopoverTrigger asChild>
                                    <Button
                                        variant="outline"
                                        className="w-full justify-start text-left font-normal"
                                        data-empty={
                                            !parseDate(filters.dateStart)
                                        }
                                    >
                                        <CalendarBlankIcon className="mr-2 h-4 w-4" />
                                        {parseDate(filters.dateStart) ? (
                                            parseDate(filters.dateEnd) ? (
                                                <>
                                                    {parseDate(
                                                        filters.dateStart
                                                    )?.toLocaleDateString(
                                                        "pt-BR"
                                                    )}{" "}
                                                    -{" "}
                                                    {parseDate(
                                                        filters.dateEnd
                                                    )?.toLocaleDateString(
                                                        "pt-BR"
                                                    )}
                                                </>
                                            ) : (
                                                parseDate(
                                                    filters.dateStart
                                                )?.toLocaleDateString("pt-BR", {
                                                    day: "numeric",
                                                    month: "long",
                                                    year: "numeric",
                                                })
                                            )
                                        ) : (
                                            <span>Selecione o período</span>
                                        )}
                                    </Button>
                                </PopoverTrigger>
                                <PopoverContent
                                    className="w-auto p-4"
                                    align="start"
                                >
                                    <div className="space-y-4">
                                        <div className="space-y-2">
                                            <label className="text-sm font-medium">
                                                Data Inicial
                                            </label>
                                            <input
                                                type="date"
                                                value={
                                                    parseDate(filters.dateStart)
                                                        ?.toISOString()
                                                        .split("T")[0] || ""
                                                }
                                                onChange={(e) =>
                                                    handleDateRangeChange(
                                                        e.target.value,
                                                        filters.dateEnd
                                                    )
                                                }
                                                className="w-full px-3 py-2 border rounded-md bg-background-primary"
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-sm font-medium">
                                                Data Final
                                            </label>
                                            <input
                                                type="date"
                                                value={
                                                    parseDate(filters.dateEnd)
                                                        ?.toISOString()
                                                        .split("T")[0] || ""
                                                }
                                                onChange={(e) =>
                                                    handleDateRangeChange(
                                                        filters.dateStart,
                                                        e.target.value
                                                    )
                                                }
                                                className="w-full px-3 py-2 border rounded-md bg-background-primary"
                                            />
                                        </div>
                                    </div>
                                </PopoverContent>
                            </Popover>
                        </div>
                    </Card>
                )}
            </div>
        </section>
    );
};

export default LogsClient;
