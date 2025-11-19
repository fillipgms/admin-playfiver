import React from "react";
import { twMerge } from "tailwind-merge";

interface CardProps {
    id?: string;
    main?: boolean;
    className?: string;
    children: React.ReactNode;
}

export const Card = React.forwardRef<HTMLDivElement, CardProps>(
    ({ id, main, className, children }, ref) => (
        <div
            id={id}
            ref={ref}
            className={twMerge(
                "bg-background-primary rounded-md p-4 gap-8",
                main &&
                    "bg-linear-to-t from-primary to-[#005EBD] text-background-primary dark:text-foreground",
                className
            )}
        >
            {children}
        </div>
    )
);
Card.displayName = "Card";

export const CardHeader = ({
    children,
    className,
}: {
    children: React.ReactNode;
    className?: string;
}) => (
    <div className={twMerge("flex items-center text-sm gap-2 mb-2", className)}>
        {children}
    </div>
);

export const CardContent = ({
    children,
    className,
}: {
    children: React.ReactNode;
    className?: string;
}) => <div className={twMerge("", className)}>{children}</div>;

export const CardFooter = ({
    children,
    className,
}: {
    children: React.ReactNode;
    className?: string;
}) => <div className={twMerge("mt-2", className)}>{children}</div>;
