import { useEffect } from "react";
import "../Style/Sidebar.css";

type PAGE = "project" | "admin";

interface SidebarProps {
    page: PAGE;
    onSelect: (mode: PAGE) => void;
    isOpen: boolean;
    onClose: () => void;
}

const PAGES : { key : PAGE , label : string}[] = [
    { key : "project" , label : "Project Manager"} ,
    { key: "admin" , label : "Admin Manager"} ,
];

export function Sidebar({ page, onSelect, isOpen, onClose }: SidebarProps) {

    useEffect(() => {
        if (!isOpen) return;
        const onKey = (e: KeyboardEvent) => {
            if (e.key === "Escape") onClose();
        };
        window.addEventListener("keydown", onKey);
        return () => window.removeEventListener("keydown", onKey);
    }, [isOpen, onClose]);

    useEffect(() => {
        document.body.style.overflow = isOpen ? "hidden" : "";
        return () => {
            document.body.style.overflow = "";
        };
    }, [isOpen]);

    const handleSelect = (m: PAGE) => {
        onSelect(m);
        onClose();
    };

    return (
        <>
            {isOpen && (
                <div className="SidebarOverlay" onClick={onClose} aria-hidden="true" />
            )}
            <aside className={`Sidebar ${isOpen ? "Sidebar-open" : ""}`}>
                <div className="SidebarHeader">
                    <span className="SidebarBrand"><b>Menu</b></span>
                    <button
                        type="button"
                        className="SidebarClose"
                        onClick={onClose}
                        aria-label="Close sidebar"
                    >
                        
                        <svg
                            xmlns="http://www.w3.org/2000/svg"
                            width="18"
                            height="18"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                        >
                            <path d="M18 6 6 18" />
                            <path d="m6 6 12 12" />
                        </svg>
                    </button>
                </div>

                <nav className="SidebarNav">
                        {PAGES.map((m) => (
                        <button
                            key={m.key}
                            type="button"
                            className={`SidebarSubItem ${page === m.key ? "SidebarSubItem-active" : ""}`}
                            onClick={() => handleSelect(m.key)}
                        >
                            <b>{page === m.key ? "[ "+m.label+" ]" : m.label}</b>
                        </button>
                        ))}
                </nav>
            </aside>
        </>
    );
}