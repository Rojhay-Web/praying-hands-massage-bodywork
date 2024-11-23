import { Outlet } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

function AdminLayout(){
    return (
        <div className='app-body'>
            <ToastContainer />
            
            <Outlet />
        </div>
    );
}

export default AdminLayout;