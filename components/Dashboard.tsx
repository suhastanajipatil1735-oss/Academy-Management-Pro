import React, { useMemo } from 'react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell, CartesianGrid } from 'recharts';
import { Users, DollarSign, TrendingUp, AlertCircle, Wallet, ArrowUpRight } from 'lucide-react';
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

  // Data for Students per Class Chart
  const classData = useMemo(() => {
    const counts: Record<string, number> = {};
    students.forEach((s) => {
      counts[s.standard] = (counts[s.standard] || 0) + 1;
    });
    return Object.entries(counts)
      .map(([name, count]) => ({ name: `${name}th`, count }))
      .sort((a, b) => parseInt(a.name) - parseInt(b.name));
  }, [students]);

  // Data for Fee Distribution (Top Classes by Due Amount)
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

  // Modern soft color palette for charts
  const CHART_COLORS = ['#6366f1', '#8b5cf6', '#ec4899', '#f43f5e', '#3b82f6'];

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white p-3 border border-gray-100 shadow-xl rounded-xl">
          <p className="font-semibold text-gray-700 mb-1">{label}</p>
          <p className="text-brand-600 font-medium">
            {typeof payload[0].value === 'number' && payload[0].value > 100 
              ? `₹${payload[0].value.toLocaleString()}` 
              : payload[0].value}
            <span className="text-gray-400 text-xs ml-1">
              {payload[0].dataKey === 'amount' ? 'Due' : 'Students'}
            </span>
          </p>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="space-y-8 pb-24">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row justify-between items-end md:items-center gap-4">
        <div>
          <h2 className="text-gray-500 font-medium mb-1">Overview</h2>
          <h1 className="text-3xl font-bold text-gray-800 tracking-tight">{academyName}</h1>
        </div>
        <div className="text-right hidden md:block">
          <p className="text-sm text-gray-400 font-medium">{new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</p>
        </div>
      </div>

      {/* Hero Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        
        {/* Total Students Card */}
        <div className="bg-white p-6 rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-gray-100 relative overflow-hidden group">
          <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
            <Users size={80} className="text-blue-600" />
          </div>
          <div className="relative z-10">
            <div className="w-12 h-12 bg-blue-50 rounded-2xl flex items-center justify-center text-blue-600 mb-4">
              <Users size={24} />
            </div>
            <p className="text-gray-500 font-medium text-sm">Active Students</p>
            <h3 className="text-3xl font-bold text-gray-800 mt-1">{stats.totalStudents}</h3>
            <div className="mt-4 flex items-center text-xs font-medium text-blue-600 bg-blue-50 w-fit px-2 py-1 rounded-full">
              <ArrowUpRight size={14} className="mr-1" />
              <span>Current Session</span>
            </div>
          </div>
        </div>

        {/* Collections Card (Featured) */}
        <div className="bg-gradient-to-br from-brand-600 to-brand-700 p-6 rounded-3xl shadow-[0_8px_30px_rgb(59,130,246,0.3)] text-white relative overflow-hidden">
          <div className="absolute -bottom-10 -right-10 w-40 h-40 bg-white opacity-10 rounded-full blur-2xl"></div>
          <div className="relative z-10">
             <div className="flex justify-between items-start mb-6">
                <div className="w-12 h-12 bg-white/20 backdrop-blur-sm rounded-2xl flex items-center justify-center text-white">
                  <Wallet size={24} />
                </div>
                <div className="text-right">
                   <p className="text-brand-100 text-xs font-medium uppercase tracking-wider">Collected</p>
                   <p className="text-2xl font-bold">₹{stats.totalFeeCollected.toLocaleString()}</p>
                </div>
             </div>
             
             <div>
               <div className="flex justify-between text-sm mb-2 text-brand-100 font-medium">
                 <span>Collection Rate</span>
                 <span>{collectionRate}%</span>
               </div>
               <div className="w-full bg-black/20 rounded-full h-2">
                 <div 
                    className="bg-white h-2 rounded-full transition-all duration-1000" 
                    style={{ width: `${collectionRate}%` }}
                 ></div>
               </div>
               <p className="mt-3 text-xs text-brand-200">Total Potential: ₹{stats.totalPotentialFee.toLocaleString()}</p>
             </div>
          </div>
        </div>

        {/* Due Amount Card */}
        <div className="bg-white p-6 rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-gray-100 relative overflow-hidden group">
          <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
            <AlertCircle size={80} className="text-orange-500" />
          </div>
          <div className="relative z-10">
            <div className="w-12 h-12 bg-orange-50 rounded-2xl flex items-center justify-center text-orange-500 mb-4">
              <AlertCircle size={24} />
            </div>
            <p className="text-gray-500 font-medium text-sm">Pending Dues</p>
            <h3 className="text-3xl font-bold text-gray-800 mt-1">₹{stats.totalDueAmount.toLocaleString()}</h3>
             <div className="mt-4 flex items-center text-xs font-medium text-orange-600 bg-orange-50 w-fit px-2 py-1 rounded-full">
              <span>{dueByClassData.length} classes pending</span>
            </div>
          </div>
        </div>
      </div>

      {/* Analytics Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        
        {/* Student Distribution */}
        <div className="bg-white p-8 rounded-3xl shadow-sm border border-gray-100">
          <div className="flex items-center justify-between mb-8">
            <h3 className="text-lg font-bold text-gray-800">Class Distribution</h3>
            <div className="p-2 bg-gray-50 rounded-lg text-gray-400">
               <TrendingUp size={20} />
            </div>
          </div>
          <div className="h-72">
             {classData.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={classData} barSize={40}>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f3f4f6" />
                      <XAxis 
                        dataKey="name" 
                        axisLine={false} 
                        tickLine={false} 
                        tick={{fill: '#9ca3af', fontSize: 12}} 
                        dy={10}
                      />
                      <YAxis 
                        hide 
                      />
                      <Tooltip content={<CustomTooltip />} cursor={{fill: '#f9fafb'}} />
                      <Bar dataKey="count" radius={[8, 8, 8, 8]}>
                        {classData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={CHART_COLORS[index % CHART_COLORS.length]} />
                        ))}
                      </Bar>
                  </BarChart>
                </ResponsiveContainer>
             ) : (
                <div className="h-full flex items-center justify-center text-gray-400 bg-gray-50 rounded-2xl border border-dashed border-gray-200">
                  <p>No student data yet</p>
                </div>
             )}
          </div>
        </div>

        {/* High Priority Dues */}
        <div className="bg-white p-8 rounded-3xl shadow-sm border border-gray-100">
          <div className="flex items-center justify-between mb-8">
            <h3 className="text-lg font-bold text-gray-800">Outstanding Dues</h3>
            <div className="p-2 bg-red-50 rounded-lg text-red-400">
               <AlertCircle size={20} />
            </div>
          </div>
          <div className="h-72">
            {dueByClassData.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={dueByClassData} layout="vertical" barSize={24} margin={{ left: 10 }}>
                    <CartesianGrid strokeDasharray="3 3" horizontal={true} vertical={false} stroke="#f3f4f6" />
                    <XAxis type="number" hide />
                    <YAxis 
                      dataKey="name" 
                      type="category" 
                      width={50} 
                      axisLine={false} 
                      tickLine={false}
                      tick={{fill: '#6b7280', fontSize: 13, fontWeight: 500}} 
                    />
                    <Tooltip content={<CustomTooltip />} cursor={{fill: 'transparent'}} />
                    <Bar dataKey="amount" radius={[0, 6, 6, 0]}>
                      {dueByClassData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={index === 0 ? '#ef4444' : '#f87171'} />
                      ))}
                    </Bar>
                    </BarChart>
                </ResponsiveContainer>
            ) : (
                <div className="h-full flex items-center justify-center text-gray-400 bg-gray-50 rounded-2xl border border-dashed border-gray-200">
                   <p>All fees collected! 🎉</p>
                </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;