import FinanceRequestTable from "@/components/finance/finance-request-table";

export default function NewRequestPage() {
  // Empty data array - in a real app, this would be populated from an API call
  const data: any[] = [];
  
  return (
    <FinanceRequestTable title="New Finance Requests" data={data} />
  );
}