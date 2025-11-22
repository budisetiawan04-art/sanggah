export interface Employee {
  id: string;
  name: string;
  nip: string;
  position: string;
  signatureBase64: string | null;
  isApprover: boolean;
}

export enum DisputeStatus {
  PENDING = 'Menunggu',
  APPROVED = 'Disetujui',
  REJECTED = 'Ditolak',
}

export interface Dispute {
  id: string;
  employeeId: string;
  date: string; // YYYY-MM-DD
  reason: string;
  status: DisputeStatus;
  approverId?: string; // ID of the employee who approved/rejected
  approvedAt?: string;
}

export type PageView = 'dashboard' | 'master-data' | 'submit-dispute' | 'approvals';