
import React from 'react';
import { ViewType } from '../types';

interface LayoutProps {
  view: ViewType;
  setView: (v: ViewType) => void;
  children: React.ReactNode;
  logoUrl?: string | null;
}

const Layout: React.FC<LayoutProps> = ({ view, setView, children, logoUrl }) => {
  return (
    <div className="min-h-screen flex flex-col">
      <header className={`py-4 px-6 flex justify-between items-center shadow-sm sticky top-0 z-50 ${view === 'Admin' ? 'bg-indigo-900 text-white' : 'bg-white text-indigo-900'}`}>
        <div className="flex items-center space-x-3" onClick={() => setView('Public')} style={{ cursor: 'pointer' }}>
          {logoUrl ? (
            <div className="w-10 h-10 rounded-xl overflow-hidden shadow-sm border border-slate-200 bg-white flex items-center justify-center">
              <img src={logoUrl} alt="Logo Unit" className="w-full h-full object-contain" />
            </div>
          ) : (
            <div className="w-10 h-10 bg-indigo-500 rounded-xl flex items-center justify-center text-white font-bold text-lg shadow-inner">P</div>
          )}
          <div className="flex flex-col">
            <h1 className="text-lg font-bold leading-tight">Unit Psikologi & Kaunseling</h1>
            <p className="text-[10px] opacity-80 font-medium tracking-wide">Institut Pendidikan Guru Malaysia</p>
          </div>
        </div>
        
        <nav className="hidden md:flex space-x-8 text-sm font-medium">
          <button onClick={() => setView('Public')} className={`hover:opacity-80 transition ${view === 'Public' ? 'border-b-2 border-indigo-500 pb-1' : ''}`}>Paparan Awam</button>
          <button onClick={() => setView('Admin')} className={`hover:opacity-80 transition ${view === 'Admin' ? 'border-b-2 border-white pb-1 text-white' : ''}`}>Paparan Admin</button>
        </nav>

        <div className="md:hidden">
            <select 
                value={view} 
                onChange={(e) => setView(e.target.value as ViewType)}
                className="bg-transparent border border-current rounded px-2 py-1 text-sm outline-none"
            >
                <option value="Public" className="text-black">Awam</option>
                <option value="Admin" className="text-black">Admin</option>
            </select>
        </div>
      </header>
      
      <main className="flex-grow">
        {children}
      </main>

      <footer className="bg-slate-100 py-10 px-6 text-center text-slate-500 text-sm border-t">
        <div className="max-w-4xl mx-auto flex flex-col items-center">
          {logoUrl && (
            <img src={logoUrl} alt="Logo Footer" className="h-12 w-auto grayscale opacity-50 mb-4" />
          )}
          <p className="font-bold text-slate-700 mb-1">Unit Psikologi & Kaunseling, IPGM</p>
          <p className="text-xs">&copy; 2024 Hak Cipta Terpelihara. Sistem Pengurusan Perkhidmatan Psikologi.</p>
        </div>
      </footer>
    </div>
  );
};

export default Layout;
