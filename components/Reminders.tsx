import React, { useState } from 'react';
import { MessageCircle, Clock, CheckCircle2, AlertCircle, Send } from 'lucide-react';
import { Student } from '../types';

interface RemindersProps {
  students: Student[];
  onUpdateStudent: (s: Student) => Promise<void>;
  academyName: string;
}

const Reminders: React.FC<RemindersProps> = ({ students, onUpdateStudent, academyName }) => {
  const [filterClass, setFilterClass] = useState('All');

  const pendingStudents = students.filter(s => (s.totalFee - s.paidFee) > 0);
  const totalDue = pendingStudents.reduce((acc, s) => acc + (s.totalFee - s.paidFee), 0);
  
  const filteredList = pendingStudents.filter(s => 
    filterClass === 'All' || s.standard === filterClass
  );

  const handleSendReminder = async (student: Student) => {
    const due = student.totalFee - student.paidFee;
    const message = `Hello ${student.name}, this is a gentle reminder from ${academyName}. You have a pending fee due of ₹${due}. Please clear it at your earliest convenience. Thank you.`;
    
    // Open WhatsApp
    const url = `https://wa.me/${student.whatsapp}?text=${encodeURIComponent(message)}`;
    window.open(url, '_blank');

    // Update last reminder timestamp
    await onUpdateStudent({
      ...student,
      lastReminderSent: Date.now()
    });
  };

  const isRestricted = (lastSent?: number) => {
    if (!lastSent) return false;
    const hours = (Date.now() - lastSent) / (1000 * 60 * 60);
    return hours < 24;
  };

  const getRestrictionLabel = (lastSent: number) => {
    const hoursLeft = 24 - Math.floor((Date.now() - lastSent) / (1000 * 60 * 60));
    return `${hoursLeft}h cooldown`;
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
       
       {/* Summary Header */}
       <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200 flex flex-col md:flex-row justify-between items-center gap-4">
          <div>
            <h2 className="text-lg font-bold text-slate-800">Pending Reminders</h2>
            <p className="text-slate-500 text-sm">
               {pendingStudents.length} students pending • <span className="text-red-600 font-medium">Total Due: ₹{totalDue.toLocaleString()}</span>
            </p>
          </div>
          <select
            value={filterClass}
            onChange={(e) => setFilterClass(e.target.value)}
            className="px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm font-medium text-slate-700 focus:ring-2 focus:ring-brand-500 outline-none min-w-[150px]"
          >
            <option value="All">All Classes</option>
            {[...new Set(pendingStudents.map(s => s.standard))].sort().map(c => (
              <option key={c} value={c}>Standard {c}</option>
            ))}
          </select>
       </div>

       {/* List */}
       <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
          {filteredList.length > 0 ? (
            <div className="divide-y divide-slate-100">
              {filteredList.map(student => {
                 const restricted = isRestricted(student.lastReminderSent);
                 const due = student.totalFee - student.paidFee;
                 return (
                  <div key={student.id} className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:bg-slate-50 transition-colors group">
                    <div className="flex items-center gap-4">
                       <div className="w-10 h-10 rounded-full bg-red-50 text-red-600 flex items-center justify-center">
                          <AlertCircle size={20} />
                       </div>
                       <div>
                          <p className="font-semibold text-slate-800">{student.name}</p>
                          <p className="text-sm text-slate-500">Class {student.standard} • <span className="text-red-600 font-medium">₹{due} overdue</span></p>
                       </div>
                    </div>
                    
                    <button
                      onClick={() => !restricted && handleSendReminder(student)}
                      disabled={restricted}
                      className={`flex items-center justify-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all w-full sm:w-auto ${
                        restricted 
                          ? 'bg-slate-100 text-slate-400 cursor-not-allowed' 
                          : 'bg-green-600 text-white hover:bg-green-700 shadow-sm'
                      }`}
                    >
                      {restricted ? (
                        <>
                          <Clock size={16} />
                          {student.lastReminderSent && getRestrictionLabel(student.lastReminderSent)}
                        </>
                      ) : (
                        <>
                          <Send size={16} />
                          Send Reminder
                        </>
                      )}
                    </button>
                  </div>
                 )
              })}
            </div>
          ) : (
             <div className="flex flex-col items-center justify-center py-16 text-center">
                <div className="w-16 h-16 bg-green-50 text-green-600 rounded-full flex items-center justify-center mb-4">
                   <CheckCircle2 size={32} />
                </div>
                <h3 className="text-lg font-bold text-slate-800">All Clear!</h3>
                <p className="text-slate-400">No pending dues for this selection.</p>
             </div>
          )}
       </div>
    </div>
  );
};

export default Reminders;