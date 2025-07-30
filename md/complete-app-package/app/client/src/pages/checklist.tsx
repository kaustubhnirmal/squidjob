import React from "react";
import { CheckListSettings } from "@/components/settings/checklist-settings";

export default function ChecklistPage() {
  return (
    <div className="p-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Checklist</h1>
      </div>
      
      <CheckListSettings />
    </div>
  );
}