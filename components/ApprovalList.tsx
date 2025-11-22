import React, { useState, useEffect } from 'react';
import { Employee, Dispute, DisputeStatus } from '../types';
import { getEmployees, getDisputes, updateDisputeStatus } from '../services/storage';
import { Button } from './Button';

export const ApprovalList: React.FC = () => {
  const [disputes, setDisputes] = useState<Dispute[]>([]);
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [currentApproverId, setCurrentApproverId] = useState<string>('');

  // Derived state
  const approvers = employees.filter(e => e.isApprover);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = () => {
    const allEmployees = getEmployees();
    setEmployees(allEmployees);
    setDisputes(getDisputes().sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()));
    
    // Default select first approver if available
    const firstApprover = allEmployees.find(e => e.isApprover);
    if (firstApprover && !currentApproverId) {
        setCurrentApproverId(firstApprover.id);
    }
  };

  const handleStatusChange = (disputeId: string, status: DisputeStatus) => {
    if (!currentApproverId) {
      alert("Silakan pilih Pejabat Penyetuju (Simulasi Login) terlebih dahulu di pojok kanan atas.");
      return;
    }
    updateDisputeStatus(disputeId, status, currentApproverId);
    loadData();
  };

  const getEmployeeDetails = (id: string) => employees.find(e => e.id === id);

  const handlePrint = (dispute: Dispute) => {
    const employee = getEmployeeDetails(dispute.employeeId);
    const approver = dispute.approverId ? getEmployeeDetails(dispute.approverId) : null;

    if (!employee) return;

    const printWindow = window.open('', '_blank');
    if (!printWindow) {
        alert("Pop-up blocker prevented printing. Please allow pop-ups for this site.");
        return;
    }

    const renderSignature = (emp: Employee | null | undefined) => {
        if (emp && emp.signatureBase64) {
            return `<img src="${emp.signatureBase64}" style="height: 80px; margin: 10px auto; display: block;" alt="Tanda Tangan" />`;
        }
        return `<div style="height: 80px; display: flex; align-items: center; justify-content: center; color: #ccc; font-style: italic;">(Belum ada TTD)</div>`;
    };

    const htmlContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <title>Surat Sanggah Absen - ${employee.name}</title>
        <style>
          body { font-family: 'Times New Roman', serif; padding: 40px; max-width: 800px; margin: 0 auto; }
          .header { text-align: center; margin-bottom: 40px; border-bottom: 2px solid black; padding-bottom: 20px; }
          .header h1 { margin: 0; font-size: 18pt; text-transform: uppercase; }
          .header p { margin: 5px 0 0; font-size: 12pt; }
          .content { font-size: 12pt; line-height: 1.6; margin-bottom: 60px; }
          .row { display: flex; margin-bottom: 10px; }
          .label { width: 180px; font-weight: bold; }
          .value { flex: 1; }
          .reason-box { margin-top: 20px; text-align: justify; }
          .signatures { display: flex; justify-content: space-between; margin-top: 50px; page-break-inside: avoid; }
          .sig-block { text-align: center; width: 45%; }
          .name { font-weight: bold; text-decoration: underline; margin-top: 10px; }
          .nip { font-size: 11pt; }
          @media print {
            @page { margin: 2cm; }
            body { -webkit-print-color-adjust: exact; }
          }
        </style>
      </head>
      <body>
        <div class="header">
          <h1>Surat Pengajuan Sanggah Absen</h1>
        </div>

        <div class="content">
          <p>Yang bertanda tangan di bawah ini:</p>
          <br/>
          <div class="row">
            <span class="label">Nama</span>
            <span class="value">: ${employee.name}</span>
          </div>
          <div class="row">
            <span class="label">NIP</span>
            <span class="value">: ${employee.nip}</span>
          </div>
          <div class="row">
            <span class="label">Jabatan</span>
            <span class="value">: ${employee.position}</span>
          </div>
          <div class="row">
            <span class="label">Tanggal Sanggah</span>
            <span class="value">: ${new Date(dispute.date).toLocaleDateString('id-ID', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</span>
          </div>

          <div class="row">
            <span class="label">Alasan</span><br/>
            <span class="value">: ${dispute.reason}</span>           
          </div>
          
          <p style="margin-top: 20px;">
            Demikian surat sanggah absen ini saya buat dengan sebenar-benarnya untuk dapat dipergunakan sebagaimana mestinya.
          </p>
        </div>

        <div class="signatures">
          <div class="sig-block">
            <p></p>
            <p>Pemohon,</p>
            ${renderSignature(employee)}
            <p class="name">${employee.name}</p>
            <p class="nip">NIP. ${employee.nip}</p>
          </div>
          
          <div class="sig-block">
            <p>Menyetujui,</p>
            <p>${approver ? approver.position : ''}</p>
            ${renderSignature(approver)}
            <p class="name">${approver ? approver.name : '.........................'}</p>
            <p class="nip">${approver ? `NIP. ${approver.nip}` : ''}</p>
          </div>
        </div>

        <script>
          window.onload = function() { window.print(); }
        </script>
      </body>
      </html>
    `;

    printWindow.document.write(htmlContent);
    printWindow.document.close();
  };

  return (
    <div className="space-y-6">
      <header className="flex flex-col md:flex-row md:justify-between md:items-center gap-4 mb-6">
        <div>
          <h2 className="text-2xl font-bold text-slate-800">Daftar & Persetujuan</h2>
          <p className="text-slate-500">Monitor dan tindak lanjuti pengajuan sanggah.</p>
        </div>
        
        {/* Simulation of "Login" as an approver */}
        <div className="flex items-center gap-2 bg-amber-50 p-3 rounded-lg border border-amber-200">
          <span className="text-sm font-bold text-amber-800">Simulasi Login Pejabat:</span>
          <select 
            className="bg-white border border-amber-300 text-sm rounded px-2 py-1"
            value={currentApproverId}
            onChange={(e) => setCurrentApproverId(e.target.value)}
          >
            {approvers.map(appr => (
              <option key={appr.id} value={appr.id}>{appr.name}</option>
            ))}
            {approvers.length === 0 && <option value="">Tidak ada Pejabat (Set di Master Data)</option>}
          </select>
        </div>
      </header>

      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
        <table className="w-full text-sm text-left text-slate-500">
          <thead className="text-xs text-slate-700 uppercase bg-slate-50 border-b">
            <tr>
              <th className="px-6 py-3">Tanggal</th>
              <th className="px-6 py-3">Pegawai</th>
              <th className="px-6 py-3">Alasan</th>
              <th className="px-6 py-3">Status</th>
              <th className="px-6 py-3">Oleh (Pejabat)</th>
              <th className="px-6 py-3 text-center">Aksi</th>
            </tr>
          </thead>
          <tbody>
            {disputes.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-6 py-12 text-center text-slate-400">Belum ada pengajuan sanggah.</td>
              </tr>
            ) : (
              disputes.map((dispute) => {
                const emp = getEmployeeDetails(dispute.employeeId);
                const approver = dispute.approverId ? getEmployeeDetails(dispute.approverId) : null;

                return (
                  <tr key={dispute.id} className="bg-white border-b hover:bg-slate-50">
                    <td className="px-6 py-4 whitespace-nowrap font-medium text-slate-900">{dispute.date}</td>
                    <td className="px-6 py-4">
                      <div className="font-medium text-slate-800">{emp?.name || 'Unknown'}</div>
                      <div className="text-xs text-slate-500">{emp?.nip}</div>
                    </td>
                    <td className="px-6 py-4">
                        <div className="max-w-xs truncate" title={dispute.reason}>
                            {dispute.reason}
                        </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-2 py-1 rounded text-xs font-semibold border ${
                        dispute.status === DisputeStatus.APPROVED ? 'bg-green-100 text-green-700 border-green-300' :
                        dispute.status === DisputeStatus.REJECTED ? 'bg-red-100 text-red-700 border-red-300' :
                        'bg-yellow-100 text-yellow-700 border-yellow-300'
                      }`}>
                        {dispute.status}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      {approver ? (
                        <div className="flex flex-col items-start gap-1">
                          <span className="text-xs font-medium">{approver.name}</span>
                          {approver.signatureBase64 && dispute.status === DisputeStatus.APPROVED && (
                             <img src={approver.signatureBase64} alt="Sig" className="h-8 w-auto opacity-80" />
                          )}
                        </div>
                      ) : '-'}
                    </td>
                    <td className="px-6 py-4">
                      {dispute.status === DisputeStatus.PENDING ? (
                        <div className="flex justify-center gap-2">
                           <Button 
                            variant="success" 
                            className="!px-2 !py-1 text-xs"
                            onClick={() => handleStatusChange(dispute.id, DisputeStatus.APPROVED)}
                           >
                             Setuju
                           </Button>
                           <Button 
                            variant="danger" 
                            className="!px-2 !py-1 text-xs"
                            onClick={() => handleStatusChange(dispute.id, DisputeStatus.REJECTED)}
                           >
                             Tolak
                           </Button>
                        </div>
                      ) : (
                        <div className="flex flex-col items-center gap-2">
                            <span className="text-xs text-slate-400 italic">Selesai</span>
                            {dispute.status === DisputeStatus.APPROVED && (
                                <button 
                                    onClick={() => handlePrint(dispute)}
                                    className="flex items-center gap-1 text-blue-600 hover:text-blue-800 text-xs font-medium border border-blue-200 px-2 py-1 rounded bg-blue-50 hover:bg-blue-100 transition-colors"
                                >
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
                                    </svg>
                                    Cetak PDF
                                </button>
                            )}
                        </div>
                      )}
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};