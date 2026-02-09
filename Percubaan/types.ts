
export interface Counselor {
  id: string;
  name: string;
  role: 'Ketua Penolong Pengarah' | 'Penolong Pengarah' | 'Ketua Kaunselor Pendidikan IPGK' | 'Kaunselor Pendidikan (Pentadbir)' | 'Kaunselor Pendidikan (Pelajar)';
  image?: string;
  category: 'IPGM' | 'IPGK';
  campus?: string;
  specialization?: string[];
}

export interface IPGKData {
  name: string;
  counselors: {
    ketua: string;
    pentadbir: string;
    pelajar: string;
  };
}

export interface Appointment {
  id: string;
  clientName: string;
  date: string;
  time: string;
  counselorId: string;
  reason: string;
  status: 'Pending' | 'Approved' | 'Completed';
}

export interface MemoTemplate {
  id: string;
  title: string;
  category: 'Surat' | 'Memo';
  content: string;
}

export type ViewType = 'Public' | 'Admin';
