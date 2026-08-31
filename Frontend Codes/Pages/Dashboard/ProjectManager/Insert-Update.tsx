import React, { useState, useEffect } from 'react';
import { type ForMeth, type ForProj, Master_API ,Del_Proj , Del_Meth} from '../../../Service/Api';
import { AddMeth } from '../../../Component/AddMethod';
import { toast } from 'react-toastify';

const EMPTY_METHOD: ForMeth = {
    ms_id: 0,
    m_name: '',
    m_description: '',
    m_is_active: '1',
    m_updated_by: '',
};
 
const EMPTY_PROJECT: ForProj = {
    proj_id: '',
    proj_name: '',
    description: '',
    is_active: '1',
    proj_priority: 'low',
    proj_budget: '',
    updated_by: '',
};

interface Props {
    mode: 'insert' | 'update'; 
    projectData?: ForProj | null;
    onClose: () => void;
    onSuccess: () => void;
}

export function InputInsertUpdate({ mode, projectData, onClose, onSuccess }: Props) {
    const [projData, setProjectData] = useState<ForProj>(EMPTY_PROJECT);
    const [methods, setMethods] = useState<ForMeth[]>([]);

    const [confirmProjDel , setConfirmProjDel] = useState<boolean>(false);

    useEffect(() => {
        if (mode === 'update' && projectData) {
            setProjectData(projectData);
            setMethods(projectData.proj_ms || (projectData as any).methods || []);
        } else {
            setProjectData(EMPTY_PROJECT);
            setMethods([]);
        }
    }, [mode, projectData]);

    const addMethod = () => setMethods([...methods, { ...EMPTY_METHOD }]);
    
    const updateMethod = (index: number, method: ForMeth) => {
        const updated = [...methods];
        updated[index] = method;
        setMethods(updated);
    };
    
    const removeMethod = async (index: number) => {
        const method = methods[index];
        if (method?.ms_id && Number(method.ms_id) > 0) {
            try {
                const resp = await Del_Meth(Number(method.ms_id));

                if (resp.data?.error) {
                    toast.error(resp.data.error);
                    return;
                }

                toast.success("Method deleted successfully!");
            } catch (err: any) {
                toast.error(
                    err.response?.data?.detail ||
                    err.message ||
                    "Unable to delete method."
                );
                return;
            }
        }
        setMethods(methods.filter((_, i) => i !== index));
    };

    const deleteProject = async () => {
        const id = Number(projData.proj_id);

        if (!id) {
            toast.error("Invalid project ID.");
            return;
        }
        try {
            const resp = await Del_Proj(id);

            if (resp.data?.error) {
                toast.error(resp.data.error);
                return;
            }
            toast.success("Project deleted successfully!");
            setConfirmProjDel(false);
            onSuccess();
        } catch (err: any) {
            toast.error(
                err.response?.data?.detail ||
                err.message ||
                "Unable to delete project."
            );
        }
    };
    
    const cleanString = (val?: any) => (val === '' || val === null || val === undefined ? undefined : String(val));
    
    const buildProjectPayload = (): ForProj => ({
        proj_id: mode === 'update' ? cleanString(projData.proj_id) : undefined,
        proj_name: cleanString(projData.proj_name),
        description: cleanString(projData.description),
        is_active: cleanString(projData.is_active),
        proj_priority: cleanString(projData.proj_priority),
        proj_budget: cleanString(projData.proj_budget),
        updated_by: cleanString(projData.updated_by),
        proj_ms: methods.length < 1 ? undefined : methods.map((m: any) => ({
            ms_id: m.ms_id ? Number(m.ms_id) : undefined,
            m_name: cleanString(m.m_name || m.name),
            m_description: cleanString(m.m_description || m.description),
            m_is_active: cleanString(m.m_is_active ?? m.is_active ?? '1'),
            m_updated_by: cleanString(m.m_updated_by || m.updated_by),
        })),
    });

    const handleProjectFieldChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        setProjectData({ ...projData, [e.target.name]: e.target.value });
    };

    const extractErrorMessage = (errData: any): string => {
        if (!errData) return "An unexpected error occurred.";
        if (typeof errData === 'string') return errData;
        if (Array.isArray(errData)) {
            return errData.map(e => e.msg || JSON.stringify(e)).join('\n');
        }
        if (errData.detail) {
            return typeof errData.detail === 'string' ? errData.detail : extractErrorMessage(errData.detail);
        }
        if (errData.error || errData.Error) {
            return errData.error || errData.Error;
        }
        return JSON.stringify(errData);
    };

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        try {
            const resp: any = await Master_API(buildProjectPayload());
            
            if (resp?.Error || resp?.error) {
                const errMsg = resp.Error || resp.error;
                toast.error(`Error: ${errMsg}`);
                return;
            }
            
            toast.success(mode === 'insert' ? "Project created successfully!" : "Project updated successfully!");
            onSuccess();
        } catch (err: any) {
            const parsedError = extractErrorMessage(err.response?.data || err.message);
            toast.error(parsedError);
        }
    };

    return (
        <form onSubmit={handleSubmit} style={{width: 'fit-content', maxHeight: '80vh', overflowY: 'auto', padding: '5px' }}>
            <div className="ProjectPage">
                <h3>{mode === 'insert' ? 'Create Project' : 'Update Project'}</h3>

                {mode === 'update' && (
                    <div>
                        <label>Project ID :{" "}</label>
                        <input type="text" className="InputSpace" name="proj_id" value={projData.proj_id || ''} readOnly />
                    </div>
                )}
                <div>
                    <label>Project Name :{" "}</label>
                    <input type="text" className="InputSpace" name="proj_name" value={projData.proj_name || ''} placeholder="Project Name" onChange={handleProjectFieldChange}/>
                </div>
                <div>
                    <label>Description :{" "}</label>
                    <input type="text" className="InputSpace" name="description" value={projData.description || ''} placeholder="Project Description" onChange={handleProjectFieldChange}/>
                </div>
                <div>
                    <label>Project Active Status :{" "}</label>
                    <select name="is_active" className="InputSpaceU" value={projData.is_active || "1"} onChange={handleProjectFieldChange}>
                        <option value='1'>Active</option>
                        <option value='0'>Inactive</option>
                    </select>
                </div>
                <div>
                    <label>Priority :{" "}</label>
                    <select name="proj_priority" className="InputSpaceU" value={projData.proj_priority || 'low'} onChange={handleProjectFieldChange}>
                        <option value='low'>LOW</option>
                        <option value='mid'>MID</option>
                        <option value='high'>HIGH</option>
                    </select>
                </div>
                <div>
                    <label>Budget :{" "}</label>
                    <input type="number" className="InputSpace" name="proj_budget" value={projData.proj_budget || ''} placeholder="Project Budget" onChange={handleProjectFieldChange}/>
                </div>
                {mode === "update" && (
                    <div>
                        <label>Updated By (Required for Updation) :{" "}</label>
                        <input type="text" className="InputSpace" name="updated_by" value={projData.updated_by || ''} placeholder="Project Updated by" onChange={handleProjectFieldChange}/>
                    </div>
                )}

                <h3>Methods Details</h3>
                {methods.map((method, index) => (
                    <AddMeth key={index} mode={mode} no={index} method={method} onChange={updateMethod} onRemove={removeMethod}/>
                ))}
                
                <div style={{ display: 'flex', gap: '8px', marginTop: '10px' }}>
                    <button type='button' className='ShowMeth' onClick={addMethod}>
                        + Method
                    </button>

                    <button type='submit' className='ShowMeth'>
                        Submit
                    </button>

                    {mode === 'update' && !confirmProjDel && (
                        <button
                            type='button'
                            className='RemMeth'
                            onClick={() => setConfirmProjDel(true)}>
                            Remove Project
                        </button>
                    )}

                    {mode === 'update' && confirmProjDel && (
                        <>
                            <button
                                type='button'
                                className='RemMeth'
                                onClick={deleteProject}>
                                Confirm
                            </button>

                            <button
                                type='button'
                                className='ShowMeth'
                                onClick={() => setConfirmProjDel(false)}>
                                Cancel
                            </button>
                        </>
                    )}

                    <button
                        type='button'
                        className='RemMeth'
                        onClick={onClose}>
                        Cancel
                    </button>
                </div>
            </div>
        </form>
    );
}