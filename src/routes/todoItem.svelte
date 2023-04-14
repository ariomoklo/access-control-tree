<li class="inline-flex justify-between items-center w-full" style="{`background-color: ${value?'lightgreen':'lightskyblue'}; padding: .25rem .5rem; margin-bottom: .5rem; gap: 1rem;`}">
    <div class="flex w-full" style="grow: 1; gap: .25rem;">
        {#if access.todo.action.toggle}
            <!-- svelte-ignore a11y-click-events-have-key-events -->
            <div style="grow: 0; cursor: pointer;" on:click={() => value = !value}>{ value ? '✅':'⏹️' }</div>
        {/if}

        {#if state === 'edit'}
            <input type="text" placeholder="Add to todo list" bind:value={text} style="background-color: white;" >
        {:else}
            <span>{ text }</span>
        {/if}
    </div>
    
    <div class="flex" style="gap: .25rem;">
        {#if access.todo.action.edit}
            {#if state === 'edit'}
                <button style="grow: 0; background-color: yellow;" on:click={() => state = 'view'}>✏️</button>
            {:else}
                <button style="grow: 0;" on:click={() => state = 'edit'}>✏️</button>
            {/if}
        {/if}

        {#if access.todo.action.delete}
            <button style="grow: 0;" on:click={() => onRemoveTodo()}>❌</button>
        {/if}
    </div>
</li>

<script lang="ts">
import { createEventDispatcher } from "svelte";

export let text: string
export let access: App.AccessAssert

let state: 'edit' | 'view' = 'view'
let value = false

const dispatch = createEventDispatcher()
const onRemoveTodo = () => dispatch('remove', { text })
</script>