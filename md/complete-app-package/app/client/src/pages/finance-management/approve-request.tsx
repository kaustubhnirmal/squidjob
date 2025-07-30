import FinanceRequestTable from "@/components/finance/finance-request-table";
import { useUser } from "@/user-context";

export default function ApproveRequestPage() {
  const { currentUser } = useUser();
  
  // In a real app, this would come from an API
  const data = [
    {
      id: 1,
      tenderId: "14371",
      requirement: "EMD",
      paymentMode: "Online",
      amount: "13500",
      requesterName: currentUser?.name || "User",
      financeExecutive: "Sampark Patel",
      requestedDate: "04-12-2024 18:00",
      deadlineDate: "05-12-2024 12:00",
      validity: "02-01-2025 12:00",
      approvalStatus: "Pending"
    },
    {
      id: 2,
      tenderId: "16751",
      requirement: "EMD",
      paymentMode: "Offline",
      amount: "5000",
      requesterName: currentUser?.name || "User",
      financeExecutive: "Palak Shah",
      requestedDate: "02-12-2024 15:44",
      deadlineDate: "06-12-2024 12:00",
      validity: "02-01-2025 12:00",
      approvalStatus: "Self Approved"
    }
  ];
  
  return (
    <FinanceRequestTable title="Approve Finance Requests" data={data} />
  );
}