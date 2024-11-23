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

/* Pages */
import NoMatch from "./core/pages/nomatch";
import AdminHome from "./admin/pages/adminHome";

const paths = [
    { path: "*", element: NoMatch }
];

function SiteRoutes(){
    const { user } = useContext(userContext.UserContext) as UserContextType;

    return(
        <Routes>
            {user?.isAdmin ?
                <Route path="/allAccess" element={<AdminLayout />}>
                    <Route index element={<AdminHome />} />
                </Route> : <></>
            }

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