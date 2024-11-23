import AdminBtn from "./adminBtn";

function Header({ }){
    return (
        <>
            <nav className="navbar navbar-expand-lg">
                <div className="nav-section end">
                    <AdminBtn />
                </div>
            </nav>
        </>
    );
}

export default Header;