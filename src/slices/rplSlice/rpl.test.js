import { createNumber } from './objects'
import { findLexem, requireStack } from './rpl'

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

describe('findLexem', () => {
    const findLexemTest = (text, input, expected) => it(text, () => {
        const actual = [...findLexem(input)]

        expect(actual).toStrictEqual(expected)
    })
    findLexemTest('should not return elements for an empty string', '', [])
    findLexemTest('should split on spaces for basical examples', '7 3 +', ['7', '3', '+'])

    // Old implementation
    // findLexemTest('should split between a number and an operation (failure)', '7 3+', ['7','3+'])
    // findLexemTest('should split on spaces inside strings', '1 2 "poide 3" 4', ['1','2', '"poide', '3"', '4'])

    // Goal implementation
    findLexemTest('should split between a number and an operation', '7 3+', ['7', '3', '+'])
    findLexemTest('should split on spaces inside strings', '1 2 "poide 3" 4', ['1', '2', '"poide 3"', '4'])
})
