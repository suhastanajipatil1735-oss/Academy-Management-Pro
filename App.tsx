import React, { useState, useEffect } from 'react';
import { LayoutDashboard, Users, MessageSquare, Settings as SettingsIcon } from 'lucide-react';
import { db } from './services/db';
import { Student, AcademySettings, ViewState } from './types';
import Login from './components/Login';
import Dashboard from './components/Dashboard';
import StudentManager from './components/StudentManager';
import Reminders from './components/Reminders';
import Settings from './components/Settings';

const App: React.FC = () => {
  const [view, setView] = useState<ViewState>(ViewState.SPLASH);
  const [students, setStudents] = useState<Student[]>([]);
  const [settings, setSettings] = useState<AcademySettings>({ academyName: '' });
  
  // Initialization Logic
  useEffect(() => {
    const init = async () => {
      // 1. Minimum Splash Screen Time (2s)
      const splashMinTime = new Promise(resolve => setTimeout(resolve, 2000));
      
      // 2. Check Auth and Load Data
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

  // Handlers
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

  // CRUD Wrappers
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

  // Render Logic
  if (view === ViewState.SPLASH) {
    return (
      <div className="h-screen w-screen bg-brand-600 flex flex-col items-center justify-center text-white">
        <div className="w-24 h-24 bg-white/20 rounded-3xl flex items-center justify-center mb-6 animate-bounce">
          <LayoutDashboard size={48} className="text-white" />
        </div>
        <h1 className="text-3xl font-bold tracking-tight animate-pulse">Academy Manager</h1>
        <p className="mt-2 text-brand-200">Pro Edition</p>
      </div>
    );
  }

  if (view === ViewState.LOGIN) {
    return <Login onLogin={handleLogin} />;
  }

  // Authenticated Layout
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col md:flex-row">
      
      {/* Sidebar / Mobile Bottom Nav */}
      <nav className="fixed bottom-0 md:top-0 left-0 w-full md:w-20 md:h-screen bg-white shadow-lg md:shadow-none border-t md:border-r border-gray-200 z-40 flex md:flex-col justify-around md:justify-start md:pt-10">
         <NavButton 
            active={view === ViewState.DASHBOARD} 
            onClick={() => setView(ViewState.DASHBOARD)} 
            icon={<LayoutDashboard size={24} />} 
            label="Home" 
         />
         <NavButton 
            active={view === ViewState.STUDENTS} 
            onClick={() => setView(ViewState.STUDENTS)} 
            icon={<Users size={24} />} 
            label="Students" 
         />
         <NavButton 
            active={view === ViewState.REMINDERS} 
            onClick={() => setView(ViewState.REMINDERS)} 
            icon={<MessageSquare size={24} />} 
            label="Remind" 
         />
         <div className="hidden md:block md:flex-grow" />
         <NavButton 
            active={view === ViewState.SETTINGS} 
            onClick={() => setView(ViewState.SETTINGS)} 
            icon={<SettingsIcon size={24} />} 
            label="Settings" 
         />
      </nav>

      {/* Main Content Area */}
      <main className="flex-1 md:ml-20 p-4 md:p-8 overflow-y-auto h-screen">
         <div className="max-w-6xl mx-auto mt-4 md:mt-0">
           {view === ViewState.DASHBOARD && (
             <Dashboard students={students} academyName={settings.academyName} />
           )}
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
           {view === ViewState.SETTINGS && (
             <Settings 
               settings={settings}
               onSave={saveSettings}
               onLogout={handleLogout}
             />
           )}
         </div>
      </main>
    </div>
  );
};

// Nav Helper Component
const NavButton = ({ active, onClick, icon, label }: any) => (
  <button
    onClick={onClick}
    className={`p-4 md:p-3 md:my-2 md:mx-auto rounded-xl flex flex-col items-center gap-1 transition-all ${
      active 
        ? 'text-brand-600 bg-brand-50 md:bg-brand-50' 
        : 'text-gray-400 hover:text-gray-600'
    }`}
  >
    {icon}
    <span className="text-[10px] font-medium md:hidden">{label}</span>
  </button>
);

export default App;