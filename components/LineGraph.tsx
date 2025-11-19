"use client";
import React, { useEffect, useMemo, useState } from "react";
import chroma from "chroma-js";
import { twMerge } from "tailwind-merge";

const LineGraphComponent = ({
    data,
}: {
    data: {
        game_name: string;
        count: number;
    }[];
}) => {
    const [colors, setColors] = useState<string[]>([]);

    const totalCount = useMemo(
        () => data.reduce((sum, uniqueData) => sum + uniqueData.count, 0),
        [data]
    );

    useEffect(() => {
        function getStyles() {
            const computed = getComputedStyle(document.documentElement);
            const primary = computed.getPropertyValue("--primary").trim();
            const secondary = computed.getPropertyValue("--secondary").trim();

            if (primary && secondary) {
                const scale = chroma
                    .scale([primary, secondary])
                    .mode("lch")
                    .colors(data.length);
                setColors(scale);
            }
        }

        getStyles();

        const observer = new MutationObserver(getStyles);
        observer.observe(document.documentElement, {
            attributes: true,
            attributeFilter: ["class"],
        });

        return () => observer.disconnect();
    }, [data.length]);

    return (
        <div className="space-y-6 w-full max-w-2xl mx-auto">
            <div className="flex gap-0.5 rounded overflow-hidden w-full mt-4">
                {data.map((bar, i) => {
                    const percent = ((bar.count / totalCount) * 100).toFixed(2);

                    return (
                        <div
                            key={bar.game_name}
                            style={{
                                width: `${percent}%`,
                                background: colors[i],
                                transition: "background 0.3s",
                            }}
                            className="h-2.5"
                            title={`${bar.game_name}: ${bar.count} (${percent}%)`}
                        ></div>
                    );
                })}
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {data.map((uniqueData, i) => (
                    <div
                        key={uniqueData.game_name}
                        className={twMerge(
                            "flex justify-between items-center gap-2 px-3 py-2 rounded-lg  shadow-sm transition",
                            i === 0 && data.length % 2 !== 0
                                ? "sm:col-span-2"
                                : ""
                        )}
                    >
                        <div className="flex items-center gap-2">
                            <div
                                className="w-3 h-3 rounded-full aspect-square"
                                style={{
                                    background: colors[i],
                                }}
                            ></div>
                            <p className="text-sm font-medium text-neutral-700 dark:text-neutral-200">
                                {uniqueData.game_name}
                            </p>
                        </div>
                        <p className="font-bold text-neutral-900 dark:text-neutral-100">
                            {uniqueData.count}
                        </p>
                    </div>
                ))}
            </div>
        </div>
    );
};

const LineGraph = React.memo(LineGraphComponent);

export default LineGraph;
