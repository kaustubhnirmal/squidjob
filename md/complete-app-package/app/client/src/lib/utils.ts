import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";
import { format, isToday, isTomorrow, isYesterday } from "date-fns";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatCurrency(amount: number | null | undefined): string {
  if (amount === null || amount === undefined) return "N/A";
  
  // Format as Indian Rupees (₹)
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(amount);
}

export function formatDeadline(date: Date | string | null | undefined): string {
  if (!date) return "N/A";
  
  const dateObj = typeof date === "string" ? new Date(date) : date;
  
  if (isToday(dateObj)) {
    return `Today, ${format(dateObj, "h:mm a")}`;
  } else if (isTomorrow(dateObj)) {
    return `Tomorrow, ${format(dateObj, "h:mm a")}`;
  } else if (isYesterday(dateObj)) {
    return `Yesterday, ${format(dateObj, "h:mm a")}`;
  } else {
    return format(dateObj, "dd/MM/yyyy, h:mm a");
  }
}

export function formatTime(date: Date | string | null | undefined): string {
  if (!date) return "N/A";
  
  const dateObj = typeof date === "string" ? new Date(date) : date;
  return format(dateObj, "h:mm a");
}

export function formatDate(date: Date | string | null | undefined): string {
  if (!date) return "N/A";
  
  const dateObj = typeof date === "string" ? new Date(date) : date;
  
  if (isToday(dateObj)) {
    return "Today";
  } else if (isTomorrow(dateObj)) {
    return "Tomorrow";
  } else if (isYesterday(dateObj)) {
    return "Yesterday";
  } else {
    return format(dateObj, "dd/MM/yyyy");
  }
}

export function getStatusBadgeClass(status: string): string {
  switch (status.toLowerCase()) {
    case "new":
      return "status-badge status-badge-new";
    case "in-process":
    case "in process":
      return "status-badge status-badge-in-process";
    case "submitted":
    case "ready":
    case "accepted":
      return "status-badge status-badge-submitted";
    case "awarded":
      return "status-badge status-badge-awarded";
    case "rejected":
      return "status-badge status-badge-rejected";
    default:
      return "status-badge bg-gray-100 text-gray-800";
  }
}

export function truncate(text: string, length: number): string {
  if (!text) return "";
  if (text.length <= length) return text;
  
  return text.slice(0, length) + "...";
}
