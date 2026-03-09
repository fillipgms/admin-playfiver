"use client";

import { searchUser } from "@/actions/user";
import { Card } from "@/components/Card";
import { Badge } from "@/components/ui/badge";
import {
    Combobox,
    ComboboxContent,
    ComboboxEmpty,
    ComboboxInput,
    ComboboxItem,
    ComboboxList,
} from "@/components/ui/combobox";
import { Input } from "@/components/ui/input";
import {
    Select,
    SelectContent,
    SelectGroup,
    SelectItem,
    SelectLabel,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { useSession } from "@/contexts/SessionContext";
import { usePermissions } from "@/hooks/usePermissions";
import { WarningCircleIcon, XIcon } from "@phosphor-icons/react/dist/ssr";
import { useCallback, useRef, useState } from "react";

interface User {
    id: string;
    name: string;
    email: string;
}

const SendTicket = () => {
    const { hasPermission, loading } = usePermissions();

    const canCreateTicket = hasPermission("ticket_create");

    const [category, setCategory] = useState("");
    const [foundUsers, setFoundUsers] = useState<
        Array<{ id: number | string; name: string; email: string }>
    >([]);
    const [isUserSearching, setIsUserSearching] = useState(false);
    const userSearchTimeoutRef = useRef<NodeJS.Timeout | null>(null);
    const [user, setUser] = useState<User | null>(null);

    const handleUserSearch = useCallback((value: string) => {
        if (userSearchTimeoutRef.current) {
            clearTimeout(userSearchTimeoutRef.current);
        }

        if (value.length < 3) {
            setFoundUsers([]);
            return;
        }

        userSearchTimeoutRef.current = setTimeout(async () => {
            setIsUserSearching(true);
            try {
                const result = await searchUser(value);
                if (
                    result.success &&
                    result.data &&
                    Array.isArray(result.data.data)
                ) {
                    setFoundUsers(
                        result.data.data.map((u: any) => ({
                            id: u.id,
                            name: u.name || u.email,
                            email: u.email,
                        })),
                    );
                } else {
                    setFoundUsers([]);
                }
            } catch (error) {
                setFoundUsers([]);
            } finally {
                setIsUserSearching(false);
            }
        }, 300);
    }, []);

    if (loading) return null;

    if (!canCreateTicket) {
        return (
            <Card className="p-8 flex items-center justify-center min-h-[200px]">
                <div className="text-center space-y-3">
                    <WarningCircleIcon className="w-10 h-10 text-destructive mx-auto" />
                    <div>
                        <h3 className="text-lg font-semibold">Acesso Negado</h3>
                        <p className="text-sm text-muted-foreground">
                            Você não tem permissão para Criar Tickets.
                        </p>
                    </div>
                </div>
            </Card>
        );
    }

    return (
        <div className="space-y-8">
            <div className="text-center space-y-2">
                <h1 className="md:text-4xl text-2xl font-bold capitalize">
                    Enviar uma solicitação
                </h1>
                <p className="max-w-2xl mx-auto text-foreground/50">
                    Encontrou um problema, alguém reportou um BUG ou acredita
                    que algo precise ser diferente? Envie uma solicitação e
                    nossa equipe trabalhará o mais rápido para ajudar
                </p>
            </div>

            <div className="flex flex-col items-center">
                <div className="max-w-xl w-full space-y-4">
                    <div className="w-full flex flex-col gap-2">
                        <label htmlFor="category" className="text-sm">
                            1. Categoria
                        </label>
                        <Select onValueChange={setCategory}>
                            <SelectTrigger className="w-full ">
                                <SelectValue placeholder="-" />
                            </SelectTrigger>
                            <SelectContent className="bg-background-primary">
                                <SelectGroup>
                                    <SelectItem
                                        className="capitalize"
                                        value="BUG"
                                    >
                                        bug
                                    </SelectItem>
                                    <SelectItem
                                        className="capitalize"
                                        value="UPDATE"
                                    >
                                        atualização de dados de um usuário
                                    </SelectItem>
                                    <SelectItem
                                        className="capitalize"
                                        value="INTERNAL"
                                    >
                                        Programação
                                    </SelectItem>
                                    <SelectItem
                                        className="capitalize"
                                        value="ALL"
                                    >
                                        Outro
                                    </SelectItem>
                                </SelectGroup>
                            </SelectContent>
                        </Select>
                    </div>
                    {category !== "" && (
                        <div className="w-full flex flex-col gap-2">
                            <label className="text-sm">
                                2. Usuário Solicitante
                            </label>
                            <Combobox
                                onValueChange={setUser}
                                items={foundUsers}
                                itemToStringValue={(user: User) => user.name}
                            >
                                <div className="relative">
                                    <ComboboxInput
                                        placeholder="-"
                                        onChange={(e) =>
                                            handleUserSearch(e.target.value)
                                        }
                                    />
                                </div>

                                <ComboboxContent>
                                    <ComboboxEmpty>
                                        {isUserSearching
                                            ? "Carregando..."
                                            : "Não foram encontrados usuários"}
                                    </ComboboxEmpty>

                                    <ComboboxList>
                                        {(user) => (
                                            <ComboboxItem
                                                key={user.id}
                                                value={user}
                                            >
                                                <div className="flex flex-col">
                                                    <span className="font-medium">
                                                        {user.name}
                                                    </span>
                                                    <span className="text-xs text-muted-foreground">
                                                        {user.email}
                                                    </span>
                                                </div>
                                            </ComboboxItem>
                                        )}
                                    </ComboboxList>
                                </ComboboxContent>
                            </Combobox>
                        </div>
                    )}

                    {category !== "" && user !== null && <div></div>}
                </div>
            </div>
        </div>
    );
};

export default SendTicket;
