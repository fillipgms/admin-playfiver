import { getSpecificUserUsers } from "@/actions/users";
import { Card, CardContent, CardHeader } from "@/components/Card";
import PaginationControls from "@/components/PaginationControls";
import { UserIcon } from "@phosphor-icons/react/dist/ssr";

const Related = async ({
    id,
    searchParamsRecord,
}: {
    id: string;
    searchParamsRecord: {
        [k: string]: string | undefined;
    };
}) => {
    const page = parseInt(searchParamsRecord.page || "1", 10);
    const { data } = (await getSpecificUserUsers(id, page)) as RelatedResponse;

    const relatedUsers = data.data;

    const { current_page, last_page, next_page_url, prev_page_url } = data;

    return (
        <div className="space-y-8">
            <Card>
                <CardHeader>
                    <div className="flex items-center w-full justify-between pb-4 border-b border-foreground/20">
                        <h2 className="font-semibold text-lg">
                            Usuários Relacionados
                        </h2>
                        <span className="text-sm text-foreground/60">
                            {relatedUsers?.length || 0} usuários
                        </span>
                    </div>
                </CardHeader>
                <CardContent>
                    {relatedUsers && relatedUsers.length > 0 ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mt-4">
                            {relatedUsers.map((relatedUser) => (
                                <a
                                    key={relatedUser.id}
                                    href={`/usuarios/${relatedUser.id}`}
                                    className="bg-background-secondary rounded-lg p-4 border border-foreground/10 hover:border-foreground/20 transition-colors group"
                                >
                                    <div className="flex items-start gap-3">
                                        <div className="flex items-center justify-center size-10 rounded-full bg-primary/10 group-hover:bg-primary/20 transition-colors">
                                            <UserIcon
                                                className="text-primary"
                                                size={20}
                                            />
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <h3 className="font-semibold text-base truncate group-hover:text-primary transition-colors">
                                                {relatedUser.name}
                                            </h3>
                                            <p className="text-sm text-foreground/60 truncate mt-1">
                                                {relatedUser.email}
                                            </p>
                                            <p className="text-xs text-foreground/40 font-mono mt-2">
                                                ID: {relatedUser.id}
                                            </p>
                                        </div>
                                    </div>
                                </a>
                            ))}
                        </div>
                    ) : (
                        <div className="p-8 text-center">
                            <UserIcon
                                className="mx-auto text-foreground/30 mb-4"
                                size={48}
                            />
                            <p className="text-foreground/60">
                                Nenhum usuário relacionado encontrado
                            </p>
                        </div>
                    )}
                </CardContent>
            </Card>

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

export default Related;
