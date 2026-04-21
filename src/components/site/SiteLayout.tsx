import { Outlet } from "react-router-dom";
import { Navbar } from "./Navbar";
import { Footer } from "./Footer";
import { AdminShortcut } from "./AdminShortcut";

export const SiteLayout = () => (
  <div className="min-h-screen flex flex-col">
    <AdminShortcut />
    <Navbar />
    <main className="flex-1 pt-16 md:pt-20">
      <Outlet />
    </main>
    <Footer />
  </div>
);
