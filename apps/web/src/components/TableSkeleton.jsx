import Skeleton from "./Skeleton";

const TableSkeleton = ({
  rows = 6,
}) => {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-6">
      {[...Array(rows)].map((_, index) => (
        <div
          key={index}
          className="flex gap-4 py-4"
        >
          <Skeleton className="h-5 w-44" />

          <Skeleton className="h-5 flex-1" />

          <Skeleton className="h-5 w-24" />

          <Skeleton className="h-5 w-28" />
        </div>
      ))}
    </div>
  );
};

export default TableSkeleton;