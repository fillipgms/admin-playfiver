export default function DashboardSectionLoading() {
    return (
        <div className="p-4 md:pl-8 md:pr-4 md:pb-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-6 gap-4 sm:gap-6 lg:gap-8 animate-pulse">
                <div className="col-span-1 sm:col-span-1 lg:col-span-2 h-28 rounded-md bg-muted/40" />
                <div className="col-span-1 sm:col-span-1 lg:col-span-2 h-28 rounded-md bg-muted/40" />
                <div className="col-span-1 sm:col-span-1 lg:col-span-2 h-28 rounded-md bg-muted/40" />

                <div className="col-span-1 sm:col-span-2 lg:col-span-3 h-64 rounded-md bg-muted/40" />
                <div className="col-span-1 sm:col-span-2 lg:col-span-3 h-64 rounded-md bg-muted/40" />
            </div>
        </div>
    );
}
