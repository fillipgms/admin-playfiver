"use client";
/* eslint-disable unicorn/no-null */
import type { KeyboardEvent } from "react";
import { useRef, useState } from "react";
import { flushSync } from "react-dom";
import { toast } from "sonner";
import {
    KanbanBoard,
    KanbanBoardColumnSkeleton,
    KanbanBoardExtraMargin,
    KanbanBoardProvider,
    useDndEvents,
} from "@/components/kanban";
import { checkTicket, deleteTicket, resolveTicket } from "@/actions/tickets";
import { useJsLoaded } from "@/hooks/use-js-loaded";
import { MyKanbanBoardColumn } from "./kanban/MyKanbanBoardColumn";
import { useRouter } from "next/navigation";

const ViewTickets = ({
    tickets,
    theresMore,
}: {
    tickets: Ticket[];
    theresMore: boolean;
}) => {
    return (
        <div className="min-w-0 overflow-x-hidden">
            <KanbanBoardProvider>
                <TicketsKanBan tickets={tickets} />
            </KanbanBoardProvider>
        </div>
    );
};

function TicketsKanBan({ tickets }: { tickets: Ticket[] }) {
    const [columns, setColumns] = useState<Column[]>(() => {
        const aFazer = tickets.filter(
            (t) => t.checked === 0 && t.resolved === 0,
        );
        const emProgresso = tickets.filter(
            (t) => t.checked === 1 && t.resolved === 0,
        );
        const concluido = tickets.filter((t) => t.resolved === 1);

        return [
            {
                id: "5155594376",
                title: "A fazer",
                color: "gray",
                items: aFazer,
            },
            {
                id: "1781010825",
                title: "Em progresso",
                color: "blue",
                items: emProgresso,
            },
            {
                id: "8258976454",
                title: "Em testes",
                color: "yellow",
                items: [],
            },
            {
                id: "0373613122",
                title: "Concluído",
                color: "green",
                items: concluido,
            },
            { id: "9060704073", title: "Rejeitado", color: "red", items: [] },
        ];
    });

    const scrollContainerReference = useRef<HTMLDivElement>(null);

    const COLUMN_ACTIONS: Record<string, (id: number) => Promise<unknown>> = {
        "5155594376": (id) => checkTicket(id, 0),
        "1781010825": (id) => checkTicket(id, 1),
        "8258976454": (id) => checkTicket(id, 2),
        "0373613122": (id) => resolveTicket(id, 1),
        "9060704073": (id) => resolveTicket(id, 2),
    };

    const router = useRouter();

    async function handleUpdateCard(cardId: string, updates: Partial<Ticket>) {
        setColumns((prev) =>
            prev.map((column) => ({
                ...column,
                items: column.items.map((item) =>
                    String(item.id) === cardId ? { ...item, ...updates } : item,
                ),
            })),
        );
    }

    async function handleDeleteCard(cardId: string) {
        setColumns((prev) =>
            prev.map((column) =>
                column.items.some((card) => String(card.id) === cardId)
                    ? {
                          ...column,
                          items: column.items.filter(
                              ({ id }) => String(id) !== cardId,
                          ),
                      }
                    : column,
            ),
        );

        try {
            const res = await deleteTicket(cardId);

            if (res.success && res.success === false) {
                toast.error(res.error);
            } else {
                toast.success("Ticket Excluído com Sucesso");
            }
        } catch (error) {
            toast.error(
                error instanceof Error
                    ? error.message
                    : "Ocorreu um erro ao Excluir o Ticket.",
            );
        }

        router.refresh();
    }

    function handleMoveCardToColumn(
        columnId: string,
        index: number,
        card: Ticket,
    ) {
        const previousColumns = columns;
        const currentColumn = columns.find((col) =>
            col.items.some(({ id }) => id === card.id),
        );
        const columnChanged = currentColumn?.id !== columnId;

        setColumns((prev) =>
            prev.map((column) => {
                if (column.id === columnId) {
                    const updated = column.items.filter(
                        ({ id }) => id !== card.id,
                    );
                    return {
                        ...column,
                        items: [
                            ...updated.slice(0, index),
                            card,
                            ...updated.slice(index),
                        ],
                    };
                }
                return {
                    ...column,
                    items: column.items.filter(({ id }) => id !== card.id),
                };
            }),
        );

        if (columnChanged && COLUMN_ACTIONS[columnId]) {
            COLUMN_ACTIONS[columnId](card.id)
                .then((result) => {
                    const res = result as
                        | { success?: boolean; error?: string }
                        | undefined;
                    if (res && res.success === false) {
                        setColumns(previousColumns);
                        toast.error(res.error ?? "Erro ao mover ticket");
                    }
                })
                .catch(() => {
                    setColumns(previousColumns);
                    toast.error("Erro ao mover ticket");
                });
        }
    }

    const [activeCardId, setActiveCardId] = useState<string>("");
    const originalCardPositionReference = useRef<{
        columnId: string;
        cardIndex: number;
    } | null>(null);
    const { onDragStart, onDragEnd, onDragCancel, onDragOver } = useDndEvents();

    function getOverId(column: Column, cardIndex: number): string {
        if (cardIndex < column.items.length - 1) {
            return String(column.items[cardIndex + 1].id);
        }
        return column.id;
    }

    function findCardPosition(cardId: string): {
        columnIndex: number;
        cardIndex: number;
    } {
        for (const [columnIndex, column] of columns.entries()) {
            const cardIndex = column.items.findIndex(
                (c) => String(c.id) === cardId,
            );
            if (cardIndex !== -1) return { columnIndex, cardIndex };
        }
        return { columnIndex: -1, cardIndex: -1 };
    }

    function moveActiveCard(
        cardId: string,
        direction: "ArrowLeft" | "ArrowRight" | "ArrowUp" | "ArrowDown",
    ) {
        const { columnIndex, cardIndex } = findCardPosition(cardId);
        if (columnIndex === -1 || cardIndex === -1) return;

        const card = columns[columnIndex].items[cardIndex];
        let newColumnIndex = columnIndex;
        let newCardIndex = cardIndex;

        switch (direction) {
            case "ArrowUp": {
                newCardIndex = Math.max(cardIndex - 1, 0);
                break;
            }
            case "ArrowDown": {
                newCardIndex = Math.min(
                    cardIndex + 1,
                    columns[columnIndex].items.length - 1,
                );
                break;
            }
            case "ArrowLeft": {
                newColumnIndex = Math.max(columnIndex - 1, 0);
                newCardIndex = Math.min(
                    newCardIndex,
                    columns[newColumnIndex].items.length,
                );
                break;
            }
            case "ArrowRight": {
                newColumnIndex = Math.min(columnIndex + 1, columns.length - 1);
                newCardIndex = Math.min(
                    newCardIndex,
                    columns[newColumnIndex].items.length,
                );
                break;
            }
        }

        flushSync(() => {
            handleMoveCardToColumn(
                columns[newColumnIndex].id,
                newCardIndex,
                card,
            );
        });

        const { columnIndex: updatedColumnIndex, cardIndex: updatedCardIndex } =
            findCardPosition(cardId);
        const overId = getOverId(columns[updatedColumnIndex], updatedCardIndex);
        onDragOver(cardId, overId);
    }

    function handleCardKeyDown(
        event: KeyboardEvent<HTMLButtonElement>,
        cardId: string,
    ) {
        const { key } = event;

        if (activeCardId === "" && key === " ") {
            event.preventDefault();
            setActiveCardId(cardId);
            onDragStart(cardId);

            const { columnIndex, cardIndex } = findCardPosition(cardId);
            originalCardPositionReference.current =
                columnIndex !== -1 && cardIndex !== -1
                    ? { columnId: columns[columnIndex].id, cardIndex }
                    : null;
        } else if (activeCardId === cardId) {
            // eslint-disable-next-line unicorn/prefer-switch
            if (key === " " || key === "Enter") {
                event.preventDefault();
                flushSync(() => {
                    setActiveCardId("");
                });

                const { columnIndex, cardIndex } = findCardPosition(cardId);
                if (columnIndex !== -1 && cardIndex !== -1) {
                    const overId = getOverId(columns[columnIndex], cardIndex);
                    onDragEnd(cardId, overId);
                } else {
                    onDragEnd(cardId);
                }

                originalCardPositionReference.current = null;
            } else if (key === "Escape") {
                event.preventDefault();

                if (originalCardPositionReference.current) {
                    const { columnId, cardIndex } =
                        originalCardPositionReference.current;
                    const {
                        columnIndex: currentColumnIndex,
                        cardIndex: currentCardIndex,
                    } = findCardPosition(cardId);

                    if (
                        currentColumnIndex !== -1 &&
                        (columnId !== columns[currentColumnIndex].id ||
                            cardIndex !== currentCardIndex)
                    ) {
                        const card =
                            columns[currentColumnIndex].items[currentCardIndex];
                        flushSync(() => {
                            handleMoveCardToColumn(columnId, cardIndex, card);
                        });
                    }
                }

                onDragCancel(cardId);
                originalCardPositionReference.current = null;
                setActiveCardId("");
            } else if (
                key === "ArrowLeft" ||
                key === "ArrowRight" ||
                key === "ArrowUp" ||
                key === "ArrowDown"
            ) {
                event.preventDefault();
                moveActiveCard(cardId, key);
            }
        }
    }

    function handleCardBlur() {
        setActiveCardId("");
    }

    const jsLoaded = useJsLoaded();

    return (
        <div className="h-full overflow-x-hidden w-full min-w-0 px-4 py-4 md:px-6">
            <KanbanBoard ref={scrollContainerReference}>
                {columns.map((column) =>
                    jsLoaded ? (
                        <MyKanbanBoardColumn
                            activeCardId={activeCardId}
                            column={column}
                            key={column.id}
                            onCardBlur={handleCardBlur}
                            onCardKeyDown={handleCardKeyDown}
                            onDeleteCard={handleDeleteCard}
                            onMoveCardToColumn={handleMoveCardToColumn}
                            onUpdateCard={handleUpdateCard}
                        />
                    ) : (
                        <KanbanBoardColumnSkeleton key={column.id} />
                    ),
                )}
                <KanbanBoardExtraMargin />
            </KanbanBoard>
        </div>
    );
}

export default ViewTickets;
