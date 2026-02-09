
import React, { useState } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { CASE_STATS, POSTERS, WORKSHEETS } from '../constants';
import { generateMemoContent } from '../services/geminiService';
import { Counselor, IPGKData } from '../types';

interface AdminViewProps {
  onLogout: () => void;
  logoUrl?: string | null;
  onUpdateLogo?: (newLogo: string | null) => void;
  counselorsIPGM: Counselor[];
  setCounselorsIPGM: React.Dispatch<React.SetStateAction<Counselor[]>>;
  campusList: IPGKData[];
  setCampusList: React.Dispatch<React.SetStateAction<IPGKData[]>>;
}

const AdminView: React.FC<AdminViewProps> = ({ 
  onLogout, 
  logoUrl, 
  onUpdateLogo,
  counselorsIPGM,
  setCounselorsIPGM,
  campusList,
  setCampusList
}) => {
  const [activeMenu, setActiveMenu] = useState<'Stats' | 'Appointments' | 'DataManagement' | 'Documents' | 'Settings'>('Stats');
  
  // Resources state
  const [posters, setPosters] = useState(POSTERS);
  const [worksheets, setWorksheets] = useState(WORKSHEETS);

  const [memoDraft, setMemoDraft] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [memoInput, setMemoInput] = useState({ topic: '', recipient: '', type: 'Memo' as 'Surat' | 'Memo' });

  // Data Management UI States
  const [managementTab, setManagementTab] = useState<'Counselors' | 'Resources'>('Counselors');
  const [editTarget, setEditTarget] = useState<{ type: 'IPGM' | 'IPGK', id?: string, index?: number, data?: IPGKData } | null>(null);
  const [editingName, setEditingName] = useState(''); 
  const [isAddingCampus, setIsAddingCampus] = useState(false);
  const [newCampusName, setNewCampusName] = useState('');

  const COLORS = ['#6366f1', '#8b5cf6', '#ec4899', '#f43f5e', '#f59e0b'];

  const handleGenerate = async () => {
    setIsGenerating(true);
    const draft = await generateMemoContent(memoInput.topic, memoInput.recipient, memoInput.type);
    setMemoDraft(draft);
    setIsGenerating(false);
  };

  const handleStartIPGMEdit = (id: string, currentName: string) => {
    setEditTarget({ type: 'IPGM', id });
    setEditingName(currentName);
  };

  const handleSaveIPGMCounselor = (id: string) => {
    setCounselorsIPGM(prev => prev.map(c => c.id === id ? { ...c, name: editingName } : c));
    setEditTarget(null);
    setEditingName('');
  };

  const handleSaveIPGKEdit = () => {
    if (editTarget?.type === 'IPGK' && editTarget.data && editTarget.index !== undefined) {
      const newList = [...campusList];
      newList[editTarget.index] = editTarget.data;
      setCampusList(newList);
      setEditTarget(null);
    }
  };

  const handleAddCampus = () => {
    if (newCampusName.trim()) {
      setCampusList([...campusList, {
        name: newCampusName.trim(),
        counselors: { ketua: '[Nama Pegawai]', pentadbir: '[Nama Pegawai]', pelajar: '[Nama Pegawai]' }
      }]);
      setNewCampusName('');
      setIsAddingCampus(false);
    }
  };

  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        if (onUpdateLogo) onUpdateLogo(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <div className="flex flex-col md:flex-row min-h-screen bg-slate-50">
      <aside className="w-full md:w-64 bg-white border-r p-6 flex flex-col sticky top-16 h-[calc(100vh-64px)] overflow-y-auto">
        <div className="flex-grow space-y-2">
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-4">Dashboard Admin</p>
          {[
            { id: 'Stats', label: 'Statistik Kes', icon: '📊' },
            { id: 'Appointments', label: 'Pengurusan Sesi', icon: '📅' },
            { id: 'DataManagement', label: 'Pengurusan Data', icon: '⚙️' },
            { id: 'Documents', label: 'Surat & Memo', icon: '📝' },
            { id: 'Settings', label: 'Tetapan Sistem', icon: '🛠️' }
          ].map(item => (
            <button
              key={item.id}
              onClick={() => setActiveMenu(item.id as any)}
              className={`w-full text-left px-4 py-3 rounded-xl text-sm font-semibold transition-all flex items-center space-x-3 ${
                activeMenu === item.id 
                ? 'bg-indigo-50 text-indigo-700' 
                : 'text-slate-600 hover:bg-slate-50'
              }`}
            >
              <span>{item.icon}</span>
              <span>{item.label}</span>
            </button>
          ))}
        </div>
        <div className="pt-6 mt-6 border-t">
          <button onClick={onLogout} className="w-full text-left px-4 py-3 rounded-xl text-sm font-semibold text-red-600 hover:bg-red-50 transition-all flex items-center space-x-3">
            <span>🚪</span>
            <span>Log Keluar</span>
          </button>
        </div>
      </aside>

      <main className="flex-grow p-8 overflow-y-auto">
        {activeMenu === 'Stats' && (
          <div className="space-y-8 animate-fadeIn">
             <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-white p-6 rounded-2xl border shadow-sm">
                  <p className="text-slate-500 text-sm font-medium">Jumlah Kes Aktif</p>
                  <h4 className="text-3xl font-bold text-slate-800">124</h4>
                  <div className="mt-2 text-xs text-green-600 font-bold">↑ 12% dari bulan lepas</div>
                </div>
                <div className="bg-white p-6 rounded-2xl border shadow-sm">
                  <p className="text-slate-500 text-sm font-medium">Sesi Selesai (Bulan Ini)</p>
                  <h4 className="text-3xl font-bold text-slate-800">42</h4>
                </div>
                <div className="bg-white p-6 rounded-2xl border shadow-sm">
                  <p className="text-slate-500 text-sm font-medium">Klien Berisiko Tinggi</p>
                  <h4 className="text-3xl font-bold text-red-600">8</h4>
                </div>
             </div>
             <div className="bg-white p-8 rounded-2xl border shadow-sm">
                <h3 className="text-xl font-bold mb-6 text-slate-800">Pecahan Isu Kaunseling</h3>
                <div className="h-[300px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={CASE_STATS}>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                      <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#64748b', fontSize: 12}} />
                      <YAxis axisLine={false} tickLine={false} tick={{fill: '#64748b', fontSize: 12}} />
                      <Tooltip contentStyle={{borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'}} cursor={{fill: '#f8fafc'}} />
                      <Bar dataKey="count" radius={[4, 4, 0, 0]}>
                        {CASE_STATS.map((entry, index) => <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />)}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </div>
             </div>
          </div>
        )}

        {activeMenu === 'DataManagement' && (
          <div className="space-y-6 animate-fadeIn">
            <div className="flex items-center space-x-4 mb-6">
              <button onClick={() => setManagementTab('Counselors')} className={`px-6 py-2 rounded-full text-sm font-bold transition ${managementTab === 'Counselors' ? 'bg-indigo-600 text-white shadow-md' : 'bg-white text-slate-600 border'}`}>Pengurusan Kaunselor</button>
              <button onClick={() => setManagementTab('Resources')} className={`px-6 py-2 rounded-full text-sm font-bold transition ${managementTab === 'Resources' ? 'bg-indigo-600 text-white shadow-md' : 'bg-white text-slate-600 border'}`}>Poster & Worksheet</button>
            </div>

            {managementTab === 'Counselors' ? (
              <div className="grid grid-cols-1 gap-6">
                <div className="bg-white p-6 rounded-2xl border shadow-sm">
                  <h3 className="text-lg font-bold text-slate-800 mb-4 flex items-center"><span className="mr-2">🏢</span> Barisan Kaunselor IPGM</h3>
                  <div className="space-y-4">
                    {counselorsIPGM.map(c => (
                      <div key={c.id} className="flex items-center justify-between p-4 bg-slate-50 rounded-xl">
                        <div className="flex-grow pr-4">
                          <p className="text-[10px] font-bold text-indigo-500 uppercase">{c.role}</p>
                          {editTarget?.type === 'IPGM' && editTarget.id === c.id ? (
                            <div className="mt-1 flex items-center space-x-2">
                              <input className="flex-grow px-3 py-1.5 border rounded-lg bg-white text-sm font-bold outline-none focus:ring-2 focus:ring-indigo-500" value={editingName} onChange={(e) => setEditingName(e.target.value)} autoFocus />
                              <button onClick={() => handleSaveIPGMCounselor(c.id)} className="bg-indigo-600 text-white px-3 py-1.5 rounded-lg text-xs font-bold hover:bg-indigo-700 transition">Simpan</button>
                              <button onClick={() => setEditTarget(null)} className="bg-slate-200 text-slate-600 px-3 py-1.5 rounded-lg text-xs font-bold hover:bg-slate-300 transition">Batal</button>
                            </div>
                          ) : ( <p className="font-bold text-slate-700">{c.name}</p> )}
                        </div>
                        {!(editTarget?.type === 'IPGM' && editTarget.id === c.id) && (
                          <button onClick={() => handleStartIPGMEdit(c.id, c.name)} className="text-xs font-bold text-indigo-600 hover:underline">Kemas Kini Nama</button>
                        )}
                      </div>
                    ))}
                  </div>
                </div>

                <div className="bg-white p-6 rounded-2xl border shadow-sm">
                  <h3 className="text-lg font-bold text-slate-800 mb-4 flex items-center"><span className="mr-2">🏫</span> Senarai Kampus IPGK & ELTC ({campusList.length})</h3>
                  {isAddingCampus && (
                    <div className="mb-4 p-4 bg-indigo-50 rounded-xl border border-indigo-100 animate-slideUp">
                      <label className="block text-xs font-bold text-indigo-600 uppercase mb-1">Nama Kampus Baru</label>
                      <div className="flex space-x-2">
                        <input className="flex-grow px-3 py-2 border rounded-lg text-sm outline-none focus:ring-2 focus:ring-indigo-500" placeholder="Contoh: IPGK Kampus Baru" value={newCampusName} onChange={(e) => setNewCampusName(e.target.value)} autoFocus />
                        <button onClick={handleAddCampus} className="bg-indigo-600 text-white px-4 py-2 rounded-lg text-sm font-bold">Simpan</button>
                        <button onClick={() => setIsAddingCampus(false)} className="bg-slate-200 text-slate-600 px-4 py-2 rounded-lg text-sm font-bold">Batal</button>
                      </div>
                    </div>
                  )}
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                    {campusList.map((campus, idx) => (
                      <div key={idx} className="p-3 bg-slate-50 rounded-lg text-xs font-medium text-slate-600 border flex justify-between items-center group">
                        <span className="truncate pr-2">{campus.name}</span>
                        <div className="flex space-x-2 opacity-0 group-hover:opacity-100 transition">
                           <button onClick={() => setEditTarget({ type: 'IPGK', index: idx, data: { ...campus } })} className="font-bold text-indigo-600 hover:underline">Edit</button>
                           <button onClick={() => setCampusList(campusList.filter((_, i) => i !== idx))} className="font-bold text-red-600 hover:underline">Padam</button>
                        </div>
                      </div>
                    ))}
                  </div>
                  {!isAddingCampus && (
                    <button onClick={() => setIsAddingCampus(true)} className="mt-6 w-full py-3 border-2 border-dashed border-slate-200 rounded-xl text-slate-400 font-bold text-sm hover:border-indigo-300 hover:text-indigo-600 transition">+ Tambah Kampus Baru</button>
                  )}
                </div>

                {editTarget?.type === 'IPGK' && editTarget.data && (
                  <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-[100] flex items-center justify-center p-6">
                    <div className="bg-white w-full max-w-lg rounded-3xl shadow-2xl p-8 animate-slideUp">
                      <h3 className="text-xl font-bold text-slate-800 mb-6 flex items-center"><span className="mr-2">📝</span> Kemas Kini Kaunselor: {editTarget.data.name}</h3>
                      <div className="space-y-4">
                        <div>
                          <label className="block text-xs font-bold text-slate-400 uppercase mb-1">Ketua Kaunselor Pendidikan</label>
                          <input className="w-full px-4 py-2 bg-slate-50 border rounded-xl text-sm outline-none focus:ring-2 focus:ring-indigo-500 transition" value={editTarget.data.counselors.ketua} onChange={(e) => setEditTarget({...editTarget, data: {...editTarget.data!, counselors: {...editTarget.data!.counselors, ketua: e.target.value}}})} />
                        </div>
                        <div>
                          <label className="block text-xs font-bold text-slate-400 uppercase mb-1">Kaunselor Pendidikan (Pentadbir)</label>
                          <input className="w-full px-4 py-2 bg-slate-50 border rounded-xl text-sm outline-none focus:ring-2 focus:ring-indigo-500 transition" value={editTarget.data.counselors.pentadbir} onChange={(e) => setEditTarget({...editTarget, data: {...editTarget.data!, counselors: {...editTarget.data!.counselors, pentadbir: e.target.value}}})} />
                        </div>
                        <div>
                          <label className="block text-xs font-bold text-slate-400 uppercase mb-1">Kaunselor Pendidikan (Pelajar)</label>
                          <input className="w-full px-4 py-2 bg-slate-50 border rounded-xl text-sm outline-none focus:ring-2 focus:ring-indigo-500 transition" value={editTarget.data.counselors.pelajar} onChange={(e) => setEditTarget({...editTarget, data: {...editTarget.data!, counselors: {...editTarget.data!.counselors, pelajar: e.target.value}}})} />
                        </div>
                      </div>
                      <div className="mt-8 flex space-x-3">
                        <button onClick={handleSaveIPGKEdit} className="flex-grow bg-indigo-600 text-white py-3 rounded-xl font-bold hover:bg-indigo-700 transition">Simpan Perubahan</button>
                        <button onClick={() => setEditTarget(null)} className="px-6 py-3 bg-slate-100 text-slate-600 rounded-xl font-bold hover:bg-slate-200 transition">Batal</button>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="grid md:grid-cols-2 gap-8">
                <div className="bg-white p-6 rounded-2xl border shadow-sm">
                  <h3 className="text-lg font-bold text-slate-800 mb-4">Pengurusan Poster</h3>
                  <div className="space-y-3">
                    {posters.map(p => (
                      <div key={p.id} className="flex items-center space-x-4 p-3 bg-slate-50 rounded-xl">
                        <img src={p.image} className="w-12 h-12 rounded object-cover" />
                        <div className="flex-grow"><p className="text-sm font-bold text-slate-700">{p.title}</p></div>
                        <button className="text-red-500 text-xs font-bold">Padam</button>
                      </div>
                    ))}
                  </div>
                  <button className="mt-4 w-full py-2 bg-indigo-50 text-indigo-600 rounded-lg font-bold text-xs">+ Muat Naik Poster Baru</button>
                </div>
                <div className="bg-white p-6 rounded-2xl border shadow-sm">
                  <h3 className="text-lg font-bold text-slate-800 mb-4">Pengurusan Worksheet</h3>
                  <div className="space-y-3">
                    {worksheets.map(w => (
                      <div key={w.id} className="p-3 bg-slate-50 rounded-xl flex justify-between items-center">
                        <div><p className="text-sm font-bold text-slate-700">{w.name}</p><p className="text-[10px] text-slate-400">{w.description}</p></div>
                        <button className="text-indigo-600 text-xs font-bold">Edit</button>
                      </div>
                    ))}
                  </div>
                  <button className="mt-4 w-full py-2 bg-indigo-50 text-indigo-600 rounded-lg font-bold text-xs">+ Tambah Worksheet Baru</button>
                </div>
              </div>
            )}
          </div>
        )}

        {activeMenu === 'Appointments' && (
          <div className="bg-white rounded-2xl border shadow-sm overflow-hidden animate-fadeIn">
            <div className="p-6 border-b flex justify-between items-center"><h3 className="text-xl font-bold text-slate-800">Senarai Menunggu</h3><button className="bg-indigo-600 text-white px-4 py-2 rounded-lg text-sm font-bold">Tambah Rekod</button></div>
            <table className="w-full text-left">
              <thead><tr className="bg-slate-50 text-slate-500 text-xs font-bold uppercase tracking-wider"><th className="px-6 py-4">Klien</th><th className="px-6 py-4">Kaunselor</th><th className="px-6 py-4">Tarikh & Masa</th><th className="px-6 py-4">Status</th><th className="px-6 py-4 text-right">Tindakan</th></tr></thead>
              <tbody className="divide-y">
                {[{id: 1, name: 'Siti Hajar', counselor: 'Pn. Siti Aminah', time: '12 Dec, 10:00 AM', status: 'Approved'}, {id: 2, name: 'Mohamad Adam', counselor: 'En. Ahmad Fauzi', time: '14 Dec, 02:00 PM', status: 'Pending'}].map(app => (
                  <tr key={app.id} className="hover:bg-slate-50 transition">
                    <td className="px-6 py-4 font-bold text-slate-700">{app.name}</td>
                    <td className="px-6 py-4 text-slate-600 text-sm">{app.counselor}</td>
                    <td className="px-6 py-4 text-slate-600 text-sm">{app.time}</td>
                    <td className="px-6 py-4"><span className={`px-3 py-1 rounded-full text-[10px] font-bold ${app.status === 'Approved' ? 'bg-green-100 text-green-700' : 'bg-amber-100 text-amber-700'}`}>{app.status}</span></td>
                    <td className="px-6 py-4 text-right"><button className="text-indigo-600 font-bold text-sm hover:underline">Sahkan</button></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {activeMenu === 'Documents' && (
          <div className="grid md:grid-cols-2 gap-8 animate-fadeIn">
            <div className="bg-white p-8 rounded-2xl border shadow-sm space-y-6">
              <h3 className="text-xl font-bold text-slate-800">Penjana Dokumen AI</h3>
              <div className="space-y-4">
                <div><label className="block text-sm font-bold text-slate-700 mb-1">Jenis Dokumen</label><select value={memoInput.type} onChange={(e) => setMemoInput({...memoInput, type: e.target.value as any})} className="w-full px-4 py-3 rounded-xl bg-slate-50 border-transparent focus:bg-white focus:border-indigo-500 outline-none transition"><option value="Memo">Memo Rasmi</option><option value="Surat">Surat Panggilan</option></select></div>
                <div><label className="block text-sm font-bold text-slate-700 mb-1">Penerima</label><input type="text" value={memoInput.recipient} onChange={(e) => setMemoInput({...memoInput, recipient: e.target.value})} placeholder="Contoh: Unit HEM / Nama Guru" className="w-full px-4 py-3 rounded-xl bg-slate-50 border-transparent focus:bg-white focus:border-indigo-500 outline-none transition" /></div>
                <div><label className="block text-sm font-bold text-slate-700 mb-1">Tujuan / Tajuk</label><textarea rows={3} value={memoInput.topic} onChange={(e) => setMemoInput({...memoInput, topic: e.target.value})} placeholder="Contoh: Memaklumkan kehadiran murid ke sesi kaunseling" className="w-full px-4 py-3 rounded-xl bg-slate-50 border-transparent focus:bg-white focus:border-indigo-500 outline-none transition"></textarea></div>
                <button onClick={handleGenerate} disabled={isGenerating || !memoInput.topic} className="w-full bg-indigo-600 text-white py-4 rounded-xl font-bold hover:bg-indigo-700 transition disabled:opacity-50">{isGenerating ? 'Sedang Menjana Draf...' : 'Jana Draf dengan Gemini'}</button>
              </div>
            </div>
            <div className="bg-indigo-900 p-8 rounded-2xl shadow-xl text-white relative overflow-hidden min-h-[400px]">
              <div className="absolute top-0 right-0 p-4 opacity-10 font-bold text-6xl">AI</div>
              <h4 className="text-lg font-bold mb-4 flex items-center"><span className="mr-2">📝</span> Pratinjau Dokumen</h4>
              {memoDraft ? ( <div className="bg-white/10 p-6 rounded-xl border border-white/20 whitespace-pre-wrap text-sm leading-relaxed font-mono">{memoDraft}</div> ) : ( <div className="flex flex-col items-center justify-center h-full text-indigo-300 text-center italic opacity-60"><p>Sila masukkan maklumat di sebelah untuk melihat draf yang dijana AI.</p></div> )}
              {memoDraft && ( <button onClick={() => { navigator.clipboard.writeText(memoDraft); alert('Draf disalin!'); }} className="mt-4 bg-white text-indigo-900 px-6 py-2 rounded-lg font-bold text-sm hover:bg-indigo-50 transition">Salin Teks</button> )}
            </div>
          </div>
        )}

        {activeMenu === 'Settings' && (
          <div className="max-w-2xl animate-fadeIn">
            <div className="bg-white p-8 rounded-2xl border shadow-sm space-y-8">
              <div><h3 className="text-xl font-bold text-slate-800">Tetapan Sistem</h3><p className="text-slate-500 text-sm">Kemas kini identiti visual aplikasi anda.</p></div>
              <div className="space-y-6">
                <div><label className="block text-sm font-bold text-slate-700 mb-3">Logo Aplikasi</label>
                  <div className="flex items-center space-x-6">
                    <div className="w-24 h-24 bg-slate-50 rounded-2xl border-2 border-dashed border-slate-200 flex items-center justify-center overflow-hidden">{logoUrl ? ( <img src={logoUrl} alt="Preview" className="w-full h-full object-contain p-2" /> ) : ( <span className="text-slate-400 text-xs">Tiada Logo</span> )}</div>
                    <div className="flex-grow space-y-3"><p className="text-xs text-slate-500">Muat naik logo dalam format PNG, JPG atau SVG. Saiz disyorkan: 200x200 px.</p>
                      <div className="flex space-x-2">
                        <label className="bg-indigo-600 text-white px-4 py-2 rounded-lg text-xs font-bold cursor-pointer hover:bg-indigo-700 transition">Pilih Fail<input type="file" className="hidden" accept="image/*" onChange={handleLogoUpload} /></label>
                        {logoUrl && ( <button onClick={() => onUpdateLogo && onUpdateLogo(null)} className="bg-red-50 text-red-600 px-4 py-2 rounded-lg text-xs font-bold hover:bg-red-100 transition">Reset ke Lalai</button> )}
                      </div>
                    </div>
                  </div>
                </div>
                <div className="pt-6 border-t"><h4 className="text-sm font-bold text-slate-700 mb-4">Informasi Unit</h4>
                   <div className="space-y-4">
                     <div><label className="block text-xs font-bold text-slate-400 uppercase mb-1">Nama Unit</label><input type="text" readOnly value="Unit Psikologi & Kaunseling" className="w-full px-4 py-2 rounded-lg bg-slate-50 border text-sm text-slate-500" /></div>
                     <div><label className="block text-xs font-bold text-slate-400 uppercase mb-1">Institusi</label><input type="text" readOnly value="Institut Pendidikan Guru Malaysia" className="w-full px-4 py-2 rounded-lg bg-slate-50 border text-sm text-slate-500" /></div>
                   </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default AdminView;
