import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent, CardHeader } from "@/components/ui/card";

export function StatCardSkeleton() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
      {Array.from({ length: 4 }).map((_, index) => (
        <Card key={index} className="overflow-hidden">
          <CardHeader className="pb-2">
            <Skeleton className="h-4 w-24" />
          </CardHeader>
          <CardContent>
            <Skeleton className="h-10 w-16 mb-2" />
            <Skeleton className="h-3 w-3/4" />
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

export function ChartSkeleton() {
  return (
    <Card className="col-span-2">
      <CardHeader className="pb-2">
        <Skeleton className="h-5 w-40" />
      </CardHeader>
      <CardContent>
        <div className="h-[300px] flex flex-col justify-between">
          <div className="flex justify-between items-end h-full pt-6">
            {Array.from({ length: 12 }).map((_, i) => (
              <Skeleton 
                key={i} 
                className="w-6 rounded-t-md rounded-b-none" 
                style={{ 
                  height: `${Math.max(30, Math.floor(Math.random() * 200))}px`,
                  opacity: 0.7 + (Math.random() * 0.3)
                }} 
              />
            ))}
          </div>
          <div className="flex justify-between mt-2">
            {Array.from({ length: 12 }).map((_, i) => (
              <Skeleton key={i} className="w-6 h-3" />
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

export function RecentActivitySkeleton() {
  return (
    <Card>
      <CardHeader className="pb-2">
        <Skeleton className="h-5 w-40" />
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="flex items-start space-x-4">
              <Skeleton className="h-10 w-10 rounded-full" />
              <div className="flex-1 space-y-2">
                <Skeleton className="h-4 w-3/4" />
                <Skeleton className="h-3 w-1/2" />
              </div>
              <Skeleton className="h-3 w-16" />
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

export function UpcomingDeadlineSkeleton() {
  return (
    <Card>
      <CardHeader className="pb-2">
        <Skeleton className="h-5 w-40" />
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="flex items-center justify-between p-3 border rounded-md">
              <div className="space-y-1">
                <Skeleton className="h-4 w-48" />
                <div className="flex items-center space-x-2">
                  <Skeleton className="h-3 w-3 rounded-full" />
                  <Skeleton className="h-3 w-24" />
                </div>
              </div>
              <Skeleton className="h-8 w-20 rounded-md" />
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

export function DashboardSkeleton() {
  return (
    <div className="container mx-auto py-6 space-y-6">
      <div className="flex items-center justify-between mb-4">
        <Skeleton className="h-8 w-64" />
        <Skeleton className="h-10 w-32 rounded-md" />
      </div>
      
      <StatCardSkeleton />
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <ChartSkeleton />
        <div className="space-y-6">
          <UpcomingDeadlineSkeleton />
          <RecentActivitySkeleton />
        </div>
      </div>
    </div>
  );
}