import React from "react";
import { twMerge } from "tailwind-merge";

const Icon = ({
    variant = "primary",
    children,
}: {
    variant?: "primary" | "secondary";
    children: React.ReactNode;
}) => {
    return (
        <div
            className={twMerge(
                "rounded text-xl p-1.5",
                variant === "primary" && "bg-primary/20 text-primary ",
                variant === "secondary" &&
                    "bg-background-primary/20 dark:bg-foreground/20 "
            )}
        >
            {children}
        </div>
    );
};

export default Icon;
