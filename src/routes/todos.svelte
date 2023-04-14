<div class="card card-content mt-4">
    <h3 class="inline-flex justify-between items-center mb-0">
        <span>Todo App</span>
        {#if access.extra.sayHi}
            <button class="btn -theme" style="font-size: 1rem;" on:click={() => alert('Hi!')}>Say Hi!</button>
        {/if}
    </h3>
    <hr>
    <ul class="list-style -none w-full">
        {#each items as item}
            <TodoItem text={item} {access} on:remove={() => onRemoveTodo(item)} />
        {/each}
        {#if access.todo.action.create}
             <div class="flex" style="gap: 1rem;">
                 <input type="text" placeholder="Add to todo list" bind:value={todoInput} >
                 <button class="btn -theme w-50" on:click={onAddTodo} disabled={!access.todo.action.create}>Add Todo</button>
             </div>
        {:else}
             <p class="text-center mb-0 mt-3" style="color: lightslategray;">Sorry, you don't have access to add todo list</p>
        {/if}
    </ul>
</div>

<script lang="ts">
import TodoItem from "./todoItem.svelte";
import accessTree from "$access.control"
import { createAccessControl } from "$lib";
import type { Readable } from "svelte/store";
import { onDestroy } from "svelte";

export let scopes: Readable<string[]>
const accessControl = createAccessControl(accessTree)
let access = accessControl.can
const unsubs = scopes.subscribe(s => {
    accessControl.reset()
    accessControl.grant(...s)
    access = accessControl.can
})

onDestroy(() => unsubs())

const todos = new Set<string>([
    'Try adding `todo.action.delete` access scope...', 
    'Watch the trash button show on scope added...',
    'Then add `todo.action.create` scope to grant create todo to user...'
])
let items = [...todos]
let todoInput = ""

function onRemoveTodo(text: string) {
    todos.delete(text)
    items = [...todos]
}

function onAddTodo() {
    if (todoInput.length > 0) {
        todos.add(todoInput)
        todoInput = ''
    }

    items = [...todos]
}
</script>