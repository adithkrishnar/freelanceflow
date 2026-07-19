import { useState } from "react";
import { useLocation, Outlet } from "react-router-dom";
import { AnimatePresence, motion } from "framer-motion";
import {
  BriefcaseBusiness,
  Clock3,
  FileText,
  FolderKanban,
  LayoutDashboard,
  Users,
} from "lucide-react";

import { useAuth } from "../context/AuthContext";
import Sidebar from "../components/Sidebar";
import Header from "../components/Header";

const navigation = [
  { name: "Dashboard", path: "/dashboard", icon: LayoutDashboard },
  { name: "Clients", path: "/clients", icon: Users },
  { name: "Projects", path: "/projects", icon: FolderKanban },
  { name: "Tasks", path: "/tasks", icon: BriefcaseBusiness },
  { name: "Time Tracking", path: "/time", icon: Clock3 },
  { name: "Invoices", path: "/invoices", icon: FileText },
];

const AppLayout = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { user, logout } = useAuth();
  const location = useLocation();

  const handleLogout = () => {
    setSidebarOpen(false);
    logout();
  };

  return (
    <div className="min-h-screen bg-slate-50 selection:bg-indigo-100 selection:text-indigo-900">
      <Sidebar 
        navigation={navigation} 
        user={user} 
        isOpen={sidebarOpen} 
        onClose={() => setSidebarOpen(false)} 
        onLogout={handleLogout} 
      />

      <div className="flex flex-col min-h-screen lg:pl-72 transition-all duration-300 ease-in-out">
        <Header onOpenSidebar={() => setSidebarOpen(true)} />

        <main className="flex-1 relative overflow-hidden p-4 sm:p-6 lg:p-8">
          <AnimatePresence mode="wait">
            <motion.div
              key={location.pathname}
              initial={{ opacity: 0, y: 8, scale: 0.99 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -8, scale: 0.99 }}
              transition={{ duration: 0.25, ease: [0.23, 1, 0.32, 1] }}
              className="h-full max-w-7xl mx-auto"
            >
              <Outlet />
            </motion.div>
          </AnimatePresence>
        </main>
      </div>
    </div>
  );
};

export default AppLayout;