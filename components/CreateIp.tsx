"use client";
import { PlusIcon, GlobeIcon } from "@phosphor-icons/react";
import { useMediaQuery } from "usehooks-ts";
import React, { useState } from "react";
import Button from "./Button";
import { Dialog, DialogContent } from "./ui/dialog";
import { Drawer, DrawerContent, DrawerTitle } from "./ui/drawer";
import { DialogTitle } from "@radix-ui/react-dialog";
import { ScrollArea } from "./ui/scroll-area";

const Form = ({
    onClose,
    onIpCreated,
    existingIps = [],
}: {
    onClose: () => void;
    onIpCreated?: () => void;
    existingIps?: string[];
}) => {
    const [error, setError] = useState("");
    const [ip, setIp] = useState("");
    const [submitting, setSubmitting] = useState(false);

    const validateIp = (ip: string): boolean => {
        const ipv4Regex =
            /^(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$/;

        const ipv6Regex =
            /^(([0-9a-fA-F]{1,4}:){7}[0-9a-fA-F]{1,4}|(([0-9a-fA-F]{1,4}:){1,7}:)|(([0-9a-fA-F]{1,4}:){1,6}:[0-9a-fA-F]{1,4})|(([0-9a-fA-F]{1,4}:){1,5}(:[0-9a-fA-F]{1,4}){1,2})|(([0-9a-fA-F]{1,4}:){1,4}(:[0-9a-fA-F]{1,4}){1,3})|(([0-9a-fA-F]{1,4}:){1,3}(:[0-9a-fA-F]{1,4}){1,4})|(([0-9a-fA-F]{1,4}:){1,2}(:[0-9a-fA-F]{1,4}){1,5})|([0-9a-fA-F]{1,4}:)((:[0-9a-fA-F]{1,4}){1,6})|:((:[0-9a-fA-F]{1,4}){1,7}|:))$/;

        return ipv4Regex.test(ip) || ipv6Regex.test(ip);
    };

    const handleSubmit = async () => {
        if (!ip.trim()) {
            setError("Por favor, digite um endereço IP");
            return;
        }

        if (!validateIp(ip.trim())) {
            setError("Por favor, digite um endereço IP válido");
            return;
        }
        if (existingIps.includes(ip.trim())) {
            setError("Este endereço IP já existe na whitelist");
            return;
        }

        setError("");

        try {
            setSubmitting(true);

            const { createNewIp } = await import("@/actions/ipWhitelist");
            const result = await createNewIp({ ip: ip.trim() });

            if (result.success) {
                onClose();
                onIpCreated?.();
            } else {
                setError(result.error || "Erro ao adicionar IP");
            }
        } catch (e) {
            console.error(e);
            const message =
                e instanceof Error ? e.message : "Erro ao adicionar IP";
            setError(message);
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <div className="space-y-6">
            <div className="text-center space-y-2">
                <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mx-auto">
                    <GlobeIcon className="w-6 h-6 text-primary" />
                </div>
                <h2 className="text-xl font-semibold text-foreground">
                    Adicionar IP à Whitelist
                </h2>
                <p className="text-sm text-foreground/60">
                    Digite o endereço IP que deseja adicionar à whitelist
                </p>
            </div>

            <form
                className="space-y-6"
                autoComplete="off"
                onSubmit={(e) => {
                    e.preventDefault();
                    if (!submitting) {
                        void handleSubmit();
                    }
                }}
            >
                <div className="space-y-2">
                    <label
                        className="text-sm font-medium text-foreground"
                        htmlFor="ip"
                    >
                        Endereço IP *
                    </label>
                    <div className="relative">
                        <input
                            type="text"
                            id="ip"
                            name="ip"
                            className="w-full h-10 px-3 pl-10 border border-foreground/20 rounded-lg bg-background-secondary focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                            autoComplete="off"
                            value={ip}
                            onChange={(e) => setIp(e.target.value)}
                            disabled={submitting}
                            placeholder="Ex: 192.168.1.1"
                        />
                        <GlobeIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-foreground/40" />
                    </div>
                </div>

                {error && (
                    <div className="p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
                        <p className="text-sm text-red-600 dark:text-red-400">
                            {error}
                        </p>
                    </div>
                )}

                <div className="flex gap-3 pt-4">
                    <Button
                        type="button"
                        variant="secondary"
                        className="flex-1"
                        onClick={onClose}
                        disabled={submitting}
                    >
                        Cancelar
                    </Button>
                    <Button
                        className="flex-1"
                        type="submit"
                        disabled={submitting}
                    >
                        {submitting ? (
                            <div className="flex items-center gap-2">
                                <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
                                Adicionando...
                            </div>
                        ) : (
                            "Adicionar IP"
                        )}
                    </Button>
                </div>
            </form>
        </div>
    );
};

const CreateIp = ({
    onIpCreated,
    existingIps = [],
}: {
    onIpCreated?: () => void;
    existingIps?: string[];
}) => {
    const isDesktop = useMediaQuery("(min-width: 768px)");
    const [open, setOpen] = useState(false);

    const handleOpen = () => setOpen(true);
    const handleClose = () => {
        setOpen(false);
    };

    return (
        <>
            <button
                type="button"
                className="flex cursor-pointer items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors"
                onClick={handleOpen}
            >
                <PlusIcon className="w-4 h-4" />
                Adicionar IP
            </button>

            <Dialog open={Boolean(isDesktop && open)} onOpenChange={setOpen}>
                <DialogContent className="bg-background-primary max-h-[85vh] overflow-y-auto max-w-md">
                    <DialogTitle className="sr-only">Adicionar IP</DialogTitle>
                    <Form
                        onClose={handleClose}
                        onIpCreated={onIpCreated}
                        existingIps={existingIps}
                    />
                </DialogContent>
            </Dialog>

            <Drawer open={Boolean(!isDesktop && open)} onOpenChange={setOpen}>
                <DrawerContent className="bg-background-primary max-w-[calc(100vw_-_2rem)] mx-auto p-5 max-h-[90vh] overflow-y-auto">
                    <DrawerTitle className="sr-only">Adicionar IP</DrawerTitle>
                    <ScrollArea className="p-4 max-h-[60vh] overflow-auto">
                        <Form
                            onClose={handleClose}
                            onIpCreated={onIpCreated}
                            existingIps={existingIps}
                        />
                    </ScrollArea>
                </DrawerContent>
            </Drawer>
        </>
    );
};

export default CreateIp;
