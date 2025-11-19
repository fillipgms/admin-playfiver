"use client";
import React, { useState, useRef, useEffect } from "react";

import { useSession } from "@/contexts/SessionContext";
import { SignOutIcon } from "@phosphor-icons/react";
import { logout } from "@/lib/auth";

const UserButton = () => {
    const [isOpen, setIsOpen] = useState(false);
    const [mounted, setMounted] = useState(false);
    const { user, loading } = useSession();
    const containerRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        setMounted(true);
    }, []);

    const handleLogout = async () => {
        await logout();
    };

    useEffect(() => {
        const handleClickOutside = (e: MouseEvent) => {
            if (
                containerRef.current &&
                !containerRef.current.contains(e.target as Node)
            ) {
                setIsOpen(false);
            }
        };

        if (isOpen) {
            document.addEventListener("mousedown", handleClickOutside);
        } else {
            document.removeEventListener("mousedown", handleClickOutside);
        }

        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, [isOpen]);

    if (!mounted || loading) {
        return (
            <div className="relative" ref={containerRef}>
                <div className="hidden sm:block">
                    <h6 className="font-semibold animate-pulse bg-gray-300 h-4 w-24 rounded"></h6>
                    <p className="text-sm animate-pulse bg-gray-300 h-3 w-16 rounded mt-1"></p>
                </div>
                <div className="sm:hidden">
                    <h6 className="font-semibold text-sm animate-pulse bg-gray-300 h-4 w-20 rounded"></h6>
                </div>
            </div>
        );
    }

    return (
        <div className="relative" ref={containerRef}>
            <div
                className="hidden sm:block cursor-pointer"
                onClick={() => setIsOpen(!isOpen)}
            >
                <h6 className="font-semibold">{user?.name}</h6>
            </div>
            <div
                className="sm:hidden cursor-pointer"
                onClick={() => setIsOpen(!isOpen)}
            >
                <h6 className="font-semibold text-sm">{user?.name}</h6>
            </div>

            {isOpen && (
                <div className="absolute top-[calc(100%_+_0.5rem)] left-0 w-xs bg-background-primary rounded shadow-lg border border-foreground/20">
                    <div
                        onClick={handleLogout}
                        className="flex gap-5 items-center p-2 cursor-pointer"
                    >
                        <SignOutIcon className="text-lg" />
                        <p>Sair</p>
                    </div>
                </div>
            )}
        </div>
    );
};

export default UserButton;
