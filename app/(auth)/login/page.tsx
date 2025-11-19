"use client";
import Button from "@/components/Button";
import { useSession } from "@/contexts/SessionContext";
import { signIn } from "@/lib/auth";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Eye, EyeOff } from "lucide-react";

export default function LoginPage() {
    const [error, setError] = useState<string | null>(null);
    const [fieldErrors, setFieldErrors] = useState<Record<string, string[]>>(
        {}
    );
    const [showPassword, setShowPassword] = useState(false);
    const { refreshSession } = useSession();
    const router = useRouter();

    const onSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setError(null);
        setFieldErrors({});
        const formData = new FormData(e.target as HTMLFormElement);
        const result = await signIn(formData);
        if (result.success) {
            refreshSession();
            router.push("/");
        } else {
            setError(result.message || "Ocorreu um erro ao fazer login");
            if (result.errors) {
                setFieldErrors(result.errors);
            }
        }
    };

    return (
        <main className="h-screen flex p-8 gap-8 bg-linear-to-b from-primary/50 to-background-primary items-center justify-center text-foreground">
            <div className="flex justify-center items-center bg-background-secondary rounded-md shadow p-8 h-fit">
                <form onSubmit={onSubmit} className="space-y-8 w-xs">
                    <div>
                        <h1 className="font-bold text-xl text-center">
                            Bem vindo de volta
                        </h1>
                        <p></p>
                    </div>
                    <div className="space-y-4">
                        <div className="flex flex-col gap-1">
                            <label className="capitalize" htmlFor="email">
                                email
                            </label>
                            <input
                                type="string"
                                name="email"
                                id="email"
                                className="w-full border py-1 rounded border-foreground/20  "
                            />
                            {fieldErrors.email && (
                                <p className="text-sm text-[#E53935]">
                                    {fieldErrors.email[0]}
                                </p>
                            )}
                        </div>

                        <div className="space-y-1">
                            <div className="flex flex-col gap-1">
                                <label
                                    className="capitalize"
                                    htmlFor="password"
                                >
                                    senha
                                </label>
                                <div className="relative">
                                    <input
                                        type={
                                            showPassword ? "text" : "password"
                                        }
                                        name="password"
                                        id="password"
                                        className="w-full border py-1 rounded border-foreground/20 pr-9"
                                    />
                                    <button
                                        type="button"
                                        aria-label={
                                            showPassword
                                                ? "Ocultar senha"
                                                : "Mostrar senha"
                                        }
                                        onClick={() =>
                                            setShowPassword((v) => !v)
                                        }
                                        className="absolute inset-y-0 right-2 flex items-center text-foreground/70 hover:text-foreground"
                                    >
                                        {showPassword ? (
                                            <EyeOff className="h-4 w-4" />
                                        ) : (
                                            <Eye className="h-4 w-4" />
                                        )}
                                    </button>
                                </div>
                                {fieldErrors.password && (
                                    <p className="text-sm text-[#E53935]">
                                        {fieldErrors.password[0]}
                                    </p>
                                )}
                            </div>
                        </div>

                        <div className="text-sm text-[#E53935]">
                            {error && <p>Erro: {error}</p>}
                        </div>
                    </div>

                    <Button className="w-full">Entrar</Button>
                </form>
            </div>
        </main>
    );
}
