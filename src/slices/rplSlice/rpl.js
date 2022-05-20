import { createCommand, createKeyword, createList, createNumber, createVar, dupObject } from "./objects"
import { COMMAND, LIST, NUMBER, VAR } from "./objectTypes"
import Lexer from 'lex'
import exportOnWindow from "../../tools/exportOnWindow"


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
    'roll': (state) => requireNsOperation(state, (stack, objects) => {
        pushStackObjects(stack, objects.slice(1))
        pushStack(stack, objects[0])
    }),
    'rolld': (state) => requireNsOperation(state, (stack, objects) => {
        pushStack(stack, objects[objects.length - 1])
        pushStackObjects(stack, objects.slice(0, objects.length - 1))
    }),
    'sto': (state) => require2OperationTypes(state, [null, VAR], (stack, object1, object2) => state.root[object2.name] = object1),
    'clear': (state) => clearStack(state.stack),
    '->list': (state) => requireNsOperation(state, (stack, objects) => pushStack(stack, createList(objects))),
    'list->': (state) => require1OperationType(state, LIST, (stack, object) => pushStackObjects(stack, object.element))
}

export const keywords = {
    '<<': true,
    '>>': true,
    '->': true,
    'if': true,
    'then': true,
    'else': true,
    'end': true,
}



const parseLexem = (state, input) => {
    const asFloat = Number.parseFloat(input)
    if (!isNaN(asFloat)) {
        return createNumber(asFloat)
    }
    if (commands[input]) {
        return createCommand(input, commands[input])
    }
    if (keywords[input]) {
        return createKeyword(input, keywords[input])
    }
    if (state.root[input]) {
        return state.root[input]
    }
    if (input.startsWith("'") && input.endsWith("'")) {
        const name = input.slice(1, input.length - 1)
        return createVar(name)
    }
    return createVar(input)
}

export const findLexem_basic = function* (input) {
    for (const inputPart of input.split(' ')) {
        if (inputPart.length > 0) {
            yield inputPart
        }
    }
}

const createLexer = () => {
    let row = 1;
    let col = 1;

    const lexer = new Lexer(function (char) {
        throw new Error("Unexpected character at row " + row + ", col " + col + ": " + char);
    });

    lexer.addRule(/\n/, function () {
        row++;
        col = 1;
    }, []);

    lexer.addRule(/(-?[0-9]+(?:\.[0-9]+)?)/, function (lexeme) {
        col += lexeme.length;
        this.yytext = lexeme
        return "NUMBER"
    }, []);

    lexer.addRule(/([a-zA-Z_][a-zA-Z0-9_]*)/, function (lexeme) {
        col += lexeme.length;
        this.yytext = lexeme
        return "SYMBOL"
    }, []);

    lexer.addRule(/('[a-zA-Z_][a-zA-Z0-9_]*')/, function (lexeme) {
        col += lexeme.length;
        this.yytext = lexeme
        return "VARIABLE"
    }, []);

    lexer.addRule(/("[^"]+")/, function (lexeme) {
        col += lexeme.length;
        this.yytext = lexeme
        return "STRING"
    }, []);

    lexer.addRule(/([-*+/])/, function (lexeme) {
        col += lexeme.length;
        this.yytext = lexeme
        return "OPERATOR"
    }, []);

    lexer.addRule(/(<<|>>|if|then|else|end|\{|\})/, function (lexeme) {
        col += lexeme.length;
        this.yytext = lexeme
        return "KEYWORD"
    }, []);

    lexer.addRule(/ /, function () {
        col++;
    }, []);

    return lexer
}

export const findLexem_lexer = function* (input) {
    const lexer = createLexer();
    lexer.input = input;

    try {
        const lexemes = []
        let item_type = lexer.lex()
        while (item_type !== undefined) {
            lexemes.push(lexer.yytext)
            item_type = lexer.lex()
        }
        for (let lexeme of lexemes) {
            yield lexeme
        }
    } catch (e) {

    }
}

export const findLexem = findLexem_lexer

export const parseInput = function* (state, input) {
    for (const inputPart of findLexem(input)) {
        yield parseLexem(state, inputPart)
    }
}

export const addInput = (state, input) => {
    const { stack } = state
    cleanErrorState(state)

    for (const item of parseInput(state, input)) {
        if (item.type === COMMAND) {
            item.element(state)
        } else {
            pushStack(stack, item)
        }
    }
    if (!state.keepInput) {
        state.input = ''
    }

}

exportOnWindow({ Lexer })
