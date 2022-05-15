import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import store from '../store'
import { Provider } from 'react-redux';

const init = (element, store, App) => {
    const root = ReactDOM.createRoot(element);
    root.render(
        <Provider store={store}>
            <React.StrictMode>
                <App />
            </React.StrictMode>
        </Provider>
    );
}

const initView = () => {
    const element = document.getElementById('root');
    init(element, store, App)
}

export default initView;