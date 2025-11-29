import React, { useState } from 'react';
import { MessageCircle, CheckCircle, Clock } from 'lucide-react';
import { Student } from '../types';

interface RemindersProps {
  students: Student[];
  onUpdateStudent: (s: Student) => Promise<void>;
  academyName: string;
}

const Reminders: React.FC<RemindersProps> = ({ students, onUpdateStudent, academyName }) => {
  const [filterClass, setFilterClass] = useState('All');

  const pendingStudents = students.filter(s => (s.totalFee - s.paidFee) > 0);
  
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
    return `Wait ${hoursLeft}h`;
  };

  return (
    <div className="pb-20 space-y-6">
      <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
        <div className="flex flex-col md:flex-row justify-between items-center gap-4 mb-6">
          <h2 className="text-lg font-bold text-gray-800 flex items-center gap-2">
            <MessageCircle className="text-brand-600" />
            Fee Reminders
          </h2>
          <select
            value={filterClass}
            onChange={(e) => setFilterClass(e.target.value)}
            className="px-4 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-brand-500"
          >
            <option value="All">All Classes</option>
            {[...new Set(pendingStudents.map(s => s.standard))].sort().map(c => (
              <option key={c} value={c}>Std {c}</option>
            ))}
          </select>
        </div>

        <div className="overflow-hidden">
          {filteredList.length > 0 ? (
            <div className="space-y-3">
              {filteredList.map(student => {
                 const restricted = isRestricted(student.lastReminderSent);
                 const due = student.totalFee - student.paidFee;
                 return (
                  <div key={student.id} className="flex flex-col sm:flex-row items-start sm:items-center justify-between p-4 bg-gray-50 rounded-xl border border-gray-100 hover:border-brand-200 transition-colors">
                    <div className="mb-3 sm:mb-0">
                      <p className="font-semibold text-gray-800">{student.name}</p>
                      <p className="text-xs text-gray-500">Std {student.standard} • Due: <span className="text-red-600 font-medium">₹{due}</span></p>
                    </div>
                    
                    <button
                      onClick={() => !restricted && handleSendReminder(student)}
                      disabled={restricted}
                      className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all w-full sm:w-auto justify-center ${
                        restricted 
                          ? 'bg-gray-200 text-gray-500 cursor-not-allowed' 
                          : 'bg-green-600 text-white hover:bg-green-700 shadow-sm hover:shadow-md'
                      }`}
                    >
                      {restricted ? (
                        <>
                          <Clock size={16} />
                          {student.lastReminderSent && getRestrictionLabel(student.lastReminderSent)}
                        </>
                      ) : (
                        <>
                          <MessageCircle size={16} />
                          Send WhatsApp
                        </>
                      )}
                    </button>
                  </div>
                 )
              })}
            </div>
          ) : (
             <div className="text-center py-10 text-gray-400">
                <CheckCircle size={48} className="mx-auto mb-2 opacity-50" />
                <p>No pending dues! Great job.</p>
             </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Reminders;