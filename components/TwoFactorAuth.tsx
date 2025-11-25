"use client";

import { useState } from "react";
import Button from "./Button";
import Image from "next/image";

type TwoFactorAuthProps = {
    qrCodeUrl?: string;
    secret?: string;
    onSubmit: (code: string) => Promise<void>;
    error?: string | null;
};

export function TwoFactorAuth({
    qrCodeUrl,
    secret,
    onSubmit,
    error,
}: TwoFactorAuthProps) {
    const [code, setCode] = useState("");

    const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        onSubmit(code);
    };

    return (
        <div className="flex justify-center items-center bg-background-secondary rounded-md shadow p-8 h-fit">
            <form onSubmit={handleSubmit} className="space-y-8 w-xs">
                <div>
                    <h1 className="font-bold text-xl text-center">
                        Autenticação de Dois Fatores
                    </h1>
                </div>

                {qrCodeUrl && (
                    <div className="flex flex-col items-center gap-4">
                        <p className="text-center text-sm">
                            Escaneie o QR code com seu app de autenticação.
                        </p>
                        <Image
                            src={qrCodeUrl}
                            alt="QR Code"
                            width={200}
                            height={200}
                        />
                        <p className="text-center text-sm">
                            Problemas ao escanear? Use o código: {secret}
                        </p>
                        <p className="text-center text-sm">
                            Após escanear, insira o código gerado pelo app.
                        </p>
                    </div>
                )}

                {!qrCodeUrl && (
                    <p className="text-center text-sm">
                        Abra seu app de autenticação e insira o código de 6
                        dígitos.
                    </p>
                )}

                <div className="space-y-4">
                    <div className="flex flex-col gap-1">
                        <label className="capitalize" htmlFor="code">
                            Código de Autenticação
                        </label>
                        <input
                            type="text"
                            name="code"
                            id="code"
                            value={code}
                            onChange={(e) => setCode(e.target.value)}
                            className="w-full border py-1 rounded border-foreground/20"
                            maxLength={6}
                        />
                    </div>
                    {error && (
                        <div className="text-sm text-[#E53935]">
                            <p>Erro: {error}</p>
                        </div>
                    )}
                </div>

                <Button type="submit" className="w-full">
                    Verificar
                </Button>
            </form>
        </div>
    );
}
