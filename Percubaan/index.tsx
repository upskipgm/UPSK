
import React, { useState, useEffect, useMemo } from 'react';
import ReactDOM from 'react-dom/client';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { GoogleGenAI } from "@google/genai";

// --- TYPES ---
interface Counselor {
  id: string;
  name: string;
  role: string;
  image?: string;
  category: 'IPGM' | 'IPGK';
}

interface IPGKData {
  name: string;
  counselors: {
    ketua: string;
    pentadbir: string;
    pelajar: string;
  };
}

type ViewType = 'Public' | 'Admin';

// --- CONSTANTS ---
const CAMPUS_NAMES = [
  "IPGK Bahasa Melayu", "IPGK Bahasa Antarabangsa", "IPGK Ilmu Khas", "IPGK Perempuan Melayu",
  "IPGK Pendidikan Islam", "IPGK Pendidikan Teknik", "IPGK Kampus Gaya", "IPGK Kampus Kent",
  "IPGK Kampus Tawau", "IPGK Kampus Sarawak", "IPGK Kampus Batu Lintang", "IPGK Kampus Rajang",
  "ELTC", "IPGK Tun Hussein Onn", "IPGK Kampus Tun Abdul Razak", "IPGK Kampus Temenggong Ibrahim",
  "IPGK Kampus Tuanku Bainun", "IPGK Kampus Sultan Mizan", "IPGK Kampus Dato' Razali Ismail",
  "IPGK Kampus Darulaman", "IPGK Kampus Ipoh", "IPGK Kampus Perlis", "IPGK Kampus Pulau Pinang",
  "IPGK Kampus Sultan Abdul Halim", "IPGK Kampus Tengku Ampuan Afzan", "IPGK Kampus Raja Melewar",
  "IPGK Kampus Kota Bharu", "IPGK Kampus Keningau"
];

const CASE_STATS = [
  { name: 'Keluarga', count: 45 }, { name: 'Akademik', count: 72 },
  { name: 'Kerjaya', count: 30 }, { name: 'Kesihatan Mental', count: 55 },
  { name: 'Disiplin', count: 18 }
];

const POSTERS = [
  { id: '1', title: 'Mengurus Stres Peperiksaan', image: 'https://picsum.photos/seed/p1/800/1200' },
  { id: '2', title: 'Kepentingan Tidur Cukup', image: 'https://picsum.photos/seed/p2/800/1200' },
  { id: '3', title: 'Buli Siber: Apa Tindakan Anda?', image: 'https://picsum.photos/seed/p3/800/1200' }
];

const WORKSHEETS = [
  { id: '1', name: 'Roda Emosi', description: 'Mengenalpasti perasaan harian anda.' },
  { id: '2', name: 'Pelan Keselamatan Diri', description: 'Langkah berjaga-gaga ketika krisis.' },
  { id: '3', name: 'Diari Kesyukuran', description: 'Amalan positif harian.' }
];

// --- AI SERVICES ---
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

const generateMemoContent = async (topic: string, recipient: string, type: string) => {
  const prompt = `Sila draf satu ${type} rasmi daripada Unit Kaunseling. Topik: ${topic}. Penerima: ${recipient}. Sertakan struktur lengkap: Tarikh, No Rujukan, Tajuk, dan Kandungan Utama.`;
  try {
    const response = await ai.models.generateContent({ model: 'gemini-3-flash-preview', contents: prompt });
    return response.text;
  } catch (e) { return "Gagal menjana draf AI."; }
};

const analyzePsychTest = async (testType: string, context: string) => {
  const prompt = `Berikan ulasan kaunseling ringkas (3-5 ayat) untuk ujian ${testType} berdasarkan konteks: ${context}. Gunakan Bahasa Melayu yang empati dan inspirasi.`;
  try {
    const response = await ai.models.generateContent({ model: 'gemini-3-flash-preview', contents: prompt });
    return response.text;
  } catch (e) { return "Ralat analisis AI."; }
};

// --- COMPONENTS ---

