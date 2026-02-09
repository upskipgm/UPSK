
import React, { useState } from 'react';
import { POSTERS, WORKSHEETS } from '../constants';
import { analyzePsychTest } from '../services/geminiService';
import { Counselor, IPGKData } from '../types';

type TestType = 'Minda Sihat' | 'Personaliti' | 'IKPSI-P' | 'Gaya Belajar' | 'Kerjaya' | 'PKPP' | 'PKPW';

interface PublicViewProps {
  counselorsIPGM: Counselor[];
  campusList: IPGKData[];
}

const PublicView: React.FC<PublicViewProps> = ({ counselorsIPGM, campusList }) => {
  const [activeTab, setActiveTab] = useState<'Counselors' | 'Test' | 'Booking' | 'Posters' | 'Worksheets'>('Counselors');
  const [counselorCategory, setCounselorCategory] = useState<'IPGM' | 'IPGK'>('IPGM');
  const [selectedCampus, setSelectedCampus] = useState<string>(campusList[0]?.name || '');
  
  const [selectedTest, setSelectedTest] = useState<TestType | null>(null);
  const [testResult, setTestResult] = useState<string | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [answers, setAnswers] = useState<Record<string, string>>({});

  const tests: { type: TestType; icon: string; desc: string; color: string; externalUrl?: string; isConstruction?: boolean }[] = [
    { type: 'PKPP', icon: '📈', desc: 'Profil Kesejahteraan Psikologi Pelajar IPG.', color: 'bg-indigo-50 text-indigo-600', externalUrl: 'https://upskipgm.com/PKPP' },
    { type: 'PKPW', icon: '🏘️', desc: 'Profil Kesejahteraan Psikologi Warga IPG.', color: 'bg-cyan-50 text-cyan-600', externalUrl: 'https://upskipgm.com/PKPW' },
    { type: 'Minda Sihat', icon: '🧠', desc: 'Saringan stres, keresahan dan kemurungan (DASS).', color: 'bg-rose-50 text-rose-600', isConstruction: true },
    { type: 'Personaliti', icon: '👤', desc: 'Mengenal pasti tret dan ciri personaliti diri.', color: 'bg-blue-50 text-blue-600', isConstruction: true },
    { type: 'IKPSI-P', icon: '📊', desc: 'Inventori Kecerdasan Pelbagai untuk potensi diri.', color: 'bg-amber-50 text-amber-600', isConstruction: true },
    { type: 'Gaya Belajar', icon: '📚', desc: 'Kenali sama ada anda Visual, Auditori atau Kinestetik.', color: 'bg-emerald-50 text-emerald-600', isConstruction: true },
    { type: 'Kerjaya', icon: '💼', desc: 'Mencari padanan kerjaya berasaskan minat (RIASEC).', color: 'bg-purple-50 text-purple-600', isConstruction: true },
  ];

  const handleTestClick = (test: typeof tests[0]) => {
    if (test.externalUrl) {
      window.open(test.externalUrl, '_blank');
    } else {
      setSelectedTest(test.type);
    }
  };

  const handleTestSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsAnalyzing(true);
    const answerSummary = Object.entries(answers).map(([q, a]) => `Q: ${q}, A: ${a}`).join('; ');
    const context = `Jenis Ujian: ${selectedTest}. Data: ${answerSummary}`;
    const feedback = await analyzePsychTest(context);
    setTestResult(feedback);
    setIsAnalyzing(false);
  };

  const handleAnswerChange = (question: string, value: string) => {
    setAnswers(prev => ({ ...prev, [question]: value }));
  };

  // Find counselor names for selected campus
  const currentCampusInfo = campusList.find(c => c.name === selectedCampus);

  return (
    <div className="max-w-6xl mx-auto px-6 py-10">
      {/* Tab Navigation */}
      <div className="flex flex-wrap gap-2 mb-10 overflow-x-auto pb-2">
        {['Counselors', 'Test', 'Posters', 'Worksheets', 'Booking'].map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab as any)}
            className={`px-6 py-2 rounded-full text-sm font-semibold transition-all whitespace-nowrap ${
              activeTab === tab 
              ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-200' 
              : 'bg-white text-slate-600 hover:bg-slate-100 border'
            }`}
          >
            {tab === 'Counselors' ? 'Barisan Kaunselor' : tab === 'Test' ? 'Ujian Psikologi' : tab === 'Posters' ? 'Poster' : tab === 'Worksheets' ? 'Worksheet' : 'Temujanji'}
          </button>
        ))}
      </div>

      {activeTab === 'Counselors' && (
        <section className="animate-fadeIn">
          <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4">
            <div>
              <h2 className="text-2xl font-bold text-slate-800">Direktori Kaunselor Pendidikan</h2>
              <p className="text-slate-500">Kenali barisan kaunselor yang sedia membantu anda.</p>
            </div>
            <div className="flex bg-white p-1 rounded-xl border shadow-sm">
              <button 
                onClick={() => setCounselorCategory('IPGM')}
                className={`px-4 py-2 rounded-lg text-sm font-bold transition ${counselorCategory === 'IPGM' ? 'bg-indigo-600 text-white' : 'text-slate-500 hover:bg-slate-50'}`}
              >
                IPGM
              </button>
              <button 
                onClick={() => setCounselorCategory('IPGK')}
                className={`px-4 py-2 rounded-lg text-sm font-bold transition ${counselorCategory === 'IPGK' ? 'bg-indigo-600 text-white' : 'text-slate-500 hover:bg-slate-50'}`}
              >
                IPGK (Kampus)
              </button>
            </div>
          </div>

          {counselorCategory === 'IPGM' ? (
            <div className="grid md:grid-cols-2 gap-8">
              {counselorsIPGM.map(c => (
                <div key={c.id} className="bg-white p-8 rounded-3xl border border-slate-100 shadow-sm flex items-center space-x-6 hover:shadow-md transition">
                  <div className="w-24 h-24 rounded-2xl bg-indigo-50 flex items-center justify-center text-4xl overflow-hidden border-2 border-indigo-100">
                    <img src={c.image || 'https://picsum.photos/200'} alt={c.name} className="w-full h-full object-cover" />
                  </div>
                  <div>
                    <span className="text-[10px] font-bold text-indigo-500 uppercase tracking-widest bg-indigo-50 px-2 py-0.5 rounded">IPGM Pusat</span>
                    <h3 className="text-xl font-bold text-slate-800 mt-1">{c.name}</h3>
                    <p className="text-slate-600 font-medium text-sm">{c.role}</p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="space-y-8">
              <div className="max-w-md">
                <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Pilih Kampus IPGK / ELTC</label>
                <select 
                  value={selectedCampus}
                  onChange={(e) => setSelectedCampus(e.target.value)}
                  className="w-full bg-white border border-slate-200 rounded-xl px-4 py-3 text-slate-700 font-bold outline-none focus:ring-2 focus:ring-indigo-500 transition"
                >
                  {campusList.map(campus => (
                    <option key={campus.name} value={campus.name}>{campus.name}</option>
                  ))}
                </select>
              </div>

              <div className="grid md:grid-cols-3 gap-6">
                {[
                  { role: 'Ketua Kaunselor Pendidikan IPGK', icon: '🏅', name: currentCampusInfo?.counselors.ketua },
                  { role: 'Kaunselor Pendidikan (Pentadbir)', icon: '📋', name: currentCampusInfo?.counselors.pentadbir },
                  { role: 'Kaunselor Pendidikan (Pelajar)', icon: '🎓', name: currentCampusInfo?.counselors.pelajar }
                ].map((pos, idx) => (
                  <div key={idx} className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm hover:border-indigo-200 transition">
                    <div className="w-12 h-12 bg-slate-50 rounded-xl flex items-center justify-center text-2xl mb-4">
                      {pos.icon}
                    </div>
                    <h4 className="text-sm font-bold text-indigo-600 mb-1">{pos.role}</h4>
                    <h3 className="text-lg font-bold text-slate-800">{pos.name || '[Nama Pegawai]'}</h3>
                    <p className="text-slate-400 text-xs mt-2">{selectedCampus}</p>
                    <div className="mt-4 pt-4 border-t flex space-x-2">
                       <button className="flex-1 bg-slate-50 text-slate-600 py-2 rounded-lg text-[10px] font-bold hover:bg-indigo-50 hover:text-indigo-600 transition">Profil</button>
                       <button className="flex-1 bg-slate-50 text-slate-600 py-2 rounded-lg text-[10px] font-bold hover:bg-indigo-50 hover:text-indigo-600 transition">Hubungi</button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </section>
      )}

      {activeTab === 'Test' && (
        <section className="animate-fadeIn">
          {!selectedTest ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              <div className="col-span-full mb-4">
                <h2 className="text-2xl font-bold text-slate-800">Pilih Ujian Psikologi</h2>
                <p className="text-slate-500">Kenali diri anda dengan lebih mendalam melalui ujian-ujian berikut.</p>
              </div>
              {tests.map(t => (
                <button 
                  key={t.type}
                  onClick={() => handleTestClick(t)}
                  className="bg-white p-8 rounded-3xl border border-slate-100 shadow-sm hover:shadow-xl hover:border-indigo-200 transition-all text-left group relative overflow-hidden"
                >
                  {t.isConstruction && (
                    <div className="absolute top-4 right-[-35px] bg-amber-500 text-white text-[10px] font-bold px-10 py-1 rotate-45 shadow-sm">
                      DIKEMASKINI
                    </div>
                  )}
                  <div className={`w-14 h-14 rounded-2xl flex items-center justify-center text-2xl mb-6 ${t.color}`}>
                    {t.icon}
                  </div>
                  <h3 className="text-xl font-bold text-slate-800 group-hover:text-indigo-600 transition">
                    {t.type} 
                    {t.externalUrl && <span className="text-xs font-normal text-slate-400 ml-1">(Pautan Luar)</span>}
                  </h3>
                  <p className="text-slate-500 text-sm mt-2 leading-relaxed">{t.desc}</p>
                  
                  <div className="mt-6 flex items-center text-indigo-600 font-bold text-sm">
                    {t.externalUrl ? 'Buka Pautan' : (t.isConstruction ? 'Lihat Maklumat' : 'Mula Ujian')} 
                    <span className="ml-2 group-hover:translate-x-1 transition-transform">→</span>
                  </div>
                </button>
              ))}
            </div>
          ) : (
            <div className="max-w-3xl mx-auto">
              <button 
                onClick={() => { setSelectedTest(null); setTestResult(null); setAnswers({}); }}
                className="mb-6 flex items-center text-slate-500 hover:text-indigo-600 font-medium transition"
              >
                ← Kembali ke senarai ujian
              </button>
              
              <div className="bg-white p-8 md:p-10 rounded-3xl shadow-sm border border-slate-100 relative overflow-hidden">
                {tests.find(t => t.type === selectedTest)?.isConstruction && (
                   <div className="absolute inset-0 bg-white/60 backdrop-blur-[2px] z-10 flex items-center justify-center p-8 text-center">
                     <div className="bg-white p-10 rounded-3xl shadow-2xl border border-amber-100 max-w-sm animate-slideUp">
                        <div className="text-5xl mb-6">🚧</div>
                        <h3 className="text-2xl font-bold text-slate-800 mb-2">Dalam Proses Pembinaan</h3>
                        <p className="text-slate-500 mb-8 leading-relaxed">Maaf, ujian <strong>{selectedTest}</strong> sedang dikemaskini oleh pihak admin Unit Psikologi & Kaunseling.</p>
                        <button 
                          onClick={() => setSelectedTest(null)}
                          className="w-full bg-slate-800 text-white py-3 rounded-xl font-bold hover:bg-slate-900 transition"
                        >
                          Kembali
                        </button>
                     </div>
                   </div>
                )}

                <div className="flex items-center space-x-4 mb-8">
                  <div className={`w-12 h-12 rounded-xl flex items-center justify-center text-xl ${tests.find(t => t.type === selectedTest)?.color}`}>
                    {tests.find(t => t.type === selectedTest)?.icon}
                  </div>
                  <h2 className="text-2xl font-bold text-slate-800">Borang Ujian: {selectedTest}</h2>
                </div>

                <form onSubmit={handleTestSubmit} className="space-y-8">
                  <div className="space-y-6">
                    {selectedTest === 'Minda Sihat' && (
                      <div className="p-4 bg-slate-50 rounded-2xl">
                        <p className="font-semibold mb-3">Sejauh mana anda merasa sukar untuk bertenang sejak kebelakangan ini?</p>
                        <div className="flex justify-between">
                          {['Tidak Pernah', 'Jarang', 'Kerap', 'Sangat Kerap'].map(opt => (
                            <label key={opt} className="flex flex-col items-center cursor-pointer">
                              <input type="radio" name="q1" value={opt} onChange={(e) => handleAnswerChange('Ketenangan', e.target.value)} required className="accent-indigo-600 w-4 h-4" />
                              <span className="text-[10px] mt-1 text-slate-500">{opt}</span>
                            </label>
                          ))}
                        </div>
                      </div>
                    )}
                    
                    <div className="p-6 text-center border-2 border-dashed rounded-3xl text-slate-400">
                      <p>Bahagian soalan khusus untuk {selectedTest} sedang dikemaskini...</p>
                      <textarea 
                        placeholder="Sila nyatakan isu atau minat anda untuk dianalisis AI..."
                        className="w-full mt-4 p-4 rounded-xl bg-slate-50 text-slate-800 border-none outline-none focus:ring-2 focus:ring-indigo-500"
                        rows={4}
                        onChange={(e) => handleAnswerChange('Konteks Diri', e.target.value)}
                      ></textarea>
                    </div>
                  </div>

                  <button 
                    disabled={isAnalyzing}
                    className="w-full bg-indigo-600 text-white py-4 rounded-2xl font-bold hover:bg-indigo-700 transition disabled:opacity-50 shadow-lg shadow-indigo-100"
                  >
                    {isAnalyzing ? 'Sedang Memproses Data...' : 'Hantar & Jana Analisis AI'}
                  </button>
                </form>

                {testResult && (
                  <div className="mt-10 p-8 bg-indigo-900 rounded-3xl text-white animate-slideUp relative overflow-hidden">
                    <div className="absolute top-0 right-0 p-4 opacity-10 text-4xl">✨</div>
                    <h4 className="font-bold text-lg mb-4 flex items-center">
                      <span className="bg-indigo-500 p-1 rounded mr-2">🤖</span> 
                      Keputusan Analisis AI ({selectedTest})
                    </h4>
                    <p className="text-indigo-100 leading-relaxed italic">"{testResult}"</p>
                  </div>
                )}
              </div>
            </div>
          )}
        </section>
      )}

      {activeTab === 'Posters' && (
        <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 animate-fadeIn">
          {POSTERS.map(p => (
            <div key={p.id} className="group cursor-pointer overflow-hidden rounded-2xl bg-white border shadow-sm">
              <div className="relative h-64 overflow-hidden">
                <img src={p.image} alt={p.title} className="w-full h-full object-cover group-hover:scale-110 transition duration-500" />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end p-6">
                   <button className="text-white text-sm font-bold underline">Muat Turun PDF</button>
                </div>
              </div>
              <div className="p-4">
                <h3 className="font-bold text-slate-800">{p.title}</h3>
              </div>
            </div>
          ))}
        </section>
      )}

      {activeTab === 'Worksheets' && (
        <section className="grid gap-4 animate-fadeIn">
          {WORKSHEETS.map(w => (
            <div key={w.id} className="bg-white p-6 rounded-2xl border flex items-center justify-between hover:border-indigo-300 transition group">
              <div>
                <h3 className="text-lg font-bold text-slate-800 group-hover:text-indigo-700 transition">{w.name}</h3>
                <p className="text-slate-500 text-sm">{w.description}</p>
              </div>
              <button className="bg-indigo-50 text-indigo-600 px-4 py-2 rounded-lg text-sm font-bold hover:bg-indigo-600 hover:text-white transition">Lihat & Isi</button>
            </div>
          ))}
        </section>
      )}

      {activeTab === 'Booking' && (
        <section className="w-full animate-fadeIn">
          <div className="bg-white p-6 rounded-3xl shadow-sm border overflow-hidden">
            <div className="mb-6">
              <h2 className="text-2xl font-bold text-slate-800">Sistem Temujanji e2PK</h2>
              <p className="text-slate-500 text-sm">Anda sedang disambungkan ke sistem temujanji rasmi Kementerian Pendidikan Malaysia.</p>
            </div>
            <div className="w-full h-[800px] rounded-2xl border border-slate-100 bg-slate-50 overflow-hidden relative">
              <iframe 
                src="https://e2pk.moe.gov.my/inframe.cfm?temujanji" 
                className="w-full h-full border-none"
                title="Sistem Temujanji e2PK"
                loading="lazy"
              />
            </div>
            <div className="mt-4 text-center">
              <p className="text-xs text-slate-400 italic">Sekiranya paparan di atas tidak muncul, sila <a href="https://e2pk.moe.gov.my/inframe.cfm?temujanji" target="_blank" rel="noreferrer" className="text-indigo-600 font-bold underline">klik di sini</a> untuk membuka pautan dalam tab baru.</p>
            </div>
          </div>
        </section>
      )}
    </div>
  );
};

export default PublicView;
