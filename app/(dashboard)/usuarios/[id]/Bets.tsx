import { getSpecificUserBets } from "@/actions/users";
import React from "react";
import AgentTransactionsTable from "../../agentes/[id]/AgentTransactionsTable";
import PaginationControls from "@/components/PaginationControls";
import FiltersClient from "./FiltersClient";

const Bets = async ({
    id,
    searchParamsRecord,
}: {
    id: string;
    searchParamsRecord: {
        [k: string]: string | undefined;
    };
}) => {
    const getParamValue = (param?: string | string[]) =>
        Array.isArray(param) ? param[0] : param;

    const filter = getParamValue(searchParamsRecord.filter) || undefined;
    const dateStart = getParamValue(searchParamsRecord.dateStart) || undefined;
    const dateEnd = getParamValue(searchParamsRecord.dateEnd) || undefined;
    const search = getParamValue(searchParamsRecord.search) || undefined;

    const page = parseInt(searchParamsRecord.page || "1", 10);
    const data = await getSpecificUserBets(
        id,
        page,
        filter,
        dateStart,
        dateEnd,
        search
    );

    const { current_page, last_page, next_page_url, prev_page_url } = data.data;

    return (
        <div className="space-y-6">
            <FiltersClient userId={id} params={searchParamsRecord} />

            <AgentTransactionsTable
                name={"Usuário"}
                transactions={data.data.data}
            />

            <PaginationControls
                currentPage={current_page}
                lastPage={last_page}
                hasNextPage={!!next_page_url}
                hasPrevPage={!!prev_page_url}
                baseUrl={`/usuarios/${id}`}
                searchParams={searchParamsRecord}
            />
        </div>
    );
};

export default Bets;
