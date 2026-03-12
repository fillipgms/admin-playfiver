import {
    KanbanBoardCard,
    KanbanBoardCardButton,
    KanbanBoardCardButtonGroup,
    KanbanBoardCardDescription,
    KanbanBoardCardTitle,
} from "@/components/kanban";

import { useEffect, useRef, type KeyboardEvent } from "react";
import { Trash2Icon, UserCircle } from "lucide-react";
import {
    Credenza,
    CredenzaContent,
    CredenzaTitle,
    CredenzaTrigger,
} from "@/components/ui/credenza";
import {
    ChatDotsIcon,
    IdentificationBadgeIcon,
    TextAlignLeftIcon,
    UserCircleIcon,
} from "@phosphor-icons/react";

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

    const column = () => {
        if (card.checked === 0 && card.resolved === 0) {
            return "A Fazer";
        }

        if (card.checked === 1 && card.resolved === 0) {
            return "Em progresso";
        }

        if (card.resolved === 1) {
            return "Concluído";
        }
    };

    function formatDateString(isoString: string) {
        const date = new Date(isoString);

        const day = date.toLocaleDateString("pt-BR", {
            day: "2-digit",
            month: "2-digit",
            year: "numeric",
            timeZone: "America/Sao_Paulo",
        });

        const time = date.toLocaleTimeString("pt-BR", {
            hour: "2-digit",
            minute: "2-digit",
            timeZone: "America/Sao_Paulo",
        });

        return `${day} às ${time}`;
    }

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
        <Credenza>
            <CredenzaTrigger className="w-full">
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
            </CredenzaTrigger>
            <CredenzaContent className="bg-background-primary p-0 xl:max-w-5xl">
                <div>
                    <div className="p-4 border-b flex gap-4">
                        <div className="bg-input/30 border w-fit py-1 px-4 rounded">
                            {CATEGORY_LABELS[card.category]}
                        </div>
                        <div className="bg-input/30 border w-fit py-1 px-4 rounded">
                            {column()}
                        </div>
                    </div>

                    <div className="grid md:grid-cols-[1.5fr_1fr]">
                        <div className="p-4 space-y-8">
                            <div className="space-y-4">
                                <CredenzaTitle className="text-2xl font-bold">
                                    {card.subject}
                                </CredenzaTitle>
                                <div className="flex gap-4 items-center flex-wrap">
                                    <div className="p-2 text-sm flex gap-2 items-center bg-input/30 border rounded">
                                        <div className="items-center flex gap-0.5">
                                            <UserCircleIcon />
                                            <p className="font-bold">
                                                Solicitante:
                                            </p>
                                        </div>
                                        <p>{card.user.name}</p>
                                    </div>

                                    <div className="p-2 text-sm flex gap-2 items-center bg-input/30 border rounded">
                                        <div className="items-center flex gap-0.5">
                                            <IdentificationBadgeIcon />
                                            <p className="font-bold">
                                                Criado por:
                                            </p>
                                        </div>
                                        <p>{card.created_by.name}</p>
                                    </div>

                                    <div className="p-2 text-sm flex gap-2 items-center bg-input/30 border rounded">
                                        <div className="items-center flex gap-0.5">
                                            <IdentificationBadgeIcon />
                                            <p className="font-bold">
                                                Criado em:
                                            </p>
                                        </div>
                                        <p>
                                            {formatDateString(card.created_at)}
                                        </p>
                                    </div>
                                </div>
                            </div>
                            <div className="flex flex-col gap-2">
                                <div className="flex items-center gap-2 text-lg">
                                    <TextAlignLeftIcon />
                                    <h5 className="font-bold ">Descrição</h5>
                                </div>
                                <p className="pl-6">{card.details}</p>
                            </div>
                        </div>
                        <div className="bg-input/30 md:border-l md:border-t-none border-t p-4 space-y-4">
                            <div className="flex items-center text-lg gap-2">
                                <ChatDotsIcon />
                                <h5 className="font-bold ">Comentários</h5>
                            </div>

                            {!card.message_checked &&
                                !card.message_resolved && <p>Sem mensagens</p>}

                            {card.message_checked && (
                                <p>{card.message_checked}</p>
                            )}

                            {card.message_resolved && (
                                <p>
                                    <span className="font-bold">
                                        {card.resolved_by}:{" "}
                                    </span>
                                    {card.message_checked}
                                </p>
                            )}
                        </div>
                    </div>
                </div>
            </CredenzaContent>
        </Credenza>
    );
}
