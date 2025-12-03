import React, { useState, useMemo } from 'react';
import { Search, Filter, Plus, Edit2, Trash2, Download, X, Save, ArrowLeft, UserX, MoreVertical } from 'lucide-react';
import { Student } from '../types';

interface StudentManagerProps {
  students: Student[];
  onAddStudent: (s: Omit<Student, 'id' | 'createdAt'>) => Promise<void>;
  onUpdateStudent: (s: Student) => Promise<void>;
  onDeleteStudent: (id: string) => Promise<void>;
  onDeleteClass: (standard: string) => Promise<void>;
}

const StudentManager: React.FC<StudentManagerProps> = ({
  students,
  onAddStudent,
  onUpdateStudent,
  onDeleteStudent,
  onDeleteClass,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterClass, setFilterClass] = useState('All');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingStudent, setEditingStudent] = useState<Student | null>(null);
  
  // Remove Mode State
  const [isRemoveMode, setIsRemoveMode] = useState(false);

  // Form State
  const [formData, setFormData] = useState({
    name: '',
    whatsapp: '',
    standard: '',
    totalFee: '',
    paidFee: '',
  });

  const availableClasses = useMemo(() => {
    const classes = Array.from(new Set(students.map((s) => s.standard)));
    return ['All', ...classes.sort((a, b) => Number(a) - Number(b))];
  }, [students]);

  const filteredStudents = useMemo(() => {
    return students.filter((s) => {
      const matchesSearch = s.name.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesClass = filterClass === 'All' || s.standard === filterClass;
      return matchesSearch && matchesClass;
    });
  }, [students, searchTerm, filterClass]);

  const handleOpenModal = (student?: Student) => {
    if (student) {
      setEditingStudent(student);
      setFormData({
        name: student.name,
        whatsapp: student.whatsapp,
        standard: student.standard,
        totalFee: student.totalFee.toString(),
        paidFee: student.paidFee.toString(),
      });
    } else {
      setEditingStudent(null);
      setFormData({ name: '', whatsapp: '', standard: '5', totalFee: '', paidFee: '' });
    }
    setIsModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const payload = {
      name: formData.name,
      whatsapp: formData.whatsapp,
      standard: formData.standard,
      totalFee: Number(formData.totalFee),
      paidFee: Number(formData.paidFee),
    };

    if (editingStudent) {
      await onUpdateStudent({ ...editingStudent, ...payload });
    } else {
      await onAddStudent(payload);
    }
    setIsModalOpen(false);
  };

  const handleExport = () => {
    const headers = ['Name,WhatsApp,Class,Total Fee,Paid Fee,Due Amount'];
    const rows = filteredStudents.map(s => 
      `"${s.name}","${s.whatsapp}","${s.standard}",${s.totalFee},${s.paidFee},${s.totalFee - s.paidFee}`
    );
    const csvContent = "data:text/csv;charset=utf-8," + [headers, ...rows].join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `students_export.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // --- REMOVE MODE ---
  if (isRemoveMode) {
    return (
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="p-4 border-b border-slate-100 bg-red-50 flex flex-col md:flex-row justify-between items-center gap-4">
           <div className="flex items-center gap-2">
              <button onClick={() => setIsRemoveMode(false)} className="p-2 hover:bg-red-100 rounded-full text-red-700 transition-colors">
                <ArrowLeft size={20} />
              </button>
              <div>
                <h2 className="text-lg font-bold text-red-800">Bulk Remove Mode</h2>
                <p className="text-sm text-red-600">Permanently delete students</p>
              </div>
           </div>
           
           <div className="flex gap-2 w-full md:w-auto">
             <select
                value={filterClass}
                onChange={(e) => setFilterClass(e.target.value)}
                className="px-3 py-2 bg-white border border-red-200 rounded-lg text-sm focus:ring-2 focus:ring-red-500 outline-none flex-1 md:flex-none"
             >
                {availableClasses.map((c) => (
                  <option key={c} value={c}>{c === 'All' ? 'Select Class' : `Std ${c}`}</option>
                ))}
             </select>
             {filterClass !== 'All' && filteredStudents.length > 0 && (
               <button 
                  onClick={() => {
                     if(confirm(`Are you sure you want to delete all ${filteredStudents.length} students in Std ${filterClass}?`)) {
                        onDeleteClass(filterClass);
                     }
                  }}
                  className="px-4 py-2 bg-red-600 text-white rounded-lg text-sm font-medium hover:bg-red-700 flex items-center gap-2"
               >
                 <Trash2 size={16} />
                 Delete All
               </button>
             )}
           </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="bg-slate-50 text-slate-500 font-medium">
              <tr>
                <th className="px-6 py-3">Student Name</th>
                <th className="px-6 py-3">Class</th>
                <th className="px-6 py-3">Contact</th>
                <th className="px-6 py-3 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredStudents.map((student) => (
                <tr key={student.id} className="hover:bg-red-50/30 group">
                  <td className="px-6 py-3 font-medium text-slate-800">{student.name}</td>
                  <td className="px-6 py-3 text-slate-500">{student.standard}th</td>
                  <td className="px-6 py-3 text-slate-500">{student.whatsapp}</td>
                  <td className="px-6 py-3 text-right">
                    <button 
                       onClick={() => { if(confirm('Delete this student?')) onDeleteStudent(student.id) }}
                       className="text-red-600 hover:text-red-800 font-medium bg-red-50 px-3 py-1 rounded-md border border-red-100"
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
              {filteredStudents.length === 0 && (
                <tr>
                  <td colSpan={4} className="px-6 py-8 text-center text-slate-400">
                    No students found. Select a class to proceed.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    );
  }

  // --- MAIN MANAGER VIEW ---
  return (
    <div className="space-y-4">
      {/* Toolbar */}
      <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-200 flex flex-col md:flex-row justify-between gap-4 items-center">
         <div className="relative w-full md:w-80">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
            <input
              type="text"
              placeholder="Search by name..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-brand-500 transition-all"
            />
         </div>

         <div className="flex gap-2 w-full md:w-auto overflow-x-auto pb-1 md:pb-0">
            <select
              value={filterClass}
              onChange={(e) => setFilterClass(e.target.value)}
              className="px-3 py-2 bg-white border border-slate-200 rounded-lg text-sm text-slate-700 focus:ring-2 focus:ring-brand-500 outline-none"
            >
              {availableClasses.map((c) => (
                <option key={c} value={c}>{c === 'All' ? 'All Classes' : `Std ${c}`}</option>
              ))}
            </select>

            <button onClick={handleExport} className="p-2 text-slate-600 border border-slate-200 rounded-lg hover:bg-slate-50" title="Export">
               <Download size={18} />
            </button>
            
            <button 
              onClick={() => setIsRemoveMode(true)} 
              className="p-2 text-red-600 border border-red-200 bg-red-50 rounded-lg hover:bg-red-100" 
              title="Remove Mode"
            >
               <UserX size={18} />
            </button>

            <button
              onClick={() => handleOpenModal()}
              className="flex items-center gap-2 px-4 py-2 bg-brand-600 text-white rounded-lg text-sm font-medium hover:bg-brand-700 shadow-sm ml-auto md:ml-0"
            >
              <Plus size={18} />
              Add Student
            </button>
         </div>
      </div>

      {/* Desktop Table View */}
      <div className="hidden md:block bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
        <table className="w-full text-sm text-left">
          <thead className="bg-slate-50 text-slate-500 font-semibold border-b border-slate-200">
            <tr>
              <th className="px-6 py-4">Student Name</th>
              <th className="px-6 py-4">Standard</th>
              <th className="px-6 py-4">WhatsApp</th>
              <th className="px-6 py-4">Fee Status</th>
              <th className="px-6 py-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {filteredStudents.map((student) => {
              const due = student.totalFee - student.paidFee;
              return (
                <tr key={student.id} className="hover:bg-slate-50 transition-colors">
                  <td className="px-6 py-4 font-medium text-slate-800">
                    <div className="flex items-center gap-3">
                       <div className="w-8 h-8 rounded-full bg-brand-100 text-brand-600 flex items-center justify-center text-xs font-bold">
                          {student.name.charAt(0)}
                       </div>
                       {student.name}
                    </div>
                  </td>
                  <td className="px-6 py-4 text-slate-600">{student.standard}th</td>
                  <td className="px-6 py-4 text-slate-600 font-mono">{student.whatsapp}</td>
                  <td className="px-6 py-4">
                     <div className="flex flex-col">
                        <span className={`text-xs font-bold px-2 py-0.5 rounded w-fit ${due > 0 ? 'bg-amber-100 text-amber-700' : 'bg-green-100 text-green-700'}`}>
                           {due > 0 ? 'Pending' : 'Paid'}
                        </span>
                        <span className="text-xs text-slate-400 mt-1">Due: ₹{due}</span>
                     </div>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <button 
                       onClick={() => handleOpenModal(student)}
                       className="text-brand-600 hover:text-brand-800 font-medium text-sm p-1.5 hover:bg-brand-50 rounded"
                    >
                       Edit
                    </button>
                  </td>
                </tr>
              );
            })}
             {filteredStudents.length === 0 && (
                <tr>
                   <td colSpan={5} className="px-6 py-10 text-center text-slate-400">
                      No students found matching your criteria.
                   </td>
                </tr>
             )}
          </tbody>
        </table>
      </div>

      {/* Mobile Card View */}
      <div className="md:hidden grid grid-cols-1 gap-3">
        {filteredStudents.map((student) => {
           const due = student.totalFee - student.paidFee;
           return (
             <div key={student.id} className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex flex-col gap-3">
               <div className="flex justify-between items-start">
                 <div className="flex gap-3 items-center">
                    <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center text-slate-500 font-bold">
                       {student.name.charAt(0)}
                    </div>
                    <div>
                       <h3 className="font-semibold text-slate-800">{student.name}</h3>
                       <p className="text-xs text-slate-500">Class {student.standard} • {student.whatsapp}</p>
                    </div>
                 </div>
                 <button onClick={() => handleOpenModal(student)} className="text-slate-400 hover:text-brand-600">
                    <Edit2 size={16} />
                 </button>
               </div>
               
               <div className="bg-slate-50 p-3 rounded-lg flex justify-between items-center text-sm">
                  <div>
                    <p className="text-xs text-slate-400">Total Fee</p>
                    <p className="font-medium">₹{student.totalFee}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-xs text-slate-400">Paid</p>
                    <p className="font-medium text-brand-600">₹{student.paidFee}</p>
                  </div>
               </div>
               
               {due > 0 && (
                 <div className="text-xs text-amber-600 bg-amber-50 px-3 py-1.5 rounded-md text-center font-medium border border-amber-100">
                    Outstanding Due: ₹{due}
                 </div>
               )}
             </div>
           );
        })}
        {filteredStudents.length === 0 && (
          <div className="text-center py-10 text-slate-400">No students found.</div>
        )}
      </div>

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl w-full max-w-lg p-0 shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="px-6 py-4 border-b border-slate-100 flex justify-between items-center bg-slate-50">
              <h2 className="text-lg font-bold text-slate-800">
                {editingStudent ? 'Edit Student Profile' : 'New Student Admission'}
              </h2>
              <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-slate-600">
                <X size={20} />
              </button>
            </div>
            
            <form onSubmit={handleSubmit} className="p-6 space-y-5">
              <div>
                <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wide mb-1.5">Student Name</label>
                <input
                  required
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({...formData, name: e.target.value})}
                  className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-brand-500 focus:bg-white transition-all outline-none"
                  placeholder="e.g. Rahul Patil"
                />
              </div>
              
              <div className="grid grid-cols-2 gap-5">
                 <div>
                    <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wide mb-1.5">Standard</label>
                    <select
                      required
                      value={formData.standard}
                      onChange={(e) => setFormData({...formData, standard: e.target.value})}
                      className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-brand-500 outline-none"
                    >
                      {[...Array(8)].map((_, i) => (
                        <option key={i} value={String(i + 5)}>{i + 5}th</option>
                      ))}
                    </select>
                 </div>
                 <div>
                    <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wide mb-1.5">WhatsApp Number</label>
                    <input
                      required
                      type="tel"
                      value={formData.whatsapp}
                      onChange={(e) => setFormData({...formData, whatsapp: e.target.value})}
                      placeholder="9876543210"
                      className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-brand-500 outline-none"
                    />
                 </div>
              </div>

              <div className="p-4 bg-brand-50/50 rounded-lg border border-brand-100">
                 <h3 className="text-sm font-bold text-brand-800 mb-3">Fee Structure</h3>
                 <div className="grid grid-cols-2 gap-5">
                    <div>
                        <label className="block text-xs font-semibold text-brand-600 mb-1">Total Fee (₹)</label>
                        <input
                        required
                        type="number"
                        min="0"
                        value={formData.totalFee}
                        onChange={(e) => setFormData({...formData, totalFee: e.target.value})}
                        className="w-full px-3 py-2 bg-white border border-brand-200 rounded-md focus:ring-2 focus:ring-brand-500 outline-none"
                        />
                    </div>
                    <div>
                        <label className="block text-xs font-semibold text-brand-600 mb-1">Paid Amount (₹)</label>
                        <input
                        required
                        type="number"
                        min="0"
                        value={formData.paidFee}
                        onChange={(e) => setFormData({...formData, paidFee: e.target.value})}
                        className="w-full px-3 py-2 bg-white border border-brand-200 rounded-md focus:ring-2 focus:ring-brand-500 outline-none"
                        />
                    </div>
                 </div>
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  className="w-full py-3 bg-brand-600 text-white rounded-lg font-semibold hover:bg-brand-700 shadow-sm flex items-center justify-center gap-2 transition-transform active:scale-[0.98]"
                >
                  <Save size={18} />
                  {editingStudent ? 'Update Profile' : 'Create Record'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default StudentManager;