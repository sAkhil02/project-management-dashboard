import {useState, type ChangeEvent, type FormEvent} from "react";
import {Admin_check ,type ForLogin} from "../../Service/Api.ts";
import "../../Style/style.css"
import LoginPic from "../../Style/Photos/LoginPhoto.png";

interface LoginProps {
    onLoginSuccess : (user: { id: number; email: string }) => void 
}
export function Login({onLoginSuccess} : LoginProps) {

    const [info,setInfo] = useState<ForLogin>({info : '' , pwd : ''});
    const [inputType , setInputType] = useState<"email" | "tel" | "text">("text");
    const [s_resp , setSeverResp] = useState<string | null>(null);
    const [err , setError] = useState<string | null>(null);

    const trimming = (value: string) => value.trim();

    function handleChange(e: ChangeEvent<HTMLInputElement>) {
        const {name , value} = e.target ;
        setInfo({...info , [name] : value});

        if (name == "info") {
            if (value.includes('@gmail.com') && value.length > 0) {
                setInputType('email');
            } else if (value.match(/^\+?(\d[\s.-]*){7,15}$/)) {
                setInputType('tel');
            } else {
                setInputType('text');
            }
        }
    }
    const checkLogin = async (e: FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setSeverResp(null);
        setError(null);

        const loginInfo = {
            ...info,
            info: trimming(info.info ?? ""),
        };

        if (!loginInfo.info){
            setError("Cannot be Empty !");
        } else if (!info.pwd){
            setError("Enter Password !")
        } else {
            try {
                const resp = await Admin_check(loginInfo);
                if (resp?.error) {
                    setError(resp.error);
                } else {
                    setSeverResp(JSON.stringify(resp));
                    onLoginSuccess({id: resp.id , email: resp.email});
                }
            } catch (err : any) {
                setError(err.message || "Something went wrong !")
            }
        }
    };

    return (
        <div className="LoginPage">
        <div className="ForLogin">
            <div className= "ProjectManager"><h1><b> Project Manager </b></h1></div>
            <form onSubmit={checkLogin}>
                <div className="LineUnder"></div>
                <div className="LoginName"><u><b> Login </b></u></div>
            <div>
                <b>Email / Ph. No. {" "}:</b>
                <input type={inputType}
                    className="InputSpace"
                    name = "info" 
                    placeholder="Email or Phone No."
                    value={info.info}
                    onChange={handleChange} />
            </div>
            <div>
                <b>Password {" "}:</b>
                <input type="password"
                    className="InputSpace"
                    name = "pwd"  
                    placeholder="Password"
                    value={info.pwd}
                    onChange={handleChange} />
            </div>
            <div>
                <button className="LoginButton"> Login </button>
            </div>
            </form>
            <div className="Response">
                {s_resp && (
                    <div>
                        <h3>Response :</h3>
                        <p>{s_resp}</p>
                    </div>
                )}
            </div>
            <div className="Error">
                {err && (
                    <div>
                        <h3>Error :</h3>
                        <p>{err}</p>
                    </div>
                )}
            </div>
        </div>
        <div className="BGforPhoto">
            <div className="LoginPhoto ">
                <img src={LoginPic} alt="Login"/>
            </div>
        </div>
        </div>
        );
}
