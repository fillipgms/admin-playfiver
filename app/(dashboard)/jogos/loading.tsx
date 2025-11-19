export default function JogosLoading() {
    return (
        <div className="space-y-6 animate-pulse">
            <div className="h-10 rounded bg-muted/40" />
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4 md:gap-6">
                {Array.from({ length: 18 }).map((_, i) => (
                    <div key={i} className="h-40 rounded-md bg-muted/40" />
                ))}
            </div>
        </div>
    );
}
