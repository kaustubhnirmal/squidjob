import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

export function TenderTableSkeleton() {
  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Reference No.</TableHead>
          <TableHead>Title</TableHead>
          <TableHead>Organization</TableHead>
          <TableHead>Submission Deadline</TableHead>
          <TableHead className="text-right">Action</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {Array.from({ length: 5 }).map((_, index) => (
          <TableRow key={index}>
            <TableCell><Skeleton className="h-4 w-24" /></TableCell>
            <TableCell><Skeleton className="h-4 w-48" /></TableCell>
            <TableCell><Skeleton className="h-4 w-32" /></TableCell>
            <TableCell><Skeleton className="h-4 w-24" /></TableCell>
            <TableCell className="text-right">
              <Skeleton className="h-8 w-24 ml-auto" />
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}

export function CompanyTableSkeleton() {
  return (
    <Table>
      <TableHeader>
        <TableRow className="bg-gray-100">
          <TableHead className="w-12"></TableHead>
          <TableHead>Company Name</TableHead>
          <TableHead>Type</TableHead>
          <TableHead>Email</TableHead>
          <TableHead>Phone</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {Array.from({ length: 5 }).map((_, index) => (
          <TableRow key={index}>
            <TableCell>
              <div className="flex items-center justify-center">
                <Skeleton className="h-4 w-4 rounded" />
              </div>
            </TableCell>
            <TableCell><Skeleton className="h-4 w-40" /></TableCell>
            <TableCell><Skeleton className="h-6 w-16 rounded-sm" /></TableCell>
            <TableCell><Skeleton className="h-4 w-32" /></TableCell>
            <TableCell><Skeleton className="h-4 w-24" /></TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}

export function TenderCardSkeleton() {
  return (
    <div className="bg-blue-50 border border-blue-200 rounded-md p-4 mb-4">
      <div className="flex items-center mb-2">
        <Skeleton className="h-5 w-5 mr-2 rounded-full" />
        <Skeleton className="h-5 w-32" />
      </div>
      <div className="ml-7">
        <Skeleton className="h-4 w-64 mb-2" />
        <Skeleton className="h-4 w-48" />
      </div>
    </div>
  );
}

export function ReviewCompanySkeleton() {
  return (
    <div className="space-y-2">
      {Array.from({ length: 3 }).map((_, index) => (
        <div key={index} className="flex justify-between items-center p-2 bg-gray-50 rounded">
          <div>
            <Skeleton className="h-4 w-40 mb-2" />
            <Skeleton className="h-3 w-24" />
          </div>
          <div>
            <Skeleton className="h-3 w-32 mb-1" />
            <Skeleton className="h-3 w-24" />
          </div>
        </div>
      ))}
    </div>
  );
}