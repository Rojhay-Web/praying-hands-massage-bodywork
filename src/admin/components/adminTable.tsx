import { useEffect, useState } from 'react';
import { spiral } from 'ldrs'
import * as _ from 'lodash';

import { AdminTableColType } from "../../datatypes";

type AdminTableType = {
    data: any[], loading: boolean | undefined,
    cols:AdminTableColType[], saveRow: (updateRow: any) => void,
    deleteRow: (_id: string | undefined, newIdx: number) => void
};

type AdminRowType = { 
    row: any, cols: AdminTableColType[], rowIdx: number,
    saveRow: (updateRow: any) => void, 
    deleteRow: (_id: string | undefined, newIdx: number) => void
};

type ScopeCellType = { 
    scopeMap: { [key: string]: boolean },
    updateCellKey: (key: string, value:boolean) => void
};

type SelectMetaDataType = {
    dictionary?: {[key:string]:any }, 
    metaMap: { [key: string]: any },
    selectVal?: string,
    updateCellKey: (key: string, value:boolean) => void
};

const scopesList = [
    { title: "Users", key:"users" },
    { title: "Gallery", key:"gallery" },
    { title: "Site Editor", key:"site_content" }
];

function ScopeCell({ scopeMap, updateCellKey }: ScopeCellType){
    const isActive = (key:string) => {
        return (scopeMap && scopeMap[key] === true);
    }

    return(
        <div className="scope-container">
            {scopesList.map((sc, i)=>
                <div className={`scope-pill ${isActive(sc.key) ? 'active' :''}`} onClick={()=>{ updateCellKey(sc.key, !isActive(sc.key)); }} key={i}>
                    <span className="scope-pill-bullet"/>
                    <span>{sc.title}</span>
                </div>
            )}
        </div>
    )
}

function SelectMetaData({ dictionary, metaMap, selectVal, updateCellKey }:SelectMetaDataType){
    const [metaFields, setMetaFields] = useState<any[]>([]);

    const updateMeta = (e:any, key: string) => {
        try {
            let value = e.target.value;
            updateCellKey(key, value);
        }
        catch(ex){
            console.log(`Updating Meta Field: ${ex}`);
        }
    }

    useEffect(()=>{
        if(selectVal && dictionary && selectVal in dictionary) {
            setMetaFields(dictionary[selectVal]);
        }
        else {
            setMetaFields([]);
        }
    },[selectVal]);

    return(
        <div className='meta-select-container'>
            {metaFields.map((mf,i)=>
                <div className='meta-admin-input' key={i}>
                    <span>{mf.key}</span>
                    <input className='meta-input' type={mf.type} name={mf.key} 
                        value={metaMap[mf.key] ?? mf.default} onChange={(e)=> { updateMeta(e, mf.key); }}
                    />
                </div>
            )}
        </div>
    );
}

