import React from "react";
import { ArrowUpIcon, ArrowDownIcon } from "@phosphor-icons/react/dist/ssr";

const formatCurrencyBRL = (value: number): string =>
    new Intl.NumberFormat("pt-BR", {
        style: "currency",
        currency: "BRL",
    }).format(value);

const parseWalletBalance = (value?: string): number => {
    if (!value) return 0;

    const cleaned = value.trim().replace(/[^0-9.,-]/g, "");

    if (!cleaned) return 0;

    if (cleaned.includes(".") && cleaned.includes(",")) {
        const lastComma = cleaned.lastIndexOf(",");
        const lastDot = cleaned.lastIndexOf(".");

        if (lastComma > lastDot) {
            return (
                parseFloat(cleaned.replace(/\./g, "").replace(",", ".")) || 0
            );
        } else {
            return parseFloat(cleaned.replace(/,/g, "")) || 0;
        }
    }

    if (cleaned.includes(",")) {
        return parseFloat(cleaned.replace(/\./g, "").replace(",", ".")) || 0;
    }

    if (cleaned.includes(".")) {
        const dots = (cleaned.match(/\./g) || []).length;
        if (dots > 1) {
            const parts = cleaned.split(".");
            const decimal = parts.pop();
            const integer = parts.join("");
            return parseFloat(`${integer}.${decimal}`) || 0;
        }
        return parseFloat(cleaned) || 0;
    }

    return parseFloat(cleaned) || 0;
};

interface AgentListProps {
    agents: WalletAgentProps[];
    maxVisible?: number;
}

const AgentList = ({ agents, maxVisible = 3 }: AgentListProps) => {
    const safeAgents = Array.isArray(agents) ? agents : [];
    const visibleAgents = safeAgents.slice(0, maxVisible);
    const remainingCount = Math.max(safeAgents.length - maxVisible, 0);

    const sortedAgents = [...visibleAgents].sort((a, b) => {
        const totalA = parseWalletBalance(a.total);
        const totalB = parseWalletBalance(b.total);
        return totalA - totalB; // Menor valor primeiro (maior perda)
    });

    return (
        <div className="space-y-3">
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                    <span className="text-sm font-medium text-foreground/70">
                        Histórico de consumo
                    </span>
                    <span className="bg-foreground/10 text-foreground/60 text-xs px-2 py-0.5 rounded-full">
                        {safeAgents.length}
                    </span>
                </div>
            </div>

            <div className="space-y-2">
                {sortedAgents.map((agent, index) => {
                    const betAmount = parseWalletBalance(agent.bet);
                    const winAmount = parseWalletBalance(agent.win);
                    const totalAmount = parseWalletBalance(agent.total);
                    const isProfit = totalAmount > 0;

                    return (
                        <div
                            key={index}
                            className="bg-foreground/5 rounded-lg p-3 border border-foreground/10"
                        >
                            <div className="flex items-start justify-between mb-2">
                                <div className="flex-1 min-w-0">
                                    <p className="text-sm font-medium text-foreground truncate">
                                        {agent.name}
                                    </p>
                                </div>
                                <div className="flex items-center gap-1 ml-2">
                                    {isProfit ? (
                                        <ArrowUpIcon
                                            weight="bold"
                                            size={14}
                                            className="text-[#95BD2B]"
                                        />
                                    ) : (
                                        <ArrowDownIcon
                                            weight="bold"
                                            size={14}
                                            className="text-[#E53935]"
                                        />
                                    )}
                                    <span
                                        className={`text-sm font-bold ${
                                            isProfit
                                                ? "text-[#95BD2B]"
                                                : "text-[#E53935]"
                                        }`}
                                    >
                                        {isProfit ? "+" : ""}
                                        {formatCurrencyBRL(totalAmount)}
                                    </span>
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-3 text-xs">
                                <div className="space-y-1">
                                    <p className="text-foreground/60">
                                        Apostas
                                    </p>
                                    <p className="font-medium text-foreground">
                                        {formatCurrencyBRL(betAmount)}
                                    </p>
                                </div>
                                <div className="space-y-1">
                                    <p className="text-foreground/60">Ganhos</p>
                                    <p className="font-medium text-foreground">
                                        {formatCurrencyBRL(winAmount)}
                                    </p>
                                </div>
                            </div>
                        </div>
                    );
                })}

                {safeAgents.length === 0 && (
                    <div className="bg-foreground/5 rounded-lg p-3 border border-foreground/10 min-h-[76px] flex items-center justify-center">
                        <span className="text-foreground/50 text-sm">
                            Sem consumo hoje
                        </span>
                    </div>
                )}

                {remainingCount > 0 && (
                    <div className="text-center">
                        <span className="text-xs text-foreground/50 bg-foreground/5 px-3 py-1 rounded-full">
                            +{remainingCount} agente
                            {remainingCount > 1 ? "s" : ""} restante
                            {remainingCount > 1 ? "s" : ""}
                        </span>
                    </div>
                )}
            </div>
        </div>
    );
};

export default AgentList;
