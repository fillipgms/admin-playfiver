"use client";
import { useRouter } from "next/navigation";
import IpTable from "./tables/IpTable";

interface IpWhitelistClientProps {
    whitelist: Array<{
        id: number;
        ip: string;
        created_at: string;
    }>;
}

export default function IpWhitelistClient({
    whitelist,
}: IpWhitelistClientProps) {
    const router = useRouter();

    const handleIpCreated = () => {
        router.refresh();
    };

    return <IpTable whitelist={whitelist} onIpCreated={handleIpCreated} />;
}
