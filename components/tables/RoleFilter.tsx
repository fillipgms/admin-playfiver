import {
    Command,
    CommandEmpty,
    CommandGroup,
    CommandInput,
    CommandItem,
    CommandList,
} from "@/components/ui/command";
import { CheckIcon } from "@phosphor-icons/react";
import { cn } from "@/lib/utils";
import { forwardRef, useImperativeHandle } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { IFilterParams, IDoesFilterPassParams } from "ag-grid-community";

const RoleFilter = forwardRef((props: IFilterParams, ref) => {
    const searchParams = useSearchParams();
    const router = useRouter();

    const currentRolesString = searchParams.get("role") || "";
    const currentRoles = currentRolesString
        ? currentRolesString.split(",")
        : [];

    const options = [
        { label: "Admin", value: "admin" },
        { label: "Suporte", value: "suporte" },
        { label: "Revendedor", value: "revendedor" },
    ];

    useImperativeHandle(ref, () => {
        return {
            isFilterActive: () => currentRoles.length > 0,
            doesFilterPass: () => true,
            getModel: () => currentRoles,
            setModel: () => {},
        };
    });

    const handleSelect = (value: string) => {
        const params = new URLSearchParams(searchParams?.toString() || "");
        params.set("page", "1");

        let newRoles: string[];

        if (currentRoles.includes(value)) {
            newRoles = currentRoles.filter((r) => r !== value);
        } else {
            newRoles = [...currentRoles, value];
        }

        if (newRoles.length > 0) {
            params.set("role", newRoles.join(","));
        } else {
            params.delete("role");
        }

        router.push(`?${params.toString()}`);
    };

    return (
        <div className="w-[200px] bg-background border-none shadow-none">
            <Command className="h-full w-full border-0 outline-none">
                <CommandInput placeholder="Buscar cargo..." className="h-9" />
                <CommandList>
                    <CommandEmpty>Nenhum cargo encontrado.</CommandEmpty>
                    <CommandGroup>
                        {options.map((option) => {
                            const isSelected = currentRoles.includes(
                                option.value
                            );
                            return (
                                <CommandItem
                                    key={option.value}
                                    value={option.value}
                                    onSelect={() => handleSelect(option.value)}
                                    className="cursor-pointer"
                                >
                                    <div
                                        className={cn(
                                            "mr-2 flex h-4 w-4 items-center justify-center rounded-sm border border-primary",
                                            isSelected
                                                ? "bg-primary text-primary-foreground"
                                                : "opacity-50 [&_svg]:invisible"
                                        )}
                                    >
                                        <CheckIcon className="h-3 w-3" />
                                    </div>
                                    <span>{option.label}</span>
                                </CommandItem>
                            );
                        })}
                    </CommandGroup>
                </CommandList>
            </Command>
        </div>
    );
});

export default RoleFilter;
