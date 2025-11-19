export default function UsuariosLoading() {
    return (
        <div className="space-y-4 animate-pulse">
            <div className="h-10 rounded bg-muted/40" />
            <div className="rounded-md bg-muted/40 h-16" />
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                {Array.from({ length: 6 }).map((_, i) => (
                    <div key={i} className="rounded-md bg-muted/40 h-48" />
                ))}
            </div>
        </div>
    );
}
