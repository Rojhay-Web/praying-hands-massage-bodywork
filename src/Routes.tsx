import "./styles/app.less";

import { useContext } from "react";
import { Routes, Route } from "react-router-dom";

/* Types */
import { AdminPathType, UserContextType } from "./datatypes";

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
    const { user, activeComponents } = useContext(userContext.UserContext) as UserContextType;

    return(
        <Routes>
            <Route path="/" element={<Layout />}>
                <Route index element={<Home />} />
                {paths.map((rt, i) => 
                    <Route path={rt.path} element={<rt.element />}  key={i} /> 
                )}
            </Route>

            <Route path="/allaccess" element={(user?.isAdmin ? <AdminLayout /> : <Layout />)}>
                <Route index element={(user?.isAdmin ? <AdminHome /> : <NoMatch />)} />
                {activeComponents?.map((art: AdminPathType, i:number) =>
                    <Route path={art.path} element={(user?.isAdmin ? <art.element />: <NoMatch />)} key={i} />
                )}
                <Route path="*" element={<NoMatch />} />
            </Route>
        </Routes>
    )
}

export default SiteRoutes;