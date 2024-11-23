import React from "react";
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from "react-router-dom";
import { GoogleOAuthProvider } from '@react-oauth/google';

import App from "./App";
import "./styles/app.less";

const GCID = "1032314402946-fi5o7qll5qej4u6r5onch4fejkaskiq4.apps.googleusercontent.com";

const appRoot = ReactDOM.createRoot(
    document.getElementById('root') as HTMLElement
);

appRoot.render(
    <GoogleOAuthProvider clientId={GCID}>
        <React.StrictMode>
            <BrowserRouter>
                <App />
            </BrowserRouter>
        </React.StrictMode>
    </GoogleOAuthProvider>
);