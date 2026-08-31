import { useState } from 'react';
import { Sidebar } from '../../Component/Sidebar.tsx';
import {ProjectManager} from './ProjectManager/ProjectManager.tsx';
import {AdminManager} from './AdminManager/AdminManager.tsx';
import "../../Style/style.css";
import "../../Style/Sidebar.css";

type Mode = "project" | "admin";
 
export function Dashboard({ ID }: { ID: number }) {
    const [page, setPage] = useState<Mode>("project");
    const [sidebarOpen, setSidebarOpen] = useState<boolean>(false);
 
    return (
        <div className="Container">
            <Sidebar
                page={page}
                onSelect={setPage}
                isOpen={sidebarOpen}
                onClose={() => setSidebarOpen(false)}
            />
            <button
                type="button"
                className="SidebarToggle"
                onClick={() => setSidebarOpen(true)}
                aria-label="Open menu"
            >
                <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="22" height="22"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round">
                    <line x1="3" y1="6" x2="21" y2="6"/>
                    <line x1="3" y1="12" x2="21" y2="12"/>
                    <line x1="3" y1="18" x2="21" y2="18"/>
                </svg>
            </button>
            {page === "project" && <ProjectManager/>}
            {page === "admin" && <AdminManager ID={ID}/>}
        </div>
    );
}