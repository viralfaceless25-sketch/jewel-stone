export const SERVICE_STATUSES = [
  "received",
  "estimate_sent",
  "approved",
  "in_service",
  "ready",
  "completed",
  "cancelled",
] as const;

export type ServiceStatus = (typeof SERVICE_STATUSES)[number];

export const SERVICE_STATUS_LABELS: Record<ServiceStatus, string> = {
  received: "Received",
  estimate_sent: "Estimate sent",
  approved: "Approved",
  in_service: "In service",
  ready: "Ready",
  completed: "Completed",
  cancelled: "Cancelled",
};

export type ServiceTicket = {
  id: string;
  customerName: string;
  email: string;
  phone: string;
  item: string;
  service: string;
  intakeDate: string;
  dueDate: string;
  estimatedCost: number;
  status: ServiceStatus;
  notes: string;
  createdAt: string;
  updatedAt: string;
};

export type ServiceTicketDraft = Partial<Omit<ServiceTicket, "id" | "createdAt" | "updatedAt">>;
