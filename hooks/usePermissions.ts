"use client";

import { useMemo, useCallback } from "react";
import { useSession } from "@/contexts/SessionContext";

type PermissionCheckTarget = string | string[] | undefined;

interface HasPermissionOptions {
    /**
     * When true, returns true if the user has at least one of the permissions.
     * When false (default), the user must have all provided permissions.
     */
    any?: boolean;
}

export const usePermissions = () => {
    const { user, loading } = useSession();

    const permissions = useMemo(
        () => user?.permissions ?? [],
        [user?.permissions]
    );
    const permissionSet = useMemo(() => new Set(permissions), [permissions]);

    const hasPermission = useCallback(
        (target?: PermissionCheckTarget, options?: HasPermissionOptions) => {
            if (!target) return true;

            const required = Array.isArray(target) ? target : [target];
            if (required.length === 0) return true;
            if (permissionSet.size === 0) return false;

            if (options?.any) {
                return required.some((permission) =>
                    permissionSet.has(permission)
                );
            }

            return required.every((permission) =>
                permissionSet.has(permission)
            );
        },
        [permissionSet]
    );

    const hasAnyPermission = useCallback(
        (...target: string[]) => hasPermission(target, { any: true }),
        [hasPermission]
    );

    return {
        permissions,
        loading,
        hasPermission,
        hasAnyPermission,
    };
};
