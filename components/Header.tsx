import React from "react";
import { NotificationButton } from "./NotificationButton";
import ThemeSwitcher from "./ThemeSwitcher";
import { ListIcon } from "@phosphor-icons/react";
import UserButton from "./UserButton";
interface HeaderProps {
    onMenuToggle: () => void;
}

const Header = ({ onMenuToggle }: HeaderProps) => {
    return (
        <div className="bg-background-secondary w-full sticky top-0 p-7 md:pr-4 md:py-4 z-30">
            <header className="bg-background-primary p-4 rounded-md flex items-center justify-between">
                <div className="flex gap-2 md:gap-4 items-center">
                    <button
                        onClick={onMenuToggle}
                        className="md:hidden bg-background-secondary p-2 rounded-md hover:bg-background-secondary/80 transition-colors"
                    >
                        <ListIcon size={20} />
                    </button>

                    <UserButton />

                    <NotificationButton />
                </div>

                <div id="theme-switcher">
                    <ThemeSwitcher />
                </div>
            </header>
        </div>
    );
};

export default Header;
