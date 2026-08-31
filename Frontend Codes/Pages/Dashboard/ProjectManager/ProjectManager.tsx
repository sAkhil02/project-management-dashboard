import { useEffect, useState } from 'react';
import "../../../Style/style.css";
import { InputInsertUpdate } from './Insert-Update.tsx';
import { InputSearch } from './SearchProj.tsx';
import { View_Projects } from './View.tsx';
import { type ForProj, Get_Projs , Del_Proj } from '../../../Service/Api.ts';
import { toast } from 'react-toastify';

const priority_statement: Record<string, string> = {
    "low" : "LOW",
    "mid" : "MID" ,
    "high" : "HIGH" ,
}

export function ProjectManager() {
    const [all_projs, setAllProjs] = useState<any[]>([]);
    const [view, setView] = useState<number | null>(null);
    // const [openView , setOpenView] = useState<boolean>(false);
    const [cancel , showCancel] = useState<number[]>([]);
    
    const [modalMode, setModalMode] = useState<'insert' | 'update' | 'view' | null>(null);
    const [selectedProject, setSelectedProject] = useState<ForProj | null>(null);

    const [active , setActive] = useState<string>("");
    const [priority , setPriority] = useState<string>("");
    const [text , setSearch] = useState<string>("");

    const loadProjects = async () => {
        try {
            const response = await Get_Projs(0);
            setAllProjs(response?.data || []);
        } catch (err) {
            console.error(err);
        }
    };

    useEffect(() => {
        loadProjects();
    }, []);

    useEffect(() => {
        const timer = setTimeout(async () => {
            if (!text.trim() && !active && !priority) {
                loadProjects();
                return;
            }
            try {
                const result = await InputSearch ({text , active , priority});
                setAllProjs(Array.isArray(result) ? result : []);
            } catch (err) {
                toast.error(String(err));
                setAllProjs([]);
            }
        });
        return () => clearTimeout(timer);
    } ,[text , active , priority]);

    useEffect(() => {
        document.body.style.overflow = modalMode ? "hidden" : "";
        return () => {
            document.body.style.overflow = "";
        };
    }, [modalMode]);

    const addView = (id : number) => {
        setView(id);
        setModalMode('view');
    }

    const delView = () => {
        setView(null)
        setModalMode(null);
    }

    const handleCreateClick = () => {
        setSelectedProject(null);
        setModalMode('insert');
    };

    const del_proj = async (id: number) => {
        try {
            const resp = await Del_Proj(id);
            if (resp.data?.error) {
                toast.error(resp.data.error);
            }
        } catch (err) {
            toast.error(String(err));
        }
        loadProjects();
    };

    const handleEditClick = (proj: any) => {
        const formattedData: ForProj = {
            proj_id: String(proj.id),
            proj_name: proj.name || '',
            description: proj.description || '',
            is_active: String(proj.is_active ?? '1'),
            proj_priority: proj.priority || 'low',
            proj_budget: proj.budget ? String(proj.budget) : '',
            updated_by: proj.updated_by || '',
            proj_ms: proj.proj_ms || proj.methods || []
        };
        setView(null);
        setSelectedProject(formattedData);
        setModalMode('update');
    };

    const handleSearchClick = async () => {
        const data = { text, active, priority };

        try {
            const result = await InputSearch(data);
            setAllProjs(Array.isArray(result) ? result : []);
        } catch (err) {
            toast.error(String(err));
            setAllProjs([]);
        }
    };

    const handleFormSuccess = () => {
        setModalMode(null);
        loadProjects();
    };

    function formatDate(value: string): string {
        return value ? new Date(value).toLocaleString() : '—';
    }

    return (
        <div className='Proj_Card'>
            <div className="button_line" style={{ marginBottom: "15px" }}>
                <button onClick={loadProjects} className="ShowMeth">
                    <svg 
                        xmlns="http://www.w3.org/2000/svg" 
                        width="18" height="18" 
                        viewBox="0 0 24 24"
                        fill="none" 
                        stroke="black"
                        strokeWidth="2" 
                        strokeLinecap="round"
                        strokeLinejoin="round">
                        <path d="M3 12a9 9 0 0 1 9-9 9.75 9.75 0 0 1 6.74 2.74L21 8"/>
                        <path d="M21 3v5h-5"/>
                        <path d="M21 12a9 9 0 0 1-9 9 9.75 9.75 0 0 1-6.74-2.74L3 16"/>
                        <path d="M8 16H3v5"/>
                    </svg>
                    Refresh
                </button>

                <div className="search_create">
                    <select 
                        name="is_active" 
                        className="InputSpaceU" 
                        value={active ?? ''} 
                        onChange={(e) => setActive(e.target.value)}>
                            <option value = ''>Both Statuses</option>
                            <option value = '1'>Active</option>
                            <option value = '0'>In-Active</option>
                    </select>
                    <select 
                        name="priority" 
                        className="InputSpaceU" 
                        value={priority ?? ''} 
                        onChange={(e) => setPriority(e.target.value)}>
                            <option value=''>All Priorities</option>
                            <option value='low'>LOW</option>
                            <option value='mid'>MID</option>
                            <option value='high'>HIGH</option>
                    </select>
                    <input 
                        type='text' 
                        className='InputSpace' 
                        value={text ?? ''} 
                        onChange={(e) => setSearch(e.target.value)}
                        placeholder='Search' />
                    <button 
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
                    <button onClick={handleCreateClick} className="ShowMeth">Add</button>
                </div>
            </div>

            <div className="Card_Container">
                {all_projs && all_projs.length > 0 ? (
                    all_projs.map((each: any) => {
                        return (
                            <div className='_Card ProjectGridItem' key={each.id}>
                                <div className='Adjust_for_proj'>
                                    <h4>Title : {each.name}</h4>
                                    <div className='Proj_data'>
                                        {view !== each.id && (
                                            <table className='Table'>
                                                <tbody>
                                                    <tr className='row'>
                                                        <td>Priority</td>
                                                        <td>{priority_statement[each.priority] || '—'}</td>
                                                    </tr>
                                                    <tr className='row'>
                                                        <td>Created At</td>
                                                        <td>{formatDate(each.created_at) || '—'}</td>
                                                    </tr>
                                                    <tr className='row'>
                                                        <td>Active Status</td>
                                                        <td>{each.is_active === 1 ? "Active" : "In-Active"}</td>
                                                    </tr>
                                                </tbody>
                                            </table>
                                        )}

                                        <div className='buttonStyle'>
                                            {! cancel.includes(each.id) && (
                                                <div className='buttonStyle'>
                                                    <button
                                                        onClick={() => view !== each.id ? addView(each.id) : delView()}
                                                        className={view !== each.id ? 'ShowMeth' : 'RemMeth'}>
                                                        {view !== each.id ? 'View' : 'Close'}
                                                    </button>
                                                    <button 
                                                        onClick={() => handleEditClick(each)} 
                                                        className='ShowMeth'> Edit </button>
                                                    <button 
                                                        onClick={() => showCancel([...cancel , each.id])} 
                                                        className='RemMeth'> Remove </button> 
                                                </div>)}
                                            {cancel.includes(each.id) && (
                                                <div className='ForCancel'>
                                                    <button className='RemMeth' onClick={() => del_proj(each.id)}>Confirm</button>
                                                    <button className='ShowMeth' onClick={() => showCancel(cancel.filter((proj) => proj !== each.id))}>Cancel</button>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        );
                    })
                ) : (
                    <h3 className='_Card'>No records found !</h3>
                )}
            </div>

            {/* Create & Edit Modal */}
            {(modalMode === 'insert' || modalMode === 'update') && (
                <div className="overlay" onClick={() => setModalMode(null)}>
                    <div className="overlay-content" onClick={(e) => e.stopPropagation()}>
                        <InputInsertUpdate 
                            mode={modalMode} 
                            projectData={selectedProject}
                            onClose={() => setModalMode(null)}
                            onSuccess={handleFormSuccess}
                        />
                    </div>
                </div>
            )}

            {/* View Modal */}
            {modalMode === 'view' && (
                <div className='overlay' onClick = {delView}>
                    <div className='overlay-content' onClick={(e) => e.stopPropagation()}>
                        <View_Projects
                            id={view}
                            viewOpen={modalMode === 'view'}
                            onClose={delView}
                        />
                    </div>
                </div>
            ) }
        </div>
    );
}