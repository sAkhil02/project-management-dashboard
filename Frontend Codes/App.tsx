import { useState } from "react";
import {Login} from "./Pages/Login/Login.tsx";
import {Dashboard} from "./Pages/Dashboard/DashBoard.tsx";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import "./Style/style.css";

export function App() {
    type LoggedUser = {
        id: number;
        email: string;
    };

    const [logged, setLog] = useState<LoggedUser | null>(null);

    const LogSuccess = (name: string | LoggedUser) => {
        const user = typeof name === "string" ? { id: Date.now(), email: name } : name;
        setLog(user);
    };

    const handleLogOut = () => {
        setLog(null);
    };

    return (
        <div>
            <ToastContainer position="top-right" autoClose={3000} hideProgressBar={false} />
            {logged && (
                <div>
                    <div className="Welcome"> Welcome <b>{logged.email.slice(0,-10)}</b> !</div>
                    <button className="LogOut fixed-LogOut" onClick={handleLogOut} aria-label="Log out">
                        <svg 
                            xmlns="http://www.w3.org/2000/svg" 
                            width="24" height="24" 
                            viewBox="0 0 24 24" 
                            fill="none" 
                            stroke="currentColor" 
                            strokeWidth="2" 
                            strokeLinecap="round" 
                            strokeLinejoin="round" 
                            className="lucide lucide-log-out-icon lucide-log-out">
                            <path d="m16 17 5-5-5-5"/>
                            <path d="M21 12H9"/>
                            <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/>
                        </svg>
                        <span className="LogOutName">Log Out</span>
                    </button>
                </div>
            )}
            {logged ? (
                <div className="Dash">
                    <Dashboard ID={logged.id} />
                </div>
            ) : (
                <Login onLoginSuccess={LogSuccess} />
            )}
        </div>
    );
}