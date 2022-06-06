import exportOnWindow from "../../tools/exportOnWindow"
import parser from './rplSyntax'
import { cleanErrorState, exec, setError } from "./commands"

export const parseInput = function* (state, input) {
    try {
        for (const item of parser.parse(input)) {
            yield item
        }
    } catch (e) {
        setError(state, e.message, true)
    }
}

export const addInput = (state, input) => {
    cleanErrorState(state)

    for (const item of parseInput(state, input)) {
        exec(state, item, {as_input: true})
    }
    if (!state.keepInput) {
        state.input = ''
    }

}

exportOnWindow({ parser })
