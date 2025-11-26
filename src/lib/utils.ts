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
      return "badge requested";
    case "ManagerApproved":
      return "badge approved";
    case "ManagerRejected":
      return "badge rejected";
    case "TransportAssigned":
      return "badge assigned";
    case "InProgress":
      return "badge assigned"; // Reusing assigned for InProgress as gold is not defined
    case "Completed":
      return "badge requested"; // Reusing requested for Completed as dark is not defined
    default:
      return "badge";
  }
}
