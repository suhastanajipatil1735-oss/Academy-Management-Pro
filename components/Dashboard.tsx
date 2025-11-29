import React, { useMemo } from 'react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { Users, DollarSign, TrendingUp, AlertCircle } from 'lucide-react';
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
      }),
      { totalStudents: 0, totalFeeCollected: 0, totalDueAmount: 0 }
    );
  }, [students]);

  // Data for Students per Class Chart
  const classData = useMemo(() => {
    const counts: Record<string, number> = {};
    students.forEach((s) => {
      counts[s.standard] = (counts[s.standard] || 0) + 1;
    });
    return Object.entries(counts)
      .map(([name, count]) => ({ name: `Std ${name}`, count }))
      .sort((a, b) => a.name.localeCompare(b.name));
  }, [students]);

  // Data for Fee Distribution (Top 5 Classes by Due Amount)
  const dueByClassData = useMemo(() => {
    const dues: Record<string, number> = {};
    students.forEach((s) => {
       const due = s.totalFee - s.paidFee;
       if (due > 0) {
        dues[s.standard] = (dues[s.standard] || 0) + due;
       }
    });
     return Object.entries(dues)
      .map(([name, amount]) => ({ name: `Std ${name}`, amount }))
      .sort((a, b) => b.amount - a.amount)
      .slice(0, 5);
  }, [students]);

  const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6'];

  return (
    <div className="space-y-6 pb-20">
      <div className="bg-brand-600 text-white p-6 rounded-3xl shadow-xl">
        <h2 className="text-xl opacity-90 font-medium">Welcome to</h2>
        <h1 className="text-3xl font-bold mt-1 tracking-tight">{academyName}</h1>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100 flex items-center space-x-4">
          <div className="p-3 bg-blue-100 text-brand-600 rounded-full">
            <Users size={24} />
          </div>
          <div>
            <p className="text-sm text-gray-500 font-medium">Total Students</p>
            <p className="text-2xl font-bold text-gray-800">{stats.totalStudents}</p>
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100 flex items-center space-x-4">
          <div className="p-3 bg-green-100 text-green-600 rounded-full">
            <DollarSign size={24} />
          </div>
          <div>
            <p className="text-sm text-gray-500 font-medium">Collected Fees</p>
            <p className="text-2xl font-bold text-gray-800">₹{stats.totalFeeCollected.toLocaleString()}</p>
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100 flex items-center space-x-4">
          <div className="p-3 bg-red-100 text-red-600 rounded-full">
            <AlertCircle size={24} />
          </div>
          <div>
            <p className="text-sm text-gray-500 font-medium">Due Amount</p>
            <p className="text-2xl font-bold text-red-600">₹{stats.totalDueAmount.toLocaleString()}</p>
          </div>
        </div>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
          <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
            <TrendingUp size={20} className="mr-2 text-brand-600" />
            Students Distribution
          </h3>
          <div className="h-64">
             {classData.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                <BarChart data={classData}>
                    <XAxis dataKey="name" tick={{fontSize: 12}} />
                    <YAxis allowDecimals={false} />
                    <Tooltip cursor={{fill: '#f3f4f6'}} contentStyle={{borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'}} />
                    <Bar dataKey="count" radius={[4, 4, 0, 0]}>
                      {classData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Bar>
                </BarChart>
                </ResponsiveContainer>
             ) : (
                <div className="h-full flex items-center justify-center text-gray-400">No data available</div>
             )}
          </div>
        </div>

        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
          <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
             <AlertCircle size={20} className="mr-2 text-red-500" />
             Pending Dues by Class (Top 5)
          </h3>
          <div className="h-64">
            {dueByClassData.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={dueByClassData} layout="vertical">
                    <XAxis type="number" hide />
                    <YAxis dataKey="name" type="category" width={60} tick={{fontSize: 12}} />
                    <Tooltip contentStyle={{borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'}} formatter={(value: number) => `₹${value.toLocaleString()}`} />
                    <Bar dataKey="amount" fill="#ef4444" radius={[0, 4, 4, 0]} barSize={20} />
                    </BarChart>
                </ResponsiveContainer>
            ) : (
                <div className="h-full flex items-center justify-center text-gray-400">No dues pending</div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;