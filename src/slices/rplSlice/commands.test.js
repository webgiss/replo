import { requireStack } from './commands'
import { createNumber } from './objects'

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
