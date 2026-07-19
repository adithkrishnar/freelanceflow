import { cn } from "../lib/utils";

const EmptyState = ({ 
  icon: Icon, 
  title, 
  description, 
  action, 
  className 
}) => {
  return (
    <div className={cn("flex flex-col items-center justify-center p-12 text-center rounded-2xl border border-dashed border-slate-300 bg-slate-50/50 shadow-sm", className)}>
      {Icon && (
        <div className="flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-tr from-indigo-100 to-indigo-50 text-indigo-500 mb-5 shadow-inner ring-1 ring-inset ring-indigo-200/50">
          <Icon size={28} strokeWidth={2.5} />
        </div>
      )}
      <h3 className="text-lg font-bold tracking-tight text-slate-900">{title}</h3>
      {description && <p className="mt-2 text-sm font-medium text-slate-500 max-w-sm">{description}</p>}
      {action && <div className="mt-6">{action}</div>}
    </div>
  );
};

export default EmptyState;
