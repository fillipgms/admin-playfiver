"use client";

import { createTicket } from "@/actions/tickets";
import { searchUser } from "@/actions/user";
import Button from "@/components/Button";
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
import { Textarea } from "@/components/ui/textarea";
import { useSession } from "@/contexts/SessionContext";
import { usePermissions } from "@/hooks/usePermissions";
import { WarningCircleIcon, XIcon } from "@phosphor-icons/react/dist/ssr";
import { useRouter } from "next/navigation";
import { useCallback, useRef, useState } from "react";
import { toast } from "sonner";

interface User {
    id: string;
    name: string;
    email: string;
}

const SendTicket = () => {
    const { hasPermission, loading } = usePermissions();

    const canCreateTicket = hasPermission("ticket_create");

    const [category, setCategory] = useState<
        "ALL" | "BUG" | "UPDATE" | "INTERNAL" | ""
    >("");
    const [user, setUser] = useState<User | null>(null);
    const [phone, setPhone] = useState("");
    const [subject, setSubject] = useState("");
    const [description, setDescription] = useState("");

    const [isSubmitting, setIsSubmitting] = useState(false);

    const [foundUsers, setFoundUsers] = useState<
        Array<{ id: number | string; name: string; email: string }>
    >([]);
    const [isUserSearching, setIsUserSearching] = useState(false);
    const userSearchTimeoutRef = useRef<NodeJS.Timeout | null>(null);

    const phoneDigits = phone.replace(/\D/g, "");
    const isPhoneValid = phoneDigits.length >= 7 && phoneDigits.length <= 15;

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

    const router = useRouter();

    const handleSubmit = async () => {
        setIsSubmitting(true);

        if (!user) {
            return;
        }

        if (category === "") {
            return;
        }

        const data = {
            user_id: user.id,
            category: category,
            subject: subject,
            contact: phone,
            details: description,
        };

        try {
            const res = await createTicket(data);

            if (res.success && res.success === false) {
                toast.error(res.error);
            } else {
                toast.success("Ticket Criado com Sucesso");
                router.refresh();
            }
        } catch (error) {
            toast.error(
                error instanceof Error
                    ? error.message
                    : "Ocorreu um erro ao criar o Ticket.",
            );
        } finally {
            setIsSubmitting(false);
        }
    };

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
                            1. Categoria *
                        </label>
                        <Select
                            onValueChange={(value) =>
                                setCategory(
                                    value as
                                        | "ALL"
                                        | "BUG"
                                        | "UPDATE"
                                        | "INTERNAL",
                                )
                            }
                        >
                            {" "}
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
                                2. Usuário Solicitante *
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

                    {category !== "" && user !== null && (
                        <div className="w-full flex flex-col gap-2">
                            <label className="text-sm">3. Telefone *</label>
                            <Input
                                placeholder="-"
                                value={phone}
                                onChange={(e) => setPhone(e.target.value)}
                            />
                            {phone !== "" && !isPhoneValid && (
                                <p className="text-xs text-destructive">
                                    Insira um número de telefone válido (entre 7
                                    e 15 dígitos).
                                </p>
                            )}
                        </div>
                    )}

                    {category !== "" && user !== null && isPhoneValid && (
                        <div className="w-full flex flex-col gap-2">
                            <label className="text-sm">Título *</label>
                            <Input
                                placeholder="-"
                                value={subject}
                                onChange={(e) => setSubject(e.target.value)}
                            />
                        </div>
                    )}

                    {category !== "" && user !== null && isPhoneValid && (
                        <div className="w-full flex flex-col gap-2">
                            <label className="text-sm">Descrição *</label>
                            <Textarea
                                placeholder="-"
                                value={description}
                                onChange={(e) => setDescription(e.target.value)}
                            />
                        </div>
                    )}

                    {category !== "" &&
                        user !== null &&
                        isPhoneValid &&
                        subject !== "" &&
                        description !== "" && (
                            <Button
                                disabled={isSubmitting}
                                className="w-full"
                                onClick={handleSubmit}
                            >
                                {isSubmitting ? "Enviando..." : "enviar"}
                            </Button>
                        )}
                </div>
            </div>
        </div>
    );
};

export default SendTicket;
