import {
    KanbanBoardColumn,
    KanbanBoardColumnHeader,
    KanbanBoardColumnList,
    KanbanBoardColumnListItem,
    KanbanBoardColumnTitle,
    KanbanBoardDropDirection,
    KanbanColorCircle,
    useDndEvents,
} from "@/components/kanban";

import { useRef, type KeyboardEvent } from "react";
import { MyKanbanBoardCard } from "./MyKanbanBoardCard";

function parseTransferredTicket(dataTransferData: string): Ticket {
    const parsed = JSON.parse(dataTransferData) as Omit<Ticket, "id"> & { id: string };
    return { ...parsed, id: Number(parsed.id) };
}

export function MyKanbanBoardColumn({
    activeCardId,
    column,
    onCardBlur,
    onCardKeyDown,
    onDeleteCard,
    onMoveCardToColumn,
    onUpdateCard,
}: {
    activeCardId: string;
    column: Column;
    onCardBlur: () => void;
    onCardKeyDown: (event: KeyboardEvent<HTMLButtonElement>, cardId: string) => void;
    onDeleteCard: (cardId: string) => void;
    onMoveCardToColumn: (columnId: string, index: number, card: Ticket) => void;
    onUpdateCard: (cardId: string, updates: Partial<Ticket>) => void;
}) {
    const listReference = useRef<HTMLUListElement>(null);
    const { onDragCancel, onDragEnd } = useDndEvents();

    function handleDropOverColumn(dataTransferData: string) {
        const card = parseTransferredTicket(dataTransferData);
        onMoveCardToColumn(column.id, 0, card);
    }

    function handleDropOverListItem(cardId: string) {
        return (dataTransferData: string, dropDirection: KanbanBoardDropDirection) => {
            const card = parseTransferredTicket(dataTransferData);
            const cardIndex = column.items.findIndex(({ id }) => String(id) === cardId);
            const currentCardIndex = column.items.findIndex(({ id }) => id === card.id);

            const baseIndex = dropDirection === "top" ? cardIndex : cardIndex + 1;
            const targetIndex =
                currentCardIndex !== -1 && currentCardIndex < baseIndex
                    ? baseIndex - 1
                    : baseIndex;

            const safeTargetIndex = Math.max(0, Math.min(targetIndex, column.items.length));
            const overCard = column.items[safeTargetIndex];

            if (card.id === overCard?.id) {
                onDragCancel(String(card.id));
            } else {
                onMoveCardToColumn(column.id, safeTargetIndex, card);
                onDragEnd(String(card.id), overCard?.id ? String(overCard.id) : column.id);
            }
        };
    }

    return (
        <KanbanBoardColumn
            columnId={column.id}
            key={column.id}
            onDropOverColumn={handleDropOverColumn}
            className="bg-background-primary"
        >
            <KanbanBoardColumnHeader>
                <KanbanBoardColumnTitle columnId={column.id}>
                    <KanbanColorCircle color={column.color} />
                    {column.title}
                </KanbanBoardColumnTitle>
            </KanbanBoardColumnHeader>

            <KanbanBoardColumnList ref={listReference}>
                {column.items.map((card) => (
                    <KanbanBoardColumnListItem
                        cardId={String(card.id)}
                        key={card.id}
                        onDropOverListItem={handleDropOverListItem(String(card.id))}
                    >
                        <MyKanbanBoardCard
                            card={card}
                            isActive={activeCardId === String(card.id)}
                            onCardBlur={onCardBlur}
                            onCardKeyDown={onCardKeyDown}
                            onDeleteCard={onDeleteCard}
                            onUpdateCard={onUpdateCard}
                        />
                    </KanbanBoardColumnListItem>
                ))}
            </KanbanBoardColumnList>
        </KanbanBoardColumn>
    );
}
