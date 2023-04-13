import type { AccessControl } from "$lib";
import access from '$access.control'

// See https://kit.svelte.dev/docs/types#app
// for information about these interfaces
declare global {
	namespace App {
		type Access = typeof access
		// interface Error {}
		interface Locals {
			accessControl: AccessControl<App.Access>
		}
		// interface PageData {}
		// interface Platform {}
	}
}

export {};
