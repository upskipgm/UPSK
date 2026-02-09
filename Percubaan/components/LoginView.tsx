
import React, { useState } from 'react';

interface LoginViewProps {
  onLogin: (password: string) => void;
  error?: string;
}

const LoginView: React.FC<LoginViewProps> = ({ onLogin, error }) => {
  const [password, setPassword] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onLogin(password);
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-6">
      <div className="max-w-md w-full bg-white p-8 rounded-3xl shadow-xl border border-slate-100 animate-slideUp">
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-indigo-100 text-indigo-600 rounded-2xl flex items-center justify-center text-3xl mx-auto mb-4">
            🔒
          </div>
          <h2 className="text-2xl font-bold text-slate-800">Akses Pentadbir</h2>
          <p className="text-slate-500 text-sm mt-2">Sila masukkan kata laluan untuk mengakses data unit kaunseling.</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-bold text-slate-700 mb-1">Kata Laluan</label>
            <input 
              type="password" 
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Masukkan kata laluan..."
              className="w-full px-4 py-3 rounded-xl bg-slate-50 border border-slate-200 focus:bg-white focus:border-indigo-500 outline-none transition"
              autoFocus
            />
          </div>
          
          {error && (
            <p className="text-red-500 text-xs font-bold bg-red-50 p-3 rounded-lg border border-red-100">
              ⚠️ {error}
            </p>
          )}

          <button 
            type="submit"
            className="w-full bg-indigo-600 text-white py-4 rounded-xl font-bold hover:bg-indigo-700 transition shadow-lg shadow-indigo-200"
          >
            Log Masuk
          </button>
        </form>
        
        <p className="text-center mt-6 text-xs text-slate-400">
          Tip: Kata laluan lalai adalah <code className="bg-slate-100 px-1 rounded text-indigo-600">admin123</code>
        </p>
      </div>
    </div>
  );
};

export default LoginView;
