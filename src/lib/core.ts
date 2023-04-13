import type { Access, AccessNodes, AccessNode, AccessControlOptions } from "./types";

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



export class AccessControl<T extends Access> {

	private _options: AccessControlOptions
	private _scopes: Map<string, AccessNode>
	private _access: T

	constructor(access: T, options: Partial<AccessControlOptions> = {}) {
		this._options = {
			prefix: options.prefix ?? '',
			spacer: options.spacer ?? '.',
			default: options.default ?? []
		}

		this._access = access
		this._scopes = new Map();
		this.reset()
	}

	private get _scopeArray() {
		return Array.from(this._scopes.values())
	}

	private _createAccessNode(scope: string, desc: string) {
		const node: AccessNode = {
			scope,
			desc,
			enabled: this._options.default.includes(scope),
			toggle: () => {
				const found = this._scopes.get(scope);
				if (found === undefined) return;
				found.enabled = !found.enabled;
				this._scopes.set(scope, found);
			}
		};

		return node;
	}

	/** utility function for finding scope */
	private _get(scope: string, opts: { exact: true }): AccessNode | undefined;
	/** utility function for finding multiple scope */
	private _get(scope: string, opts: { exact: false }): AccessNode[];
	private _get(scope: string, opts: { exact?: boolean } = {}) {
		if (opts.exact === true || opts.exact === undefined) {
			return this._scopeArray.find((s) => s.scope === scope);
		}

		return this._scopeArray.filter((s) => s.scope.startsWith(scope));
	}

	/** reset access control to the options scope default */
	reset() {
		traverseAccessControl(this._access, this._options.prefix, this._options.spacer, (node, scope) => {
			this._scopes.set(scope, this._createAccessNode(scope, node));
		});
	}

	/** grant access control with the given scope */
	grant(...scopes: string[]) {
		scopes.forEach((scope) => {
			const node = this._scopes.get(scope);
			if (node) {
				node.enabled = true;
				this._scopes.set(scope, node);
			}
		});
	}

	/** Return access nodes as an array of { scope: string, desc: string } */
	export({ enabledOnly }: { enabledOnly?: boolean } = {}) {
        let exported = this._scopeArray
		if (enabledOnly) exported = exported.filter((s) => s.enabled)
        
        return exported.map((s) => ({ scope: s.scope, desc: s.desc }));
	}

	/** utility function for checking if there is an access node that have an exact match with given scope */
	has(scope: string) {
		const found = this._get(scope, { exact: true });
		return found !== undefined;
	}

	/** get access node by string scope */
	get(scope: string) {
		return this._get(scope, { exact: true })
	}

	/** find access node that has the given substring. */
	search(substring: string, fn = ((n: AccessNode) => n.scope.includes(substring) || n.desc.includes(substring))) {
		return this._scopeArray.filter(fn)
	}

	/** find all child of the given string scope */
	getChild(scope: string) {
		return this._get(scope, { exact: false })
	}

	/** readonly enabled access node */
	get enabled() {
		return this._scopeArray.filter((s) => s.enabled === true);
	}

	/** readonly disabled access node */
	get disabled() {
		return this._scopeArray.filter((s) => s.enabled === false);
	}

	/** readonly AccessNodes  */
	get nodes(): AccessNodes<T, AccessNode> {
		const clone = structuredClone(this._access) as T;
		return transformAccessControl(clone, this._options.prefix, this._options.spacer, (desc, scope) => {
			const found = this._scopes.get(scope);
			if (found !== undefined) return found;
			return this._createAccessNode(scope, desc);
		});
	}

	/** readonly assertion utility for granted scopes  */
	get can(): AccessNodes<T, boolean> {
		const clone = structuredClone(this._access) as T;
		return transformAccessControl(
			clone,
			this._options.prefix,
			this._options.spacer,
			(_, scope) => this._scopes.get(scope)?.enabled === true ?? false
		);
	}
}