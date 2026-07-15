import Skeleton from "./Skeleton";

const DashboardSkeleton = () => {
  return (
    <div className="p-8">
      <Skeleton className="h-10 w-72 mb-8" />

      <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-4">
        {[1, 2, 3, 4].map((item) => (
          <div
            key={item}
            className="rounded-2xl border border-slate-200 bg-white p-6"
          >
            <Skeleton className="h-5 w-28 mb-5" />

            <Skeleton className="h-10 w-20 mb-6" />

            <Skeleton className="h-4 w-full" />
          </div>
        ))}
      </div>

      <div className="grid gap-6 mt-8 xl:grid-cols-[2fr_1fr]">
        <div className="rounded-2xl border border-slate-200 bg-white p-6">
          <Skeleton className="h-6 w-48 mb-8" />

          <Skeleton className="h-80 w-full" />
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-6">
          <Skeleton className="h-6 w-40 mb-8" />

          {[1, 2, 3].map((item) => (
            <div
              key={item}
              className="mb-5"
            >
              <Skeleton className="h-5 w-full mb-3" />

              <Skeleton className="h-4 w-36" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default DashboardSkeleton;