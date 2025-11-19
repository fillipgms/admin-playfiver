"use client";

import { Button } from "@/components/ui/button";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { WarningIcon } from "@phosphor-icons/react";

interface InfluencerConfirmationModalProps {
    isOpen: boolean;
    onClose: () => void;
    onConfirm: () => void;
    playerName: string;
}

export default function InfluencerConfirmationModal({
    isOpen,
    onClose,
    onConfirm,
    playerName,
}: InfluencerConfirmationModalProps) {
    const handleConfirm = () => {
        onConfirm();
        onClose();
    };

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="sm:max-w-md bg-background-primary">
                <DialogHeader>
                    <div className="flex items-center gap-2">
                        <WarningIcon className="h-5 w-5 text-amber-500" />
                        <DialogTitle>Confirmar Modo Influenciador</DialogTitle>
                    </div>
                    <DialogDescription className="text-left">
                        Você está prestes a marcar <strong>{playerName}</strong>{" "}
                        como influenciador.
                    </DialogDescription>
                </DialogHeader>

                <div className="py-4">
                    <div className="bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-800 rounded-lg p-4">
                        <p className="text-sm text-amber-800 dark:text-amber-200 leading-relaxed">
                            Estou ciente de que, para o modo influenciador
                            funcionar corretamente, devo estar com o jogo
                            fechado ou reiniciar o jogo caso já esteja aberto.
                        </p>
                        <p className="text-sm text-amber-800 dark:text-amber-200 leading-relaxed mt-2">
                            Entendo também que quaisquer descontos de saldo por
                            falta de atenção serão de minha responsabilidade.
                        </p>
                    </div>
                </div>

                <DialogFooter className="flex gap-2">
                    <Button variant="outline" onClick={onClose}>
                        Cancelar
                    </Button>
                    <Button
                        onClick={handleConfirm}
                        className="bg-primary hover:bg-primary/90"
                    >
                        Eu aceito
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
