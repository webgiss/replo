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
    },

    reducers: {
        addInput: (state, { input }) => {
            addInput(state, input)
        },
        updateInput: (state, { input }) => {
            state.input = input
        },
    },
});

export const actions = rplSlice.actions;
export default rplSlice;
