
import { GoogleGenAI } from "@google/genai";

const getAI = () => new GoogleGenAI({ apiKey: process.env.API_KEY || "" });

export const generateMemoContent = async (topic: string, recipient: string, type: 'Surat' | 'Memo') => {
  const ai = getAI();
  const prompt = `Sila draf satu ${type} rasmi daripada Unit Kaunseling. 
  Topik: ${topic}. 
  Penerima: ${recipient}. 
  Bahasa: Bahasa Melayu Formal. 
  Sertakan struktur lengkap: Tarikh, No Rujukan, Tajuk, dan Kandungan Utama.`;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: prompt,
    });
    return response.text || "Gagal menjana draf. Sila cuba lagi.";
  } catch (error) {
    console.error("Gemini Error:", error);
    return "Ralat teknikal semasa menjana draf.";
  }
};

export const analyzePsychTest = async (context: string) => {
  const ai = getAI();
  const prompt = `Anda adalah seorang Kaunselor Berdaftar yang sangat empati. Berikan ulasan ringkas dan profesional berdasarkan data ujian psikologi berikut: ${context}. 
  Garis panduan:
  1. Jika ini ujian Kerjaya, berikan cadangan bidang yang sesuai.
  2. Jika ini ujian Minda Sihat, berikan galakan dan nasihat kesihatan mental.
  3. Jika ini PKPP (Profil Kesejahteraan Psikologi Pelajar) atau PKPW (Profil Kesejahteraan Psikologi Warga), berikan ulasan tentang tahap kesejahteraan dan cadangan penambahbaikan diri.
  4. Jika Gaya Belajar, berikan tip belajar yang berkesan.
  5. Gunakan Bahasa Melayu yang sopan, memberi inspirasi, dan mudah difahami.
  6. Pastikan ulasan dalam 3-5 ayat sahaja.`;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: prompt,
    });
    return response.text || "Ulasan tidak tersedia buat masa ini.";
  } catch (error) {
    console.error("Gemini Analysis Error:", error);
    return "Sistem sibuk menganalisis data. Sila hubungi Unit Kaunseling secara terus untuk keputusan rasmi.";
  }
};
