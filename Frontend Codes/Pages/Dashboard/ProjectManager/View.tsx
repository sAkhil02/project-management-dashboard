import "../../../Style/style.css";
import { Get_Projs, Master_API, type OnlyProj, type ForMeth, type ForProj, Del_Meth } from "../../../Service/Api";
import { useEffect, useState, type ChangeEvent } from "react";
import { toast } from "react-toastify";

interface props {
    id: number | null;
    viewOpen: boolean;
    onClose: () => void;
}

const priority_statement: Record<string, string> = {
    "low": "LOW",
    "mid": "MID",
    "high": "HIGH",
};

const EMPTY_METHOD_DRAFT: ForMeth = {
    m_name: '',
    m_description: '',
    m_is_active: '1',
};

export function View_Projects({ id, viewOpen, onClose}: props) {
    const [resp, setResp] = useState<OnlyProj | any | null>(null);
    const methodsList = Array.isArray((resp as any)?.methods) ? (resp as any).methods : [];

    function formatDate(value: string): string {
        return value ? new Date(value).toLocaleString() : '—';
    }

    const [confirmDel , setConfirmDel] = useState<number[]>([]);

    // Add & Edit method 
    const [editingIndex, setEditingIndex] = useState<number | null>(null);
    const [addingMethod, setAddingMethod] = useState<boolean>(false);
    const [draftMethod, setDraftMethod] = useState<ForMeth>(EMPTY_METHOD_DRAFT);
    const [draftUpdatedBy, setDraftUpdatedBy] = useState<string>("");
    const [saving, setSaving] = useState<boolean>(false);

    const refresh = async () => {
        if (id === null) return;

        try {
            const { data } = await Get_Projs(id);
            const project = Array.isArray(data) ? data[0] : data;
            setResp(project ?? null);
        } catch {
            setResp(null);
        }
    };

    useEffect(() => {
        let cancelled = false;
        setResp(null);
        setEditingIndex(null);
        setAddingMethod(false);
        setDraftMethod(EMPTY_METHOD_DRAFT);
        setDraftUpdatedBy("");

        Get_Projs(id ? id : 0).then(({ data }) => {
                if (cancelled) return;
                const project = Array.isArray(data) ? data[0] : data;
                setResp(project ?? null);
            })
            .catch(() => {
                if (!cancelled) setResp(null);
            });

        return () => {
            cancelled = true;
        };
    }, [id]);

    const del_meth = async(indx : number) => {
        try {
            const result = await Del_Meth(indx);
            if (result.data?.error) {
                toast.error(result.data.error);
                return ;
            }
            await refresh() ;
        } catch(err) {
            toast.error(String(err));
        }
    }

    const extractErrorMessage = (errData: any): string => {
        if (!errData) return "An unexpected error occurred.";
        if (typeof errData === 'string') return errData;
        if (Array.isArray(errData)) {
            return errData.map((e) => e.msg || JSON.stringify(e)).join('\n');
        }
        if (errData.detail) {
            return typeof errData.detail === 'string' ? errData.detail : extractErrorMessage(errData.detail);
        }
        if (errData.error || errData.Error) {
            return errData.error || errData.Error;
        }
        return JSON.stringify(errData);
    };

    const startEdit = (no: number, meth: any) => {
        setAddingMethod(false);
        setEditingIndex(no);
        setDraftMethod({
            ms_id: meth?.ms_id,
            m_name: meth?.m_name ?? meth?.name ?? '',
            m_description: meth?.m_description ?? meth?.description ?? '',
            m_is_active: String(meth?.m_is_active ?? meth?.is_active ?? 1),
        });
        setDraftUpdatedBy(String(meth?.m_updated_by ?? meth?.updated_by ?? resp?.updated_by ?? ''));
    };

    const startAdd = () => {
        setEditingIndex(null);
        setAddingMethod(true);
        setDraftMethod({ ...EMPTY_METHOD_DRAFT });
        setDraftUpdatedBy(String(resp?.updated_by ?? ''));
    };

    const cancelMethodForm = () => {
        setEditingIndex(null);
        setAddingMethod(false);
        setDraftMethod(EMPTY_METHOD_DRAFT);
        setDraftUpdatedBy("");
    };

    const handleDraftChange = (e: ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setDraftMethod({ ...draftMethod, [name]: value });
    };

    const saveMethod = async () => {
        if (resp?.id == null) return;

        if (!draftMethod.m_name?.trim()) {
            toast.error("Method Name cannot be empty!");
            return;
        }
        if (!draftMethod.m_description?.trim()) {
            toast.error("Method Description cannot be empty!");
            return;
        }
        if (!draftUpdatedBy.trim()) {
            toast.error("Updated By is required!");
            return;
        }

        const methodPayload: ForMeth = editingIndex !== null
            ? {
                ms_id: draftMethod.ms_id,
                m_name: draftMethod.m_name.trim(),
                m_description: draftMethod.m_description.trim(),
                m_is_active: draftMethod.m_is_active ?? '1',
                m_updated_by: draftUpdatedBy.trim(),
            }
            : {
                m_name: draftMethod.m_name.trim(),
                m_description: draftMethod.m_description.trim(),
                m_is_active: draftMethod.m_is_active ?? '1',
            };

        const payload: ForProj = {
            proj_id: String(resp.id),
            proj_name: resp.name ?? undefined,
            description: resp.description ?? undefined,
            is_active: resp.is_active !== undefined && resp.is_active !== null ? String(resp.is_active) : undefined,
            proj_priority: resp.priority ?? undefined,
            proj_budget: resp.budget !== undefined && resp.budget !== null ? String(resp.budget) : undefined,
            updated_by: draftUpdatedBy.trim(),
            proj_ms: [methodPayload],
        };

        setSaving(true);
        try {
            const result: any = await Master_API(payload);
            if (result?.error || result?.Error) {
                toast.error(result.error || result.Error);
                return;
            }
            toast.success(editingIndex !== null ? "Method updated successfully!" : "Method added successfully!");
            cancelMethodForm();
            await refresh();
        } catch (err: any) {
            toast.error(extractErrorMessage(err.response?.data || err.message));
        } finally {
            setSaving(false);
        }
    };

    if (!viewOpen) return null;

    return (
        <div style={{ maxHeight: '80vh', overflowY: 'auto', padding: '5px', width: '95%' }}>
            <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '10px'}}>
                {resp && <button type="button" className="Cross" onClick={onClose}>
                            <svg 
                                xmlns="http://www.w3.org/2000/svg" 
                                width="18" 
                                height="18" 
                                viewBox="0 0 24 24" 
                                fill="none" 
                                stroke="currentColor" 
                                stroke-width="2" 
                                stroke-linecap="round" 
                                stroke-linejoin="round">
                                    <path d="M18 6 6 18"/>
                                    <path d="m6 6 12 12"/>
                                </svg>
                        </button>}
            </div>

            {resp ? (
                <div key={resp?.id ?? 'project-view'} className="_Card">
                    <table className='Table'>
                        <tbody>
                            <tr className='row'>
                                <td>Title</td>
                                <td>{resp.name ?? '—'}</td>
                            </tr>
                            <tr className='row'>
                                <td>Budget</td>
                                <td>{resp.budget ?? '—'}</td>
                            </tr>
                            <tr className='row'>
                                <td>Priority</td>
                                <td>{priority_statement[resp.priority] || '—'}</td>
                            </tr>
                            <tr className='row'>
                                <td>Active Status</td>
                                <td>{resp.is_active === 1 ? "Active" : "In-Active"}</td>
                            </tr>
                            <tr className='row'>
                                <td>Description</td>
                                <td>{resp.description || '—'}</td>
                            </tr>
                            <tr className='row'>
                                <td>Created At</td>
                                <td>{formatDate(resp.created_at) || '—'}</td>
                            </tr>
                            <tr className='row'>
                                <td>Updated by</td>
                                <td>{resp.updated_by || '—'}</td>
                            </tr>
                        </tbody>
                    </table>

                    <div className='_Card' style={{ width: "100%", margin: "8px 0" ,background: "#eaeaea" }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '8px' }}>
                            <h4>Methods :</h4>
                            {!addingMethod && (
                                <button type="button" className="ShowMeth" onClick={startAdd}>
                                    + Add Method
                                </button>
                            )}
                        </div>

                        {addingMethod && (
                            <div className='_Card'>
                                <h4>New Method</h4>
                                <div>
                                    <label>Name :{" "}</label>
                                    <input type="text" className="InputSpace" name="m_name" placeholder="Method Name" value={draftMethod.m_name || ''} onChange={handleDraftChange}/>
                                </div>
                                <div>
                                    <label>Active Status :{" "}</label>
                                    <select name="m_is_active" className="InputSpaceU" value={draftMethod.m_is_active || '1'} onChange={handleDraftChange}>
                                        <option value='1'>Active</option>
                                        <option value='0'>Inactive</option>
                                    </select>
                                </div>
                                <div>
                                    <label>Description :{" "}</label>
                                    <input type="text" className="InputSpace" name="m_description" placeholder="Method Description" value={draftMethod.m_description || ''} onChange={handleDraftChange}/>
                                </div>
                                <div>
                                    <label>Updated By (Required) :{" "}</label>
                                    <input type="text" className="InputSpace" placeholder="Updated By" value={draftUpdatedBy} onChange={(e) => setDraftUpdatedBy(e.target.value)}/>
                                </div>
                                <div style={{ display: 'flex', gap: '8px', marginTop: '8px' }}>
                                    <button type="button" className="ShowMeth" onClick={saveMethod} disabled={saving}>
                                        {saving ? "Saving..." : "Save"}
                                    </button>
                                    <button type="button" className="RemMeth" onClick={cancelMethodForm} disabled={saving}>
                                        Cancel
                                    </button>
                                </div>
                            </div>
                        )}

                        {methodsList.length > 0 ? (
                            methodsList.map((meth: ForMeth | any, no: number) => (
                                <div key={meth?.ms_id ?? no} className='_Card'>
                                    <h4>Method No. {no + 1}</h4>

                                    {editingIndex === no ? (
                                        <div>
                                            <div>
                                                <label>Name :{" "}</label>
                                                <input type="text" className="InputSpace" name="m_name" placeholder="Method Name" value={draftMethod.m_name || ''} onChange={handleDraftChange}/>
                                            </div>
                                            <div>
                                                <label>Active Status :{" "}</label>
                                                <select name="m_is_active" className="InputSpaceU" value={draftMethod.m_is_active || '1'} onChange={handleDraftChange}>
                                                    <option value='1'>Active</option>
                                                    <option value='0'>Inactive</option>
                                                </select>
                                            </div>
                                            <div>
                                                <label>Description :{" "}</label>
                                                <input type="text" className="InputSpace" name="m_description" placeholder="Method Description" value={draftMethod.m_description || ''} onChange={handleDraftChange}/>
                                            </div>
                                            <div>
                                                <label>Updated By (Required) :{" "}</label>
                                                <input type="text" className="InputSpace" placeholder="Updated By" value={draftUpdatedBy} onChange={(e) => setDraftUpdatedBy(e.target.value)}/>
                                            </div>
                                            <div style={{ display: 'flex', gap: '8px', marginTop: '8px' }}>
                                                <button type="button" className="ShowMeth" onClick={saveMethod} disabled={saving}>
                                                    {saving ? "Saving..." : "Save"}
                                                </button>
                                                <button type="button" className="RemMeth" onClick={cancelMethodForm} disabled={saving}>
                                                    Cancel
                                                </button>
                                            </div>
                                        </div>
                                    ) : (
                                        <>
                                            <table className='Table'>
                                                <tbody>
                                                    <tr className='row'>
                                                        <td>Name</td>
                                                        <td>{meth?.name || meth?.m_name || '—'}</td>
                                                    </tr>
                                                    <tr className='row'>
                                                        <td>Active Status</td>
                                                        <td>{(meth?.is_active === 1 || meth?.m_is_active === 1) ? "Active" : "In-Active"}</td>
                                                    </tr>
                                                    <tr className='row'>
                                                        <td>Description</td>
                                                        <td>{meth?.description || meth?.m_description || '—'}</td>
                                                    </tr>
                                                    <tr className='row'>
                                                        <td>Updated By</td>
                                                        <td>{meth?.updated_by || meth?.m_updated_by || '—'}</td>
                                                    </tr>
                                                </tbody>
                                            </table>

                                            <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                                                <button
                                                    type="button"
                                                    className="ShowMeth"
                                                    onClick={() => startEdit(no, meth)}>
                                                        Edit this Method
                                                    </button>

                                                {!confirmDel.includes(no) ?
                                                    (<button 
                                                        className="ShowMeth" 
                                                        onClick={() => setConfirmDel([...confirmDel,no])}>
                                                            Remove this Method
                                                        </button>
                                                    ) : (
                                                        <>
                                                            <button 
                                                                className="RemMeth" 
                                                                onClick={() => del_meth(meth.ms_id)}>
                                                                    Confirm
                                                                </button>
                                                            <button 
                                                                className="ShowMeth" 
                                                                onClick={() => setConfirmDel(confirmDel.filter((e) => e !== no))}>
                                                                    Cancel
                                                                </button>
                                                        </>
                                                    )
                                                }
                                            </div>
                                        </>
                                    )}
                                </div>
                            ))
                        ) : (
                            !addingMethod && <h4>No Methods Available !</h4>
                        )}
                    </div>
                </div>
            ) : (
                <p>Loading...</p>
            )}
        </div>
    );
}