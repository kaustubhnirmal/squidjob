import FinanceRequestTable from "@/components/finance/finance-request-table";
import { useUser } from "@/user-context";

export default function DeniedRequestPage() {
  const { currentUser } = useUser();
  
  // Sample data with Denied status
  // In a real app, this would come from an API
  const data = [
    {
      id: 1,
      tenderId: "14372",
      requirement: "EMD",
      paymentMode: "Online",
      amount: "22500",
      requesterName: currentUser?.name || "User",
      financeExecutive: "Sampark Patel",
      requestedDate: "03-12-2024 14:30",
      deadlineDate: "06-12-2024 12:00",
      validity: "05-01-2025 12:00",
      approvalStatus: "Denied"
    },
    {
      id: 2,
      tenderId: "16752",
      requirement: "Security Deposit",
      paymentMode: "Offline",
      amount: "7500",
      requesterName: currentUser?.name || "User",
      financeExecutive: "Palak Shah",
      requestedDate: "01-12-2024 10:20",
      deadlineDate: "05-12-2024 12:00",
      validity: "03-01-2025 12:00",
      approvalStatus: "Denied"
    }
  ];
  
  return (
    <FinanceRequestTable title="Denied Finance Requests" data={data} />
  );
}