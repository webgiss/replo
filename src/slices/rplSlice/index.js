import { createModule } from 'saga-slice';
import { addInput } from './rpl';

const rplSlice = createModule({
    name: 'rpl',

    initialState: {
        stack: [],
        input: '',
        error: null,
        keepInput: false,
        root: {},
        rootLoaded: false,
    },

    reducers: {
        addInput: (state, { input }) => {
            addInput(state, input)
        },
        updateInput: (state, { input }) => {
            state.input = input
        },
        rootLoad: (state, { keys }) => {
            for (const key of keys) {
                state.root[key.name] = key.value
            }
            state.rootLoaded = true
        },
    },
});

const localStoragePrefix = 'dirroot-'

rplSlice.stateHooks = [
    {
        name: 'store dir values in localStorage',
        tester: (state) => state.root,
        action: (state) => {
            const keyGen = (name) => `${localStoragePrefix}${name}`

            Object.keys(state.root).forEach((name) => {
                const key = keyGen(name)
                const value = JSON.stringify(state.root[name])
                if (localStorage.getItem(key) !== value) {
                    localStorage.setItem(key, value)
                }
            })
        },
    },
    {
        name: 'Load dir values from localStorage',
        tester: (state) => state.rootLoaded,
        action: (state, dispatch) => {
            const keyTest = (key) => key.startsWith(localStoragePrefix)
            const keyExtract = (key) => key.slice(localStoragePrefix.length, key.length)
            const keys = []
            if (state.rootLoaded) {
                for (const key of Object.keys(localStorage)) {
                    if (keyTest(key)) {
                        const name = keyExtract(key)
                        const value = JSON.parse(localStorage.getItem(key))
                        keys.push({ name, value })
                    }
                }
            }

            dispatch(rplSlice.actions.rootLoad({ keys }))
        },
    },


];

export const actions = rplSlice.actions;
export default rplSlice;
