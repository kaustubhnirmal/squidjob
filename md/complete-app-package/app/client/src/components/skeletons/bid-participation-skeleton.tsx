import { Skeleton } from "@/components/ui/skeleton";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";

export function BidParticipationStepsSkeleton() {
  return (
    <div className="flex items-center mb-8">
      {[1, 2, 3, 4].map((step) => (
        <div key={step} className="flex items-center">
          <div className="flex items-center justify-center w-8 h-8 rounded-full bg-gray-200">
            <Skeleton className="h-4 w-4 rounded-full" />
          </div>
          {step < 4 && <Skeleton className="flex-grow h-0.5 mx-2 w-24" />}
        </div>
      ))}
    </div>
  );
}

export function BidParticipationStepLabelsSkeleton() {
  return (
    <div className="flex justify-between mb-8 text-sm">
      <Skeleton className="text-center w-1/4 h-4" />
      <Skeleton className="text-center w-1/4 h-4" />
      <Skeleton className="text-center w-1/4 h-4" />
      <Skeleton className="text-center w-1/4 h-4" />
    </div>
  );
}

export function BidParticipationPageSkeleton() {
  return (
    <div className="container mx-auto py-6">
      <Card className="animate-pulse">
        <CardHeader>
          <CardTitle>
            <Skeleton className="h-6 w-48" />
          </CardTitle>
          <CardDescription>
            <Skeleton className="h-4 w-72" />
          </CardDescription>
        </CardHeader>
        <CardContent>
          <BidParticipationStepsSkeleton />
          <BidParticipationStepLabelsSkeleton />
          
          <div className="space-y-6">
            {/* Step 1 layout skeleton */}
            <div className="space-y-6">
              <div className="relative w-full max-w-md">
                <Skeleton className="absolute left-2.5 top-2.5 h-4 w-4 rounded-full" />
                <Skeleton className="h-10 w-full rounded-md pl-8" />
              </div>

              <div className="border rounded-md p-4">
                <Skeleton className="h-8 w-full mb-4" />
                
                {Array.from({ length: 5 }).map((_, i) => (
                  <div key={i} className="flex items-center space-x-4 p-2 border-b last:border-0">
                    <div className="flex-1">
                      <Skeleton className="h-4 w-24 mb-1" />
                    </div>
                    <div className="flex-1">
                      <Skeleton className="h-4 w-48 mb-1" />
                    </div>
                    <div className="flex-1">
                      <Skeleton className="h-4 w-32" />
                    </div>
                    <div className="flex-1">
                      <Skeleton className="h-4 w-24" />
                    </div>
                    <div className="flex justify-end">
                      <Skeleton className="h-9 w-24 rounded-md" />
                    </div>
                  </div>
                ))}
              </div>
            </div>
            
            {/* Navigation buttons */}
            <div className="flex justify-between mt-8">
              <Skeleton className="h-10 w-24 rounded-md" />
              <Skeleton className="h-10 w-24 rounded-md" />
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

export function BidParticipationFormSkeleton() {
  return (
    <div className="space-y-6 max-w-3xl mx-auto">
      <div className="bg-blue-50 border border-blue-200 rounded-md p-4 mb-4">
        <div className="flex items-center mb-2">
          <Skeleton className="h-5 w-5 mr-2 rounded" />
          <Skeleton className="h-5 w-32" />
        </div>
        <div className="ml-7">
          <Skeleton className="h-5 w-64 mb-1" />
          <Skeleton className="h-4 w-48" />
        </div>
      </div>

      <div className="grid gap-6">
        <div>
          <Skeleton className="h-4 w-32 mb-2" />
          <Skeleton className="h-10 w-full rounded-md" />
        </div>
        
        <div>
          <Skeleton className="h-4 w-24 mb-2" />
          <Skeleton className="h-32 w-full rounded-md" />
        </div>
      </div>

      <div className="flex justify-between mt-8">
        <Skeleton className="h-10 w-24 rounded-md" />
        <Skeleton className="h-10 w-24 rounded-md" />
      </div>
    </div>
  );
}

export function BidParticipationReviewSkeleton() {
  return (
    <div className="space-y-6 max-w-3xl mx-auto">
      <div className="bg-green-50 border border-green-200 rounded-md p-4 mb-4">
        <Skeleton className="h-5 w-48 mb-2" />
        <Skeleton className="h-4 w-full" />
      </div>

      <div className="space-y-6">
        <div className="border rounded-md p-4">
          <Skeleton className="h-4 w-40 mb-3" />
          <div className="grid grid-cols-2 gap-4">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i}>
                <Skeleton className="h-3 w-24 mb-1" />
                <Skeleton className="h-5 w-32" />
              </div>
            ))}
          </div>
        </div>
        
        <div className="border rounded-md p-4">
          <Skeleton className="h-4 w-40 mb-3" />
          <div className="space-y-2">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="flex justify-between items-center p-2 bg-gray-50 rounded">
                <div>
                  <Skeleton className="h-5 w-32 mb-1" />
                  <Skeleton className="h-3 w-20" />
                </div>
                <div className="text-right">
                  <Skeleton className="h-4 w-32 mb-1" />
                  <Skeleton className="h-3 w-24" />
                </div>
              </div>
            ))}
          </div>
        </div>
        
        <div className="border rounded-md p-4">
          <Skeleton className="h-4 w-40 mb-3" />
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Skeleton className="h-3 w-24 mb-1" />
              <Skeleton className="h-5 w-40" />
            </div>
            <div className="col-span-2">
              <Skeleton className="h-3 w-24 mb-1" />
              <Skeleton className="h-20 w-full rounded-md" />
            </div>
          </div>
        </div>
      </div>

      <div className="flex justify-between mt-8">
        <Skeleton className="h-10 w-24 rounded-md" />
        <Skeleton className="h-10 w-40 rounded-md" />
      </div>
    </div>
  );
}