const LoginView: React.FC<{ onLogin: (p: string) => void, error: string }> = ({ onLogin, error }) => {
  const [password, setPassword] = useState('');
  return (
    <div className="min-h-[70vh] flex items-center justify-center px-4 animate-slideUp">
      <div className="max-w-md w-full bg-white p-10 rounded-[2.5rem] shadow-2xl border border-slate-100">
        <div className="text-center mb-8"><div className="text-5xl mb-4">🔐</div><h2 className="text-2xl font-black text-slate-800 tracking-tight">Portal Admin</h2></div>
        <form onSubmit={(e) => { e.preventDefault(); onLogin(password); }} className="space-y-5">
          <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Masukkan kata laluan..." className="w-full px-5 py-4 rounded-2xl bg-slate-50 border-2 border-transparent outline-none focus:border-indigo-500 transition-all font-medium" />
          {error && <p className="text-red-500 text-xs font-bold bg-red-50 p-4 rounded-xl border border-red-100 italic">⚠️ {error}</p>}
          <button type="submit" className="w-full bg-indigo-600 text-white py-4 rounded-2xl font-black hover:bg-indigo-700 transition shadow-lg shadow-indigo-100">LOG MASUK</button>
        </form>
        <p className="text-center mt-6 text-[10px] text-slate-400 font-bold tracking-widest uppercase">DEFAULT: admin123</p>
      </div>
    </div>
  );
};

const Layout: React.FC<{ view: ViewType, setView: (v: ViewType) => void, children: React.ReactNode, logoUrl: string | null }> = ({ view, setView, children, logoUrl }) => (
  <div className="min-h-screen flex flex-col font-['Plus_Jakarta_Sans']">
    <header className={`py-4 px-6 md:px-10 flex justify-between items-center shadow-sm sticky top-0 z-50 backdrop-blur-md ${view === 'Admin' ? 'bg-indigo-950/90 text-white' : 'bg-white/90 text-indigo-950'}`}>
      <div className="flex items-center space-x-4 cursor-pointer group" onClick={() => setView('Public')}>
        {logoUrl ? <img src={logoUrl} className="w-12 h-12 object-contain bg-white rounded-2xl p-1.5 border shadow-sm group-hover:scale-105 transition" /> : <div className="w-12 h-12 bg-indigo-600 rounded-2xl flex items-center justify-center text-white font-black shadow-lg">UP</div>}
        <div><h1 className="text-sm md:text-base font-black leading-tight tracking-tight uppercase">UPskIPGM</h1><p className="text-[10px] opacity-70 font-bold tracking-wide">Institut Pendidikan Guru Malaysia</p></div>
      </div>
      <nav className="flex space-x-6 text-xs font-black uppercase tracking-widest">
        <button onClick={() => setView('Public')} className={view === 'Public' ? 'text-indigo-600 border-b-2 border-indigo-600 pb-1' : 'opacity-50 hover:opacity-100 transition'}>Awam</button>
        <button onClick={() => setView('Admin')} className={view === 'Admin' ? 'text-white border-b-2 border-white pb-1' : 'opacity-50 hover:opacity-100 transition'}>Admin</button>
      </nav>
    </header>
    <main className="flex-grow">{children}</main>
    <footer className="bg-slate-100 py-12 px-6 text-center border-t border-slate-200">
       <div className="max-w-4xl mx-auto opacity-40">
         <p className="font-black text-xs text-slate-800 tracking-widest uppercase mb-2">Unit Psikologi & Kaunseling, IPGM</p>
         <p className="text-[10px] font-medium leading-relaxed">Platform bersepadu pengurusan perkhidmatan psikologi untuk warga pendidik dan pelajar IPG Malaysia. © 2024 Hak Cipta Terpelihara.</p>
       </div>
    </footer>
  </div>
);

