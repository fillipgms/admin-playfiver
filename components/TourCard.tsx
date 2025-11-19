"use client";

import React, { JSX } from "react";
import { Step } from "nextstepjs";
import Button from "./Button";

interface TourCardProps {
    step: Step;
    currentStep: number;
    totalSteps: number;
    nextStep: () => void;
    prevStep: () => void;
    skipTour?: () => void;
    arrow: JSX.Element;
}

const TourCard = ({
    step,
    currentStep,
    totalSteps,
    nextStep,
    prevStep,
    skipTour,
    arrow,
}: TourCardProps) => {
    return (
        <div className="rounded-lg shadow-lg p-6 max-w-md bg-background-primary text-foreground">
            <div className="flex items-center gap-3 mb-4">
                {step.icon && <div className="text-2xl">{step.icon}</div>}
                <h3 className="text-xl font-bold">{step.title}</h3>
            </div>

            <div className="mb-6">{step.content}</div>

            {arrow}

            <div className="flex justify-between gap-2 items-center">
                <div className="text-sm">
                    <p className="text-nowrap">
                        {currentStep + 1} / {totalSteps}
                    </p>
                </div>

                <div className="flex gap-2">
                    {step.showSkip && skipTour && (
                        <Button variant="secondary" onClick={skipTour}>
                            Pular
                        </Button>
                    )}
                    {currentStep > 0 && (
                        <Button variant="secondary" onClick={prevStep}>
                            Voltar
                        </Button>
                    )}

                    <Button onClick={nextStep}>
                        {currentStep === totalSteps - 1
                            ? "Finalizar"
                            : "Próximo"}
                    </Button>
                </div>
            </div>
        </div>
    );
};

export default TourCard;
