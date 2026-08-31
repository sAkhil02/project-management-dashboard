import React , {useState} from 'react';
import {type ForMeth} from '../Service/Api.ts'
import "../Style/style.css"

interface MethProps{
    mode : string
    no : number ;
    method : ForMeth ;
    onChange : (no : number , method : ForMeth) => void ;
    onRemove : (no:number) => void ;
}

export function AddMeth({mode ,no ,method ,onChange ,onRemove} : MethProps) {
    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        onChange(no , {...method ,[e.target.name]:e.target.value});
    }

    const [confirmRem , setConfirmRem] = useState<boolean>(false);

    const handleRem = () => {
        onRemove(no);
        setConfirmRem(false);
    }

    return (
        <div className="_Card">
            <h4>Method No. {no+1}</h4>
            {mode === "update" && (
                <div>
                    <label>Method ID :{" "}</label>
                    <input type="number" className="InputSpace" placeholder="Method ID" name="ms_id" value={method.ms_id} readOnly/>
                </div>
            )}
            <div>
                <label>Method Name :{" "}</label>
                <input type="text" className="InputSpace" placeholder="Method Name" name="m_name" value={method.m_name} onChange={handleChange}/>
            </div>
            <div>
                <label>Method Active Status :{" "}</label>
                <select name="m_is_active" className="InputSpaceU" value={method.m_is_active} onChange={handleChange}>
                    <option value='1'>Active</option>
                    <option value='0'>Inactive</option>
                </select>
            </div>
            {mode === "update" && (
                <div>
                    <label>Method Updated by {(mode === 'update' ? "(Required for Updation)" : "" )}:{" "}</label>
                    <input type="text" className="InputSpace" placeholder="Method Updated By" name="m_updated_by" value={method.m_updated_by} onChange={handleChange}/>
                </div>
            )}
            <div>
                <label>Method Description :{" "}</label>
                <input type="textbox" className="InputSpace" placeholder="Method Description" name="m_description" value={method.m_description} onChange={handleChange}/>
            </div>
            { !confirmRem && (
                <button className='RemMeth' onClick={() => setConfirmRem(true)}>Remove this Method</button>
            )}
            { confirmRem && (
                <div className='ForCancel'>
                    <button className='RemMeth' onClick={handleRem}>Confirm</button>
                    <button className='ShowMeth' onClick={() => setConfirmRem(false)}>Cancel</button>
                </div>
            )}
        </div>
    )
}