const PublicView: React.FC<{ ipgm: Counselor[], campuses: IPGKData[] }> = ({ ipgm, campuses }) => {
  const [tab, setTab] = useState('Counselors');
  const [cat, setCat] = useState<'IPGM' | 'IPGK'>('IPGM');
  const [selectedCampus, setSelectedCampus] = useState(campuses[0]?.name || '');
  const [isAnalysing, setIsAnalysing] = useState(false);
  const [aiResult, setAiResult] = useState('');
  const [testType, setTestType] = useState('');

  const campusInfo = useMemo(() => campuses.find(c => c.name === selectedCampus), [selectedCampus, campuses]);

  const handleTest = async (type: string) => {
    setTestType(type);
    setIsAnalysing(true);
    const res = await analyzePsychTest(type, "Pelajar ingin memahami potensi diri melalui ujian " + type);
    setAiResult(res);
    setIsAnalysing(false);
  };

  return (
    <div className="max-w-6xl mx-auto px-6 py-12">
      <div className="flex space-x-3 mb-12 overflow-x-auto pb-4 no-scrollbar">
        {['Counselors', 'Test', 'Posters', 'Booking'].map(t => (
          <button key={t} onClick={() => { setTab(t); setAiResult(''); }} className={`px-7 py-3 rounded-full text-xs font-black whitespace-nowrap transition-all shadow-sm border ${tab === t ? 'bg-indigo-600 text-white border-indigo-600 shadow-indigo-200' : 'bg-white text-slate-500 hover:bg-slate-50 border-slate-200'}`}>
            {t === 'Counselors' ? 'DIREKTORI' : t === 'Test' ? 'UJIAN AI' : t === 'Posters' ? 'RESOURCES' : 'TEMUJANJI'}
          </button>
        ))}
      </div>

      {tab === 'Counselors' && (
        <section className="animate-fadeIn">
          <div className="flex flex-col md:flex-row md:items-center justify-between mb-10 gap-6">
            <div><h2 className="text-3xl font-black text-slate-800 tracking-tighter">Barisan Kaunselor</h2><p className="text-slate-500 font-medium">Hubungi pakar bimbingan kami di seluruh Malaysia.</p></div>
            <div className="flex bg-white p-1.5 rounded-2xl border-2 border-slate-100 shadow-sm font-black text-[10px]">
              <button onClick={() => setCat('IPGM')} className={`px-5 py-2.5 rounded-xl transition ${cat === 'IPGM' ? 'bg-indigo-600 text-white' : 'text-slate-400'}`}>IPGM</button>
              <button onClick={() => setCat('IPGK')} className={`px-5 py-2.5 rounded-xl transition ${cat === 'IPGK' ? 'bg-indigo-600 text-white' : 'text-slate-400'}`}>IPGK (KAMPUS)</button>
            </div>
          </div>
          {cat === 'IPGM' ? (
            <div className="grid md:grid-cols-2 gap-8">
              {ipgm.map(c => (
                <div key={c.id} className="bg-white p-8 rounded-[2rem] border border-slate-100 shadow-xl shadow-slate-200/50 flex items-center space-x-6 hover:translate-y-[-4px] transition duration-300">
                  <img src={c.image} className="w-24 h-24 rounded-3xl object-cover bg-indigo-50 border-4 border-white shadow-inner" />
                  <div><p className="text-[10px] font-black text-indigo-600 uppercase tracking-widest mb-1">{c.role}</p><h3 className="text-xl font-black text-slate-800">{c.name}</h3></div>
                </div>
              ))}
            </div>
          ) : (
            <div className="space-y-10">
              <div className="max-w-md">
                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3 ml-1">Pilih Kampus IPGK</label>
                <select value={selectedCampus} onChange={(e) => setSelectedCampus(e.target.value)} className="w-full px-6 py-4 rounded-2xl border-2 border-slate-100 bg-white font-black text-sm outline-none focus:border-indigo-500 transition shadow-sm">
                  {campuses.map(c => <option key={c.name} value={c.name}>{c.name}</option>)}
                </select>
              </div>
              <div className="grid md:grid-cols-3 gap-6">
                {[
                  { r: 'Ketua Kaunselor', n: campusInfo?.counselors.ketua },
                  { r: 'Pentadbir', n: campusInfo?.counselors.pentadbir },
                  { r: 'Pelajar', n: campusInfo?.counselors.pelajar }
                ].map((p, i) => (
                  <div key={i} className="bg-white p-8 rounded-[2rem] border border-slate-100 shadow-lg text-center">
                    <div className="w-12 h-12 bg-slate-50 rounded-2xl flex items-center justify-center text-xl mx-auto mb-5">🎖️</div>
                    <p className="text-[10px] font-black text-indigo-600 mb-2 uppercase tracking-widest">{p.r}</p>
                    <h4 className="font-black text-slate-800 leading-snug">{p.n || '[Nama Pegawai]'}</h4>
                  </div>
                ))}
              </div>
            </div>
          )}
        </section>
      )}

      {tab === 'Test' && (
        <section className="animate-fadeIn">
          <div className="mb-10 text-center"><h2 className="text-3xl font-black text-slate-800 tracking-tighter">Analisis Psikologi AI</h2><p className="text-slate-500 font-medium">Gunakan kecerdasan buatan untuk ulasan awal ujian anda.</p></div>
          <div className="grid md:grid-cols-3 gap-6">
            {['Minda Sihat', 'Personaliti', 'Kerjaya', 'PKPP', 'PKPW'].map(t => (
              <button key={t} onClick={() => handleTest(t)} className="bg-white p-10 rounded-[2.5rem] border-2 border-slate-50 hover:border-indigo-100 hover:shadow-2xl transition duration-500 text-center group">
                <div className="text-4xl mb-6 group-hover:scale-125 transition">🧠</div>
                <h3 className="font-black text-slate-800 uppercase text-sm tracking-widest">{t}</h3>
                <p className="text-[10px] text-slate-400 font-bold mt-4 tracking-wider">KLIK UNTUK ANALISIS</p>
              </button>
            ))}
            {isAnalysing && <div className="col-span-full py-20 text-center animate-pulse font-black text-indigo-600 tracking-widest uppercase italic">🤖 Gemini AI sedang berfikir...</div>}
            {aiResult && (
              <div className="col-span-full mt-10 p-10 bg-indigo-950 text-white rounded-[2.5rem] shadow-2xl animate-slideUp relative overflow-hidden">
                <div className="absolute top-0 right-0 p-8 opacity-10 text-6xl">✨</div>
                <h4 className="font-black text-xs uppercase tracking-[0.3em] mb-6 opacity-60">Keputusan Analisis AI ({testType}):</h4>
                <p className="text-lg leading-relaxed font-medium opacity-90 italic">"{aiResult}"</p>
              </div>
            )}
          </div>
        </section>
      )}

      {tab === 'Posters' && (
        <section className="grid md:grid-cols-3 gap-8 animate-fadeIn">
          {POSTERS.map(p => (
            <div key={p.id} className="bg-white rounded-[2rem] border border-slate-100 overflow-hidden shadow-lg group">
              <div className="relative h-72 overflow-hidden">
                <img src={p.image} className="h-full w-full object-cover group-hover:scale-110 transition duration-700" />
                <div className="absolute inset-0 bg-indigo-950/40 opacity-0 group-hover:opacity-100 transition flex items-center justify-center"><button className="bg-white text-indigo-950 px-6 py-2 rounded-full font-black text-xs shadow-xl">DOWNLOAD PDF</button></div>
              </div>
              <div className="p-6 text-center"><p className="font-black text-slate-800 text-sm">{p.title}</p></div>
            </div>
          ))}
        </section>
      )}

      {tab === 'Booking' && (
        <section className="animate-fadeIn bg-white rounded-[2.5rem] border-2 border-slate-100 p-8 shadow-2xl">
          <div className="mb-8 text-center"><h2 className="text-2xl font-black text-slate-800 uppercase tracking-widest">Sistem e2PK</h2><p className="text-xs text-slate-400 font-bold mt-2">PORTAL TEMUJANJI RASMI KEMENTERIAN PENDIDIKAN MALAYSIA</p></div>
          <iframe src="https://e2pk.moe.gov.my/inframe.cfm?temujanji" className="w-full h-[700px] border-none rounded-[1.5rem] bg-slate-50" />
        </section>
      )}
    </div>
  );
};

