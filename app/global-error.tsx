"use client";

import Button from "@/components/Button";
import Link from "next/link";
import { useEffect } from "react";

export default function GlobalError({
    error,
    reset,
}: {
    error: Error & { digest?: string };
    reset: () => void;
}) {
    useEffect(() => {
        console.error(error);
    }, [error]);

    return (
        <html>
            <body className="min-h-screen flex items-center justify-center bg-[#0a0a0a] text-white p-6">
                <div className="max-w-md w-full text-center">
                    <h1 className="text-2xl font-semibold mb-2">
                        Algo deu errado
                    </h1>
                    <p className="text-sm text-gray-300 mb-6">
                        Ocorreu um erro inesperado.{" "}
                        {error?.digest ? `(id: ${error.digest})` : ""}
                    </p>
                    <div className="flex items-center justify-center gap-3">
                        <Button variant="secondary" onClick={() => reset()}>
                            Tentar novamente
                        </Button>
                        <Link href="/">
                            <Button>Voltar para início</Button>
                        </Link>
                    </div>
                </div>
            </body>
        </html>
    );
}
