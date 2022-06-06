import { requireStack } from './commands'
import { createNumber } from './objects'
import { parse } from './rplSyntax'
// import { findLexem, requireStack } from './rpl'

const basicState = {
    stack: [],
    input: '',
    error: null,
}

const copyState = (state) => ({ ...state, stack: [...state.stack] })

describe('requireStack', () => {
    it('should fail with an empty stack and non zero arg', () => {
        const state = copyState(basicState)

        const actual = requireStack(state, 1)

        expect(actual).toBe(false)
        expect(state.error).toBe('Too few arguments')
    })

    it('should not fail with a stack with 1 element and 1 arg', () => {
        const state = copyState({ ...basicState, stack: [createNumber(4)] })

        const actual = requireStack(state, 1)

        expect(actual).toBe(true)
        expect(state.error).toBeNull()
    })

    it('should fail with a stack with 1 element and 2 arg', () => {
        const state = copyState({ ...basicState, stack: [createNumber(4)] })

        const actual = requireStack(state, 2)

        expect(actual).toBe(false)
        expect(state.error).toBe('Too few arguments')
    })
})

describe('parse', () => {
    const findLexemTest = (text, input, expected) => it(text, () => {
        const actual = [...parse(input)]

        expect(actual).toStrictEqual(expected)
    })
    findLexemTest('should not return elements for an empty string', '', [])
    findLexemTest('should split on spaces for basical examples', '7 3 +', [
        { type: 'NUMBER', element: 7, repr: '7' }, 
        { type: 'NUMBER', element: 3, repr: '3' }, 
        { type: 'COMMAND', name: '+', repr: '+', element: '+' }
    ])

    findLexemTest('should split between a number and an operation', '7 3+', [
        { type: 'NUMBER', element: 7, repr: '7' }, 
        { type: 'NUMBER', element: 3, repr: '3' }, 
        { type: 'COMMAND', name: '+', repr: '+', element: '+' }
    ])
    findLexemTest('should split on spaces inside strings', '1 2 "poide 3" 4', [
        { type: 'NUMBER', element: 1, repr: '1' }, 
        { type: 'NUMBER', element: 2, repr: '2' }, 
        { type: 'STRING', element: "poide 3", repr: '"poide 3"' }, 
        { type: 'NUMBER', element: 4, repr: '4' }, 
    ])
})
