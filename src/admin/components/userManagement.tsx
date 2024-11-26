import { useContext, useEffect, useState } from "react";
import { gql, useLazyQuery, useMutation } from '@apollo/client';
import { toast } from 'react-toastify';
import * as _ from 'lodash';

import AdminTable from "./adminTable";
import { AdminTableColType, User, UserContextType } from "../../datatypes";
import userContext from "../../context/user.context";

const MAX_NEW_USERS = 1;
const tableSetup: AdminTableColType[] = [
    { title: "Email", key:"email", type: "text", default: "", required: true },
    { title: "Admin", key:"isAdmin", type: "toggle", default: false, required: false },
    { title: "Scopes", key:"scopes", type: "scope_toggles", default: {}, required: false }
];

/* */
const GET_USER_QUERY = gql`
    query getUsers{
        users{
            _id
            email
            isAdmin
            scopes
        }
    }`,
ADD_USER_MUTATION = gql`
    mutation addUser($email: String!, $isAdmin: Boolean, $scopes: JSONObj){
        addUserPermissions(email: $email, isAdmin: $isAdmin, scopes: $scopes)
    }`,
UPDATE_USER_MUTATION = gql`
    mutation updateUser($_id: String!, $email: String, $isAdmin: Boolean, $scopes: JSONObj){
        updateUserPermissions(_id: $_id, email: $email, isAdmin: $isAdmin, scopes: $scopes)
    }`,
REMOVE_USER_MUTATION = gql`
    mutation removeUser($_id: String!){
        removeUserPermissions(_id: $_id)
    }`;

