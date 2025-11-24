import UsersTable from "@/components/tables/UsersTable";
import { Metadata } from "next";
import { Suspense } from "react";
import PaginationControls from "@/components/PaginationControls";
import { getUsersData } from "@/actions/users";
import Button from "@/components/Button";
import CreateUserModal from "./CreateUserModal";

export const metadata: Metadata = {
    title: "Usuários",
    description: "Gerenciamento de usuários do sistema",
};

type UsuariosSearchParams = Promise<
    Record<string, string | string[] | undefined>
>;

export default async function UsuariosPage({
    searchParams,
}: {
    searchParams: UsuariosSearchParams;
}) {
    const getParamValue = (param?: string | string[]) =>
        Array.isArray(param) ? param[0] : param;

    const params = await searchParams;

    const page = parseInt(getParamValue(params.page) || "1", 10);
    const search = getParamValue(params.search) || "";
    const role = getParamValue(params.role) || undefined;
    const filter = getParamValue(params.filter) || undefined;

    const { data, current_page, last_page, next_page_url, prev_page_url } =
        (await getUsersData({
            page,
            search,
            role,
            filter,
        })) as UserResponseProps;

    const searchParamsRecord = Object.fromEntries(
        Object.entries(searchParams).map(([key, value]) => [
            key,
            Array.isArray(value) ? value[0] : value,
        ])
    );

    return (
        <main className="space-y-8">
            <section className="flex items-center justify-between flex-wrap ga-4">
                <span />

                <CreateUserModal />
            </section>

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
