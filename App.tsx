import React, { useState, useEffect } from 'react';
import { LayoutDashboard, Users, MessageSquare, Settings as SettingsIcon, Menu, Bell, FileText } from 'lucide-react';
import { db } from './services/db';
import { Student, AcademySettings, ViewState } from './types';
import Login from './components/Login';
import Dashboard from './components/Dashboard';
import StudentManager from './components/StudentManager';
import Reminders from './components/Reminders';
import FeeReceipt from './components/FeeReceipt';
import Settings from './components/Settings';

const App: React.FC = () => {
  const [view, setView] = useState<ViewState>(ViewState.SPLASH);
  const [students, setStudents] = useState<Student[]>([]);
  const [settings, setSettings] = useState<AcademySettings>({ academyName: '' });
  
  // Initialization Logic
  useEffect(() => {
    const init = async () => {
      const splashMinTime = new Promise(resolve => setTimeout(resolve, 2000));
      const isAuth = db.isAuthenticated();
      let nextView = ViewState.LOGIN;

      if (isAuth) {
        await Promise.all([
           db.getStudents().then(setStudents),
           db.getSettings().then(setSettings)
        ]);
        nextView = ViewState.DASHBOARD;
      }

      await splashMinTime;
      setView(nextView);
    };

    init();
  }, []);

  const handleLogin = async (password: string) => {
    const success = await db.login(password);
    if (success) {
      const [sts, cfg] = await Promise.all([db.getStudents(), db.getSettings()]);
      setStudents(sts);
      setSettings(cfg);
      setView(ViewState.DASHBOARD);
      return true;
    }
    return false;
  };

  const handleLogout = () => {
    db.logout();
    setView(ViewState.LOGIN);
  };

  const refreshData = async () => {
    const data = await db.getStudents();
    setStudents(data);
  };

  const addStudent = async (s: any) => {
    await db.addStudent(s);
    await refreshData();
  };

  const updateStudent = async (s: Student) => {
    await db.updateStudent(s);
    await refreshData();
  };

  const deleteStudent = async (id: string) => {
    await db.deleteStudent(id);
    await refreshData();
  };

  const deleteClass = async (standard: string) => {
    await db.deleteStudentsByClass(standard);
    await refreshData();
  };

  const saveSettings = async (s: AcademySettings) => {
    await db.updateSettings(s);
    setSettings(s);
  };

  if (view === ViewState.SPLASH) {
    return (
      <div className="h-screen w-screen bg-brand-600 flex flex-col items-center justify-center text-white relative overflow-hidden">
        <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10"></div>
        <div className="w-24 h-24 bg-white rounded-2xl shadow-2xl flex items-center justify-center mb-6 z-10 animate-bounce">
          <LayoutDashboard size={48} className="text-brand-600" />
        </div>
        <h1 className="text-3xl font-bold tracking-tight z-10">Academy Manager</h1>
        <p className="mt-2 text-brand-100 z-10 font-medium tracking-wide">SOFTWARE EDITION</p>
      </div>
    );
  }

  if (view === ViewState.LOGIN) {
    return <Login onLogin={handleLogin} />;
  }

  const getPageTitle = () => {
    switch(view) {
      case ViewState.DASHBOARD: return 'Dashboard';
      case ViewState.STUDENTS: return 'Student Management';
      case ViewState.REMINDERS: return 'Fee Reminders';
      case ViewState.RECEIPTS: return 'Fee Receipts';
      case ViewState.SETTINGS: return 'System Settings';
      default: return '';
    }
  };

  return (
    <div className="flex h-screen bg-slate-50 text-slate-800 font-sans overflow-hidden">
      
      {/* Desktop Sidebar */}
      <aside className="hidden md:flex flex-col w-64 bg-white border-r border-slate-200 shadow-sm z-20">
        <div className="p-6 border-b border-slate-100 flex items-center gap-3">
          <div className="w-8 h-8 bg-brand-600 rounded-lg flex items-center justify-center text-white">
            <LayoutDashboard size={18} />
          </div>
          <span className="font-bold text-lg tracking-tight text-slate-800">Academy Pro</span>
        </div>
        
        <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
          <SidebarItem 
            active={view === ViewState.DASHBOARD} 
            onClick={() => setView(ViewState.DASHBOARD)} 
            icon={<LayoutDashboard size={20} />} 
            label="Dashboard" 
          />
          <SidebarItem 
            active={view === ViewState.STUDENTS} 
            onClick={() => setView(ViewState.STUDENTS)} 
            icon={<Users size={20} />} 
            label="Students" 
          />
          <SidebarItem 
            active={view === ViewState.REMINDERS} 
            onClick={() => setView(ViewState.REMINDERS)} 
            icon={<MessageSquare size={20} />} 
            label="Reminders" 
            badge={students.filter(s => s.totalFee > s.paidFee).length}
          />
          <SidebarItem 
            active={view === ViewState.RECEIPTS} 
            onClick={() => setView(ViewState.RECEIPTS)} 
            icon={<FileText size={20} />} 
            label="Fee Receipts" 
          />
          <div className="pt-4 mt-4 border-t border-slate-100">
            <SidebarItem 
              active={view === ViewState.SETTINGS} 
              onClick={() => setView(ViewState.SETTINGS)} 
              icon={<SettingsIcon size={20} />} 
              label="Settings" 
            />
          </div>
        </nav>

        <div className="p-4 border-t border-slate-100">
          <div className="bg-slate-50 p-3 rounded-lg border border-slate-100 flex items-center gap-3">
             <div className="w-8 h-8 rounded-full bg-brand-100 flex items-center justify-center text-brand-700 font-bold text-xs">
               AD
             </div>
             <div>
                <p className="text-sm font-semibold text-slate-700">Admin User</p>
                <p className="text-xs text-slate-400">View Profile</p>
             </div>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col h-full overflow-hidden relative">
        
        {/* Mobile Header */}
        <header className="md:hidden bg-white border-b border-slate-200 h-16 flex items-center justify-between px-4 z-20 flex-shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-brand-600 rounded-lg flex items-center justify-center text-white">
              <LayoutDashboard size={16} />
            </div>
            <h1 className="font-bold text-slate-800 text-lg truncate max-w-[200px]">{settings.academyName || 'Academy Pro'}</h1>
          </div>
          <button className="p-2 text-slate-400">
             <Bell size={20} />
          </button>
        </header>

        {/* Desktop Header */}
        <header className="hidden md:flex bg-white border-b border-slate-200 h-16 items-center justify-between px-8 flex-shrink-0">
          <h2 className="text-xl font-bold text-slate-800">{getPageTitle()}</h2>
          <div className="flex items-center gap-4">
            <span className="px-3 py-1 bg-brand-50 text-brand-700 rounded-full text-xs font-medium border border-brand-100">
               {settings.academyName || 'My Academy'}
            </span>
            <div className="h-8 w-px bg-slate-200"></div>
            <p className="text-sm text-slate-500">{new Date().toLocaleDateString()}</p>
          </div>
        </header>

        {/* Scrollable Page Content */}
        <main className="flex-1 overflow-y-auto p-4 md:p-8 pb-24 md:pb-8 bg-slate-50">
           <div className="max-w-7xl mx-auto h-full">
             {view === ViewState.DASHBOARD && <Dashboard students={students} academyName={settings.academyName} />}
             {view === ViewState.STUDENTS && (
               <StudentManager 
                 students={students} 
                 onAddStudent={addStudent}
                 onUpdateStudent={updateStudent}
                 onDeleteStudent={deleteStudent}
                 onDeleteClass={deleteClass}
               />
             )}
             {view === ViewState.REMINDERS && (
               <Reminders 
                 students={students} 
                 onUpdateStudent={updateStudent}
                 academyName={settings.academyName}
               />
             )}
             {view === ViewState.RECEIPTS && (
                <FeeReceipt 
                  students={students}
                  academyName={settings.academyName}
                />
             )}
             {view === ViewState.SETTINGS && (
               <Settings 
                 settings={settings}
                 onSave={saveSettings}
                 onLogout={handleLogout}
               />
             )}
           </div>
        </main>

        {/* Mobile Bottom Nav */}
        <nav className="md:hidden bg-white border-t border-slate-200 fixed bottom-0 w-full h-16 z-30 flex justify-around items-center px-2 shadow-[0_-4px_20px_rgba(0,0,0,0.05)]">
           <MobileNavItem 
              active={view === ViewState.DASHBOARD} 
              onClick={() => setView(ViewState.DASHBOARD)} 
              icon={<LayoutDashboard size={20} />} 
              label="Home" 
           />
           <MobileNavItem 
              active={view === ViewState.STUDENTS} 
              onClick={() => setView(ViewState.STUDENTS)} 
              icon={<Users size={20} />} 
              label="Students" 
           />
           <MobileNavItem 
              active={view === ViewState.REMINDERS} 
              onClick={() => setView(ViewState.REMINDERS)} 
              icon={<MessageSquare size={20} />} 
              label="Remind" 
           />
           <MobileNavItem 
              active={view === ViewState.RECEIPTS} 
              onClick={() => setView(ViewState.RECEIPTS)} 
              icon={<FileText size={20} />} 
              label="Receipts" 
           />
           <MobileNavItem 
              active={view === ViewState.SETTINGS} 
              onClick={() => setView(ViewState.SETTINGS)} 
              icon={<SettingsIcon size={20} />} 
              label="Settings" 
           />
        </nav>
      </div>
    </div>
  );
};

const SidebarItem = ({ active, onClick, icon, label, badge }: any) => (
  <button
    onClick={onClick}
    className={`w-full flex items-center justify-between px-4 py-3 rounded-xl transition-all duration-200 group ${
      active 
        ? 'bg-brand-50 text-brand-700 font-medium border border-brand-100' 
        : 'text-slate-500 hover:bg-slate-50 hover:text-slate-800'
    }`}
  >
    <div className="flex items-center gap-3">
      <div className={`${active ? 'text-brand-600' : 'text-slate-400 group-hover:text-slate-600'}`}>
        {icon}
      </div>
      <span>{label}</span>
    </div>
    {badge > 0 && (
      <span className="bg-red-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-full">
        {badge}
      </span>
    )}
  </button>
);

const MobileNavItem = ({ active, onClick, icon, label }: any) => (
  <button
    onClick={onClick}
    className={`flex flex-col items-center justify-center w-16 h-full gap-1 ${
      active ? 'text-brand-600' : 'text-slate-400'
    }`}
  >
    <div className={`p-1.5 rounded-full ${active ? 'bg-brand-50' : ''}`}>
      {icon}
    </div>
    <span className="text-[10px] font-medium">{label}</span>
  </button>
);

export default App;