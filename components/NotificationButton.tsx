"use client";
import { BellIcon } from "@phosphor-icons/react";
import React from "react";

export const NotificationButton = () => {
    return (
        <button className=" size-8 border border-foreground/50 rounded-full flex items-center justify-center cursor-pointer">
            <BellIcon />
        </button>
    );
};
