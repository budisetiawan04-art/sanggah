import React, { useState, useEffect } from 'react';
import { Employee } from '../types';
import { getEmployees, saveEmployee, deleteEmployee, backupData, restoreData } from '../services/storage';
import { Button } from './Button';

export const MasterData: React.FC = () => {
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState<Partial<Employee>>({
    name: '',
    nip: '',
    position: '',
    isApprover: false,
    signatureBase64: null
  });

  useEffect(() => {
    loadEmployees();
  }, []);

  const loadEmployees = () => {
    setEmployees(getEmployees());
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setFormData(prev => ({ ...prev, signatureBase64: reader.result as string }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.nip || !formData.position) return;

    const newEmployee: Employee = {
      id: formData.id || crypto.randomUUID(),
      name: formData.name,
      nip: formData.nip,
      position: formData.position,
      isApprover: formData.isApprover || false,
      signatureBase64: formData.signatureBase64 || null
    };

    saveEmployee(newEmployee);
    loadEmployees();
    resetForm();
  };

  const handleEdit = (employee: Employee) => {
    setFormData(employee);
    setIsEditing(true);
  };

  const handleDelete = (id: string) => {
    if (window.confirm('Yakin ingin menghapus data ini?')) {
      deleteEmployee(id);
      loadEmployees();
    }
  };

  const resetForm = () => {
    setFormData({ name: '', nip: '', position: '', isApprover: false, signatureBase64: null });
    setIsEditing(false);
  };

  // JSON Backup Handlers
  const handleDownloadBackup = () => {
    const jsonString = backupData();
    const blob = new Blob([jsonString], { type: 'application/json' });
    const href = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = href;
    link.download = `sanggah_pintar_backup_${new Date().toISOString().slice(0,10)}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleRestoreBackup = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      if (restoreData(content)) {
        alert('Data berhasil dipulihkan dari file JSON!');
        loadEmployees(); // Refresh view
      } else {
        alert('Gagal memproses file. Pastikan format JSON benar.');
      }
    };
    reader.readAsText(file);
    // Reset input value so same file can be selected again if needed
    e.target.value = ''; 
  };

  return (
    <div className="space-y-8 pb-10">
      <header className="mb-6">
        <h2 className="text-2xl font-bold text-slate-800">Master Data Pegawai</h2>
        <p className="text-slate-500">Kelola data pegawai, jabatan, dan tanda tangan digital.</p>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Form Section */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 sticky top-4">
            <h3 className="text-lg font-semibold mb-4 border-b pb-2">
              {isEditing ? 'Edit Pegawai' : 'Tambah Pegawai Baru'}
            </h3>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Nama Lengkap</label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full border border-slate-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">NIP</label>
                <input
                  type="text"
                  required
                  value={formData.nip}
                  onChange={(e) => setFormData({ ...formData, nip: e.target.value })}
                  className="w-full border border-slate-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Jabatan</label>
                <input
                  type="text"
                  required
                  value={formData.position}
                  onChange={(e) => setFormData({ ...formData, position: e.target.value })}
                  className="w-full border border-slate-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Upload Tanda Tangan (Image)</label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleFileChange}
                  className="w-full text-sm text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                />
                {formData.signatureBase64 && (
                  <div className="mt-2 p-2 border rounded bg-slate-50">
                    <p className="text-xs text-slate-500 mb-1">Preview:</p>
                    <img src={formData.signatureBase64} alt="Signature Preview" className="h-16 object-contain" />
                  </div>
                )}
              </div>

              <div className="flex items-center gap-2 py-2">
                <input
                  type="checkbox"
                  id="isApprover"
                  checked={formData.isApprover}
                  onChange={(e) => setFormData({ ...formData, isApprover: e.target.checked })}
                  className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                />
                <label htmlFor="isApprover" className="text-sm font-medium text-slate-700">
                  Pejabat Penyetuju? (Approver)
                </label>
              </div>

              <div className="flex gap-2 pt-2">
                <Button type="submit" className="w-full">
                  {isEditing ? 'Update' : 'Simpan'}
                </Button>
                {isEditing && (
                  <Button type="button" variant="secondary" onClick={resetForm}>
                    Batal
                  </Button>
                )}
              </div>
            </form>
          </div>
        </div>

        {/* List Section */}
        <div className="lg:col-span-2 space-y-8">
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
            <table className="w-full text-sm text-left text-slate-500">
              <thead className="text-xs text-slate-700 uppercase bg-slate-50 border-b">
                <tr>
                  <th className="px-6 py-3">Nama / NIP</th>
                  <th className="px-6 py-3">Jabatan</th>
                  <th className="px-6 py-3">Peran</th>
                  <th className="px-6 py-3">Tanda Tangan</th>
                  <th className="px-6 py-3">Aksi</th>
                </tr>
              </thead>
              <tbody>
                {employees.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="px-6 py-8 text-center text-slate-400">Belum ada data pegawai.</td>
                  </tr>
                ) : (
                  employees.map((emp) => (
                    <tr key={emp.id} className="bg-white border-b hover:bg-slate-50">
                      <td className="px-6 py-4">
                        <div className="font-medium text-slate-900">{emp.name}</div>
                        <div className="text-xs text-slate-500">{emp.nip}</div>
                      </td>
                      <td className="px-6 py-4">{emp.position}</td>
                      <td className="px-6 py-4">
                        {emp.isApprover ? (
                          <span className="bg-purple-100 text-purple-800 text-xs font-medium px-2.5 py-0.5 rounded border border-purple-400">
                            Pejabat
                          </span>
                        ) : (
                          <span className="bg-slate-100 text-slate-800 text-xs font-medium px-2.5 py-0.5 rounded border border-slate-300">
                            Staf
                          </span>
                        )}
                      </td>
                      <td className="px-6 py-4">
                        {emp.signatureBase64 ? (
                          <img src={emp.signatureBase64} alt="Sign" className="h-8 object-contain" />
                        ) : (
                          <span className="text-xs text-red-500 italic">Belum ada</span>
                        )}
                      </td>
                      <td className="px-6 py-4 flex gap-2">
                        <button onClick={() => handleEdit(emp)} className="text-blue-600 hover:underline">Edit</button>
                        <button onClick={() => handleDelete(emp.id)} className="text-red-600 hover:underline">Hapus</button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* Database Backup/Restore Section */}
          <div className="bg-slate-800 rounded-xl shadow-lg p-6 text-white">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div>
                <h3 className="text-lg font-bold flex items-center gap-2">
                  💾 Manajemen Database (JSON)
                </h3>
                <p className="text-slate-400 text-sm mt-1">
                  Simpan semua data input ke file JSON atau pulihkan data dari file.
                </p>
              </div>
              <div className="flex items-center gap-3">
                <Button 
                  variant="primary" 
                  onClick={handleDownloadBackup}
                  className="!bg-blue-600 hover:!bg-blue-500 !border-none"
                >
                  ⬇️ Download Data
                </Button>
                
                <div className="relative">
                  <input 
                    type="file" 
                    id="json-upload" 
                    accept=".json"
                    onChange={handleRestoreBackup}
                    className="hidden"
                  />
                  <label 
                    htmlFor="json-upload" 
                    className="cursor-pointer px-4 py-2 rounded-lg font-medium flex items-center justify-center gap-2 transition-all bg-slate-700 hover:bg-slate-600 text-slate-200 border border-slate-600"
                  >
                    ⬆️ Upload Data
                  </label>
                </div>
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};