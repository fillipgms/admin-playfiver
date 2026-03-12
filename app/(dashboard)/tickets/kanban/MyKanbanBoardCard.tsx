import {
    KanbanBoardCard,
    KanbanBoardCardButton,
    KanbanBoardCardButtonGroup,
    KanbanBoardCardDescription,
    KanbanBoardCardTitle,
} from "@/components/kanban";

import { useEffect, useRef, type KeyboardEvent } from "react";
import { Trash2Icon } from "lucide-react";

const CATEGORY_LABELS: Record<Ticket["category"], string> = {
    ALL: "Geral",
    BUG: "Bug",
    UPDATE: "Atualização",
    INTERNAL: "Interno",
};

export function MyKanbanBoardCard({
    card,
    isActive,
    onCardBlur,
    onCardKeyDown,
    onDeleteCard,
}: {
    card: Ticket;
    isActive: boolean;
    onCardBlur: () => void;
    onCardKeyDown: (
        event: KeyboardEvent<HTMLButtonElement>,
        cardId: string,
    ) => void;
    onDeleteCard: (cardId: string) => void;
}) {
    const cardRef = useRef<HTMLButtonElement>(null);
    const previousIsActiveRef = useRef(isActive);
    const wasCancelledRef = useRef(false);

    useEffect(() => {
        if (isActive) {
            cardRef.current?.focus();
        }

        if (
            !isActive &&
            previousIsActiveRef.current &&
            wasCancelledRef.current
        ) {
            cardRef.current?.focus();
            wasCancelledRef.current = false;
        }

        previousIsActiveRef.current = isActive;
    }, [isActive]);

    return (
        <KanbanBoardCard
            data={{ ...card, id: String(card.id) }}
            isActive={isActive}
            onBlur={onCardBlur}
            onKeyDown={(event) => {
                if (event.key === " ") {
                    event.preventDefault();
                }
                if (event.key === "Escape") {
                    wasCancelledRef.current = true;
                }
                onCardKeyDown(event, String(card.id));
            }}
            ref={cardRef}
            className="dark:bg-input/30"
        >
            <span className="text-xs text-muted-foreground font-medium">
                {CATEGORY_LABELS[card.category]}
            </span>
            <KanbanBoardCardTitle>{card.subject}</KanbanBoardCardTitle>
            <KanbanBoardCardDescription>
                {card.user.name}
            </KanbanBoardCardDescription>
            <KanbanBoardCardButtonGroup
                className="bg-transparent"
                disabled={isActive}
            >
                <KanbanBoardCardButton
                    className="text-destructive"
                    onClick={() => onDeleteCard(String(card.id))}
                    tooltip="Excluir ticket"
                >
                    <Trash2Icon />
                    <span className="sr-only">Excluir ticket</span>
                </KanbanBoardCardButton>
            </KanbanBoardCardButtonGroup>
        </KanbanBoardCard>
    );
}
