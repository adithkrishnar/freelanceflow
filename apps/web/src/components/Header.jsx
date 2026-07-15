import { Menu, Bell, Search } from "lucide-react";
import { cn } from "../lib/utils";

const Header = ({ onOpenSidebar }) => {
  return (
    <header className="sticky top-0 z-30 flex h-16 items-center justify-between border-b border-slate-200 bg-white/80 px-4 sm:px-8 backdrop-blur-md">
      <div className="flex items-center">
        <button
          type="button"
          onClick={onOpenSidebar}
          className="mr-4 rounded-lg p-2 text-slate-500 transition hover:bg-slate-100 hover:text-slate-900 lg:hidden"
          aria-label="Open navigation"
        >
          <Menu size={20} />
        </button>

        {/* Global Search Placeholder */}
        <div className="hidden lg:flex items-center gap-2 text-sm text-slate-400 bg-slate-100/50 hover:bg-slate-100 px-3 py-1.5 rounded-lg border border-slate-200/50 transition cursor-pointer">
          <Search size={16} />
          <span>Search workspaces...</span>
          <div className="ml-4 flex items-center gap-1 text-[10px] font-semibold text-slate-400">
            <kbd className="rounded bg-slate-200 px-1.5 py-0.5">⌘</kbd>
            <kbd className="rounded bg-slate-200 px-1.5 py-0.5">K</kbd>
          </div>
        </div>
      </div>

      <div className="flex items-center gap-3">
        <button 
          className="relative rounded-lg p-2 text-slate-400 transition hover:bg-slate-100 hover:text-slate-900"
          aria-label="Notifications"
        >
          <Bell size={18} />
          <span className="absolute right-2 top-2 flex h-2 w-2">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-blue-400 opacity-75"></span>
            <span className="relative inline-flex h-2 w-2 rounded-full bg-blue-500"></span>
          </span>
        </button>
      </div>
    </header>
  );
};

export default Header;
