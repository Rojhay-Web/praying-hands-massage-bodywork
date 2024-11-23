import "./styles/app.less";
import { Routes, Route } from "react-router-dom";

/* Layouts */
import Layout from "./components/layout";

/* Pages */
import NoMatch from "./pages/nomatch";

const paths = [
    { path: "*", element: NoMatch }
];

function SiteRoutes(){
    return(
        <Routes>
            <Route path="/" element={<Layout />}>
                <Route index element={<>{/*HOME*/}</>} />
                {paths.map((rt, i) => 
                    <Route path={rt.path} element={<rt.element />}  key={i} /> 
                )}
            </Route>
        </Routes>
    )
}

export default SiteRoutes;