"use client";

import { useState } from "react";
import Sidebar from "@/components/Sidebar";
import Header from "@/components/Header";
import { NextStep, NextStepProvider } from "nextstepjs";
import {
    steps,
    useFirstVisitTour,
    useSidebarMobileTourStep,
} from "@/data/toursteps";
import TourCard from "@/components/TourCard";
import { TooltipProvider } from "@/components/ui/tooltip";

function DashboardContent({ children }: { children: React.ReactNode }) {
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    const isSidebarMobileStep = useSidebarMobileTourStep();

    useFirstVisitTour();

    const toggleSidebar = () => setIsSidebarOpen(!isSidebarOpen);
    const closeSidebar = () => setIsSidebarOpen(false);

    return (
        <div className="flex min-h-svh">
            <Sidebar
                isOpen={isSidebarOpen || isSidebarMobileStep}
                onClose={closeSidebar}
            />
            <div
                id="home-component"
                className="flex-1 flex flex-col min-h-svh min-w-0"
            >
                <Header onMenuToggle={toggleSidebar} />
                <div
                    id="home-screen"
                    className="flex-1 p-4 md:pl-8 md:pr-4 md:pb-4 min-w-0"
                >
                    {children}
                </div>
            </div>
        </div>
    );
}

export default function DashboardLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <NextStepProvider>
            <NextStep
                steps={steps}
                cardComponent={TourCard}
                shadowRgb="0, 0, 0"
                shadowOpacity="0.7"
            >
                <DashboardContent>
                    <TooltipProvider>{children}</TooltipProvider>
                </DashboardContent>
            </NextStep>
        </NextStepProvider>
    );
}
