import React, { useState } from 'react';
import { FileText, Download, Share2, Printer } from 'lucide-react';
import { jsPDF } from 'jspdf';
import { Student } from '../types';

interface FeeReceiptProps {
  students: Student[];
  academyName: string;
}

const FeeReceipt: React.FC<FeeReceiptProps> = ({ students, academyName }) => {
  const [filterClass, setFilterClass] = useState('All');

  const filteredStudents = students.filter(s => 
    filterClass === 'All' || s.standard === filterClass
  );

  const availableClasses = Array.from(new Set(students.map((s) => s.standard))).sort((a, b) => Number(a) - Number(b));

  const generateAndSendReceipt = (student: Student) => {
    const doc = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: 'a5'
    });

    // --- PDF DESIGN ---
    const primaryColor = '#2563eb'; // Blue-600
    
    // Header
    doc.setFillColor(248, 250, 252); // Slate-50
    doc.rect(0, 0, 148, 40, 'F');
    
    doc.setFontSize(18);
    doc.setTextColor(primaryColor);
    doc.setFont('helvetica', 'bold');
    doc.text(academyName || "Academy Receipt", 74, 15, { align: 'center' });
    
    doc.setFontSize(10);
    doc.setTextColor(100);
    doc.setFont('helvetica', 'normal');
    doc.text("FEE PAYMENT RECEIPT", 74, 25, { align: 'center' });

    // Details Section
    doc.setFontSize(10);
    doc.setTextColor(0);
    
    let y = 50;
    const lineHeight = 8;
    
    // Receipt Info
    doc.setFont('helvetica', 'bold');
    doc.text("Receipt No:", 15, y);
    doc.setFont('helvetica', 'normal');
    doc.text(`RCPT-${Date.now().toString().slice(-6)}`, 45, y);
    
    doc.setFont('helvetica', 'bold');
    doc.text("Date:", 85, y);
    doc.setFont('helvetica', 'normal');
    doc.text(new Date().toLocaleDateString(), 105, y);
    
    y += lineHeight * 2;
    
    // Student Info
    doc.setFont('helvetica', 'bold');
    doc.text("Student Name:", 15, y);
    doc.setFont('helvetica', 'normal');
    doc.text(student.name, 45, y);
    
    y += lineHeight;
    
    doc.setFont('helvetica', 'bold');
    doc.text("Class:", 15, y);
    doc.setFont('helvetica', 'normal');
    doc.text(`${student.standard}th Standard`, 45, y);

    y += lineHeight;

    doc.setFont('helvetica', 'bold');
    doc.text("Mobile:", 15, y);
    doc.setFont('helvetica', 'normal');
    doc.text(student.whatsapp, 45, y);

    // Payment Box
    y += 15;
    doc.setDrawColor(200);
    doc.setFillColor(255, 255, 255);
    doc.rect(15, y, 118, 30);
    
    y += 10;
    doc.setFontSize(12);
    doc.text("Total Amount Paid", 20, y);
    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    doc.text(`Rs. ${student.paidFee.toLocaleString()}/-`, 128, y, { align: 'right' });
    
    y += 10;
    doc.setFontSize(9);
    doc.setTextColor(100);
    doc.setFont('helvetica', 'normal');
    doc.text(`(Out of Total Fees: Rs. ${student.totalFee.toLocaleString()})`, 128, y, { align: 'right' });

    // Footer
    y = 180;
    doc.setFontSize(8);
    doc.setTextColor(150);
    doc.text("This is a computer generated receipt.", 74, y, { align: 'center' });
    doc.text("Thank you for your payment!", 74, y + 5, { align: 'center' });

    // Save and Send
    const fileName = `Receipt_${student.name.replace(/\s+/g, '_')}.pdf`;
    doc.save(fileName);

    // WhatsApp Message
    const message = `Hello ${student.name}, please find attached your fee receipt for Rs. ${student.paidFee}. Thank you - ${academyName}`;
    const waUrl = `https://wa.me/${student.whatsapp}?text=${encodeURIComponent(message)}`;
    
    // Slight delay to allow download to start before opening new tab
    setTimeout(() => {
       window.open(waUrl, '_blank');
    }, 1000);
  };

  return (
    <div className="space-y-6">
       
       {/* Header & Filter */}
       <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200 flex flex-col md:flex-row justify-between items-center gap-4">
          <div>
            <h2 className="text-lg font-bold text-slate-800 flex items-center gap-2">
               <FileText className="text-brand-600" />
               Fee Receipts
            </h2>
            <p className="text-slate-500 text-sm">Generate and send PDF statements</p>
          </div>
          <div className="flex items-center gap-2 w-full md:w-auto">
            <span className="text-sm font-medium text-slate-600 whitespace-nowrap">Select Class:</span>
            <select
                value={filterClass}
                onChange={(e) => setFilterClass(e.target.value)}
                className="flex-1 px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm font-medium text-slate-700 focus:ring-2 focus:ring-brand-500 outline-none"
            >
                <option value="All">All Classes</option>
                {availableClasses.map(c => (
                <option key={c} value={c}>Standard {c}</option>
                ))}
            </select>
          </div>
       </div>

       {/* Student List */}
       <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
          {filteredStudents.length > 0 ? (
            <div className="overflow-x-auto">
                <table className="w-full text-sm text-left">
                    <thead className="bg-slate-50 text-slate-500 font-medium border-b border-slate-100">
                    <tr>
                        <th className="px-6 py-4">Student Name</th>
                        <th className="px-6 py-4">Class</th>
                        <th className="px-6 py-4 text-right">Total Paid</th>
                        <th className="px-6 py-4 text-center">Action</th>
                    </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                    {filteredStudents.map((student) => (
                        <tr key={student.id} className="hover:bg-slate-50 transition-colors">
                        <td className="px-6 py-4 font-medium text-slate-800">{student.name}</td>
                        <td className="px-6 py-4 text-slate-500">{student.standard}th</td>
                        <td className="px-6 py-4 text-right font-mono text-green-600 font-medium">₹{student.paidFee.toLocaleString()}</td>
                        <td className="px-6 py-4 flex justify-center">
                           <button 
                             onClick={() => generateAndSendReceipt(student)}
                             className="flex items-center gap-2 px-3 py-1.5 bg-brand-50 text-brand-700 hover:bg-brand-100 rounded-lg text-xs font-semibold border border-brand-200 transition-colors"
                             title="Download PDF & Open WhatsApp"
                           >
                             <Printer size={14} />
                             Generate Receipt
                           </button>
                        </td>
                        </tr>
                    ))}
                    </tbody>
                </table>
            </div>
          ) : (
             <div className="p-12 text-center text-slate-400">
                <p>No students found for the selected class.</p>
             </div>
          )}
       </div>
    </div>
  );
};

export default FeeReceipt;