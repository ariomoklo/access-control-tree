import { AccessControl as AccessControlTree } from "./core";
import type { Access, AccessControlOptions } from "./types";

export type AccessControl<T extends Access> = AccessControlTree<T>
export const isInstanceOfAccessControl = (obj: unknown) => obj instanceof AccessControlTree
export const createAccessControl = <T extends Access>(
	access: T,
	options: Partial<AccessControlOptions> = {}
) => new AccessControlTree<T>(access, options)
