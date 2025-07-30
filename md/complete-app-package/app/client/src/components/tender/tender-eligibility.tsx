import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { EligibilityCriteria } from "@/types";

interface TenderEligibilityProps {
  criteria: EligibilityCriteria[];
  loading?: boolean;
  onGenerateAI?: () => void;
}

export function TenderEligibility({ criteria, loading = false, onGenerateAI }: TenderEligibilityProps) {
  return (
    <Card>
      <CardHeader className="px-5 py-4 border-b border-gray-200 flex flex-wrap justify-between items-center">
        <CardTitle className="text-lg font-medium text-gray-800">Eligibility Criteria</CardTitle>
        <div className="flex items-center">
          {criteria.length > 0 && criteria[0].isAiGenerated && (
            <span className="text-xs bg-primary-100 text-primary-800 px-2 py-1 rounded-full mr-2">AI Extracted</span>
          )}
          {onGenerateAI && (
            <Button size="sm" onClick={onGenerateAI}>
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M12 2v4m0 12v4M6 12H2m20 0h-4m2.247-7.753l-2.828 2.828m-8.838 8.838l-2.828 2.828m2.828-14.494l-2.828-2.828m14.494 14.494l-2.828-2.828" />
              </svg>
              Generate AI Criteria
            </Button>
          )}
        </div>
      </CardHeader>
      <CardContent className="p-5">
        {loading ? (
          <div className="flex justify-center py-10">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        ) : criteria.length === 0 ? (
          <div className="text-center py-10">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 mx-auto text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            <h3 className="mt-2 text-sm font-medium text-gray-900">No eligibility criteria available</h3>
            <p className="mt-1 text-sm text-gray-500">Generate eligibility criteria using AI or add it manually.</p>
            {onGenerateAI && (
              <div className="mt-6">
                <Button onClick={onGenerateAI}>
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M12 2v4m0 12v4M6 12H2m20 0h-4m2.247-7.753l-2.828 2.828m-8.838 8.838l-2.828 2.828m2.828-14.494l-2.828-2.828m14.494 14.494l-2.828-2.828" />
                  </svg>
                  Generate AI Criteria
                </Button>
              </div>
            )}
          </div>
        ) : (
          <div className="space-y-4">
            {criteria.map((item) => (
              <div key={item.id} className="border border-gray-200 rounded-md">
                <div className="px-4 py-4 sm:px-6">
                  <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
                    <div className="col-span-2 lg:col-span-1">
                      <h4 className="font-medium text-gray-800">{item.category || 'Criteria'}</h4>
                    </div>
                    <div className="col-span-2 lg:col-span-4">
                      <p className="text-sm text-gray-700">{item.criteria}</p>
                    </div>
                  </div>
                </div>
              </div>
            ))}
            
            <div className="mt-6 flex justify-end">
              <Button variant="outline">
                Download Full Eligibility Document
              </Button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
