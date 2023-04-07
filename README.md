# Access Control Tree

Authorizing access to your app with ease.

## Get Started

```
npm install access-control-tree
```

### Define your access control

The concept of this library is structuring your application as a tree. Defining access from page to section to content to button or function as deep as you want.

``` ts
// this is the base usage
const access = createAccessControl(
    {
        todo: {
            view: 'Enable user to view todo list page',
            toggle: 'Enable user to toggle todo value',
            crud: {
                edit: 'Enable user to edit todo item',
                create: 'Enable user to add todo item',
                delete: 'Enable user to delete todo item'
            }
        },
        extra: {
            sayHi: 'Enable user to say hi'
        }
    }
);
```

#### `createAccessControl`

``` ts
interface Access = { [K: string]: Access | string }
type AccessControlOptions = {
    /** 
     * add prefix to scope. default to '' (none) 
     * example prefix: 'com.example'
     * scope 'todo.view' => 'com.example.todo.view'
     * */
    prefix: string
    
    /** string to use for spacer for scope. default to '.' */
    spacer: string
    
    /** default string scopes to be enabled. default to [] */
    default: string[]
}

function createAccessControl<T extends Access> (access: T, Partial<AccessControlOptions>): {
    grant: (...scopes: string[]) => void
    reset: () => void
    export: (enabledOnly: boolean) => ({ scope: string, desc: string })[]
    has: (scope: string) => boolean
    get: (scope: string) => AccessNode | undefined
    search: (substring: string) => AccessNode[]
    getChild: (scope: string) => AccessNode[]
    readonly enabled: accessNode[]
    readonly disabled: accessNode[]
    readonly nodes: AccessNodes<T, AccessNode>
    readonly can: AccessNodes<T, AccessNode>
}
```

### Asserting and Granting access

To assert granted access you can use `can` property. `can` property will be typed as the type of access object from `createAccessControl` function with the leaf node will be typed boolean. With the example from before, variable `access` will have property of `can.todo.view` with typeof boolean.

For getting access node data you can use `nodes` property. Like `can`, `nodes` will be structured as given access object but with node leaf with type of `AccessNode`.
``` ts
type AccessNode = {
    // string scope
    scope: string
    // enabled value
    enabled: boolean
    // scope description
    desc: string
    // enabled toggle function
    toggle: () => void 
}
```

Here is example how to assert and granting scope

``` ts
// asserting granted access
const isViewEnabled = access.can.todo.view
//    ^ type is boolean

// grant access by string scope
access.grant('todo.view', 'todo.toggle', 'todo.crud.edit')

// grant access by toggle function
access.nodes.todo.view.toggle()

// reseting access to default
access.reset()
```
