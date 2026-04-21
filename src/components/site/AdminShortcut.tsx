import { useEffect } from "react";
import { useNavigate } from "react-router-dom";

/** Atalho secreto para abrir a área admin: Ctrl/Cmd + Shift + A */
export const AdminShortcut = () => {
  const nav = useNavigate();
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.shiftKey && e.key.toLowerCase() === "a") {
        e.preventDefault();
        nav("/auth");
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [nav]);
  return null;
};
