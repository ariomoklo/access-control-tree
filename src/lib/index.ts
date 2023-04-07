export interface Access {
	[K: string]: Access | string;
}
type AccessNode = { scope: string; enabled: boolean; desc: string; toggle: () => void };
type AccessNodes<T, R> = T extends Access
	? { [P in keyof T]: T[P] extends Access ? AccessNodes<T[P], R> : R; }
	: R;

export type ScopeItem = {
	scope: string;
	toggle: () => void;
	desc?: string;
	parent: string;
	hasChild: boolean;
	value: {
		enabled: boolean;
		partialChild: boolean;
	};
};

export type AccessEditor = {
	toggle: (scope: string, asParent?: boolean) => void;
	getChild: (scope: string) => AccessNode[];
	enableAll: () => void;
	disableAll: () => void;
	enabled: readonly string[];
	disabled: readonly string[];
	scopes: readonly ScopeItem[];
};

function traverseAccessControl<T extends Access>(
	node: T,
	parent = '',
	spacer = '.',
	onLeaf: (node: string, scope: string, parent: string) => void = () => undefined,
	onBranch: (node: Access, scope: string, parent: string) => void = () => undefined
) {
	for (const key in node) {
		if (Object.prototype.hasOwnProperty.call(node, key)) {
			const scope = parent !== '' ? [parent, key].join(spacer) : key;
			const current = node[key] as string | Access;

			if (typeof current === 'string') {
				onLeaf(current, scope, parent);
			} else {
				onBranch(current, scope, parent);
				traverseAccessControl(current, scope, spacer, onLeaf, onBranch);
			}
		}
	}
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function transformAccessControl<T = any, A extends Access = Access>(
	nodes: A,
	parent: string,
	spacer = '.',
	onLeaf: (node: string, scope: string, parent: string) => T
): AccessNodes<A, T> {
	const traverse = <N extends string | Access>(node: N, path: string) => {
		const scope = parent !== '' ? [parent, path].join(spacer) : path;
		if (typeof node === 'string') {
			const value = onLeaf(node, scope, path);
			return [path, value];
		} else {
			return [path, transformAccessControl(node, scope, spacer, onLeaf)];
		}
	};

	return Object.fromEntries(Object.entries(nodes).map(([key, value]) => traverse(value, key)));
}

export type AccessControl<T extends Access> = ReturnType<typeof createAccessControl<T>>;
export type AccessControlOptions = {
	/** add prefix to scope. default to '' (none) */
	prefix: string;

	/** string to use for spacer for scope. default to '.' */
	spacer: string;

	/** set default string scopes to be enabled */
	default: string[];
};

export function createAccessControl<T extends Access>(
	access: T,
	options: Partial<AccessControlOptions> = {}
) {
	/** default options */
	const opts: AccessControlOptions = {
		prefix: options.prefix ?? '',
		spacer: options.spacer ?? '.',
		default: options.default ?? []
	};

	/** Scopes / Access Nodes */
	const _scopes: Map<string, AccessNode> = new Map();

	/** Access node creator */
	const _createAccessNode = (scope: string, desc: string) => {
		const node: AccessNode = {
			scope,
			desc,
			enabled: opts.default.includes(scope),
			toggle: () => {
				const found = _scopes.get(scope);
				if (found === undefined) return;
				found.enabled = !found.enabled;
				_scopes.set(scope, found);
			}
		};

		return node;
	};

	/** Reseting Scopes */
	const reset = () => {
		traverseAccessControl(access, opts.prefix, opts.spacer, (node, scope) => {
			_scopes.set(scope, _createAccessNode(scope, node));
		});
	};

	/** Grant Access using given user scopes */
	const grant = (...scopes: string[]) => {
		scopes.forEach((scope) => {
			const node = _scopes.get(scope);
			if (node) {
				node.enabled = true;
				_scopes.set(scope, node);
			}
		});
	};

	/** utility function for finding scope */
	function _get(scope: string, opts: { exact: true }): AccessNode | undefined;
	/** utility function for finding multiple scope */
	function _get(scope: string, opts: { exact: false }): AccessNode[];
	function _get(scope: string, opts: { exact?: boolean } = {}) {
		const scopes = Array.from(_scopes.values());
		if (opts.exact === true || opts.exact === undefined) {
			return scopes.find((s) => s.scope === scope);
		}

		return scopes.filter((s) => s.scope.startsWith(scope));
	}

	// reset to fresh before return
	reset();

	return {
		/** grant access control with the given scope */
		grant,

		/** reset access control to the options scope default */
		reset,

		/** Return access nodes as an array of { scope: string, desc: string } */
		export: (enabledOnly = true) => {
			const scopes = Array.from(_scopes.values());
			if (enabledOnly)
				return scopes.filter((s) => s.enabled).map((s) => ({ scope: s.scope, desc: s.desc }));
			else return scopes.map((s) => ({ scope: s.scope, desc: s.desc }));
		},

		/** utility function for checking if there is an access node that have an exact match with given scope */
		has(scope: string) {
			const found = _get(scope, { exact: true });
			return found !== undefined;
		},

		/** get access node by string scope */
		get: (scope: string) => _get(scope, { exact: true }),

		/** find access node that has the given substring. */
		search: (substring: string, fn = ((n: AccessNode) => n.scope.includes(substring) || n.desc.includes(substring))) => {
            const scopes = Array.from(_scopes.values());
            return scopes.filter(fn)
        },

		/** find all child of the given string scope */
		getChild: (scope: string) => _get(scope, { exact: false }),

		/** readonly enabled access node */
		get enabled() {
			return Array.from(_scopes.values()).filter((s) => s.enabled === true);
		},

		/** readonly disabled access node */
		get disabled() {
			return Array.from(_scopes.values()).filter((s) => s.enabled === false);
		},

		/** readonly AccessNodes  */
		get nodes(): AccessNodes<T, AccessNode> {
			const clone = structuredClone(access) as T;
			return transformAccessControl(clone, opts.prefix, opts.spacer, (desc, scope) => {
				const found = _scopes.get(scope);
				if (found !== undefined) return found;
				return _createAccessNode(scope, desc);
			});
		},

		/** readonly assertion utility for granted scopes  */
		get can(): AccessNodes<T, boolean> {
			const clone = structuredClone(access) as T;
			return transformAccessControl(
				clone,
				opts.prefix,
				opts.spacer,
				(_, scope) => _scopes.get(scope)?.enabled === true ?? false
			);
		}
	};
}
