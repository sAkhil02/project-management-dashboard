import React , {useState} from 'react';
import {type Admin, type AddAdmin ,type DelAdmin } from '../../../Service/Api.ts';
import { For_admin } from '../../../Component/InputAdmin.tsx';
import { All_Admin, Delete_Admin, Add_Admin } from '../../../Service/Api.ts';
import { ResponseMsg } from '../../../Component/Receive.tsx';
import { filterAdmins, getRoleOptions } from './SearchAdmin.tsx';
 
const EMPTY_ADMIN: Admin = {
    id: 0,
    email: "",
    phno: "",
    created_at: "",
    last_login: "",
    order_no: 0,
};

export function AdminManager({ID} : {ID : number}) {
    const [response, setResponse] = useState<any>(null);
    const [showResponse, setShowResponse] = useState<boolean>(true);
    const [loading, setLoading] = useState<boolean>(false);
    const [error, setError] = useState<any | null>(null);

    const [refreshingAdmins, setRefreshingAdmins] = useState<boolean>(false);
    const [admins, setAdmins] = useState<Array<Admin>>([]);
    const [pendingDeleteIds, setPendingDeleteIds] = useState<Array<number>>([]);

    const [draftAdmins, setDraftAdmins] = useState<Array<Admin>>([]);
    const [searchText, setSearchText] = useState<string>("");
    const [role, setRole] = useState<string>("");

    const toggleResponseVisibility = () => {
        setShowResponse(!showResponse);
    };

    const clear = () => {
        setResponse(null)
        setError(null)
    }

    function formatDate(value: string): string {
        return new Date(value).toLocaleString();
    }
    const addDraftAdmin = () => {
        setDraftAdmins([...draftAdmins, { ...EMPTY_ADMIN }]);
    };
    const updateDraftAdmin = (index: number, admin: Admin) => {
        const updated = [...draftAdmins];
        updated[index] = admin;
        setDraftAdmins(updated);
    };
    const removeDraftAdmin = (index: number) => {
        setDraftAdmins(draftAdmins.filter((_, i) => i !== index));
    };

    // useEffect -> useEffect( function , [] );
    React.useEffect(() => {refreshAdmins();}, []);

    const refreshAdmins = async () => {
        setRefreshingAdmins(true);
        setResponse(null)
        try {
            const data = await All_Admin();
            setAdmins(data);
        } finally {
            setRefreshingAdmins(false);
        }
    };
    
    const confirmAdminDelete = async(id: number) => {
        setPendingDeleteIds(pendingDeleteIds.filter((pendingId) => pendingId !== id));
        setAdmins(admins.filter((admin: any) => admin.id !== id));
        const data : DelAdmin = {
            id : id ,
            curr_id : ID
        }
        try {
            let resp : any = await Delete_Admin(data);
            if (resp?.message) {
                setResponse(resp)
            } else {
                setError(resp.error)
                setRefreshingAdmins(true);
            }
        } catch (err:any) {
            const msg = err.respose?.data?.detail || err.message ;
            setError(msg);
        } finally {
            setRefreshingAdmins(true);
            setRefreshingAdmins(false);
        }
    };
    const cancelAdminDelete = (id: number) => {
        setPendingDeleteIds(pendingDeleteIds.filter((pendingId) => pendingId !== id));
    };

    const handleSearchClick = () => {
        setSearchText((prev) => prev.trim());
    };

    const roleOptions = getRoleOptions(admins);
    const visibleAdmins = filterAdmins(admins, searchText, role).filter((admin: any) => admin.id !== ID);

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
            e.preventDefault();
            setResponse(null);
            setError(null);
            setLoading(true);
            try {
                let result: any;
                
                if (draftAdmins.length === 0) {
                    setError("Add at least one admin (click the + button) before submitting.");
                    return;
                }

                const missing = draftAdmins
                    .map((admin, i) => {
                        if (!admin.email?.trim()) return `Admin ${i + 1}: Email is required.`;
                        if (!admin.phno?.trim()) return `Admin ${i + 1}: Phone number is required.`;
                        return null;
                    })
                    .filter((msg): msg is string => msg !== null);

                if (missing.length > 0) {
                    setError(missing.join(" | "));
                    return;
                }
                const created: any[] = [];
                const succeededIndices: number[] = [];
                const failures: string[] = [];

                for (let i = 0; i < draftAdmins.length; i++) {
                    const admin = draftAdmins[i];
                    const payload: AddAdmin = {
                        email: admin.email?.trim() ?? "",
                        phno: admin.phno?.trim() ?? "",
                        curr_id: ID,
                    };
                    try {
                        created.push(await Add_Admin(payload));
                        succeededIndices.push(i);
                    } catch (rowErr: any) {
                        const detail = rowErr.response?.data?.detail || rowErr.message;
                        failures.push(`Admin #${i + 1}: ${typeof detail === "string" ? detail : JSON.stringify(detail)}`);
                    }
                }

                result = created;

                if (created.length > 0) {
                    await refreshAdmins();
                    setDraftAdmins((current) => current.filter((_, i) => !succeededIndices.includes(i)));
                }

                if (failures.length > 0) {
                    setError(failures.join(" | "));
                }
                setResponse(result);
                } catch (err: any) {
                const message = err.response?.data?.detail || err.message;
                setError(message);
            } finally {
                setLoading(false);
            }
        };

    return (
        <div className='Proj_Card'>
            <form onSubmit={handleSubmit}>
                <div>
                    <div className="button_line" style={{ marginBottom: "15px" }}>
                        <button type="button" className="ShowMeth" onClick={refreshAdmins} disabled={refreshingAdmins}>
                            <svg 
                                xmlns="http://www.w3.org/2000/svg" 
                                width="18" 
                                height="18" 
                                viewBox="0 0 24 24" 
                                fill="none" 
                                stroke="black"
                                stroke-width="2" 
                                stroke-linecap="round" 
                                stroke-linejoin="round"
                                className='Refresh'>
                                    <path d="M3 12a9 9 0 0 1 9-9 9.75 9.75 0 0 1 6.74 2.74L21 8"/>
                                    <path d="M21 3v5h-5"/>
                                    <path d="M21 12a9 9 0 0 1-9 9 9.75 9.75 0 0 1-6.74-2.74L3 16"/>
                                    <path d="M8 16H3v5"/>
                            </svg>
                            {refreshingAdmins ? " Refreshing..." : " Refresh List"}
                        </button>

                        <div className="search_create">
                            <select
                                name="role"
                                className="InputSpaceU"
                                value={role}
                                onChange={(e) => setRole(e.target.value)}>
                                    <option value=''>All Roles</option>
                                    {roleOptions.map((r) => (
                                        <option key={r} value={r}>Admin Level {r}</option>
                                    ))}
                            </select>
                            <input 
                                type='text' 
                                className='InputSpace' 
                                value={searchText} 
                                onChange={(e) => setSearchText(e.target.value)}
                                placeholder='Search by Email / Phone' />
                            <button 
                                type="button"
                                onClick={handleSearchClick} 
                                className="ShowMeth">
                                    <svg 
                                        xmlns="http://www.w3.org/2000/svg" 
                                        width="16" 
                                        height="16" 
                                        viewBox="0 0 24 24" 
                                        fill="none" 
                                        stroke="currentColor" 
                                        stroke-width="2" 
                                        stroke-linecap="round" 
                                        stroke-linejoin="round" >
                                            <path d="m21 21-4.34-4.34"/>
                                            <circle cx="11" cy="11" r="8"/>
                                    </svg>
                            </button>
                            <div>
                                <button type="button" className='ShowMeth' onClick={addDraftAdmin}>Add Admin</button>
                            </div>
                        </div>
                    </div>
                    {visibleAdmins ? (
                        <div className='Admin_Container'>
                            {visibleAdmins.map((admin: any, index: number) => (
                                <div key={admin.id ?? index}>
                                    <div className='_Card '> 
                                        <h4 className='ToMiddle'><u>Admin No. - {index+1}</u></h4>
                                        <table className='Table'>
                                            <tr className="row">
                                                <td className="Key"><b>Email</b></td>
                                                <td className="Val">{typeof admin.email !== 'object' && String(admin.email)}</td>
                                            </tr>
                                            <tr className="row">
                                                <td className="Key"><b>Phone No.</b></td>
                                                <td className="Val">{typeof admin.phno !== 'object' && String(admin.phno)}</td>
                                            </tr>
                                            <tr className="row">
                                                <td className="Key"><b>Last Login</b></td>
                                                <td className="Val">{typeof admin.last_login !== 'object' && formatDate(String(admin.last_login))}</td>
                                            </tr>
                                            <tr className="row">
                                                <td className="Key"><b>Created At</b></td>
                                                <td className="Val">{typeof admin.created_at !== 'object' && formatDate(String(admin.created_at))}</td>
                                            </tr>
                                            <tr className='row'>
                                                <td className='Key'><b>Role</b></td>
                                                <td className='Val'>{"Admin Level "+admin.order_no }</td>
                                            </tr>
                                        </table>
                                    {!pendingDeleteIds.includes(admin.id) && 
                                        <button 
                                            type="button" 
                                            className='RemMeth' 
                                            onClick={() => setPendingDeleteIds([...pendingDeleteIds, admin.id])}> 
                                                <b>Remove</b>
                                        </button>}
                                    {pendingDeleteIds.includes(admin.id) && (
                                        <div>
                                            <button 
                                                type="button" 
                                                className='ShowMeth' 
                                                onClick={() => confirmAdminDelete(admin.id)}>
                                                    Confirm !
                                                </button>
                                            <button 
                                                type="button" 
                                                className='RemMeth' 
                                                onClick={() => cancelAdminDelete(admin.id)}>
                                                    Cancel !
                                                </button>
                                        </div>
                                    )}
                                    </div> 

                                </div>
                            ))}
                        </div> ) : <pre>No Records Found !</pre>
                    }

                    {draftAdmins.map((draftAdmin, index) => (
                        <For_admin key={index} no={index} each={draftAdmin} onChange={updateDraftAdmin} onRemove={removeDraftAdmin}/>
                    ))}
                </div>
            <button type="submit" className='ShowMeth'><h3>Submit</h3></button>
            </form>
            {loading && (
                <div><h3>LOADING...</h3></div>
            )}
            <button className='RemMeth' onClick={toggleResponseVisibility}><b>{showResponse ? "Hide " : "Show "} Response !</b></button>
            {showResponse && (
                <div>
                    <ResponseMsg resp={response} error={error} mode={"edit_admin"}/>
                </div>
            )}
            {(response || error) && 
                <button className='ShowMeth' onClick={clear}><b>Clear Response</b></button>
            }
        </div>
    );
}