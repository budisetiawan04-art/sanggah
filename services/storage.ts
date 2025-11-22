import { Employee, Dispute, DisputeStatus } from '../types';

const EMPLOYEES_KEY = 'sp_employees';
const DISPUTES_KEY = 'sp_disputes';

// Seed data if empty
const seedData = () => {
  if (!localStorage.getItem(EMPLOYEES_KEY)) {
    const dummyEmployees: Employee[] = [
      {
        id: '1',
        name: 'Budi Santoso',
        nip: '198501012010011001',
        position: 'Kepala Bagian Umum',
        signatureBase64: null,
        isApprover: true,
      },
      {
        id: '2',
        name: 'Siti Aminah',
        nip: '199005152015032005',
        position: 'Staf Administrasi',
        signatureBase64: null,
        isApprover: false,
      }
    ];
    localStorage.setItem(EMPLOYEES_KEY, JSON.stringify(dummyEmployees));
  }
};

seedData();

export const getEmployees = (): Employee[] => {
  const data = localStorage.getItem(EMPLOYEES_KEY);
  return data ? JSON.parse(data) : [];
};

export const saveEmployee = (employee: Employee) => {
  const employees = getEmployees();
  const index = employees.findIndex(e => e.id === employee.id);
  if (index >= 0) {
    employees[index] = employee;
  } else {
    employees.push(employee);
  }
  localStorage.setItem(EMPLOYEES_KEY, JSON.stringify(employees));
};

export const deleteEmployee = (id: string) => {
  const employees = getEmployees().filter(e => e.id !== id);
  localStorage.setItem(EMPLOYEES_KEY, JSON.stringify(employees));
};

export const getDisputes = (): Dispute[] => {
  const data = localStorage.getItem(DISPUTES_KEY);
  return data ? JSON.parse(data) : [];
};

export const saveDispute = (dispute: Dispute) => {
  const disputes = getDisputes();
  const index = disputes.findIndex(d => d.id === dispute.id);
  if (index >= 0) {
    disputes[index] = dispute;
  } else {
    disputes.push(dispute);
  }
  localStorage.setItem(DISPUTES_KEY, JSON.stringify(disputes));
};

export const updateDisputeStatus = (disputeId: string, status: DisputeStatus, approverId: string) => {
  const disputes = getDisputes();
  const index = disputes.findIndex(d => d.id === disputeId);
  if (index >= 0) {
    disputes[index] = {
      ...disputes[index],
      status,
      approverId,
      approvedAt: new Date().toISOString()
    };
    localStorage.setItem(DISPUTES_KEY, JSON.stringify(disputes));
  }
};

// Fitur Backup & Restore JSON
export const backupData = (): string => {
  const data = {
    employees: getEmployees(),
    disputes: getDisputes(),
    exportedAt: new Date().toISOString(),
    version: '1.0'
  };
  return JSON.stringify(data, null, 2);
};

export const restoreData = (jsonString: string): boolean => {
  try {
    const data = JSON.parse(jsonString);
    
    // Validasi sederhana
    if (!data.employees || !Array.isArray(data.employees)) {
      throw new Error("Format JSON tidak valid: data pegawai hilang.");
    }

    localStorage.setItem(EMPLOYEES_KEY, JSON.stringify(data.employees));
    
    if (data.disputes && Array.isArray(data.disputes)) {
      localStorage.setItem(DISPUTES_KEY, JSON.stringify(data.disputes));
    }
    
    return true;
  } catch (error) {
    console.error("Gagal restore data:", error);
    return false;
  }
};