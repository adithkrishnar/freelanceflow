import { useState } from "react";

import {
  BriefcaseBusiness,
  Clock3,
  FileText,
  FolderKanban,
  LayoutDashboard,
  LogOut,
  Menu,
  Users,
  X,
} from "lucide-react";

import { NavLink, Outlet } from "react-router-dom";

import { useAuth } from "../context/AuthContext";

const navigation = [
  {
    name: "Dashboard",
    path: "/dashboard",
    icon: LayoutDashboard,
  },
  {
    name: "Clients",
    path: "/clients",
    icon: Users,
  },
  {
    name: "Projects",
    path: "/projects",
    icon: FolderKanban,
  },
  {
    name: "Tasks",
    path: "/tasks",
    icon: BriefcaseBusiness,
  },
  {
    name: "Time Tracking",
    path: "/time",
    icon: Clock3,
  },
  {
    name: "Invoices",
    path: "/invoices",
    icon: FileText,
  },
];

const AppLayout = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const { user, logout } = useAuth();

  const handleLogout = () => {
    setSidebarOpen(false);
    logout();
  };

  const getInitial = () => {
    return user?.name?.charAt(0)?.toUpperCase() || "U";
  };

  return (
    <div className="min-h-screen bg-slate-50">
      {sidebarOpen && (
        <button
          type="button"
          aria-label="Close navigation overlay"
          onClick={() => setSidebarOpen(false)}
          className="fixed inset-0 z-40 bg-slate-950/50 backdrop-blur-sm lg:hidden"
        />
      )}

      <aside
        className={`fixed inset-y-0 left-0 z-50 flex w-72 flex-col border-r border-slate-800 bg-slate-950 text-white transition-transform duration-300 lg:translate-x-0 ${
          sidebarOpen
            ? "translate-x-0"
            : "-translate-x-full"
        }`}
      >
        <div className="flex h-20 items-center justify-between border-b border-slate-800 px-6">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white font-bold text-slate-950">
              F
            </div>

            <div>
              <p className="font-bold tracking-tight">
                FreelanceFlow
              </p>

              <p className="text-xs text-slate-400">
                Business Workspace
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={() => setSidebarOpen(false)}
            className="rounded-lg p-2 text-slate-400 transition hover:bg-slate-800 hover:text-white lg:hidden"
            aria-label="Close navigation"
          >
            <X size={20} />
          </button>
        </div>

        <nav className="flex-1 overflow-y-auto px-4 py-6">
          <p className="mb-3 px-3 text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">
            Workspace
          </p>

          <div className="space-y-1">
            {navigation.map((item) => {
              const Icon = item.icon;

              return (
                <NavLink
                  key={item.path}
                  to={item.path}
                  onClick={() => setSidebarOpen(false)}
                  className={({ isActive }) =>
                    `flex items-center gap-3 rounded-xl px-3 py-3 text-sm font-medium transition ${
                      isActive
                        ? "bg-white text-slate-950 shadow-sm"
                        : "text-slate-400 hover:bg-slate-900 hover:text-white"
                    }`
                  }
                >
                  <Icon size={19} />

                  {item.name}
                </NavLink>
              );
            })}
          </div>
        </nav>

        <div className="border-t border-slate-800 p-4">
          <div className="rounded-2xl bg-slate-900 p-4">
            <div className="flex items-center gap-3">
              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-white font-bold text-slate-950">
                {getInitial()}
              </div>

              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-semibold text-white">
                  {user?.name || "Freelancer"}
                </p>

                <p className="truncate text-xs text-slate-400">
                  {user?.email}
                </p>
              </div>
            </div>

            <div className="mt-4 flex items-center justify-between">
              <span
                className={`rounded-full px-2.5 py-1 text-xs font-bold ${
                  user?.plan === "PRO"
                    ? "bg-emerald-400/10 text-emerald-400"
                    : "bg-slate-800 text-slate-300"
                }`}
              >
                {user?.plan || "FREE"} PLAN
              </span>

              <button
                type="button"
                onClick={handleLogout}
                className="rounded-lg p-2 text-slate-400 transition hover:bg-red-500/10 hover:text-red-400"
                aria-label="Logout"
                title="Logout"
              >
                <LogOut size={18} />
              </button>
            </div>
          </div>
        </div>
      </aside>

      <div className="min-h-screen lg:pl-72">
        <header className="sticky top-0 z-30 flex h-16 items-center border-b border-slate-200 bg-white/90 px-4 backdrop-blur lg:hidden">
          <button
            type="button"
            onClick={() => setSidebarOpen(true)}
            className="rounded-xl border border-slate-200 p-2.5 text-slate-700 shadow-sm transition hover:bg-slate-50"
            aria-label="Open navigation"
          >
            <Menu size={21} />
          </button>

          <div className="ml-4">
            <p className="font-bold text-slate-950">
              FreelanceFlow
            </p>
          </div>

          <span
            className={`ml-auto rounded-full px-2.5 py-1 text-xs font-bold ${
              user?.plan === "PRO"
                ? "bg-emerald-100 text-emerald-700"
                : "bg-slate-100 text-slate-600"
            }`}
          >
            {user?.plan || "FREE"}
          </span>
        </header>

        <main className="min-h-screen">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default AppLayout;