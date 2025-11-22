import React, { useState } from 'react';
import { Layout } from './components/Layout';
import { MasterData } from './components/MasterData';
import { DisputeSubmission } from './components/DisputeSubmission';
import { ApprovalList } from './components/ApprovalList';
import { PageView, DisputeStatus } from './types';
import { getEmployees, getDisputes } from './services/storage';

const Dashboard: React.FC = () => {
  const employees = getEmployees();
  const disputes = getDisputes();
  
  const stats = [
    { label: 'Total Pegawai', value: employees.length, color: 'bg-blue-500' },
    { label: 'Menunggu Persetujuan', value: disputes.filter(d => d.status === DisputeStatus.PENDING).length, color: 'bg-yellow-500' },
    { label: 'Disetujui', value: disputes.filter(d => d.status === DisputeStatus.APPROVED).length, color: 'bg-emerald-500' },
    { label: 'Ditolak', value: disputes.filter(d => d.status === DisputeStatus.REJECTED).length, color: 'bg-red-500' },
  ];

  return (
    <div>
      <header className="mb-8">
        <h2 className="text-3xl font-bold text-slate-800">Dashboard</h2>
        <p className="text-slate-500">Ringkasan aktivitas sanggah absen.</p>
      </header>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, idx) => (
          <div key={idx} className="bg-white p-6 rounded-xl shadow-sm border border-slate-100 flex items-center gap-4">
            <div className={`w-12 h-12 rounded-lg ${stat.color} flex items-center justify-center text-white font-bold text-xl shadow-md`}>
              {stat.value}
            </div>
            <div>
              <p className="text-slate-500 text-sm font-medium">{stat.label}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-10">
        <h3 className="text-lg font-semibold text-slate-800 mb-4">Selamat Datang di SanggahPintar</h3>
        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
           <p className="text-slate-600 mb-4">
             Aplikasi ini dirancang untuk memudahkan proses pengajuan dan persetujuan sanggahan absen (koreksi presensi).
           </p>
           <ul className="list-disc list-inside text-slate-600 space-y-2">
             <li>Gunakan menu <span className="font-semibold">Master Data</span> untuk mendaftarkan pegawai dan pejabat penyetuju.</li>
             <li>Pegawai dapat mengajukan sanggah melalui menu <span className="font-semibold">Ajukan Sanggah</span> dengan bantuan AI untuk menyusun kalimat.</li>
             <li>Pejabat melakukan verifikasi melalui menu <span className="font-semibold">Daftar & Persetujuan</span>.</li>
           </ul>
        </div>
      </div>
    </div>
  );
};

const App: React.FC = () => {
  const [page, setPage] = useState<PageView>('dashboard');

  return (
    <Layout currentPage={page} onNavigate={setPage}>
      {page === 'dashboard' && <Dashboard />}
      {page === 'master-data' && <MasterData />}
      {page === 'submit-dispute' && <DisputeSubmission />}
      {page === 'approvals' && <ApprovalList />}
    </Layout>
  );
};

export default App;