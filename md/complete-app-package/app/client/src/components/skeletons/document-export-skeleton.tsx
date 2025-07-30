import { Skeleton } from "@/components/ui/skeleton";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

export function DocumentExportSkeleton() {
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
          <div className="space-y-8">
            {/* Selection Controls */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="space-y-2">
                <Skeleton className="h-4 w-32 mb-1" />
                <Skeleton className="h-10 w-full rounded-md" />
              </div>
              <div className="space-y-2">
                <Skeleton className="h-4 w-36 mb-1" />
                <Skeleton className="h-10 w-full rounded-md" />
              </div>
              <div className="space-y-2">
                <Skeleton className="h-4 w-28 mb-1" />
                <Skeleton className="h-10 w-full rounded-md" />
              </div>
            </div>
            
            {/* Document Table */}
            <div className="border rounded-md overflow-hidden">
              <Table>
                <TableHeader>
                  <TableRow className="bg-[#0076a8] text-white hover:bg-[#005e86]">
                    <TableHead className="text-white w-10">
                      <Skeleton className="h-4 w-4 bg-white/30" />
                    </TableHead>
                    <TableHead className="text-white">
                      <Skeleton className="h-4 w-32 bg-white/30" />
                    </TableHead>
                    <TableHead className="text-white">
                      <Skeleton className="h-4 w-24 bg-white/30" />
                    </TableHead>
                    <TableHead className="text-white">
                      <Skeleton className="h-4 w-32 bg-white/30" />
                    </TableHead>
                    <TableHead className="text-white">
                      <Skeleton className="h-4 w-24 bg-white/30" />
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {Array.from({ length: 6 }).map((_, index) => (
                    <TableRow key={index}>
                      <TableCell>
                        <Skeleton className="h-4 w-4" />
                      </TableCell>
                      <TableCell>
                        <Skeleton className="h-4 w-40" />
                      </TableCell>
                      <TableCell>
                        <Skeleton className="h-4 w-24" />
                      </TableCell>
                      <TableCell>
                        <Skeleton className="h-4 w-32" />
                      </TableCell>
                      <TableCell>
                        <Skeleton className="h-4 w-24" />
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
            
            {/* Preview Section */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="md:col-span-2">
                <Card>
                  <CardHeader>
                    <Skeleton className="h-5 w-32" />
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center justify-center h-[400px] border-2 border-dashed rounded-md">
                      <div className="text-center space-y-3">
                        <Skeleton className="h-12 w-12 rounded-full mx-auto" />
                        <Skeleton className="h-4 w-40 mx-auto" />
                        <Skeleton className="h-3 w-64 mx-auto" />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
              
              <div>
                <Card>
                  <CardHeader>
                    <Skeleton className="h-5 w-32" />
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div className="space-y-2">
                      <Skeleton className="h-4 w-24 mb-1" />
                      <Skeleton className="h-10 w-full rounded-md" />
                    </div>
                    
                    <div className="space-y-2">
                      <Skeleton className="h-4 w-32 mb-1" />
                      <Skeleton className="h-20 w-full rounded-md" />
                    </div>
                    
                    <div className="space-y-4">
                      <Skeleton className="h-4 w-48 mb-1" />
                      <div className="flex space-x-2">
                        <Skeleton className="h-8 w-8 rounded-md" />
                        <Skeleton className="h-8 w-8 rounded-md" />
                        <Skeleton className="h-8 w-8 rounded-md" />
                      </div>
                    </div>
                    
                    <Skeleton className="h-10 w-full rounded-md" />
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

export function DocumentExportCompactSkeleton() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>
          <Skeleton className="h-6 w-48" />
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex space-x-2">
              <Skeleton className="h-9 w-24 rounded-md" />
              <Skeleton className="h-9 w-24 rounded-md" />
            </div>
            <Skeleton className="h-9 w-32 rounded-md" />
          </div>
          
          <div className="border rounded-md p-4">
            <div className="flex flex-col space-y-2">
              {Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className="flex items-center justify-between p-2 border-b last:border-0">
                  <Skeleton className="h-4 w-48" />
                  <Skeleton className="h-8 w-8 rounded-full" />
                </div>
              ))}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}