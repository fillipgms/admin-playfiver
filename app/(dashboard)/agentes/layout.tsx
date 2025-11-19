import React from "react";

import { Metadata } from "next";

export const metadata: Metadata = {
    title: "Agentes",
    description: "Agentes do sistema",
};

const layout = ({ children }: { children: React.ReactNode }) => {
    return <div>{children}</div>;
};

export default layout;
