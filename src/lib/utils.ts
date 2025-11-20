import { format } from "date-fns";

export function fmtDateTime(d: string | Date) {
  try {
    return format(new Date(d), "yyyy-MM-dd HH:mm");
  } catch {
    return String(d);
  }
}

export function badgeClass(status: string) {
  // Tiny style hook for status chips
  switch (status) {
    case "Requested":
      return "badge badge-gray";
    case "ManagerApproved":
      return "badge badge-green";
    case "ManagerRejected":
      return "badge badge-red";
    case "TransportAssigned":
      return "badge badge-blue";
    case "InProgress":
      return "badge badge-gold";
    case "Completed":
      return "badge badge-dark";
    default:
      return "badge";
  }
}
