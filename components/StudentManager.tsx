import React, { useState, useMemo } from 'react';
import { Search, Filter, Plus, Edit2, Trash2, Download, X, Save } from 'lucide-react';
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
    return ['All', ...classes.sort()];
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
    link.setAttribute("download", `students_export_${new Date().toISOString().slice(0,10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="pb-20 space-y-6">
      {/* Header Controls */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-white p-4 rounded-xl shadow-sm border border-gray-100">
        <div className="relative w-full md:w-64">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
          <input
            type="text"
            placeholder="Search students..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-500"
          />
        </div>
        
        <div className="flex gap-2 w-full md:w-auto overflow-x-auto">
          <select
            value={filterClass}
            onChange={(e) => setFilterClass(e.target.value)}
            className="px-4 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-500 text-sm"
          >
            {availableClasses.map((c) => (
              <option key={c} value={c}>{c === 'All' ? 'All Classes' : `Std ${c}`}</option>
            ))}
          </select>

          <button onClick={handleExport} className="p-2 text-gray-600 bg-gray-100 rounded-lg hover:bg-gray-200">
            <Download size={20} />
          </button>
          
          {filterClass !== 'All' && (
             <button 
                onClick={() => {
                   if(confirm(`Are you sure you want to delete ALL students in Standard ${filterClass}?`)) {
                      onDeleteClass(filterClass);
                   }
                }}
                className="p-2 text-red-600 bg-red-100 rounded-lg hover:bg-red-200"
                title="Delete all in this class"
             >
                <Trash2 size={20} />
             </button>
          )}

          <button
            onClick={() => handleOpenModal()}
            className="flex items-center gap-2 px-4 py-2 bg-brand-600 text-white rounded-lg hover:bg-brand-700 shadow-sm whitespace-nowrap"
          >
            <Plus size={18} />
            Add Student
          </button>
        </div>
      </div>

      {/* Student List */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredStudents.map((student) => {
          const due = student.totalFee - student.paidFee;
          return (
            <div key={student.id} className="bg-white p-5 rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow relative group">
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="font-semibold text-gray-800 text-lg">{student.name}</h3>
                  <p className="text-sm text-gray-500">Std: {student.standard} • {student.whatsapp}</p>
                </div>
                <div className={`px-2 py-1 text-xs font-bold rounded-full ${due > 0 ? 'bg-red-100 text-red-600' : 'bg-green-100 text-green-600'}`}>
                  {due > 0 ? `Due: ₹${due}` : 'Paid'}
                </div>
              </div>
              
              <div className="mt-4 pt-4 border-t border-gray-50 flex justify-between items-center text-sm">
                 <div>
                    <span className="text-gray-400 block text-xs">Total Fee</span>
                    <span className="font-medium">₹{student.totalFee}</span>
                 </div>
                 <div className="text-right">
                    <span className="text-gray-400 block text-xs">Paid</span>
                    <span className="font-medium text-brand-600">₹{student.paidFee}</span>
                 </div>
              </div>

              <div className="absolute top-4 right-14 opacity-0 group-hover:opacity-100 transition-opacity flex gap-2">
                 <button onClick={() => handleOpenModal(student)} className="p-1.5 bg-blue-50 text-blue-600 rounded-md hover:bg-blue-100">
                    <Edit2 size={16} />
                 </button>
                 <button onClick={() => { if(confirm('Delete student?')) onDeleteStudent(student.id) }} className="p-1.5 bg-red-50 text-red-600 rounded-md hover:bg-red-100">
                    <Trash2 size={16} />
                 </button>
              </div>
            </div>
          );
        })}
        {filteredStudents.length === 0 && (
          <div className="col-span-full text-center py-12 text-gray-400">
            No students found. Add one to get started!
          </div>
        )}
      </div>

      {/* Add/Edit Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50 backdrop-blur-sm">
          <div className="bg-white rounded-2xl w-full max-w-md p-6 shadow-2xl animate-in fade-in zoom-in duration-200">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-bold text-gray-800">
                {editingStudent ? 'Edit Student' : 'Add New Student'}
              </h2>
              <button onClick={() => setIsModalOpen(false)} className="text-gray-400 hover:text-gray-600">
                <X size={24} />
              </button>
            </div>
            
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
                <input
                  required
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({...formData, name: e.target.value})}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-500 focus:border-transparent"
                />
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                 <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Standard</label>
                    <select
                      required
                      value={formData.standard}
                      onChange={(e) => setFormData({...formData, standard: e.target.value})}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-500"
                    >
                      {[...Array(8)].map((_, i) => (
                        <option key={i} value={String(i + 5)}>{i + 5}th</option>
                      ))}
                    </select>
                 </div>
                 <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">WhatsApp</label>
                    <input
                      required
                      type="tel"
                      value={formData.whatsapp}
                      onChange={(e) => setFormData({...formData, whatsapp: e.target.value})}
                      placeholder="9876543210"
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-500"
                    />
                 </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                 <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Total Fee</label>
                    <input
                      required
                      type="number"
                      min="0"
                      value={formData.totalFee}
                      onChange={(e) => setFormData({...formData, totalFee: e.target.value})}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-500"
                    />
                 </div>
                 <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Paid Amount</label>
                    <input
                      required
                      type="number"
                      min="0"
                      value={formData.paidFee}
                      onChange={(e) => setFormData({...formData, paidFee: e.target.value})}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-500"
                    />
                 </div>
              </div>

              <div className="pt-4">
                <button
                  type="submit"
                  className="w-full py-3 bg-brand-600 text-white rounded-xl font-semibold hover:bg-brand-700 shadow-md flex items-center justify-center gap-2"
                >
                  <Save size={20} />
                  Save Student
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