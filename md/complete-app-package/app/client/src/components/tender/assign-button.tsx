import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Users } from "lucide-react";
import { TenderAssignDialog } from "./tender-assign-dialog";

interface AssignButtonProps {
  tenderId: number;
  tenderReferenceNo: string;
  className?: string;
  variant?: "default" | "outline" | "ghost";
  size?: "sm" | "default" | "lg";
}

export function AssignButton({ 
  tenderId, 
  tenderReferenceNo, 
  className,
  variant = "outline",
  size = "sm"
}: AssignButtonProps) {
  const [isAssignDialogOpen, setIsAssignDialogOpen] = useState(false);

  return (
    <>
      <Button
        variant={variant}
        size={size}
        onClick={() => setIsAssignDialogOpen(true)}
        className={className}
      >
        <Users className="h-4 w-4" />
        Assign
      </Button>

      <TenderAssignDialog
        isOpen={isAssignDialogOpen}
        onClose={() => setIsAssignDialogOpen(false)}
        tenderId={tenderId}
        tenderReferenceNo={tenderReferenceNo}
      />
    </>
  );
}