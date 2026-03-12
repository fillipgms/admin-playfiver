"use client";
import Button from "@/components/Button";
import Link from "next/link";
import { useEffect, useState } from "react";

export default function Error({
    error,
    reset,
}: {
    error: Error & { digest?: string };
    reset: () => void;
}) {
    const [copied, setCopied] = useState(false);

    useEffect(() => {
        console.error(error);
    }, [error]);

    const errorMessage = error?.message || "Erro desconhecido";
    const errorDigest = error?.digest;

    const textToCopy = [
        `Erro: ${errorMessage}`,
        errorDigest ? `ID: ${errorDigest}` : null,
    ]
        .filter(Boolean)
        .join("\n");

    const handleCopy = () => {
        navigator.clipboard.writeText(textToCopy).then(() => {
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        });
    };

    return (
        <div className="min-h-[60vh] flex items-center justify-center p-6">
            <div className="max-w-md w-full text-center">
                <h1 className="text-xl font-semibold mb-2">
                    Ops! Algo deu errado
                </h1>
                <p className="text-sm text-muted-foreground mb-4">
                    Tente novamente ou volte para a página inicial.
                </p>

                {/* Caixa do erro */}
                <div className="bg-muted rounded-lg p-3 mb-4 text-left">
                    <p className="text-xs font-medium text-muted-foreground mb-1">
                        Detalhes do erro:
                    </p>
                    <p className="text-xs font-mono break-all text-foreground">
                        {errorMessage}
                    </p>
                    {errorDigest && (
                        <p className="text-xs text-muted-foreground mt-1">
                            ID: {errorDigest}
                        </p>
                    )}
                </div>

                <div className="flex items-center justify-center gap-3">
                    <Button variant="secondary" onClick={handleCopy}>
                        {copied ? "Copiado!" : "Copiar erro"}
                    </Button>
                    <Button variant="secondary" onClick={() => reset()}>
                        Tentar novamente
                    </Button>
                    <Link href="/">
                        <Button>Voltar para início</Button>
                    </Link>
                </div>
            </div>
        </div>
    );
}