const AdminView: React.FC<{ 
  onLogout: () => void, logoUrl: string | null, onUpdateLogo: (l: string | null) => void,
  ipgm: Counselor[], setIpgm: any, campuses: IPGKData[], setCampuses: any
}> = ({ onLogout, logoUrl, onUpdateLogo, ipgm, setIpgm, campuses, setCampuses }) => {
  const [menu, setMenu] = useState('Stats');
  const [editIpgmId, setEditIpgmId] = useState<string | null>(null);
  const [editName, setEditName] = useState('');
  const [editCampusIdx, setEditCampusIdx] = useState<number | null>(null);
  const [memoInput, setMemoInput] = useState({ t: '', r: '', type: 'Memo' });
  const [memoResult, setMemoResult] = useState('');
  const [isGen, setIsGen] = useState(false);

  const handleUpdateCampus = (field: keyof IPGKData['counselors'], val: string) => {
    if (editCampusIdx === null) return;
    const newList = [...campuses];
    newList[editCampusIdx].counselors[field] = val;
    setCampuses(newList);
  };

  return (
    <div className="flex flex-col md:flex-row min-h-[calc(100vh-80px)]">
      <aside className="w-full md:w-72 bg-white border-r border-slate-200 p-8 space-y-3">
        <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-6 px-4">Menu Kawalan</p>
        {['Stats', 'Management', 'AI Memo', 'Settings'].map(m => (
          <button key={m} onClick={() => setMenu(m)} className={`w-full text-left px-6 py-4 rounded-2xl text-xs font-black transition-all ${menu === m ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-100' : 'text-slate-500 hover:bg-slate-50'}`}>{m.toUpperCase()}</button>
        ))}
        <button onClick={onLogout} className="w-full text-left px-6 py-4 text-red-600 font-black text-xs mt-10 border-t border-slate-100 pt-10">LOG KELUAR</button>
      </aside>

      <main className="flex-grow p-10 bg-slate-50 overflow-y-auto">
        {menu === 'Stats' && (
          <div className="space-y-10 animate-fadeIn">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {[
                { l: 'Kes Aktif', v: '124', c: 'text-indigo-600' },
                { l: 'Sesi Selesai', v: '42', c: 'text-green-600' },
                { l: 'Kes Berisiko', v: '8', c: 'text-red-600' }
              ].map((s, i) => (
                <div key={i} className="bg-white p-8 rounded-[2rem] border-2 border-slate-50 shadow-sm">
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3">{s.l}</p>
                  <h4 className={`text-4xl font-black ${s.c}`}>{s.v}</h4>
                </div>
              ))}
            </div>
            <div className="bg-white p-10 rounded-[2rem] border-2 border-slate-50 shadow-sm h-[400px]">
              <h3 className="font-black text-slate-800 mb-8 uppercase text-xs tracking-widest">Pecahan Isu Sesi</h3>
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={CASE_STATS}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                  <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fontSize: 10, fontWeight: 700}} />
                  <YAxis axisLine={false} tickLine={false} tick={{fontSize: 10, fontWeight: 700}} />
                  <Tooltip cursor={{fill: '#f8fafc'}} />
                  <Bar dataKey="count" radius={[8, 8, 0, 0]} fill="#6366f1" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        )}

        {menu === 'Management' && (
          <div className="space-y-8 animate-fadeIn">
            <div className="bg-white p-8 rounded-[2rem] border-2 border-slate-50">
              <h3 className="font-black text-slate-800 mb-6 uppercase text-xs tracking-widest">Pusat Kaunselor IPGM</h3>
              <div className="grid md:grid-cols-2 gap-4">
                {ipgm.map(c => (
                  <div key={c.id} className="p-6 bg-slate-50 rounded-2xl flex justify-between items-center border border-slate-100">
                    <div><p className="text-[10px] font-black text-indigo-600 mb-1">{c.role}</p><p className="font-black text-sm">{c.name}</p></div>
                    <button onClick={() => { setEditIpgmId(c.id); setEditName(c.name); }} className="text-[10px] bg-white px-4 py-2 rounded-xl font-black text-indigo-600 shadow-sm">EDIT</button>
                  </div>
                ))}
              </div>
            </div>
            <div className="bg-white p-8 rounded-[2rem] border-2 border-slate-50">
              <h3 className="font-black text-slate-800 mb-6 uppercase text-xs tracking-widest">Senarai IPGK ({campuses.length})</h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                {campuses.map((c, i) => (
                  <button key={i} onClick={() => setEditCampusIdx(i)} className="p-4 bg-slate-50 border border-slate-100 rounded-xl text-[10px] font-black hover:bg-indigo-600 hover:text-white transition-all text-left uppercase truncate">{c.name}</button>
                ))}
              </div>
            </div>
          </div>
        )}

        {menu === 'AI Memo' && (
          <div className="grid md:grid-cols-2 gap-10 animate-fadeIn">
            <div className="bg-white p-10 rounded-[2.5rem] border-2 border-slate-50 shadow-sm space-y-6">
              <h3 className="font-black text-xl tracking-tight">Dokumen Penjana AI</h3>
              <div className="space-y-4">
                <select value={memoInput.type} onChange={e => setMemoInput({...memoInput, type: e.target.value})} className="w-full p-4 rounded-2xl border-2 border-slate-50 bg-slate-50 font-black text-xs"><option>Memo</option><option>Surat Rasmi</option></select>
                <input value={memoInput.r} onChange={e => setMemoInput({...memoInput, r: e.target.value})} placeholder="Nama Penerima..." className="w-full p-4 rounded-2xl border-2 border-slate-50 text-sm font-medium" />
                <textarea value={memoInput.t} onChange={e => setMemoInput({...memoInput, t: e.target.value})} placeholder="Tujuan Memo..." rows={4} className="w-full p-4 rounded-2xl border-2 border-slate-50 text-sm font-medium" />
                <button onClick={async () => { setIsGen(true); const res = await generateMemoContent(memoInput.t, memoInput.r, memoInput.type); setMemoResult(res); setIsGen(false); }} disabled={isGen} className="w-full bg-indigo-600 text-white py-4 rounded-2xl font-black shadow-lg">{isGen ? 'Sedang Menjana...' : 'JANA DRAF AI'}</button>
              </div>
            </div>
            <div className="bg-indigo-950 p-10 rounded-[2.5rem] text-white shadow-2xl min-h-[500px] flex flex-col">
               <h4 className="font-black text-[10px] uppercase tracking-widest mb-8 opacity-40 border-b border-white/10 pb-4">Salinan Draf Rasmi</h4>
               <p className="text-sm whitespace-pre-wrap font-mono leading-relaxed opacity-80 flex-grow">{memoResult || 'Draf akan dijana di sini...'}</p>
               {memoResult && <button onClick={() => navigator.clipboard.writeText(memoResult)} className="mt-8 bg-white/10 hover:bg-white/20 text-white py-3 rounded-xl text-xs font-black transition">SALIN TEKS</button>}
            </div>
          </div>
        )}

        {menu === 'Settings' && (
          <div className="max-w-md animate-fadeIn">
            <div className="bg-white p-10 rounded-[2.5rem] border-2 border-slate-50 shadow-sm">
              <h3 className="font-black text-xl mb-8 tracking-tight">Identiti Visual</h3>
              <div className="space-y-8">
                <div>
                  <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4">Logo Portal</label>
                  <div className="flex items-center space-x-6">
                    <div className="w-24 h-24 border-4 border-slate-50 rounded-3xl flex items-center justify-center overflow-hidden bg-slate-50 shadow-inner">
                      {logoUrl ? <img src={logoUrl} className="w-full h-full object-contain p-2" /> : <span className="text-[10px] font-black text-slate-300">TIADA</span>}
                    </div>
                    <label className="bg-indigo-600 text-white px-5 py-3 rounded-2xl text-[10px] font-black cursor-pointer shadow-lg">TUKAR LOGO<input type="file" className="hidden" onChange={(e) => {
                      const f = e.target.files?.[0];
                      if (f) { const r = new FileReader(); r.onloadend = () => onUpdateLogo(r.result as string); r.readAsDataURL(f); }
                    }} /></label>
                  </div>
                </div>
                <button onClick={() => onUpdateLogo(null)} className="text-[10px] text-red-500 font-black hover:underline uppercase tracking-widest">Hapuskan Logo</button>
              </div>
            </div>
          </div>
        )}

        {/* Modal Edits */}
        {editIpgmId && (
          <div className="fixed inset-0 bg-indigo-950/40 z-[100] flex items-center justify-center p-6 backdrop-blur-sm">
            <div className="bg-white p-10 rounded-[2.5rem] w-full max-w-sm shadow-2xl animate-slideUp">
              <h4 className="font-black text-lg mb-6">Kemas Kini Pegawai</h4>
              <input value={editName} onChange={e => setEditName(e.target.value)} className="w-full p-4 border-2 border-slate-100 rounded-2xl mb-6 font-medium" />
              <div className="flex space-x-3">
                <button onClick={() => { setIpgm(ipgm.map(c => c.id === editIpgmId ? {...c, name: editName} : c)); setEditIpgmId(null); }} className="flex-1 bg-indigo-600 text-white py-4 rounded-2xl font-black">SIMPAN</button>
                <button onClick={() => setEditIpgmId(null)} className="flex-1 bg-slate-100 py-4 rounded-2xl font-black text-slate-500">BATAL</button>
              </div>
            </div>
          </div>
        )}

        {editCampusIdx !== null && (
          <div className="fixed inset-0 bg-indigo-950/40 z-[100] flex items-center justify-center p-6 backdrop-blur-sm">
            <div className="bg-white p-10 rounded-[2.5rem] w-full max-w-lg shadow-2xl animate-slideUp">
              <h4 className="font-black text-lg mb-8 uppercase tracking-tighter">Edit: {campuses[editCampusIdx].name}</h4>
              <div className="space-y-5 mb-10">
                {['ketua', 'pentadbir', 'pelajar'].map(key => (
                  <div key={key}>
                    <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 ml-1">Kaunselor {key}</label>
                    <input value={(campuses[editCampusIdx].counselors as any)[key]} onChange={e => handleUpdateCampus(key as any, e.target.value)} className="w-full p-4 border-2 border-slate-100 rounded-2xl text-sm font-medium" />
                  </div>
                ))}
              </div>
              <button onClick={() => setEditCampusIdx(null)} className="w-full bg-indigo-600 text-white py-4 rounded-2xl font-black shadow-lg">SELESAI</button>
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

// --- MAIN APP ---
const App: React.FC = () => {
  const [view, setView] = useState<ViewType>('Public');
  const [isAuth, setIsAuth] = useState(false);
  const [err, setErr] = useState('');
  const [logo, setLogo] = useState<string | null>(localStorage.getItem('up_logo'));
  
  const initialIpgm: Counselor[] = [
    { id: '1', name: '[Nama Pegawai]', role: 'Ketua Penolong Pengarah', category: 'IPGM', image: 'https://picsum.photos/seed/ipgm1/400/400' },
    { id: '2', name: '[Nama Pegawai]', role: 'Penolong Pengarah', category: 'IPGM', image: 'https://picsum.photos/seed/ipgm2/400/400' }
  ];

  const [ipgm, setIpgm] = useState<Counselor[]>(JSON.parse(localStorage.getItem('up_ipgm') || JSON.stringify(initialIpgm)));
  const [campuses, setCampuses] = useState<IPGKData[]>(JSON.parse(localStorage.getItem('up_campuses') || JSON.stringify(CAMPUS_NAMES.map(n => ({
    name: n, counselors: { ketua: '[Nama Pegawai]', pentadbir: '[Nama Pegawai]', pelajar: '[Nama Pegawai]' }
  })))));

  useEffect(() => { localStorage.setItem('up_logo', logo || ''); }, [logo]);
  useEffect(() => { localStorage.setItem('up_ipgm', JSON.stringify(ipgm)); }, [ipgm]);
  useEffect(() => { localStorage.setItem('up_campuses', JSON.stringify(campuses)); }, [campuses]);

  const onLogin = (p: string) => { if (p === 'admin123') { setIsAuth(true); setErr(''); } else setErr('Akses ditolak!'); };

  return (
    <Layout view={view} setView={setView} logoUrl={logo}>
      {view === 'Admin' ? (
        !isAuth ? <LoginView onLogin={onLogin} error={err} /> : 
        <AdminView onLogout={() => { setIsAuth(false); setView('Public'); }} logoUrl={logo} onUpdateLogo={setLogo} ipgm={ipgm} setIpgm={setIpgm} campuses={campuses} setCampuses={setCampuses} />
      ) : (
        <PublicView ipgm={ipgm} campuses={campuses} />
      )}
      <style>{`
        @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
        @keyframes slideUp { from { opacity: 0; transform: translateY(30px); } to { opacity: 1; transform: translateY(0); } }
        .animate-fadeIn { animation: fadeIn 0.6s cubic-bezier(0.16, 1, 0.3, 1); }
        .animate-slideUp { animation: slideUp 0.6s cubic-bezier(0.16, 1, 0.3, 1); }
        .no-scrollbar::-webkit-scrollbar { display: none; }
        .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
      `}</style>
    </Layout>
  );
};

const root = ReactDOM.createRoot(document.getElementById('root')!);
root.render(<App />);
