import type { RequestEvent } from "@sveltejs/kit";
import type { Access, AccessControlOptions } from "./types";
import type { AccessControl } from "./core";
import { createAccessControl, isInstanceOfAccessControl } from "$lib";
import { writable } from "svelte/store";
import { getContext, setContext } from "svelte";

export function createServerHook<T extends Access = App.Access>(event: RequestEvent, access: T | AccessControl<T>, options: Partial<AccessControlOptions> = {}) {
    if (isInstanceOfAccessControl(access)) event.locals.accessControl = access as AccessControl<T>
    else event.locals.accessControl = createAccessControl(access as T, options)
}

export function setupContext<T extends Access = App.Access>(contextKey: string, access: T | AccessControl<T>, options: Partial<AccessControlOptions> = {}) {
    if (!isInstanceOfAccessControl(access)) {
        access = createAccessControl(access as T, options)
    }

    const accessControl = writable(access as AccessControl<T>)
    const unsubscribe = accessControl.subscribe(_access => access = _access)
    setContext(contextKey, accessControl)

    return {
        unsubscribe,
        /** grant access control with the given scope */
        grant(...scopes: string[]) {
            accessControl.update(access => {
                access.grant(...scopes)
                return access
            })
        }
    }
}

export function getAccessControl<T extends Access = App.Access>(contextKey: string) {
    return getContext<AccessControl<T>>(contextKey)
}