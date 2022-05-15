import { createHashHistory } from 'history'
import { configureStore } from '@reduxjs/toolkit'
import { saga, createRootReducer, stateHooks } from '../slices'
import { routerMiddleware } from 'connected-react-router'
import createSagaMiddleware from 'redux-saga';
import exportOnWindow from '../tools/exportOnWindow';

const history = createHashHistory();
const sagaMiddleware = createSagaMiddleware();

const store = configureStore({
    reducer: createRootReducer(history),
    middleware: (getDefaultMiddleware) => getDefaultMiddleware().concat(routerMiddleware(history)).concat(sagaMiddleware),
})

const registerStateHooks = (store) => {
    const stateHookLastValues = {}

    const onStateHook = () => {
        const state = store.getState()
        const globalState = state
        exportOnWindow({ state })
        stateHooks.forEach(async (stateHook, index) => {
            const { name, moduleName, tester, action, onFail } = stateHook
            const state = moduleName ? globalState[moduleName] : globalState
            const lastValue = stateHookLastValues[index]

            let shouldRun = true
            if (tester) {
                const value = tester(state)
                if (value === lastValue) {
                    shouldRun = false
                } else {
                    stateHookLastValues[index] = value
                }
            }
            if (shouldRun) {
                if (name) {
                    console.log(`stateHook: [${name}][${moduleName}]`)
                }

                try {
                    const dispatch = (action) => store.dispatch(action)
                    await action(state, dispatch)
                } catch (e) {
                    if (onFail) {
                        await onFail(e)
                    }
                }
            }
        })
    }

    store.subscribe(onStateHook)
    onStateHook()

    exportOnWindow({ store, stateHookLastValues })
}

registerStateHooks(store)

sagaMiddleware.run(saga)

export default store;