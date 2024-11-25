import "./styles/app.less";

import { useContext } from "react";
import { Routes, Route } from "react-router-dom";

/* Types */
import { UserContextType } from "./datatypes";

/* Context */
import userContext from "./context/user.context";

/* Layouts */
import Layout from "./core/components/layout";
import AdminLayout from "./admin/components/adminLayout";

/* Admin Pages */
import AdminHome from "./admin/pages/adminHome";

/* Core Pages */
import NoMatch from "./core/pages/nomatch";
import Home from "./core/pages/home";


const paths = [
    { path: "*", element: NoMatch }
];

function SiteRoutes(){
    const { user } = useContext(userContext.UserContext) as UserContextType;

    return(
        <Routes>
            <Route path="/allAccess" element={<AdminLayout />}>
                <Route index element={(user?.isAdmin ? <AdminHome /> : <Home />)} />
            </Route>

            <Route path="/" element={<Layout />}>
                <Route index element={<Home />} />
                {paths.map((rt, i) => 
                    <Route path={rt.path} element={<rt.element />}  key={i} /> 
                )}
            </Route>
        </Routes>
    )
}

export default SiteRoutes;