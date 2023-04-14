<main class="container p-4">
    <h1>Access Control Tree Demo</h1>
    <hr>

    <div class="flex" style="gap: 1rem;">
        <div class="card card-content" style="max-width: 75ch;">
            <p>JSON data bellow is an access control tree configured for todo app bellow. Based on the object tree, <code>access-control-tree</code> will generate 6 access scope that you can saved on databases and grant to user for determining access to authenticated user.</p>
            <p>visit our <a href="https://github.com/ariomoklo/access-control-tree" style="background-color: black; color: white; padding: 4px 6px; border-radius: 6px;">github repo</a> for documentation on how to get started.</p>
            <pre>{JSON.stringify(access, null, 2)}</pre>
        </div>
        <div class="card card-content w-50">
            <p>Try granting access scope bellow to see the action...</p>
            <div class="flex" style="gap: 1rem;">
                <select bind:value={selected} disabled={availableScopeArray.length === 0}>
                    <option disabled selected value>
                        {#if availableScopeArray.length > 0}
                            Pick an access scope
                        {:else}
                            All scope has been granted
                        {/if}
                    </option>
                    {#each availableScopeArray as scope}
                        <option>{scope}</option>
                    {/each}
                </select>
                <button class="btn -theme w-50" on:click={onAddScope} disabled={availableScopeArray.length === 0}>Add Scope</button>
            </div>
            <hr>
            <ul class="list-style -none w-full">
                {#each scopeItems as scope}
                    <li class="inline-flex justify-between items-center w-full" style="background-color: lightskyblue; padding: .25rem .5rem; margin-bottom: .25rem;">
                        <span>{ scope }</span>
                        <button style="grow: 0;" on:click={() => onRemoveScope(scope)}>❌</button>
                    </li>
                {/each}
            </ul>
        </div>
    </div>

    <Todos {scopes} />
</main>

<script lang="ts">
import Todos from "./todos.svelte";
import access from "$access.control";
import { writable } from "svelte/store";
const scopes = writable([ 'todo.view' ])
let selected: string
let scopeItems: string[]
scopes.subscribe(s => scopeItems = s)

let availableScope = new Set([
    'todo.action.toggle',
    'todo.action.edit',
    'todo.action.create',
    'todo.action.delete',
    'extra.sayHi'
])

let availableScopeArray = [...availableScope]

function onAddScope() {
    if (availableScope.has(selected)) {
        scopes.update(s => [ ...s, selected ])
        availableScope.delete(selected)
        availableScopeArray = [...availableScope]
        selected = ''
    }
}

function onRemoveScope(scope: string) {
    scopes.update(s => s.filter(i => i !== scope))
    availableScope.add(scope)
    availableScopeArray = [...availableScope]
}
</script>