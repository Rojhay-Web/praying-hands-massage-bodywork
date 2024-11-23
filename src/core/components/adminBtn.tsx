import { useContext } from "react";
import { useGoogleLogin } from '@react-oauth/google';
import { toast } from 'react-toastify';

import userContext from "../../context/user.context";
import { UserContextType } from "../../datatypes";


function AdminBtn(){
    const { user, setUserToken } = useContext(userContext.UserContext) as UserContextType;

    const gLogin = useGoogleLogin({
        onSuccess: (tokenResponse) => { setUserToken(tokenResponse); },
        onError:(error) => { 
            console.log(`Google Login: ${error}`);
            toast.error("Sorry, We were unable to login with google [Please Contact Site Admin]", { position: "top-right",
                autoClose: 5000, hideProgressBar: false, closeOnClick: true, pauseOnHover: true,
                draggable: true, progress: undefined, theme: "light" });    
        }
    });

    const btnAction = () => {
        try {
            if(!user) {
                gLogin();
            }
            else {
                // Open Logged in Modal
            }
        }
        catch(ex){
            console.log(`Admin Button Action: ${ex}`);
        }
    }

    return (
        <>
            <div className={`admin-btn-container ${!user ? 'non-user':''}`} onClick={btnAction}>
                {!user ?
                    <span className="material-symbols-outlined">account_circle</span>:
                    <>
                        {user?.isAdmin ? 
                            <span className="material-symbols-outlined">apps</span> :
                            <>  
                                {user?.picture ?
                                    <img src={user.picture} alt="User Profile" /> :
                                    <span className="material-symbols-outlined">person</span>
                                }
                            </>
                        }
                    </>
                }
            </div> 
        </>
    );
}

export default AdminBtn;