import React from "react";
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from "react-router-dom";
import { GoogleOAuthProvider } from '@react-oauth/google';
import ReactGA from "react-ga4";

import App from "./App";
import ScrollToTop from "./scrollToTop";
import { GA_MEASUREMENT_ID } from "./utils";

// Custom Styles
import 'leaflet/dist/leaflet.css';
import "react-datepicker/dist/react-datepicker.css";
import "./styles/app.less";

const GCID = "54510890763-1t27ss88njg5eb676b5rjiumn6o0ijc1.apps.googleusercontent.com";

ReactGA.initialize(GA_MEASUREMENT_ID);

const appRoot = ReactDOM.createRoot(
    document.getElementById('root') as HTMLElement
);

appRoot.render(
    <GoogleOAuthProvider clientId={GCID}>
        <React.StrictMode>
            <BrowserRouter>
                <ScrollToTop />
                <App />
            </BrowserRouter>
        </React.StrictMode>
    </GoogleOAuthProvider>
);

