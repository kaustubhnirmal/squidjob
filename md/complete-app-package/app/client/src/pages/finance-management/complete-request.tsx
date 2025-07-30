import FinanceRequestTable from "@/components/finance/finance-request-table";
import { useUser } from "@/user-context";

export default function CompleteRequestPage() {
  const { currentUser } = useUser();
  
  // Sample data with Completed status
  // In a real app, this would come from an API
  const data = [
    {
      id: 1,
      tenderId: "14370",
      requirement: "EMD",
      paymentMode: "Online",
      amount: "18000",
      requesterName: currentUser?.name || "User",
      financeExecutive: "Sampark Patel",
      requestedDate: "01-12-2024 09:15",
      deadlineDate: "03-12-2024 12:00",
      validity: "01-01-2025 12:00",
      approvalStatus: "Completed"
    },
    {
      id: 2,
      tenderId: "16750",
      requirement: "Fees",
      paymentMode: "Offline",
      amount: "3500",
      requesterName: currentUser?.name || "User",
      financeExecutive: "Palak Shah",
      requestedDate: "30-11-2024 11:30",
      deadlineDate: "02-12-2024 12:00",
      validity: "30-12-2024 12:00",
      approvalStatus: "Completed"
    }
  ];
  
  return (
    <FinanceRequestTable title="Completed Finance Requests" data={data} />
  );
}