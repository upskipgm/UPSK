
import React, { useState, useEffect } from 'react';
import { ViewType, Counselor, IPGKData } from './types';
import Layout from './components/Layout';
import PublicView from './components/PublicView';
import AdminView from './components/AdminView';
import LoginView from './components/LoginView';
import { IPGM_COUNSELORS, IPGK_CAMPUS_LIST } from './constants';

const App: React.FC = () => {
  const [view, setView] = useState<ViewType>('Public');
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loginError, setLoginError] = useState('');
  const [logoUrl, setLogoUrl] = useState<string | null>(null);

  // Centralized Counselor Data State
  const [counselorsIPGM, setCounselorsIPGM] = useState<Counselor[]>(IPGM_COUNSELORS);
  const [campusList, setCampusList] = useState<IPGKData[]>(
    IPGK_CAMPUS_LIST.map(name => ({
      name,
      counselors: { ketua: '[Nama Pegawai]', pentadbir: '[Nama Pegawai]', pelajar: '[Nama Pegawai]' }
    }))
  );

  // Load data from localStorage on mount
  useEffect(() => {
    const savedLogo = localStorage.getItem('app_logo');
    if (savedLogo) setLogoUrl(savedLogo);

    const savedIPGM = localStorage.getItem('counselors_ipgm');
    if (savedIPGM) setCounselorsIPGM(JSON.parse(savedIPGM));

    const savedCampuses = localStorage.getItem('campus_list');
    if (savedCampuses) setCampusList(JSON.parse(savedCampuses));
  }, []);

  // Save data to localStorage when changed
  useEffect(() => {
    localStorage.setItem('counselors_ipgm', JSON.stringify(counselorsIPGM));
  }, [counselorsIPGM]);

  useEffect(() => {
    localStorage.setItem('campus_list', JSON.stringify(campusList));
  }, [campusList]);

  const handleUpdateLogo = (newLogo: string | null) => {
    setLogoUrl(newLogo);
    if (newLogo) {
      localStorage.setItem('app_logo', newLogo);
    } else {
      localStorage.removeItem('app_logo');
    }
  };

  const handleAdminLogin = (password: string) => {
    if (password === 'admin123') {
      setIsAuthenticated(true);
      setLoginError('');
    } else {
      setLoginError('Kata laluan salah. Sila cuba lagi.');
    }
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    setView('Public');
  };

  const renderContent = () => {
    if (view === 'Admin') {
      if (!isAuthenticated) {
        return <LoginView onLogin={handleAdminLogin} error={loginError} />;
      }
      return (
        <AdminView 
          onLogout={handleLogout} 
          logoUrl={logoUrl} 
          onUpdateLogo={handleUpdateLogo}
          counselorsIPGM={counselorsIPGM}
          setCounselorsIPGM={setCounselorsIPGM}
          campusList={campusList}
          setCampusList={setCampusList}
        />
      );
    }
    return <PublicView counselorsIPGM={counselorsIPGM} campusList={campusList} />;
  };

  return (
    <Layout view={view} setView={(v) => {
      setView(v);
      if (v === 'Public') setLoginError('');
    }} logoUrl={logoUrl}>
      <div className="animate-fadeIn">
        {renderContent()}
      </div>
      
      {/* Global CSS for animations */}
      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @keyframes slideUp {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-fadeIn {
          animation: fadeIn 0.5s ease-out;
        }
        .animate-slideUp {
          animation: slideUp 0.4s ease-out;
        }
      `}</style>
    </Layout>
  );
};

export default App;
