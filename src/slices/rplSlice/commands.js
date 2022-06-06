import { createList, createNumber, createVar, dupObject } from "./objects"
import { LIST, NUMBER, VAR, COMMAND, PROGRAM, VARCALL, IFTHENELSEEND } from "./objectTypes"

export const setError = (state, text, keepInput) => {
    state.error = text
    if (keepInput) {
        state.keepInput = true
    } else {
        state.keepInput = false
    }
}

export const requireStack = (state, n) => {
    if (state.stack.length < n) {
        setError(state, 'Too few arguments')
        return false
    }
    return true
}

export const requireStackTypes = (state, n, types) => {
    if (!requireStack(state, n)) {
        return false
    }
    const { length } = state.stack
    for (let index = 0; index < n; index++) {
        if ((types[index] !== null) && (state.stack[length - n + index].type !== types[index])) {
            setError(state, `Bad argument type; element [${n - index}] should of type <${types[index]}>`)
            return false
        }
    }
    return true
}

export const cleanErrorState = (state) => {
    if (state.error !== null) {
        setError(state, null)
    }
}

export const pushStack = (stack, element) => stack.push(element)

export const popStack = (stack) => stack.pop()

export const popNStack = (stack, n) => stack.splice(stack.length - n, n)

export const peekStack = (stack, n) => stack[stack.length - n]

export const peekNStack = (stack, n) => stack.slice(stack.length - n, stack.length)

export const clearStack = (stack) => stack.splice(0)

export const pushStackObjects = (stack, objects) => {
    for (const object of objects) {
        pushStack(stack, object)
    }
}

const require1Operation = (state, code) => {
    cleanErrorState(state)
    if (requireStack(state, 1)) {
        const { stack } = state

        const object1 = popStack(stack)
        code(stack, object1)
    }
}

const require1OperationType = (state, type, code) => {
    cleanErrorState(state)
    if (requireStackTypes(state, 1, [type])) {
        const { stack } = state

        const object1 = popStack(stack)
        code(stack, object1)
    }
}

const require1OperationKeep = (state, code) => {
    cleanErrorState(state)
    if (requireStack(state, 1)) {
        const { stack } = state

        const object1 = peekStack(stack, 1)
        code(stack, object1)
    }
}

const require2Operation = (state, code) => {
    cleanErrorState(state)
    if (requireStack(state, 2)) {
        const { stack } = state

        const [object1, object2] = popNStack(stack, 2)
        code(stack, object1, object2)
    }
}

const require2OperationTypes = (state, types, code) => {
    cleanErrorState(state)
    if (requireStackTypes(state, 2, types)) {
        const { stack } = state

        const [object1, object2] = popNStack(stack, 2)
        code(stack, object1, object2)
    }
}

const require2OperationKeep = (state, code) => {
    cleanErrorState(state)
    if (requireStack(state, 2)) {
        const { stack } = state

        const [object1, object2] = peekNStack(stack, 2)
        code(stack, object1, object2)
    }
}

const requireNOperationKeep = (state, n, code) => {
    cleanErrorState(state)
    if (requireStack(state, n)) {
        const { stack } = state

        code(stack)
    }
}

const requireNsOperationKeep = (state, code) => {
    cleanErrorState(state)
    if (requireStackTypes(state, 1, [NUMBER])) {
        const { stack } = state

        const objectN = peekStack(stack, 1)
        const n = objectN.element
        if (requireStack(state, n + 1)) {
            popStack(stack)
            code(stack, n)
        }
    }
}

const requireNsOperation = (state, code) => requireNsOperationKeep(
    state,
    (stack, n) => code(stack, popNStack(stack, n))
)

const unaryNumberOperation = (state, unaryFunc) => require1OperationType(
    state,
    NUMBER,
    (stack, object) => pushStack(stack, createNumber(unaryFunc(object.element)))
)


const binaryNumberOperation = (state, binaryFunc) => require2OperationTypes(
    state,
    [NUMBER, NUMBER],
    (stack, object1, object2) => pushStack(stack, createNumber(binaryFunc(object1.element, object2.element)))
)

export const execs = (state, items) => {
    if (items) {
        for (const item of items) {
            exec(state, item)
        }
    }
}

export const exec = (state, item, { as_input, as_program } = {}) => {
    console.log({ item })
    if (item.type === COMMAND) {
        const command = commands[item.name]
        command(state)
    } else if (item.type === VARCALL) {
        const content = state.root[item.name]
        if (content) {
            exec(state, content)
        } else {
            pushStack(state.stack, createVar(item.name))
        }
    } else if (item.type === VAR && (!as_input) && (!as_program)) {
        const content = state.root[item.name]
        if (content) {
            exec(state, content)
        } else {
            pushStack(state.stack, item)
        }
    } else if (item.type === PROGRAM && (!as_input) && (!as_program)) {
        for (const object of item.element) {
            exec(state, object, { as_program: true })
        }
    } else if (item.type === IFTHENELSEEND && (!as_input)) {
        const { objects_if, objects_then, objects_else } = item.element
        execs(state, objects_if)
        if (state.stack.length < 1) {
            throw new Error('then: Too few arguments')
        }
        const test = popStack(state.stack)
        if (test.element) {
            execs(state, objects_then)
        } else {
            execs(state, objects_else)
        }
    } else {
        pushStack(state.stack, item)
    }
}


