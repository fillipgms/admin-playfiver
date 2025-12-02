"use client";

import { useEffect, useState } from "react";
import { getPermissions } from "@/actions/permission";

export default function TestPage() {
    const [data, setData] = useState();

    useEffect(() => {
        const fetchData = async () => {
            const res = await getPermissions();
            setData(res);
        };
        fetchData();
    }, []);

    return (
        <div>
            <h1>Test Page</h1>
            <pre>{JSON.stringify(data, null, 2)}</pre>
        </div>
    );
}
