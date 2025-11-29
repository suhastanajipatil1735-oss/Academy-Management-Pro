import { Student, AcademySettings } from '../types';

const STORAGE_KEYS = {
  STUDENTS: 'amp_students',
  SETTINGS: 'amp_settings',
  SESSION: 'amp_session_token',
};

// Simulate async network delay for realism and future API swap
const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

export const db = {
  // --- Auth ---
  isAuthenticated: (): boolean => {
    return !!localStorage.getItem(STORAGE_KEYS.SESSION);
  },

  login: async (password: string): Promise<boolean> => {
    await delay(500);
    if (password === 'suhaspatilsir') {
      // Create a persistent session token (simple timestamp for demo)
      localStorage.setItem(STORAGE_KEYS.SESSION, Date.now().toString());
      return true;
    }
    return false;
  },

  logout: async () => {
    await delay(200);
    localStorage.removeItem(STORAGE_KEYS.SESSION);
  },

  // --- Settings ---
  getSettings: async (): Promise<AcademySettings> => {
    await delay(100);
    const data = localStorage.getItem(STORAGE_KEYS.SETTINGS);
    return data ? JSON.parse(data) : { academyName: 'My Academy' };
  },

  updateSettings: async (settings: AcademySettings): Promise<void> => {
    await delay(200);
    localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(settings));
  },

  // --- Students ---
  getStudents: async (): Promise<Student[]> => {
    await delay(300);
    const data = localStorage.getItem(STORAGE_KEYS.STUDENTS);
    return data ? JSON.parse(data) : [];
  },

  addStudent: async (student: Omit<Student, 'id' | 'createdAt'>): Promise<Student> => {
    await delay(300);
    const students = await db.getStudents();
    const newStudent: Student = {
      ...student,
      id: crypto.randomUUID(),
      createdAt: Date.now(),
    };
    students.push(newStudent);
    localStorage.setItem(STORAGE_KEYS.STUDENTS, JSON.stringify(students));
    return newStudent;
  },

  updateStudent: async (updatedStudent: Student): Promise<void> => {
    await delay(300);
    const students = await db.getStudents();
    const index = students.findIndex((s) => s.id === updatedStudent.id);
    if (index !== -1) {
      students[index] = updatedStudent;
      localStorage.setItem(STORAGE_KEYS.STUDENTS, JSON.stringify(students));
    }
  },

  deleteStudent: async (id: string): Promise<void> => {
    await delay(300);
    const students = await db.getStudents();
    const filtered = students.filter((s) => s.id !== id);
    localStorage.setItem(STORAGE_KEYS.STUDENTS, JSON.stringify(filtered));
  },

  deleteStudentsByClass: async (standard: string): Promise<void> => {
     await delay(300);
     const students = await db.getStudents();
     const filtered = students.filter((s) => s.standard !== standard);
     localStorage.setItem(STORAGE_KEYS.STUDENTS, JSON.stringify(filtered));
  }
};