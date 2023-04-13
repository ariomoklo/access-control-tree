export interface Access {
	[K: string]: Access | string;
}

export type AccessNode = { scope: string; enabled: boolean; desc: string; toggle: () => void };
export type AccessNodes<T, R> = T extends Access
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

export type AccessControlOptions = {
	/** add prefix to scope. default to '' (none) */
	prefix: string;

	/** string to use for spacer for scope. default to '.' */
	spacer: string;

	/** set default string scopes to be enabled */
	default: string[];
};