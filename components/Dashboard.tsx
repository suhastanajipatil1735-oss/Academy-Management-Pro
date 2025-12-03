import React, { useMemo } from 'react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell, CartesianGrid } from 'recharts';
import { Users, Wallet, TrendingUp, AlertCircle, TrendingDown } from 'lucide-react';
import { Student } from '../types';

interface DashboardProps {
  students: Student[];
  academyName: string;
}

const Dashboard: React.FC<DashboardProps> = ({ students, academyName }) => {
  const stats = useMemo(() => {
    return students.reduce(
      (acc, s) => ({
        totalStudents: acc.totalStudents + 1,
        totalFeeCollected: acc.totalFeeCollected + s.paidFee,
        totalDueAmount: acc.totalDueAmount + (s.totalFee - s.paidFee),
        totalPotentialFee: acc.totalPotentialFee + s.totalFee
      }),
      { totalStudents: 0, totalFeeCollected: 0, totalDueAmount: 0, totalPotentialFee: 0 }
    );
  }, [students]);

  const collectionRate = stats.totalPotentialFee > 0 
    ? Math.round((stats.totalFeeCollected / stats.totalPotentialFee) * 100) 
    : 0;

  const classData = useMemo(() => {
    const counts: Record<string, number> = {};
    students.forEach((s) => {
      counts[s.standard] = (counts[s.standard] || 0) + 1;
    });
    return Object.entries(counts)
      .map(([name, count]) => ({ name: `${name}th`, count }))
      .sort((a, b) => parseInt(a.name) - parseInt(b.name));
  }, [students]);

  const dueByClassData = useMemo(() => {
    const dues: Record<string, number> = {};
    students.forEach((s) => {
       const due = s.totalFee - s.paidFee;
       if (due > 0) {
        dues[s.standard] = (dues[s.standard] || 0) + due;
       }
    });
     return Object.entries(dues)
      .map(([name, amount]) => ({ name: `${name}th`, amount }))
      .sort((a, b) => b.amount - a.amount)
      .slice(0, 5);
  }, [students]);

  const CHART_COLORS = ['#3b82f6', '#6366f1', '#8b5cf6', '#ec4899', '#f43f5e'];

  return (
    <div className="space-y-6">
      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        
        {/* Metric 1 */}
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm flex flex-col justify-between h-32">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-slate-500 text-sm font-medium">Total Students</p>
              <h3 className="text-2xl font-bold text-slate-800 mt-1">{stats.totalStudents}</h3>
            </div>
            <div className="p-2 bg-blue-50 text-blue-600 rounded-lg">
              <Users size={18} />
            </div>
          </div>
          <div className="flex items-center text-xs font-medium text-green-600 bg-green-50 px-2 py-1 rounded w-fit">
            <TrendingUp size={12} className="mr-1" />
            <span>Active</span>
          </div>
        </div>

        {/* Metric 2 */}
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm flex flex-col justify-between h-32">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-slate-500 text-sm font-medium">Collected Fees</p>
              <h3 className="text-2xl font-bold text-slate-800 mt-1">₹{stats.totalFeeCollected.toLocaleString()}</h3>
            </div>
            <div className="p-2 bg-emerald-50 text-emerald-600 rounded-lg">
              <Wallet size={18} />
            </div>
          </div>
          <div className="w-full bg-slate-100 rounded-full h-1.5 mt-2">
            <div className="bg-emerald-500 h-1.5 rounded-full" style={{ width: `${collectionRate}%` }}></div>
          </div>
          <p className="text-[10px] text-slate-400 mt-1 text-right">{collectionRate}% of total</p>
        </div>

        {/* Metric 3 */}
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm flex flex-col justify-between h-32">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-slate-500 text-sm font-medium">Pending Dues</p>
              <h3 className="text-2xl font-bold text-slate-800 mt-1">₹{stats.totalDueAmount.toLocaleString()}</h3>
            </div>
            <div className="p-2 bg-amber-50 text-amber-600 rounded-lg">
              <AlertCircle size={18} />
            </div>
          </div>
           <div className="flex items-center text-xs font-medium text-amber-600 bg-amber-50 px-2 py-1 rounded w-fit">
            <span>{dueByClassData.length} classes pending</span>
          </div>
        </div>

        {/* Metric 4 */}
         <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm flex flex-col justify-between h-32">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-slate-500 text-sm font-medium">Est. Revenue</p>
              <h3 className="text-2xl font-bold text-slate-800 mt-1">₹{stats.totalPotentialFee.toLocaleString()}</h3>
            </div>
            <div className="p-2 bg-indigo-50 text-indigo-600 rounded-lg">
              <TrendingUp size={18} />
            </div>
          </div>
          <p className="text-xs text-slate-400">Total projection for current batch</p>
        </div>
      </div>

      {/* Analytics Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Class Distribution Chart */}
        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
          <h3 className="text-base font-bold text-slate-800 mb-6">Student Distribution</h3>
          <div className="h-64">
             {classData.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={classData} barSize={32}>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                      <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#64748b', fontSize: 12}} dy={10} />
                      <Tooltip 
                        contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)' }}
                        cursor={{fill: '#f1f5f9'}}
                      />
                      <Bar dataKey="count" radius={[4, 4, 0, 0]}>
                        {classData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={CHART_COLORS[index % CHART_COLORS.length]} />
                        ))}
                      </Bar>
                  </BarChart>
                </ResponsiveContainer>
             ) : (
               <div className="h-full flex items-center justify-center text-slate-400 bg-slate-50 rounded-lg border border-dashed border-slate-200">
                  <p className="text-sm">No data available</p>
               </div>
             )}
          </div>
        </div>

        {/* Outstanding Dues Chart */}
        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
          <h3 className="text-base font-bold text-slate-800 mb-6">Outstanding Dues by Class</h3>
          <div className="h-64">
            {dueByClassData.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={dueByClassData} layout="vertical" barSize={20} margin={{ left: 10 }}>
                    <CartesianGrid strokeDasharray="3 3" horizontal={true} vertical={false} stroke="#e2e8f0" />
                    <XAxis type="number" hide />
                    <YAxis dataKey="name" type="category" width={40} axisLine={false} tickLine={false} tick={{fill: '#64748b', fontSize: 12, fontWeight: 500}} />
                    <Tooltip 
                        contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)' }}
                        cursor={{fill: 'transparent'}}
                        formatter={(value: number) => [`₹${value.toLocaleString()}`, 'Due']}
                    />
                    <Bar dataKey="amount" radius={[0, 4, 4, 0]} fill="#f59e0b">
                       {dueByClassData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={index === 0 ? '#ef4444' : '#f97316'} />
                      ))}
                    </Bar>
                    </BarChart>
                </ResponsiveContainer>
            ) : (
                <div className="h-full flex items-center justify-center text-slate-400 bg-slate-50 rounded-lg border border-dashed border-slate-200">
                   <p className="text-sm">All cleared</p>
                </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;