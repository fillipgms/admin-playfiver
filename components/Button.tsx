import React from "react";
import { twMerge } from "tailwind-merge";

const Button = ({
    variant = "primary",
    children,
    className,
    ...rest
}: React.ButtonHTMLAttributes<HTMLButtonElement> & {
    variant?: "primary" | "secondary";
    children: React.ReactNode;
    className?: string;
}) => {
    return (
        <button
            className={twMerge(
                "inline-flex items-center justify-center cursor-pointer gap-2 whitespace-nowrap rounded-md text-sm font-medium h-9 px-4 py-2 has-[>svg]:px-3",
                variant === "primary"
                    ? "bg-primary text-background-primary "
                    : "border text-primary border-primary",
                className
            )}
            {...rest}
        >
            {children}
        </button>
    );
};

export default Button;
