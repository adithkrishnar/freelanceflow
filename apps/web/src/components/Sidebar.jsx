import { NavLink } from "react-router-dom";
import { LogOut, X } from "lucide-react";
import { cn } from "../lib/utils";

const Sidebar = ({ navigation, user, isOpen, onClose, onLogout }) => {
  const getInitial = () => {
    return user?.name?.charAt(0)?.toUpperCase() || "U";
  };

  return (
    <>
      {isOpen && (
        <button
          type="button"
          aria-label="Close navigation overlay"
          onClick={onClose}
          className="fixed inset-0 z-40 bg-slate-900/40 backdrop-blur-sm lg:hidden transition-opacity"
        />
      )}

      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-50 flex w-72 flex-col bg-[#0B0F19] border-r border-slate-800 transition-transform duration-300 ease-in-out lg:translate-x-0",
          isOpen ? "translate-x-0 shadow-2xl" : "-translate-x-full"
        )}
      >
        <div className="flex h-16 items-center justify-between px-6 border-b border-slate-800/80">
          <div className="flex items-center gap-3">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-indigo-500 to-indigo-600 text-white font-bold shadow-md shadow-indigo-500/20 ring-1 ring-indigo-500/50">
              F
            </div>
            <div>
              <p className="text-base font-semibold tracking-tight text-white">
                FreelanceFlow
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="rounded-lg p-2 text-slate-400 transition hover:bg-slate-800 hover:text-white lg:hidden"
            aria-label="Close navigation"
          >
            <X size={20} />
          </button>
        </div>

        <nav className="flex-1 overflow-y-auto px-4 py-6 scrollbar-thin scrollbar-thumb-slate-800">
          <p className="mb-3 px-3 text-[11px] font-semibold uppercase tracking-wider text-slate-500">
            Workspace
          </p>

          <div className="space-y-1">
            {navigation.map((item) => {
              const Icon = item.icon;

              return (
                <NavLink
                  key={item.path}
                  to={item.path}
                  onClick={onClose}
                  className={({ isActive }) =>
                    cn(
                      "group flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-all duration-200",
                      isActive
                        ? "bg-indigo-500/10 text-indigo-400 ring-1 ring-inset ring-indigo-500/20"
                        : "text-slate-400 hover:bg-slate-800/50 hover:text-slate-200"
                    )
                  }
                >
                  <Icon size={18} className={cn("transition-colors", "group-hover:text-slate-200")} />
                  {item.name}
                </NavLink>
              );
            })}
          </div>
        </nav>

        <div className="p-4 border-t border-slate-800/80">
          <div className="rounded-xl border border-slate-800 bg-slate-900/50 p-4 transition-colors hover:bg-slate-800/80">
            <div className="flex items-center gap-3">
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-gradient-to-br from-slate-700 to-slate-800 border border-slate-600 font-medium text-white shadow-sm">
                {getInitial()}
              </div>

              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-medium text-slate-200">
                  {user?.name || "Freelancer"}
                </p>
                <p className="truncate text-xs text-slate-500">
                  {user?.email}
                </p>
              </div>
            </div>

            <div className="mt-4 flex items-center justify-between border-t border-slate-800/80 pt-4">
              <span
                className={cn(
                  "rounded-md px-2 py-0.5 text-[10px] font-semibold tracking-wide uppercase ring-1 ring-inset",
                  user?.plan === "PRO"
                    ? "bg-emerald-500/10 text-emerald-400 ring-emerald-500/20"
                    : "bg-slate-800 text-slate-400 ring-slate-700"
                )}
              >
                {user?.plan || "FREE"} PLAN
              </span>

              <button
                type="button"
                onClick={onLogout}
                className="rounded-lg p-1.5 text-slate-500 transition hover:bg-rose-500/10 hover:text-rose-400"
                aria-label="Logout"
                title="Logout"
              >
                <LogOut size={16} />
              </button>
            </div>
          </div>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;
