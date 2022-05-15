import { rootSaga, rootReducer } from 'saga-slice';
import { connectRouter } from 'connected-react-router'

import rplSlice from './rplSlice';
import exportOnWindow from '../tools/exportOnWindow';

export const modules = [
    rplSlice
];

export const createRootReducer = (history) => rootReducer(
    modules,
    {
        debug: (state, action) => {
            const { type } = action
            console.log('action', type, action)
            return "debug"
        },
        router: connectRouter(history),
    }
)

export const saga = rootSaga(modules)

const createStateHooks = (modules, globalStateHooks = []) => [
    ...modules
        .filter((module) => module.stateHooks !== undefined)
        .map((module) => [...module.stateHooks].map((stateHookItem) => ({ ...stateHookItem, moduleName: module.name })))
        .flat(),
    ...globalStateHooks
]

const sliceModules = Object.fromEntries(modules.map((module) => [module.name, module]))

exportOnWindow({ sliceModules })

export const stateHooks = createStateHooks(modules)