export const commands = {
    '+': (state) => binaryNumberOperation(state, (v1, v2) => v1 + v2),
    '-': (state) => binaryNumberOperation(state, (v1, v2) => v1 - v2),
    '*': (state) => binaryNumberOperation(state, (v1, v2) => v1 * v2),
    '/': (state) => binaryNumberOperation(state, (v1, v2) => v1 / v2),
    'depth': (state) => pushStack(state.stack, createNumber(state.stack.length)),
    'drop': (state) => require1Operation(state, () => { }),
    'dup': (state) => require1OperationKeep(state, (stack, object1) => pushStack(stack, dupObject(object1))),
    'dup2': (state) => require2OperationKeep(state, (stack, object1, object2) => {
        pushStack(stack, dupObject(object1))
        pushStack(stack, dupObject(object2))
    }),
    'dupn': (state) => requireNsOperationKeep(state, (stack, n) => pushStackObjects(stack, peekNStack(stack, n).map((object) => dupObject(object)))),
    'swap': (state) => require2Operation(state, (stack, object1, object2) => {
        pushStack(stack, object2)
        pushStack(stack, object1)
    }),
    'dropn': (state) => requireNsOperation(state, () => { }),
    'pick': (state) => requireNsOperationKeep(state, (stack, n) => pushStack(stack, dupObject(peekStack(stack, n)))),
    'over': (state) => requireNOperationKeep(state, 2, (stack) => pushStack(stack, dupObject(peekStack(stack, 2)))),
    'ip': (state) => unaryNumberOperation(state, (v) => v >= 0 ? Math.floor(v) : Math.floor(v) + 1),
    'fp': (state) => unaryNumberOperation(state, (v) => v >= 0 ? v - Math.floor(v) : v - Math.floor(v) - 1),
    'neg': (state) => unaryNumberOperation(state, (v) => -v),
    'inv': (state) => unaryNumberOperation(state, (v) => 1 / v),
    'sqrt': (state) => unaryNumberOperation(state, (v) => Math.sqrt(v)),
    'cos': (state) => unaryNumberOperation(state, (v) => Math.cos(v)),
    'sin': (state) => unaryNumberOperation(state, (v) => Math.sin(v)),
    'cosh': (state) => unaryNumberOperation(state, (v) => Math.cosh(v)),
    'sinh': (state) => unaryNumberOperation(state, (v) => Math.sinh(v)),
    'acos': (state) => unaryNumberOperation(state, (v) => Math.acos(v)),
    'asin': (state) => unaryNumberOperation(state, (v) => Math.asin(v)),
    'acosh': (state) => unaryNumberOperation(state, (v) => Math.acosh(v)),
    'asinh': (state) => unaryNumberOperation(state, (v) => Math.asinh(v)),
    'roll': (state) => requireNsOperation(state, (stack, objects) => {
        pushStackObjects(stack, objects.slice(1))
        pushStack(stack, objects[0])
    }),
    'rolld': (state) => requireNsOperation(state, (stack, objects) => {
        pushStack(stack, objects[objects.length - 1])
        pushStackObjects(stack, objects.slice(0, objects.length - 1))
    }),
    'sto': (state) => require2OperationTypes(state, [null, VAR], (stack, object1, object2) => {
        if (commands[object2.name] === undefined) {
            state.root[object2.name] = object1
        } else {
            pushStackObjects(stack, [object1, object2])
            setError(state, `${object2.name} is a system command`, false)
        }
    }),
    'rcl': (state) => require1OperationType(state, VAR, (stack, object) => {
        if (commands[object.name] === undefined) {
            if (state.root[object.name] !== undefined) {
                pushStack(stack, state.root[object.name])
            } else {
                pushStack(stack, object)
                setError(state, `No object named ${object.name}`, false)
            }
        } else {
            pushStack(stack, object)
            setError(state, `${object.name} is a system command`, false)
        }
    }),
    'eval': (state) => require1Operation(state, (stack, object) => {
        try {
            if (object.type === COMMAND || object.type === IFTHENELSEEND || object.type === PROGRAM) {
                exec(state, object)
            } else if (object.type === LIST) {
                for (const item of object.element) {
                    pushStack(stack, item)
                }
            } else if (object.type === VAR) {
                if (state.root[object.name] === undefined) {
                    pushStack(stack, object)
                } else {
                    exec(state, state.root[object.name])
                }
            }
        } catch (e) {
            setError(state, e.message, false)
        }
    }),
    'vars': (state) => {
        const vars = Object.keys(state.root)
        const list = createList(vars.map((var_name) => createVar(var_name)))
        pushStack(state.stack, list)
    },
    'clear': (state) => clearStack(state.stack),
    '->list': (state) => requireNsOperation(state, (stack, objects) => pushStack(stack, createList(objects))),
    'list->': (state) => require1OperationType(state, LIST, (stack, object) => pushStackObjects(stack, object.element)),
    'pi': (state) => pushStack(state.stack, createNumber(Math.PI)),
    'e': (state) => pushStack(state.stack, createNumber(Math.E)),
}
