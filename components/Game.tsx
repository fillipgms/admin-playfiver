"use client";

import { SealCheckIcon } from "@phosphor-icons/react";
import Image from "next/image";
import { twMerge } from "tailwind-merge";
import { Card, CardContent, CardHeader } from "./Card";
import { AspectRatio } from "./ui/aspect-ratio";
import EditGameModal from "./EditGameModal";

const Game = ({
    game,
    provedores,
    distribuidores,
}: {
    game: GameProps;
    provedores: { id: number; name: string }[];
    distribuidores: { id: number; name: string }[];
}) => {
    const createdDate = new Date(game.created_at);

    return (
        <Card>
            <CardHeader className="flex gap-2 items-center">
                <div className="w-20">
                    <AspectRatio ratio={1 / 1}>
                        <Image
                            src={game.image_url}
                            alt={game.name}
                            fill
                            className="rounded w-full h-full"
                        />
                    </AspectRatio>
                </div>
                <div className="flex flex-col gap-2">
                    <div className="flex gap-2 items-center">
                        <h2 className="text-lg font-semibold truncate">
                            <span>#{game.id}</span> {game.name}
                        </h2>
                        {game.original === 1 && (
                            <SealCheckIcon
                                className="text-primary text-lg inline-block align-baseline ml-1"
                                weight="fill"
                            />
                        )}
                    </div>
                    <div className="flex gap-2">
                        <span
                            className={twMerge(
                                "text-xs py-1 px-3 rounded-md",
                                game.status !== 1
                                    ? "bg-[#E53935]/20 text-[#E53935]"
                                    : "bg-[#95BD2B]/20 text-[#95BD2B]"
                            )}
                        >
                            {game.status === 1 ? "Ativo" : "Inativo"}
                        </span>
                        <p>{game.game_code}</p>
                    </div>
                </div>
            </CardHeader>
            <CardContent className="space-y-4">
                <div className="flex flex-wrap justify-between gap-4">
                    <div className="">
                        <p className="text-sm font-light text-foreground/50">
                            Visualizações:
                        </p>
                        <p className="">{game.views}</p>
                    </div>

                    <div className="">
                        <p className="text-sm font-light text-foreground/50">
                            Provedor:
                        </p>
                        <p className="">{game.provedor}</p>
                    </div>

                    <div className="">
                        <p className="text-sm font-light text-foreground/50">
                            Distribuidor:
                        </p>
                        <p className="">{game.distribuidor}</p>
                    </div>
                </div>

                <div>
                    <p className="text-foreground/50 text-sm">
                        Criado em: {createdDate.toLocaleDateString("pt-BR")}
                    </p>
                </div>

                <div>
                    <EditGameModal
                        game={game}
                        provedores={provedores}
                        distribuidores={distribuidores}
                    />
                </div>
            </CardContent>
        </Card>
    );
};

export default Game;
