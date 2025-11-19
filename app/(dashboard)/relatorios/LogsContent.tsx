import { relatorioLogs } from "@/data/placeholder";
import PaginationControls from "@/components/PaginationControls";
import { getLogsData } from "@/actions/logs";

function formatDateHeading(dateStr: string) {
    const d = new Date(dateStr);
    const today = new Date();
    const isToday =
        d.getFullYear() === today.getFullYear() &&
        d.getMonth() === today.getMonth() &&
        d.getDate() === today.getDate();
    if (isToday) return "Hoje";
    return d.toLocaleDateString("pt-BR", {
        weekday: "short",
        day: "2-digit",
        month: "short",
        year: d.getFullYear() !== today.getFullYear() ? "numeric" : undefined,
    });
}

function formatTime(dateStr: string) {
    const d = new Date(dateStr);
    return d.toLocaleTimeString("pt-BR", {
        hour: "2-digit",
        minute: "2-digit",
    });
}

interface LogsContentProps {
    searchParams: Record<string, string | string[] | undefined>;
}

export default async function LogsContent({ searchParams }: LogsContentProps) {
    const { data, error } = await getLogsData();
    if (error) {
        return <div>{error}</div>;
    }
    const logs = data as LogEntryProps[];

    const grouped: Record<string, typeof logs> = {};
    for (const item of logs) {
        const key = new Date(item.created_at).toDateString();
        if (!grouped[key]) grouped[key] = [];
        grouped[key].push(item);
    }

    const dayKeys = Object.keys(grouped).sort(
        (a, b) => new Date(b).getTime() - new Date(a).getTime()
    );

    return (
        <section className="space-y-8">
            {dayKeys.map((key) => (
                <div key={key} className="grid grid-cols-[16px_1fr] gap-4">
                    <div className="relative">
                        <div className="absolute left-2 top-0 bottom-0 w-[2px] bg-border/60" />
                    </div>
                    <div className="space-y-4">
                        <div className="text-sm font-semibold text-foreground/70">
                            {formatDateHeading(key)}
                        </div>
                        {grouped[key]
                            .sort(
                                (a, b) =>
                                    new Date(b.created_at).getTime() -
                                    new Date(a.created_at).getTime()
                            )
                            .map((log, i) => {
                                const gravity = (
                                    log.gravity || ""
                                ).toLowerCase();
                                let badgeClass = "bg-muted text-foreground/70";
                                let badgeText = log.gravity || "OK";
                                switch (gravity) {
                                    case "hight":
                                        badgeClass =
                                            "bg-[#E53935]/15 text-[#E53935]";
                                        badgeText = "Hight";
                                        break;
                                    case "normal":
                                        badgeClass =
                                            "bg-yellow-500/15 text-yellow-500";
                                        badgeText = "Normal";
                                        break;
                                    default:
                                        break;
                                }
                                return (
                                    <div
                                        key={i}
                                        className="grid grid-cols-[16px_1fr] gap-4"
                                    >
                                        <div className="relative">
                                            <div className="h-3 w-3 rounded-full bg-background-primary ring-2 ring-primary relative left-[7px] top-[10px]" />
                                        </div>
                                        <div className="rounded-lg border bg-background-primary p-4 space-y-2">
                                            <div className="flex items-center justify-between gap-3">
                                                <div className="text-sm">
                                                    <span className="font-semibold">
                                                        {log.agente?.code ||
                                                            "Sem agente"}
                                                    </span>
                                                    {log.type && (
                                                        <span className="text-foreground/50">
                                                            {" "}
                                                            · {log.type}
                                                        </span>
                                                    )}
                                                </div>
                                                <span
                                                    className={`text-xs px-2 py-1 rounded ${badgeClass}`}
                                                >
                                                    {badgeText}
                                                </span>
                                            </div>
                                            {log.data?.titulo && (
                                                <div className="text-sm font-medium">
                                                    {log.data.titulo}
                                                </div>
                                            )}
                                            {log.data?.mensagem && (
                                                <div className="text-sm text-foreground/70 break-all">
                                                    {log.data.mensagem}
                                                </div>
                                            )}
                                            {log.user && (
                                                <div className="text-xs text-foreground/50">
                                                    {log.user.name} (
                                                    {log.user.email})
                                                </div>
                                            )}
                                            <div className="text-xs text-foreground/50">
                                                {formatTime(log.created_at)}
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}
                    </div>
                </div>
            ))}

            <PaginationControls
                currentPage={relatorioLogs.current_page}
                lastPage={relatorioLogs.last_page}
                hasNextPage={!!relatorioLogs.next_page_url}
                hasPrevPage={!!relatorioLogs.prev_page_url}
                baseUrl="/relatorios"
                searchParams={searchParams}
                compact
            />
        </section>
    );
}