function UserManagement(){
    const [query, setQuery] = useState("");
    const [display, setDisplay] = useState<any[]>([]);
    const [newUsers, setNewUsers] = useState<any>([]);

    const { user } = useContext(userContext.UserContext) as UserContextType;

    const handleGQLError = (err:any) => {
        try {
            toast.error(`Sorry we encountered an error. [${err}]`, { position: "top-right",
                autoClose: 5000, hideProgressBar: false, closeOnClick: true, pauseOnHover: true,
                draggable: true, progress: undefined, theme: "light" });
        }
        catch(ex){
            console.log(`Handling Error: ${ex}`);
        }
    }

    // GQL Queries
    const [retrieveUsers,{ loading: users_loading, data: users_data }] = useLazyQuery(GET_USER_QUERY, {fetchPolicy: 'no-cache'});
    
    // Mutations
    const authHeader = {context: { headers: { "Authorization": user?._id }}};
    const [addUser,{ loading: add_loading, error: add_error, data: add_data }] = useMutation(ADD_USER_MUTATION, {fetchPolicy: 'no-cache', ...authHeader, onError: handleGQLError });
    const [updateUser,{ loading: update_loading, error: update_error, data: update_data }] = useMutation(UPDATE_USER_MUTATION, {fetchPolicy: 'no-cache', ...authHeader, onError: handleGQLError});
    const [removeUser,{ loading: remove_loading, error: remove_error, data: remove_data }] = useMutation(REMOVE_USER_MUTATION, {fetchPolicy: 'no-cache', ...authHeader, onError: handleGQLError});

    const searchQuery = (e:any) => {
        try {
            setQuery(e.target.value);
        }
        catch(ex){
            console.log(`Searching: ${ex}`);
        }
    }

    const addRow = () => {
        try {
            if(newUsers?.length >= MAX_NEW_USERS){
                toast.warning(`You have ${MAX_NEW_USERS} pending new users, please save the pending users before adding any more.`, { position: "top-right",
                    autoClose: 5000, hideProgressBar: false, closeOnClick: true, pauseOnHover: true,
                    draggable: true, progress: undefined, theme: "light" });
            }
            else {
                let tmpNew: { [key:string]:any } = {};

                tableSetup.forEach((s)=> {
                    tmpNew[s.key] = s.default;
                });

                setNewUsers((d:any)=>{
                    return [tmpNew, ...d];
                });
            }
        }
        catch(ex){
            console.log(`Adding Row: ${ex}`);
        }
    }

    const deleteRow = (_id: string | undefined, newIdx: number) => {
        try {
            if(_id) {
                if(!user?._id || user._id === _id){
                    toast.error(`Sorry It looks like you are unable to update this row.`, { position: "top-right",
                        autoClose: 5000, hideProgressBar: false, closeOnClick: true, pauseOnHover: true,
                        draggable: true, progress: undefined, theme: "light" });
                }
                else {
                    removeUser({ variables: { _id: _id }});
                }
            }
            else if(newIdx >= 0){
                setNewUsers((d:any)=> {
                    let tmp = _.cloneDeep(d);
                    tmp.splice(newIdx,1);
                    return tmp;
                });
            }
        }
        catch(ex){
            console.log(`Deleting Row: ${ex}`);
        }
    }

    const saveRow = (row: any) => {
        try {
            if(!user?._id || user._id === row?._id){
                toast.error(`Sorry It looks like you are unable to update this row.`, { position: "top-right",
                    autoClose: 5000, hideProgressBar: false, closeOnClick: true, pauseOnHover: true,
                    draggable: true, progress: undefined, theme: "light" });
            }
            else {
                let isValid = true;
                tableSetup.forEach((s)=> {
                    if(s.required && _.isEmpty(row[s.key])){
                        isValid = false;
                    }
                });

                if(!isValid) {
                    toast.error(`Unable to Save Row: Please make sure you don't leave any fields empty.`, { position: "top-right",
                        autoClose: 5000, hideProgressBar: false, closeOnClick: true, pauseOnHover: true,
                        draggable: true, progress: undefined, theme: "light" });
                }
                else if(!row?._id){
                    addUser({ variables: { 
                        email: row.email, isAdmin: row.isAdmin, scopes: row.scopes
                    }});
                }
                else {
                    updateUser({ variables: { 
                        _id: row._id, email: row.email, 
                        isAdmin: row.isAdmin, scopes: row.scopes
                    }});
                }
            }
        }
        catch(ex){
            console.log(`Saving Row: ${ex}`);
        }
    }

    useEffect(()=>{
        if(users_data?.users?.length > 0 || newUsers?.length > 0){
            let d = (users_data?.users?.length > 0 ?
                users_data?.users.filter((u:User)=> {
                    return u.email.toLowerCase().indexOf(query.toLowerCase()) >= 0;
                }) : []);

            let displayList = newUsers.concat(d);

            setDisplay(displayList);
        }
    },[query, newUsers, users_data]);

    // Show Sucess Messages
    useEffect(()=>{ 
        if(!add_loading && add_data?.addUserPermissions){
            setNewUsers([]);
            toast.success(`Added New User.`, { position: "top-right",
                autoClose: 5000, hideProgressBar: false, closeOnClick: true, pauseOnHover: true,
                draggable: true, progress: undefined, theme: "light" });
        }
    },[add_data]);

    useEffect(()=>{ 
        if(!update_loading && update_data?.updateUserPermissions){
            toast.success(`Updating User.`, { position: "top-right",
                autoClose: 5000, hideProgressBar: false, closeOnClick: true, pauseOnHover: true,
                draggable: true, progress: undefined, theme: "light" });
        }
    },[update_data]);

    useEffect(()=>{ 
        if(!remove_loading && remove_data?.removeUserPermissions){
            toast.success(`Removing User.`, { position: "top-right",
                autoClose: 5000, hideProgressBar: false, closeOnClick: true, pauseOnHover: true,
                draggable: true, progress: undefined, theme: "light" });
        }
    },[remove_data]);

    // Refresh Users On Completion of action
    useEffect(()=>{ 
        if(!users_loading && !add_loading && !update_loading && !remove_loading){
            retrieveUsers({});
        }
    },[add_data, update_data, remove_data]);

    return(
        <div className="admin-component user-management">
            <div className="table-action-container">
                <div className="action-input-container">
                    <span className="material-symbols-outlined">search</span>
                    <input type="text" name="query" placeholder='Search Users' value={query} onChange={searchQuery} />
                </div>

                <div className='table-action-btn' onClick={addRow}>
                    <span className="material-symbols-outlined">person_add</span>
                    <span className="btn-title">Add User</span>
                </div>
            </div>

            <AdminTable data={display} cols={tableSetup} loading={users_loading} saveRow={saveRow} deleteRow={deleteRow}/>
        </div>
    );
}

export default UserManagement;