function AdminRow({ row, cols, rowIdx, saveRow, deleteRow }: AdminRowType){
    const [localRow, setLocalRow] = useState<any>(null);
    const [rowTag, setRowTag] = useState("");

    const updateCell = (col:AdminTableColType, cellRow:any, e:any) =>{
        try {
            setLocalRow((d:any)=> {
                let tmp = _.cloneDeep(d);

                switch(col.type){
                    case "text":
                    case "select":
                        tmp[col.key] = e.target.value;
                        break;
                    case "toggle":
                        tmp[col.key] = (cellRow[col.key] === true ? false : true);
                        break;
                    case "scope_toggles":
                    case "select_metadata":
                        let toggleKey = e.target.key,
                            toggleValue = e.target.value;
                        if(!tmp[col.key]){
                            tmp[col.key] = { [toggleKey]: toggleValue };
                        }
                        else {
                            tmp[col.key][toggleKey] = toggleValue;
                        }
                        break;
                    default:
                        break;
                }
                return tmp;
            });
        }
        catch(ex){
            console.log(`Updating Cell: ${ex}`);
        }
    }

    const cellComponent = (col:AdminTableColType, cellRow:any) => {
        try {
            switch(col.type){
                case "text":
                    return <input className='admin-input' type="text" name={col.key} placeholder={`Enter ${col.title}`} value={cellRow[col.key]} onChange={(e)=>{ updateCell(col, cellRow, e); }} />
                case "toggle":
                    return <div className={`admin-toggle ${(cellRow[col.key] ? 'active' : '')}`} onClick={()=>{
                        updateCell(col, cellRow, {});
                    }}>
                        <span className="material-symbols-outlined">check</span>
                    </div>;
                case "scope_toggles":
                    return <ScopeCell scopeMap={cellRow[col.key]} updateCellKey={(key: string, value:boolean) => { 
                        updateCell(col, cellRow, { target: { key, value }}); 
                    }} />;
                case "select":
                    return <select className='admin-select' name={col.key} value={cellRow[col.key]} onChange={(e)=>{ updateCell(col, cellRow, e); }}>
                        <option hidden>{`Enter ${col.title}`}</option>
                        {col?.options?.map((option,j)=>
                            <option key={j} value={option}>{option}</option>
                        )}
                    </select>;
                case "select_metadata":
                    return <SelectMetaData dictionary={col.dictionary} metaMap={cellRow[col.key]} 
                                selectVal={(col?.selectKey ? cellRow[col.selectKey] : "")}
                                updateCellKey={(key: string, value:boolean) => { 
                                    updateCell(col, cellRow, { target: { key, value }}); 
                                }}/>;
                default:
                    return <></>;
                    
            }
        }
        catch(ex){
            console.log(`Building Cell Component: ${ex}`);
        }
    }

    const hasChanged = () => {
        try {
            if(localRow){
                const isEq = _.isEqual(row,localRow);
                return !isEq;
            }
        }
        catch(ex){
            console.log(`Checking If Row Has Changed: ${ex}`);
        }

        return false;
    }

    const saveChanges = () => {
        try {
            if(localRow && rowTag?.length > 0){ 
                saveRow(localRow);
            }
        }
        catch(ex){
            console.log(`Saving Changes: ${ex}`);
        }
    }

    const deleteCurRow = () => {
        if(window.confirm('Are you sure you want to delete this row?')){            
            deleteRow(row?._id, rowIdx);
        }
    }

    useEffect(()=>{
        if(row){
            setLocalRow(_.cloneDeep(row));
        }
    },[row]);

    useEffect(()=>{
        if(localRow){
            if(!localRow?._id){
                setRowTag("new");
            }
            else if(hasChanged()){
                setRowTag("update");
            }
            else if(rowTag?.length > 0){
                setRowTag("");
            }
        }
    },[localRow]);

    return(
        <tr className={`admin-row ${rowTag}`}>
            {localRow ?
                <>
                    {cols.map((col,i) =>
                        <td key={i}>{cellComponent(col, localRow)}</td>
                    )}

                    <td>
                        <div className="table-btns">
                            <span className={`material-symbols-outlined ${(rowTag != "") ? "":"hide"}`} onClick={saveChanges}>save</span>
                            <span className="material-symbols-outlined remove" onClick={deleteCurRow}>remove_selection</span>
                        </div>
                    </td>
                </> 
                : <></>
            }
        </tr>
    );
}

function AdminTable({ data, cols, loading, saveRow, deleteRow }: AdminTableType){
    useEffect(()=>{ spiral.register(); },[]);
    
    return (
        <div className="admin-table-container">
            <table className="admin-table">
                <thead>
                    <tr>
                        {cols.map((col, i)=> <th key={i}>{col.title}</th> )}
                        <th />
                    </tr>
                </thead>
                <tbody>
                    {loading ?
                        <>
                            <tr>
                                <td colSpan={(cols?.length + 1)}>
                                    <div className='admin-table-loading'>
                                        <l-spiral size="150" speed="0.9" color="rgba(0,41,95,1)"></l-spiral>
                                    </div>
                                </td>
                            </tr>
                        </>:
                        <>
                            {data.map((row, i)=>
                                <AdminRow key={i} row={row} cols={cols} rowIdx={i} saveRow={saveRow} deleteRow={deleteRow}/>
                            )}
                        </>
                    }
                    
                </tbody>
            </table>
        </div>
    );
}

export default AdminTable;