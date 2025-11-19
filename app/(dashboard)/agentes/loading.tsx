export default function AgentesLoading() {
    return (
        <div className="space-y-4 p-2 sm:p-4 lg:p-0 animate-pulse">
            <div className="h-10 rounded bg-muted/40" />
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4 sm:gap-6 lg:gap-8">
                {Array.from({ length: 6 }).map((_, i) => (
                    <div key={i} className="h-72 rounded-md bg-muted/40" />
                ))}
            </div>
        </div>
    );
}
