import axios from "axios";
import { headers } from "next/headers";

export async function getClientIp() {
    const res = await axios.get("https://api.ipify.org");

    return res.data;
}
