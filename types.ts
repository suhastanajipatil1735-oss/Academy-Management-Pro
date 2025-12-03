export interface Student {
  id: string;
  name: string;
  whatsapp: string;
  standard: string;
  totalFee: number;
  paidFee: number;
  lastReminderSent?: number; // timestamp
  createdAt: number;
}

export interface AcademySettings {
  academyName: string;
}

export enum ViewState {
  SPLASH = 'SPLASH',
  LOGIN = 'LOGIN',
  DASHBOARD = 'DASHBOARD',
  STUDENTS = 'STUDENTS',
  REMINDERS = 'REMINDERS',
  RECEIPTS = 'RECEIPTS',
  SETTINGS = 'SETTINGS',
}

export interface Stats {
  totalStudents: number;
  totalFeeCollected: number;
  totalDueAmount: number;
}