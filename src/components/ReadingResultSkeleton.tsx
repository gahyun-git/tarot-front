import Skeleton from "./Skeleton";

export default function ReadingResultSkeleton() {
  return (
    <section className="space-y-4">
      <div className="flex gap-2">
        <Skeleton className="h-9 w-24" />
        <Skeleton className="h-9 w-24" />
        <Skeleton className="h-9 w-28" />
      </div>
      <div className="grid gap-4">
        <div className="grid grid-cols-3 gap-4 items-end">
          <Skeleton className="h-56" />
          <Skeleton className="h-56" />
          <Skeleton className="h-56" />
        </div>
        <div className="grid grid-cols-3 gap-4">
          <Skeleton className="h-56" />
          <Skeleton className="h-56" />
          <Skeleton className="h-56" />
        </div>
        <div className="grid grid-cols-2 gap-4">
          <Skeleton className="h-56" />
          <Skeleton className="h-56" />
        </div>
      </div>
    </section>
  );
}


