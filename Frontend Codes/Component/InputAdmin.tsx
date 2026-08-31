import {type Admin} from '../Service/Api.ts' ;

interface AdminProps{
    no : number ;
    each : Admin ;
    onChange : (no : number , method : Admin) => void ;
    onRemove : (no : number) => void ;
}

export function For_admin ({no , each , onChange , onRemove} : AdminProps){
    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
            onChange(no , {...each ,[e.target.name]:e.target.value});
        }
    
        return (
            <div className="_Card">
                <div>
                    <label>New Admin Email :{" "}</label>
                    <input type="text" className="InputSpace" placeholder="Email" name="email" value={each.email} onChange={handleChange}/>
                </div>
                <div>
                    <label>New Admin Phone No. :{" "}</label>
                    <input type="text" className="InputSpace" placeholder="Phone Number" name="phno" value={each.phno} onChange={handleChange}/>
                </div>
                <button type="button" className="RemMeth" onClick={() => onRemove(no)}>Remove this Method</button>
            </div>
        )
}