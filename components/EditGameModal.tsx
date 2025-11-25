"use client";

import {
    Credenza,
    CredenzaBody,
    CredenzaClose,
    CredenzaContent,
    CredenzaFooter,
    CredenzaHeader,
    CredenzaTitle,
    CredenzaTrigger,
} from "@/components/ui/credenza";
import { Button } from "./ui/button";
import { PencilIcon } from "@phosphor-icons/react/dist/ssr";
import { Input } from "./ui/input";
import { useState } from "react";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "./ui/select";
import { updateGame } from "@/actions/jogos";
import { toast } from "sonner";
import { Switch } from "./ui/switch";
import { Label } from "./ui/label";
import { useRouter } from "next/navigation";

const EditGameModal = ({
    game,
    provedores,
    distribuidores,
}: {
    game: GameProps;
    provedores: { id: number; name: string }[];
    distribuidores: { id: number; name: string }[];
}) => {
    const [isOpen, setIsOpen] = useState(false);
    const [isLoading, setIsLoading] = useState(false);

    const [name, setName] = useState(game.name);
    const [gameCode, setGameCode] = useState(game.game_code);
    const [imageUrl, setImageUrl] = useState(game.image_url);
    const [status, setStatus] = useState(game.status === 1);
    const [provider, setProvider] = useState<string | undefined>(
        game.provedorId?.toString()
    );
    const [distributor, setDistributor] = useState<string | undefined>(
        game.distribuidorId?.toString()
    );
    const router = useRouter();

    const handleSave = async () => {
        setIsLoading(true);
        try {
            const payload: any = {
                id: game.id,
                name,
                game_code: gameCode,
                image_url: imageUrl,
                status: status ? 1 : 0,
                provedor: provider ? parseInt(provider) : undefined,
                distribuidor: distributor ? parseInt(distributor) : null,
            };

            const result = await updateGame(payload);

            if (result.success) {
                toast.success("Jogo atualizado com sucesso!");
                setIsOpen(false);
                router.refresh();
            } else {
                toast.error(result.error || "Erro ao atualizar jogo");
            }
        } catch (err) {
            toast.error("Erro inesperado ao salvar");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <Credenza open={isOpen} onOpenChange={setIsOpen}>
            <CredenzaTrigger asChild>
                <Button
                    size="sm"
                    variant="outline"
                    className="w-full"
                    title="Editar jogo"
                >
                    <PencilIcon size={14} />
                    <span>Editar</span>
                </Button>
            </CredenzaTrigger>
            <CredenzaContent className="bg-background-primary sm:max-w-[700px]">
                <CredenzaHeader>
                    <CredenzaTitle>Editando {game.name}</CredenzaTitle>
                </CredenzaHeader>
                <CredenzaBody className="space-y-4 py-4">
                    <div className="grid grid-cols-12 gap-4">
                        <div className="col-span-12">
                            <Label className="text-xs font-medium text-muted-foreground block mb-1.5">
                                Nome
                            </Label>
                            <Input
                                name="name"
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                className="h-9"
                            />
                        </div>
                        <div className="col-span-12 md:col-span-6">
                            <Label className="text-xs font-medium text-muted-foreground block mb-1.5">
                                Game Code
                            </Label>
                            <Input
                                name="game_code"
                                value={gameCode}
                                onChange={(e) => setGameCode(e.target.value)}
                                className="h-9"
                            />
                        </div>
                        <div className="col-span-12 md:col-span-6">
                            <Label className="text-xs font-medium text-muted-foreground block mb-1.5">
                                Image URL
                            </Label>
                            <Input
                                name="image_url"
                                value={imageUrl}
                                onChange={(e) => setImageUrl(e.target.value)}
                                className="h-9"
                            />
                        </div>
                    </div>

                    <div className="grid grid-cols-12 gap-4">
                        <div className="col-span-6">
                            <Label className="text-xs font-medium text-muted-foreground block mb-1.5">
                                Provedor
                            </Label>
                            <Select
                                value={provider}
                                onValueChange={setProvider}
                            >
                                <SelectTrigger className="h-9">
                                    <SelectValue placeholder="Selecione um provedor" />
                                </SelectTrigger>
                                <SelectContent>
                                    {provedores.map((p) => (
                                        <SelectItem
                                            key={p.id}
                                            value={p.id.toString()}
                                        >
                                            {p.name}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="col-span-6">
                            <Label className="text-xs font-medium text-muted-foreground block mb-1.5">
                                Distribuidor (Opcional)
                            </Label>
                            <Select
                                value={distributor}
                                onValueChange={setDistributor}
                            >
                                <SelectTrigger className="h-9">
                                    <SelectValue placeholder="Selecione um distribuidor" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="null">Nenhum</SelectItem>
                                    {distribuidores.map((d) => (
                                        <SelectItem
                                            key={d.id}
                                            value={d.id.toString()}
                                        >
                                            {d.name}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                    </div>

                    <div className="flex items-center gap-2">
                        <Switch
                            id="status-game"
                            checked={status}
                            onCheckedChange={setStatus}
                        />
                        <Label
                            htmlFor="status-game"
                            className="text-sm font-medium"
                        >
                            Ativo
                        </Label>
                    </div>
                </CredenzaBody>
                <CredenzaFooter className="gap-2 border-t pt-4">
                    <CredenzaClose asChild>
                        <Button
                            variant="ghost"
                            type="button"
                            disabled={isLoading}
                        >
                            Cancelar
                        </Button>
                    </CredenzaClose>
                    <Button
                        onClick={handleSave}
                        disabled={isLoading}
                        className="w-full sm:w-auto"
                    >
                        {isLoading ? "Salvando..." : "Salvar Alterações"}
                    </Button>
                </CredenzaFooter>
            </CredenzaContent>
        </Credenza>
    );
};

export default EditGameModal;
