"use client";
import Link from "next/link";
import { CaretLeftIcon, CaretRightIcon } from "@phosphor-icons/react";

interface PaginationControlsProps {
    currentPage: number;
    lastPage: number;
    hasNextPage: boolean;
    hasPrevPage: boolean;
    baseUrl: string;
    searchParams: Record<string, string | string[] | undefined>;
    paramKey?: string;
    compact?: boolean;
    hideWhenSinglePage?: boolean;
}

export default function PaginationControls({
    currentPage,
    lastPage,
    hasNextPage,
    hasPrevPage,
    baseUrl,
    searchParams,
    paramKey = "page",
    compact = false,
    hideWhenSinglePage = true,
}: PaginationControlsProps) {
    const buildHref = (newPage: number) => {
        const params = new URLSearchParams();
        Object.entries(searchParams).forEach(([key, value]) => {
            if (value) {
                if (Array.isArray(value)) {
                    value.forEach((v) => params.append(key, v));
                } else {
                    params.set(key, value);
                }
            }
        });
        params.set(paramKey, newPage.toString());
        return `${baseUrl}?${params.toString()}`;
    };

    if (hideWhenSinglePage && lastPage <= 1) {
        return null;
    }

    if (compact) {
        return (
            <div className="flex items-center justify-center gap-2 mt-4">
                <Link
                    scroll={false}
                    href={buildHref(currentPage - 1)}
                    aria-disabled={!hasPrevPage}
                    tabIndex={hasPrevPage ? 0 : -1}
                    onClick={(e) => {
                        if (!hasPrevPage) e.preventDefault();
                    }}
                    className="inline-flex items-center justify-center whitespace-nowrap text-sm font-medium transition-all aria-disabled:pointer-events-none aria-disabled:opacity-50 [&_svg]:pointer-events-none [&_svg:not([class*='size-'])]:size-4 shrink-0 [&_svg]:shrink-0 outline-none focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px] aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive border bg-background shadow-xs hover:bg-accent hover:text-accent-foreground dark:bg-input/30 dark:border-input dark:hover:bg-input/50 rounded-md gap-1.5 has-[>svg]:px-2.5 p-2 h-8 w-8 min-w-0 cursor-pointer"
                >
                    <CaretLeftIcon size={16} />
                </Link>

                <span className="text-sm text-foreground/70">
                    {currentPage} / {lastPage}
                </span>

                <Link
                    scroll={false}
                    href={buildHref(currentPage + 1)}
                    aria-disabled={!hasNextPage}
                    tabIndex={hasNextPage ? 0 : -1}
                    onClick={(e) => {
                        if (!hasNextPage) e.preventDefault();
                    }}
                    className="inline-flex items-center justify-center whitespace-nowrap text-sm font-medium transition-all aria-disabled:pointer-events-none aria-disabled:opacity-50 [&_svg]:pointer-events-none [&_svg:not([class*='size-'])]:size-4 shrink-0 [&_svg]:shrink-0 outline-none focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px] aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive border bg-background shadow-xs hover:bg-accent hover:text-accent-foreground dark:bg-input/30 dark:border-input dark:hover:bg-input/50 rounded-md gap-1.5 has-[>svg]:px-2.5 p-2 h-8 w-8 min-w-0 cursor-pointer"
                >
                    <CaretRightIcon size={16} />
                </Link>
            </div>
        );
    }

    const getVisiblePages = () => {
        const delta = 2;
        const range = [];
        const rangeWithDots = [];

        for (
            let i = Math.max(2, currentPage - delta);
            i <= Math.min(lastPage - 1, currentPage + delta);
            i++
        ) {
            range.push(i);
        }

        if (currentPage - delta > 2) {
            rangeWithDots.push(1, "...");
        } else {
            rangeWithDots.push(1);
        }

        rangeWithDots.push(...range);

        if (currentPage + delta < lastPage - 1) {
            rangeWithDots.push("...", lastPage);
        } else if (lastPage > 1) {
            rangeWithDots.push(lastPage);
        }

        return rangeWithDots;
    };

    return (
        <div className="flex items-center justify-center gap-2 mt-6">
            <Link
                scroll={false}
                href={buildHref(currentPage - 1)}
                aria-disabled={!hasPrevPage}
                tabIndex={hasPrevPage ? 0 : -1}
                className="justify-center whitespace-nowrap text-sm font-medium transition-all aria-disabled:pointer-events-none aria-disabled:opacity-50 [&_svg]:pointer-events-none [&_svg:not([class*='size-'])]:size-4 shrink-0 [&_svg]:shrink-0 outline-none focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px] aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive border bg-background shadow-xs hover:bg-accent hover:text-accent-foreground dark:bg-input/30 dark:border-input dark:hover:bg-input/50 h-8 rounded-md px-3 has-[>svg]:px-2.5 flex items-center gap-1 cursor-pointer aria-disabled:cursor-not-allowed"
                onClick={(e) => {
                    if (!hasPrevPage) e.preventDefault();
                }}
            >
                <CaretLeftIcon size={16} />
                Anterior
            </Link>

            <div className="flex items-center gap-1">
                {getVisiblePages().map((page, index) => {
                    if (page === "...") {
                        return (
                            <span
                                key={`dots-${index}`}
                                className="px-2 py-1 text-foreground/50"
                            >
                                ...
                            </span>
                        );
                    }

                    const pageNumber = page as number;
                    const isCurrentPage = pageNumber === currentPage;

                    return (
                        <Link
                            scroll={false}
                            key={pageNumber}
                            href={buildHref(pageNumber)}
                            aria-current={isCurrentPage ? "page" : undefined}
                            aria-disabled={isCurrentPage}
                            tabIndex={isCurrentPage ? -1 : 0}
                            onClick={(e) => {
                                if (isCurrentPage) e.preventDefault();
                            }}
                            className={`min-w-[40px] ${
                                isCurrentPage
                                    ? "inline-flex items-center justify-center whitespace-nowrap text-sm font-medium transition-all aria-disabled:pointer-events-none [&_svg]:pointer-events-none [&_svg:not([class*='size-'])]:size-4 shrink-0 [&_svg]:shrink-0 outline-none focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px] aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive shadow-xs hover:bg-primary/90 h-8 rounded-md gap-1.5 px-3 has-[>svg]:px-2.5 min-w-[40px] bg-primary text-primary-foreground"
                                    : "inline-flex items-center justify-center whitespace-nowrap text-sm font-medium transition-all aria-disabled:pointer-events-none aria-disabled:opacity-50 [&_svg]:pointer-events-none [&_svg:not([class*='size-'])]:size-4 shrink-0 [&_svg]:shrink-0 outline-none focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px] aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive border bg-background shadow-xs hover:bg-accent hover:text-accent-foreground dark:bg-input/30 dark:border-input dark:hover:bg-input/50 h-8 rounded-md gap-1.5 px-3 has-[>svg]:px-2.5 min-w-[40px] cursor-pointer"
                            }`}
                        >
                            {pageNumber}
                        </Link>
                    );
                })}
            </div>

            <Link
                scroll={false}
                href={buildHref(currentPage + 1)}
                aria-disabled={!hasNextPage}
                tabIndex={hasNextPage ? 0 : -1}
                onClick={(e) => {
                    if (!hasNextPage) e.preventDefault();
                }}
                className="justify-center whitespace-nowrap text-sm font-medium transition-all aria-disabled:pointer-events-none aria-disabled:opacity-50 [&_svg]:pointer-events-none [&_svg:not([class*='size-'])]:size-4 shrink-0 [&_svg]:shrink-0 outline-none focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px] aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive border bg-background shadow-xs hover:bg-accent hover:text-accent-foreground dark:bg-input/30 dark:border-input dark:hover:bg-input/50 h-8 rounded-md px-3 has-[>svg]:px-2.5 flex items-center gap-1 cursor-pointer aria-disabled:cursor-not-allowed"
            >
                Próxima
                <CaretRightIcon size={16} />
            </Link>
        </div>
    );
}
