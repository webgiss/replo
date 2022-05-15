import { createCommand, createList, createNumber, createVar, dupObject } from "./objects"
import { COMMAND, LIST, NUMBER } from "./objectTypes"

export const requireStack = (state, n) => {
    if (state.stack.length < n) {
        state.error = 'Too few arguments'
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
        if (state.stack[length - n + index].type !== types[index]) {
            state.error = `Bad argument type; element [${n - index}] should of type <${types[index]}>`
            return false
        }
    }
    return true
}

export const cleanErrorState = (state) => {
    if (state.error !== null) {
        state.error = null
    }
}

export const pushStack = (stack, element) => stack.push(element)

export const popStack = (stack) => stack.pop()

export const popNStack = (stack, n) => stack.splice(stack.length - n, n)

export const peekStack = (stack, n) => stack[stack.length - n]

export const peekNStack = (stack, n) => stack.slice(stack.length - n, stack.length)

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

const requireNsOperation = (state, code) => requireNsOperationKeep(state, (stack, n) => {
    const objects = popNStack(stack, n)
    code(stack, objects)
})

const unaryNumberOperation = (state, unaryFunc) => {
    require1OperationType(state, NUMBER, (stack, object) => {
        const { element: v } = object
        pushStack(stack, createNumber(unaryFunc(v)))
    })
}

const binaryNumberOperation = (state, binaryFunc) => {
    require2OperationTypes(state, [NUMBER, NUMBER], (stack, object1, object2) => {
        const { element: v1 } = object1
        const { element: v2 } = object2
        pushStack(stack, createNumber(binaryFunc(v1, v2)))
    })
}

const commands = {
    '+': (state) => binaryNumberOperation(state, (v1, v2) => v1 + v2),
    '-': (state) => binaryNumberOperation(state, (v1, v2) => v1 - v2),
    '*': (state) => binaryNumberOperation(state, (v1, v2) => v1 * v2),
    '/': (state) => binaryNumberOperation(state, (v1, v2) => v1 / v2),
    'drop': (state) => require1Operation(state, () => { }),
    'dup': (state) => require1OperationKeep(state, (stack, object1) => pushStack(stack, dupObject(object1))),
    'dup2': (state) => require2OperationKeep(state, (stack, object1, object2) => {
        const object1dup = dupObject(object1)
        const object2dup = dupObject(object2)
        pushStack(stack, object1dup)
        pushStack(stack, object2dup)
    }),
    'dupn': (state) => requireNsOperationKeep(state, (stack, n) => {
        const objects = peekNStack(stack, n)
        console.log({objects, n})
        for (const object of objects) {
            pushStack(stack, dupObject(object))
        }
    }),
    'swap': (state) => require2Operation(state, (stack, object1, object2) => {
        pushStack(stack, object2)
        pushStack(stack, object1)
    }),
    'pick': (state) => {
        cleanErrorState(state)
        if (requireStackTypes(state, 1, [NUMBER])) {
            const { stack } = state

            const objectN = peekStack(stack, 1)
            if (requireStack(state, objectN.element + 1)) {
                popStack(stack)
                const object = dupObject(peekStack(stack, objectN.element))
                pushStack(stack, object)
            }
        }
    },
    'ip': (state) => unaryNumberOperation(state, (v) => Math.floor(v)),
    'roll': (state) => requireNsOperation(state, (stack, objects) => {
        for (const object of objects.slice(1)) {
            pushStack(stack, object)
        }
        pushStack(stack, objects[0])
    }),
    'rolld': (state) => requireNsOperation(state, (stack, objects) => {
        pushStack(stack, objects[objects.length - 1])
        for (const object of objects.slice(0, objects.length - 1)) {
            pushStack(stack, object)
        }
    }),
    '->list': (state) => requireNsOperation(state, (stack, objects) => pushStack(stack, createList(objects))),
    'list->': (state) => require1OperationType(state, LIST, (stack, object) => {
        const objects = object.element
        for (const newObject of objects) {
            pushStack(stack, newObject)
        }
    })
}

const parseLexem = (input) => {
    const asFloat = Number.parseFloat(input)
    if (!isNaN(asFloat)) {
        return createNumber(asFloat)
    }
    if (commands[input]) {
        return createCommand(input, commands[input])
    }
    return createVar(input)
}

export const findLexem = function*(input) {
    for (const inputPart of input.split(' ')) {
        if (inputPart.length > 0) {
            yield inputPart
        }
    }
}

export const parseInput = function* (input) {
    for (const inputPart of findLexem(input)) {
        yield parseLexem(inputPart)
    }
}

export const addInput = (state, input) => {
    const { stack } = state
    cleanErrorState(state)

    for (const item of parseInput(input)) {
        if (item.type === COMMAND) {
            item.element(state)
        } else {
            pushStack(stack, item)
        }
    }
    state.input = ''
}
