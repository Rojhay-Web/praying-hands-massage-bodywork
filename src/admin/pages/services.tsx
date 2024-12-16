import { useContext, useEffect, useRef, useState } from "react";
import { gql, useLazyQuery, useMutation } from '@apollo/client';

import userContext from "../../context/user.context";
import { AdminTableColType, Service, UserContextType } from "../../datatypes";
import { handleGQLError } from "../../utils";

import AdminTable from "../components/adminTable";

const tableSetup: AdminTableColType[] = [
    { title: "Image", key:"image", type: "image", default: "", required: false },
    { title: "Title", key:"title", type: "text", default: "", required: true },

    { 
        title: "Type", key:"type", type: "select", default: "", 
        options:["","massage","group","workshop","healing"], required: false 
    },
    { title: "Time", key:"time", type: "number", default: "", required: true },
    { title: "Price", key:"price", type: "number", default: "", required: true },
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
}`;

function ServicesEditor(){
    const [services, setServices] = useState<Service[]>([]);
    const { user } = useContext(userContext.UserContext) as UserContextType;

    // GQL Queries
    const authHeader = {context: { headers: { "Authorization": user?._id }}};
    const [retrieveServices,{ loading: services_loading, data: services_data }] = useLazyQuery(GET_SERVICES_QUERY, {fetchPolicy: 'no-cache', ...authHeader, onError: handleGQLError});

    const addServiceRow = () => {

    }

    const saveKeyRow = (row: any) => {
        try {
           
        }
        catch(ex){
            console.log(`Saving Row: ${ex}`);
        }
    }

    const deleteKeyRow = (_id: string | undefined, newIdx: number) => {
        try {
            
        }
        catch(ex){
            console.log(`Deleting Row: ${ex}`);
        }
    }

    useEffect(()=>{
        retrieveServices({ variables: { type: '' }});
    },[]);

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