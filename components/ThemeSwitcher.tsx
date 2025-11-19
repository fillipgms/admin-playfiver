"use client";
import React, { useEffect, useState } from "react";

const THEME_KEY = "theme";
const DARK_CLASS = "dark";

import {
    MoonIcon,
    MoonStarsIcon,
    SunIcon,
    SunDimIcon,
} from "@phosphor-icons/react";

const ThemeSwitcher = () => {
    const [isDark, setIsDark] = useState(false);
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
        const savedTheme = localStorage.getItem(THEME_KEY);
        if (savedTheme === DARK_CLASS) {
            document.documentElement.classList.add(DARK_CLASS);
            setIsDark(true);
        } else {
            document.documentElement.classList.remove(DARK_CLASS);
            setIsDark(false);
        }
    }, []);

    const toggleTheme = () => {
        if (isDark) {
            document.documentElement.classList.remove(DARK_CLASS);
            localStorage.setItem(THEME_KEY, "light");
            setIsDark(false);
        } else {
            document.documentElement.classList.add(DARK_CLASS);
            localStorage.setItem(THEME_KEY, DARK_CLASS);
            setIsDark(true);
        }
    };

    if (!mounted) {
        return (
            <button
                className="rounded-full flex items-center gap-2 border relative p-2 border-primary cursor-pointer"
                disabled
            >
                <div
                    className="absolute h-[80%] z-10 aspect-square rounded-full bg-primary transition-transform duration-300 translate-x-0"
                    style={{ left: 4, top: "10%" }}
                ></div>
                <MoonStarsIcon
                    weight="fill"
                    className="z-20 text-background-primary"
                />
                <SunDimIcon className="z-20" />
            </button>
        );
    }

    return (
        <button
            onClick={toggleTheme}
            className="rounded-full flex items-center gap-2 border relative p-2 border-primary cursor-pointer"
        >
            <div
                className={`absolute h-[80%] z-10 aspect-square rounded-full bg-primary transition-transform duration-300 ${
                    isDark ? "translate-x-0" : "translate-x-full"
                }`}
                style={{ left: isDark ? 4 : 1, top: "10%" }}
            ></div>
            {isDark ? (
                <MoonStarsIcon
                    weight="fill"
                    className="z-20 text-background-primary"
                />
            ) : (
                <MoonIcon className="z-20" />
            )}
            {isDark ? (
                <SunDimIcon className="z-20" />
            ) : (
                <SunIcon
                    weight="fill"
                    className="z-20 text-background-primary"
                />
            )}
        </button>
    );
};

export default ThemeSwitcher;
