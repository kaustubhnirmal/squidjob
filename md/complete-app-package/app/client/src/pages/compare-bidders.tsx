import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CompareForm } from "@/components/compare/compare-form";
import { Competitor } from "@/types";
import { useQuery } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";

interface CompareData {
  company1?: {
    id: number;
    name: string;
    tendersParticipated: number;
    tendersAwarded: number;
    tendersLost: number;
    winRate: string;
    strongCategories: string[];
  };
  company2?: {
    id: number;
    name: string;
    tendersParticipated: number;
    tendersAwarded: number;
    tendersLost: number;
    winRate: string;
    strongCategories: string[];
  };
}

export default function CompareBidders() {
  const { toast } = useToast();
  const [compareData, setCompareData] = React.useState<CompareData>({});

  // Fetch competitors
  const { data: competitors } = useQuery<Competitor[]>({
    queryKey: ["/api/competitors"],
  });

  const handleCompare = (company1Id: number, company2Id: number) => {
    if (!competitors) return;
    
    const company1 = competitors.find(c => c.id === company1Id);
    const company2 = competitors.find(c => c.id === company2Id);
    
    if (!company1 || !company2) {
      toast({
        title: "Error",
        description: "One or both companies not found",
        variant: "destructive",
      });
      return;
    }
    
    // In a real app, we would fetch detailed comparison data from the API
    // For this demo, we'll use the data we already have
    setCompareData({
      company1: {
        id: company1.id,
        name: company1.name,
        tendersParticipated: company1.participatedTenders,
        tendersAwarded: company1.awardedTenders,
        tendersLost: company1.lostTenders,
        winRate: ((company1.awardedTenders / company1.participatedTenders) * 100).toFixed(1) + "%",
        strongCategories: company1.category ? [company1.category] : ["Construction", "Civil Works"]
      },
      company2: {
        id: company2.id,
        name: company2.name,
        tendersParticipated: company2.participatedTenders,
        tendersAwarded: company2.awardedTenders,
        tendersLost: company2.lostTenders,
        winRate: ((company2.awardedTenders / company2.participatedTenders) * 100).toFixed(1) + "%",
        strongCategories: company2.category ? [company2.category] : ["Electrical", "Mechanical"]
      }
    });
  };

  return (
    <main className="flex-1 p-4 sm:p-6 lg:p-8 bg-gray-100">
      <div className="mb-6">
        <h1 className="text-2xl font-semibold text-gray-800">Compare Bidders</h1>
        <p className="text-sm text-gray-600 mt-1">
          Compare performance metrics between different bidders
        </p>
      </div>

      <Card className="mb-6">
        <CardHeader className="px-5 py-4 border-b border-gray-200">
          <CardTitle className="text-lg font-medium text-gray-800">Companies Compare</CardTitle>
        </CardHeader>
        <CardContent className="p-5">
          <CompareForm 
            competitors={competitors || []} 
            onCompare={handleCompare} 
          />
        </CardContent>
      </Card>

      {(compareData.company1 && compareData.company2) && (
        <Card>
          <CardHeader className="px-5 py-4 border-b border-gray-200">
            <CardTitle className="text-lg font-medium text-gray-800">Comparison Results</CardTitle>
          </CardHeader>
          <CardContent className="p-5">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-green-50 border border-green-100 rounded-md p-4">
                <h3 className="text-lg font-medium text-green-800 mb-3">{compareData.company1.name}</h3>
                <div className="space-y-3">
                  <div className="flex justify-between border-b border-green-100 pb-2">
                    <span className="text-sm text-gray-600">Tenders Participated</span>
                    <span className="text-sm font-medium text-gray-900">{compareData.company1.tendersParticipated}</span>
                  </div>
                  <div className="flex justify-between border-b border-green-100 pb-2">
                    <span className="text-sm text-gray-600">Tenders Awarded</span>
                    <span className="text-sm font-medium text-gray-900">{compareData.company1.tendersAwarded}</span>
                  </div>
                  <div className="flex justify-between border-b border-green-100 pb-2">
                    <span className="text-sm text-gray-600">Tenders Lost</span>
                    <span className="text-sm font-medium text-gray-900">{compareData.company1.tendersLost}</span>
                  </div>
                  <div className="flex justify-between border-b border-green-100 pb-2">
                    <span className="text-sm text-gray-600">Win Rate</span>
                    <span className="text-sm font-medium text-gray-900">{compareData.company1.winRate}</span>
                  </div>
                  <div>
                    <span className="text-sm text-gray-600 block mb-1">Strong Categories</span>
                    <div className="flex flex-wrap gap-1">
                      {compareData.company1.strongCategories.map((category, index) => (
                        <span key={index} className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                          {category}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-blue-50 border border-blue-100 rounded-md p-4">
                <h3 className="text-lg font-medium text-blue-800 mb-3">{compareData.company2.name}</h3>
                <div className="space-y-3">
                  <div className="flex justify-between border-b border-blue-100 pb-2">
                    <span className="text-sm text-gray-600">Tenders Participated</span>
                    <span className="text-sm font-medium text-gray-900">{compareData.company2.tendersParticipated}</span>
                  </div>
                  <div className="flex justify-between border-b border-blue-100 pb-2">
                    <span className="text-sm text-gray-600">Tenders Awarded</span>
                    <span className="text-sm font-medium text-gray-900">{compareData.company2.tendersAwarded}</span>
                  </div>
                  <div className="flex justify-between border-b border-blue-100 pb-2">
                    <span className="text-sm text-gray-600">Tenders Lost</span>
                    <span className="text-sm font-medium text-gray-900">{compareData.company2.tendersLost}</span>
                  </div>
                  <div className="flex justify-between border-b border-blue-100 pb-2">
                    <span className="text-sm text-gray-600">Win Rate</span>
                    <span className="text-sm font-medium text-gray-900">{compareData.company2.winRate}</span>
                  </div>
                  <div>
                    <span className="text-sm text-gray-600 block mb-1">Strong Categories</span>
                    <div className="flex flex-wrap gap-1">
                      {compareData.company2.strongCategories.map((category, index) => (
                        <span key={index} className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                          {category}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="mt-6 bg-gray-50 p-4 rounded-md">
              <h3 className="text-lg font-medium text-gray-800 mb-3">Head-to-Head Comparison</h3>
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-100">
                    <tr>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Metric</th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-green-600 uppercase tracking-wider">{compareData.company1.name}</th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-blue-600 uppercase tracking-wider">{compareData.company2.name}</th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Better Performer</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    <tr>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">Participation</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{compareData.company1.tendersParticipated}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{compareData.company2.tendersParticipated}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {compareData.company1.tendersParticipated > compareData.company2.tendersParticipated ? (
                          <span className="text-green-600 font-medium">{compareData.company1.name}</span>
                        ) : compareData.company2.tendersParticipated > compareData.company1.tendersParticipated ? (
                          <span className="text-blue-600 font-medium">{compareData.company2.name}</span>
                        ) : (
                          <span className="text-gray-500">Equal</span>
                        )}
                      </td>
                    </tr>
                    <tr>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">Win Rate</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{compareData.company1.winRate}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{compareData.company2.winRate}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {parseFloat(compareData.company1.winRate) > parseFloat(compareData.company2.winRate) ? (
                          <span className="text-green-600 font-medium">{compareData.company1.name}</span>
                        ) : parseFloat(compareData.company2.winRate) > parseFloat(compareData.company1.winRate) ? (
                          <span className="text-blue-600 font-medium">{compareData.company2.name}</span>
                        ) : (
                          <span className="text-gray-500">Equal</span>
                        )}
                      </td>
                    </tr>
                    <tr>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">Awards Count</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{compareData.company1.tendersAwarded}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{compareData.company2.tendersAwarded}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {compareData.company1.tendersAwarded > compareData.company2.tendersAwarded ? (
                          <span className="text-green-600 font-medium">{compareData.company1.name}</span>
                        ) : compareData.company2.tendersAwarded > compareData.company1.tendersAwarded ? (
                          <span className="text-blue-600 font-medium">{compareData.company2.name}</span>
                        ) : (
                          <span className="text-gray-500">Equal</span>
                        )}
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </main>
  );
}
