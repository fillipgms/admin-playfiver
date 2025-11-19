import Button from "@/components/Button";
import Link from "next/link";

export default function notFoundPage() {
    return (
        <div className="min-h-[60vh] flex items-center justify-center p-6">
            <div className="max-w-md w-full text-center">
                <h1 className="md:text-6xl text-2xl font-bold mb-2">
                    Erro 404
                </h1>
                <p className="text-sm text-muted-foreground mb-2">
                    A página que você está tentando acessar não existe, foi
                    movida ou está em manutenção temporárea.
                </p>
                <div className="flex items-center justify-center gap-3">
                    <Link href="/">
                        <Button>Voltar para início</Button>
                    </Link>
                </div>
            </div>
        </div>
    );
}
