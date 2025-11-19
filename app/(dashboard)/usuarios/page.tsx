import UsersTable from "@/components/tables/UsersTable";
import { Metadata } from "next";
import { Suspense } from "react";
import PaginationControls from "@/components/PaginationControls";
import { getUsersData } from "@/actions/users";
import UsersFilters from "./UsersFilters";

export const metadata: Metadata = {
    title: "Usuários",
    description: "Gerenciamento de usuários do sistema",
};

type UsuariosSearchParams = Record<
    string,
    string | string[] | undefined
>;

export default async function UsuariosPage({
    searchParams,
}: {
    searchParams: UsuariosSearchParams;
}) {
    const getParamValue = (param?: string | string[]) =>
        Array.isArray(param) ? param[0] : param;

    const page = parseInt(getParamValue(searchParams.page) || "1", 10);
    const search = getParamValue(searchParams.search) || "";
    const role = getParamValue(searchParams.role) || undefined;
    const filter = getParamValue(searchParams.filter) || undefined;

    const {
        data,
        current_page,
        last_page,
        next_page_url,
        prev_page_url,
    } = (await getUsersData({ page, search, role, filter })) as UserResponseProps;

    const availableRoles = Array.from(
        new Set(data.flatMap((user) => user.role || []))
    ).filter(Boolean);

    const searchParamsRecord = Object.fromEntries(
        Object.entries(searchParams).map(([key, value]) => [
            key,
            Array.isArray(value) ? value[0] : value,
        ])
    );

    return (
        <main className="space-y-8">
            <UsersFilters roles={availableRoles} />

            <section>
                <Suspense fallback={<div>Carregando tabela...</div>}>
                    <UsersTable users={data} />
                </Suspense>
            </section>

            <Suspense fallback={<div>Carregando paginação...</div>}>
                <PaginationControls
                    currentPage={current_page}
                    lastPage={last_page}
                    hasNextPage={!!next_page_url}
                    hasPrevPage={!!prev_page_url}
                    baseUrl="/usuarios"
                    searchParams={searchParamsRecord}
                />
            </Suspense>
        </main>
    );
}
