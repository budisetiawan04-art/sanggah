import React, { useState, useEffect } from 'react';
import { Employee, Dispute, DisputeStatus } from '../types';
import { getEmployees, saveDispute } from '../services/storage';
import { refineDisputeReason } from '../services/geminiService';
import { Button } from './Button';

export const DisputeSubmission: React.FC = () => {
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [selectedEmpId, setSelectedEmpId] = useState<string>('');
  const [date, setDate] = useState('');
  const [reason, setReason] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  useEffect(() => {
    setEmployees(getEmployees());
  }, []);

  const handleAiAssist = async () => {
    if (!reason.trim() || !selectedEmpId) {
      alert('Mohon pilih pegawai dan isi draft alasan singkat terlebih dahulu.');
      return;
    }
    
    const employee = employees.find(e => e.id === selectedEmpId);
    if (!employee) return;

    setIsGenerating(true);
    const refined = await refineDisputeReason(reason, employee.name, employee.position);
    setReason(refined);
    setIsGenerating(false);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedEmpId || !date || !reason) return;

    const newDispute: Dispute = {
      id: crypto.randomUUID(),
      employeeId: selectedEmpId,
      date,
      reason,
      status: DisputeStatus.PENDING
    };

    saveDispute(newDispute);
    setSubmitted(true);
    setTimeout(() => setSubmitted(false), 3000);
    setReason('');
    setDate('');
  };

  return (
    <div className="max-w-2xl mx-auto">
      <header className="mb-6">
        <h2 className="text-2xl font-bold text-slate-800">Ajukan Sanggah Absen</h2>
        <p className="text-slate-500">Formulir pengajuan koreksi presensi pegawai.</p>
      </header>

      <div className="bg-white rounded-xl shadow-lg border border-slate-200 p-8">
        {submitted ? (
          <div className="text-center py-12">
            <div className="w-16 h-16 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
            </div>
            <h3 className="text-xl font-bold text-slate-800">Pengajuan Terkirim!</h3>
            <p className="text-slate-600">Data sanggah telah disimpan dan menunggu persetujuan pejabat terkait.</p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Nama Pegawai</label>
              <select
                required
                value={selectedEmpId}
                onChange={(e) => setSelectedEmpId(e.target.value)}
                className="w-full border border-slate-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white"
              >
                <option value="">-- Pilih Pegawai --</option>
                {employees.map(emp => (
                  <option key={emp.id} value={emp.id}>{emp.name} - {emp.nip}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Tanggal Absen yang Disanggah</label>
              <input
                type="date"
                required
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full border border-slate-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>

            <div>
              <div className="flex justify-between items-center mb-1">
                <label className="block text-sm font-medium text-slate-700">Alasan Sanggah</label>
                <button
                  type="button"
                  onClick={handleAiAssist}
                  disabled={isGenerating}
                  className="text-xs flex items-center gap-1 text-blue-600 hover:text-blue-800 font-medium bg-blue-50 px-2 py-1 rounded-md transition-colors"
                >
                  {isGenerating ? (
                    <span>✨ Menulis...</span>
                  ) : (
                    <>
                      <span>✨ Perbaiki Bahasa (AI)</span>
                    </>
                  )}
                </button>
              </div>
              <textarea
                required
                rows={5}
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                placeholder="Contoh: Saya lupa absen pulang karena buru-buru ada urusan keluarga mendadak."
                className="w-full border border-slate-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
              <p className="text-xs text-slate-400 mt-1">
                Tips: Tulis alasan singkat, lalu klik tombol AI untuk mengubahnya menjadi bahasa formal yang sopan.
              </p>
            </div>

            <div className="pt-4">
              <Button type="submit" className="w-full text-lg py-3" disabled={isGenerating}>
                Kirim Pengajuan
              </Button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};