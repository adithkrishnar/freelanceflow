import { cn } from "../lib/utils";

const DataTable = ({ columns, data, keyField = "id", onRowClick, className }) => {
  return (
    <div className={cn("overflow-hidden rounded-2xl border border-slate-200/80 bg-white shadow-sm", className)}>
      <div className="overflow-x-auto">
        <table className="w-full text-left text-sm text-slate-600">
          <thead className="border-b border-slate-200/80 bg-slate-50 text-xs uppercase tracking-wider text-slate-500 font-semibold">
            <tr>
              {columns.map((col, idx) => (
                <th key={idx} className={cn("px-6 py-4", col.className)}>
                  {col.header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 bg-white">
            {data.map((row) => (
              <tr 
                key={row[keyField]} 
                onClick={() => onRowClick && onRowClick(row)}
                className={cn("transition-colors duration-200", onRowClick ? "cursor-pointer hover:bg-slate-50" : "hover:bg-slate-50/50")}
              >
                {columns.map((col, idx) => (
                  <td key={idx} className={cn("px-6 py-4 whitespace-nowrap text-slate-700", col.cellClassName)}>
                    {col.accessor ? row[col.accessor] : col.render ? col.render(row) : null}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default DataTable;
