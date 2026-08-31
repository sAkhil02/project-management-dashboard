import { useState } from "react";
import "../Style/style.css"

interface ResponseProps {
    resp: any ;
    error: any | null ;
    mode: string ;
}

const head: any = {
    "error" : "Error" ,
    "message" : "Messae"
}

export function ResponseMsg({resp , error , mode}: ResponseProps) {
    const hasResp = resp != undefined && resp != null ;
    const [showMeth , setShowMeth] = useState<number[]>([]);

    const addMethod = (no : number) => {
        setShowMeth((current) => [...current, no])
    };
    const removeMeth = (no : number) => {
        setShowMeth(showMeth.filter(item => (item !== no)))
    };
    const handleMsg = (data : any) => {
        const part = mode === 'update' ? data?.Updation_Part : data?.Creation_Part ;
        if (!part) return null ;
        return (
            <div>
                {part.Project && (
                    <div className="RespBox">
                        <h4><u>Project :</u></h4>
                        {part.Project.message || part.Project.error}
                    </div>
                )}
                {part.Project_Method?.length > 0 && (
                    <div className="Response">
                        <h4><u>Method :</u></h4>
                        {part.Project_Method.map((each : any , ind : number) => (
                            <div key={ind}>{ind+" - "+(each.message || each.error)}</div>
                        ))}
                    </div>
                )}
            </div>
        );
    };

    function strtodate(value: string): string {
        return new Date(value).toLocaleString();
    };  

    function forproj (data : Record<string, any>) {
        const proj_temp : Record<string ,string> = {
            id: "ID" ,
            name: "Name" ,
            is_active: "Active Status" ,
            budget: "Budget" ,
            updated_at: "Last Updated" ,
            created_at: "Created at" ,
            description: "Description" ,
            priority: "Priority" ,
            updated_by: "Upddated By" ,
            methods: "Have Methods ?"
        };

        const new_obj : Record<string ,any> = {} ;
        const entries = Object.entries(data);

        for (let i = 0; i < entries.length; i++) {
            const [key, val] = entries[i];
            const label = proj_temp[key] || key;

            if (key === "is_active") {
                new_obj[label] = val === 1 ? "Active" : "In-Active";
            } else if (key === "methods") {
                new_obj[label] = Array.isArray(val) && val.length > 0 ? "Yes" : "No";
            } else if (key === "created_at" || key === "updated_at") {
                new_obj[label] = val ? strtodate(val) : "—";
            } else if (key === "priority"){
                new_obj[label] = val ? val.charAt(0).toUpperCase() + val.slice(1) : "";
            } else {
                new_obj[label] = val ? val : "-";
            }
        }
        data = new_obj ;
        return (
            <table className="Table">
                {Object.entries(data).map(([key, value]) => (
                    <div>
                        <tr className="row" key={key}>
                            <td className="Key"><b>{key}</b></td>
                            <td className="Val">{typeof value !== 'object' && String(value)}</td>
                        </tr>
                    </div>
                ))}
            </table>
        );
    }

    function formeth (data : object) {
        const meth_temp : Record<string ,string> = {
            proj_id: "Project ID" ,
            created_at: "Method created at",
            ms_id: "Method ID" ,
            m_name: "Method Name" ,
            m_is_active: "Method Active Status" ,
            m_updated_by: "Method Updated By" ,
            m_description: "Method Description"
        };

        const new_obj : Record<string ,any> = {} ;
        const entries = Object.entries(data);

        for (let i = 0; i < entries.length; i++) {
            const [key, val] = entries[i];
            const label = meth_temp[key] || key;

            if (key === "m_is_active") {
                new_obj[label] = val === 1 ? "Active" : "In-Active";
            } else if (key === "created_at") {
                new_obj[label] = val ? strtodate(val) : "-" ;
            } else { 
                new_obj[label] = val ? val : "-";
            }
        }
        data = new_obj ;
        return (
            <table className="Table">
                <tbody>
                {Object.entries(data).map(([key, value]) => (
                    <tr className="row" key={key}>
                        <td className="Key"><b>{key}</b></td>
                        <td className="Val">{typeof value !== 'object' && String(value)}</td>
                    </tr>
                ))}
                </tbody>
            </table>
        );
    }
    function foradminresult (data : any, ind : number) {
        return (
            <div className="_Card" key={ind}>
                <h4><u>Admin No. {ind}</u></h4>
                {data && typeof data === 'object' ? (
                    <table className="Table">
                        <tbody>
                        {Object.entries(data).map(([key, value]) => (
                            <tr className="row" key={key}>
                                <td className="Key"><b>{head[key]}</b></td>
                                <td className="Val">{(key === "last_login" || key === "created_at") ? strtodate(String(value)) : String(value)}</td>
                            </tr>
                        ))}
                        </tbody>
                    </table>
                ) : (
                    <p>{String(data)}</p>
                )}
            </div>
        );
    }
    
    if (!hasResp && !error) return null ;

    return (
        <div>
            {hasResp && (
                <div>
                    <h3>Response :</h3>
                    <div>
                        {mode === 'search' && (resp.projects || resp.methods) ? (
                            <>
                                {resp.projects && resp.projects.map((each: object , indx : number) => (
                                    <div className = "_Card" key={`project-${indx}`}>
                                        <h4><ul><u>Project No. {indx+1}</u></ul></h4>
                                        {forproj(each)}
                                    </div>))}
                                {(resp.projects && resp.methods) && 
                                    <p>-------------------------------------------------------------------</p> }
                                {resp.methods && resp.methods.map((each: object , indx : number) => (
                                    <div className = "_Card" key={`method-${indx}`}>
                                        <h4><ul><u>Method No. {indx+1}</u></ul></h4>
                                        {formeth(each)}
                                    </div>))}
                            </>
                        ) : mode === 'search' ? (
                                <div>
                                    {resp.map((each : any, index : number) => (
                                        <div className = "_Card" key={`project-card-${index}`}>
                                            <h4><u>Project No. - {index+1}</u></h4>
                                            {forproj(each)}
                                            {showMeth.includes(index) ? (
                                                <>
                                                    {showMeth.includes(index) && (
                                                        <button className="RemMeth" onClick={() => removeMeth(index)}>Remove Methods</button>
                                                    )}
                                                    {each.methods &&
                                                        each.methods.map((meth: any, ind: number) => (
                                                            <div className="_Card" key={ind}>
                                                                <h4><ul>Method No. - {ind+1}</ul></h4>
                                                                {formeth(meth)}
                                                            </div>
                                                        ))}
                                                </>
                                            ) : (
                                                each.methods && each.methods.length > 0 && (
                                                    <button className="ShowMeth" onClick={() => addMethod(index)}>Show Methods</button>
                                                )
                                            )}
                                        </div>
                                    ))}
                                </div>
                            ) : mode === 'edit_admin' ? (
                                <div>
                                    {Array.isArray(resp) && resp.map((each, ind) => foradminresult(each, ind+1))}
                                </div>
                            ) : (
                                <div>
                                    {handleMsg(resp)}
                                </div>
                            )
                        }
                    </div>
                </div>
            )}
            {error && (
                <div className="ErrorBox">
                    <h4>Error :</h4>
                    <pre>{JSON.stringify(error[0]?.msg ?? error, null, 2)}</pre>
                </div>
            )}
        </div>
    );
}