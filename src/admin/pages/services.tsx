import { useContext, useEffect, useState } from "react";
import { gql, useLazyQuery, useMutation } from '@apollo/client';
import { toast } from 'react-toastify';
import * as _ from 'lodash';

import userContext from "../../context/user.context";
import { AdminTableColType, Service, UserContextType } from "../../datatypes";
import { handleGQLError } from "../../utils";

import AdminTable from "../components/adminTable";

const MAX_NEW_ROWS = 1;

const tableSetup: AdminTableColType[] = [
    { title: "Image", key:"image", type: "image", default: "", required: false },
    { title: "Title", key:"title", type: "text", default: "", required: true },

    { 
        title: "Type", key:"type", type: "select", default: "", 
        options:["","massage","group","workshop","healing"], required: false 
    },
    { title: "Time", key:"time", type: "number", default: 0, required: true },
    { title: "Price", key:"price", type: "number", default: 0, required: true },
    { title: "Booking Site", key:"bookingSite", type: "select", default: "", 
        options:["","massagebook","heallist"], required: false  
    },
    { title: "Description", key:"description", type: "richText", default: "", required: true }
];

const GET_SERVICES_QUERY = gql`
query getServices($type: String, $page:Int, $pageSize: Int){
	services(type: $type, page:$page, pageSize:$pageSize){
      _id
      title
      type
      time
      price
      bookingSite
      image
      description
    }
}`,
UPSERT_SERVICE = gql`
mutation upsertService($title:String!, $type:String, $_id:String, $time:Int, $price:Int, $bookingSite:String, $image:String, $description:String){
	upsertService(title: $title, type: $type, _id: $_id, time: $time, price: $price, bookingSite: $bookingSite, image: $image, description: $description)
}`,
REMOVE_SERVICE = gql`
mutation removeService($_id:String!){
	removeService(_id: $_id)
} `;

function ServicesEditor(){
    const [services, setServices] = useState<Service[]>([]);
    const { user } = useContext(userContext.UserContext) as UserContextType;

    // GQL Queries
    const authHeader = {context: { headers: { "Authorization": user?._id }}};
    const [retrieveServices,{ loading: services_loading, data: services_data }] = useLazyQuery(GET_SERVICES_QUERY, {fetchPolicy: 'no-cache', ...authHeader, onError: handleGQLError});

    // Mutations
    const [upsertService,{ loading: upsert_service_loading }] = useMutation(UPSERT_SERVICE, {fetchPolicy: 'no-cache', ...authHeader, onError: handleGQLError });
    const [removeService,{ loading: remove_service_loading }] = useMutation(REMOVE_SERVICE, {fetchPolicy: 'no-cache', ...authHeader, onError: handleGQLError });

    const addServiceRow = () => {
        try {
            let newRow = services?.filter((p) => { return !p._id; });
            if(newRow && newRow?.length >= MAX_NEW_ROWS){
                toast.warning(`You have ${MAX_NEW_ROWS} pending new services, please save the pending service before adding any more.`, { position: "top-right",
                    autoClose: 5000, hideProgressBar: false, closeOnClick: true, pauseOnHover: true,
                    draggable: true, progress: undefined, theme: "light" });
            }
            else {
                setServices((d: any)=>{
                    let tmp = _.cloneDeep(d);
                    tmp.unshift({ image: null, title:"", type:"", time:0, price:0, bookingSite:"", description:"" });

                    return tmp;
                });
            }
        }
        catch(ex){
            console.log(`Adding Service Row: ${ex}`);
        }
    }

    const saveKeyRow = (row: any) => {
        try { 
            if(!row?.title){
                toast.warning(`Please make sure the service has a title`, { position: "top-right",
                    autoClose: 5000, hideProgressBar: false, closeOnClick: true, pauseOnHover: true,
                    draggable: true, progress: undefined, theme: "light" });
            }
            else {
                upsertService({ variables: { 
                    ...(row?._id ?  {_id: row._id} : {}),
                    title: row.title, type: row.type,
                    time: Number(row.time), price: Number(row.price),
                    bookingSite: row.bookingSite, image: row.image,
                    description: row.description
                }});
            }       
        }
        catch(ex){
            console.log(`Saving Row: ${ex}`);
        }
    }

    const deleteKeyRow = (_id: string | undefined, newIdx: number) => {
        try {
            if(_id) {
                removeService({ variables: { _id: _id }})
            }
            else if(newIdx >= 0){
                setServices((d: any)=>{
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

    useEffect(()=>{
        if(!remove_service_loading && !upsert_service_loading) {
            retrieveServices({ variables: { type: '' }});
        }
    },[upsert_service_loading, remove_service_loading]);

    useEffect(()=>{
        if(services_data?.services){
            setServices(services_data.services);
        }
    },[services_data]);

    return(
        <div className="admin-component service-editor">
            {/* CMS Info */}
            {services_loading ?
                <div><l-spiral size="150" speed="0.9" color="rgba(0,41,95,1)"></l-spiral></div> :
                <>
                    <div className="page-title-container">
                        <div className="title-btn-container">
                            <div className="add-key-btn" onClick={addServiceRow}>
                                <span className="material-symbols-outlined">library_add</span>
                                <span>Add Service</span>
                            </div>
                        </div>
                    </div>

                    <AdminTable data={services} cols={tableSetup} loading={services_loading} saveRow={saveKeyRow} deleteRow={deleteKeyRow} />
                </>
            }
        </div>
    );
}

export default ServicesEditor;