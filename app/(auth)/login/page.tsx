"use client";
import Button from "@/components/Button";
import { TwoFactorAuth } from "@/components/TwoFactorAuth";
import { useSession } from "@/contexts/SessionContext";
import { signIn, verify2FA } from "@/lib/auth";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Eye, EyeOff } from "lucide-react";

type AuthStep = "credentials" | "qr-code" | "verify-2fa";

export default function LoginPage() {
    const [error, setError] = useState<string | null>(null);
    const [fieldErrors, setFieldErrors] = useState<Record<string, string[]>>(
        {}
    );
    const [showPassword, setShowPassword] = useState(false);
    const { refreshSession } = useSession();
    const router = useRouter();

    const [authStep, setAuthStep] = useState<AuthStep>("credentials");
    const [qrCodeUrl, setQrCodeUrl] = useState<string | null>(null);
    const [qrCodeSecret, setQrCodeSecret] = useState<string | null>(null);
    const [email, setEmail] = useState<string>("");
    const [password, setPassword] = useState<string>("");

    const handleCredentialsSubmit = async (
        e: React.FormEvent<HTMLFormElement>
    ) => {
        e.preventDefault();
        setError(null);
        setFieldErrors({});
        const formData = new FormData(e.target as HTMLFormElement);
        const currentEmail = formData.get("email") as string;
        const currentPassword = formData.get("password") as string;
        setEmail(currentEmail);
        setPassword(currentPassword);

        const result = await signIn(formData);

        if (result.success) {
            if (result.twoFactor === "REGISTER") {
                setQrCodeUrl(result.qrCodeUrl || null);
                setQrCodeSecret(result.qrCodeSecret || null);
                setAuthStep("qr-code");
            } else if (result.twoFactor === "VERIFY") {
                setAuthStep("verify-2fa");
            } else {
                refreshSession();
                router.push("/");
            }
        } else {
            setError(result.message || "Ocorreu um erro ao fazer login");
            if (result.errors) {
                setFieldErrors(result.errors);
            }
        }
    };

    const handle2FASubmit = async (code: string) => {
        setError(null);
        if (!email || !password) {
            setError(
                "Ocorreu um erro. Por favor, tente fazer o login novamente."
            );
            setAuthStep("credentials");
            return;
        }

        const result = await verify2FA(code, email, password);
        if (result.success) {
            refreshSession();
            router.push("/");
        } else {
            setError(
                result.message || "Ocorreu um erro ao verificar o código."
            );
        }
    };

    return (
        <main className="h-screen flex p-8 gap-8 bg-linear-to-b from-primary/50 to-background-primary items-center justify-center text-foreground">
            {authStep === "credentials" && (
                <div className="flex justify-center items-center bg-background-secondary rounded-md shadow p-8 h-fit">
                    <form
                        onSubmit={handleCredentialsSubmit}
                        className="space-y-8 w-xs"
                    >
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
                                                showPassword
                                                    ? "text"
                                                    : "password"
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
            )}
            {(authStep === "qr-code" || authStep === "verify-2fa") && (
                <TwoFactorAuth
                    secret={qrCodeSecret ?? undefined}
                    qrCodeUrl={qrCodeUrl ?? undefined}
                    onSubmit={handle2FASubmit}
                    error={error}
                />
            )}
        </main>
    );
}
