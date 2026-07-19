import { Menu, Bell, Search } from "lucide-react";
import { cn } from "../lib/utils";

const Header = ({ onOpenSidebar }) => {
  return (
    <header className="sticky top-0 z-30 flex h-16 items-center justify-between border-b border-slate-200/60 bg-white/70 px-4 sm:px-8 backdrop-blur-xl supports-[backdrop-filter]:bg-white/60">
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
        <div className="hidden lg:flex items-center gap-2 text-sm text-slate-500 bg-white hover:bg-slate-50 px-3 py-1.5 rounded-lg border border-slate-200 shadow-sm transition-all cursor-pointer w-64 hover:border-slate-300">
          <Search size={16} className="text-slate-400" />
          <span className="flex-1">Search...</span>
          <div className="flex items-center gap-1 text-[10px] font-medium text-slate-400">
            <kbd className="rounded border border-slate-200 bg-slate-50 px-1.5 py-0.5 font-sans">⌘</kbd>
            <kbd className="rounded border border-slate-200 bg-slate-50 px-1.5 py-0.5 font-sans">K</kbd>
          </div>
        </div>
      </div>

      <div className="flex items-center gap-4">
        <button 
          className="relative rounded-full p-2 text-slate-400 transition hover:bg-slate-100 hover:text-slate-700"
          aria-label="Notifications"
        >
          <Bell size={18} />
          <span className="absolute right-2 top-2 flex h-2 w-2">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-indigo-400 opacity-75"></span>
            <span className="relative inline-flex h-2 w-2 rounded-full bg-indigo-500 ring-2 ring-white"></span>
          </span>
        </button>
        
        {/* Decorative divider */}
        <div className="h-5 w-px bg-slate-200 hidden sm:block"></div>
        
        {/* Placeholder for future user avatar in header if needed */}
        <div className="hidden sm:flex h-8 w-8 rounded-full bg-gradient-to-tr from-indigo-100 to-indigo-50 border border-indigo-200 items-center justify-center text-indigo-700 font-medium text-xs">
          F
        </div>
      </div>
    </header>
  );
};

export default Header;

