import React, { useState } from 'react';
import { Save, LogOut, Building, ShieldCheck } from 'lucide-react';
import { AcademySettings } from '../types';

interface SettingsProps {
  settings: AcademySettings;
  onSave: (s: AcademySettings) => Promise<void>;
  onLogout: () => void;
}

const Settings: React.FC<SettingsProps> = ({ settings, onSave, onLogout }) => {
  const [name, setName] = useState(settings.academyName);
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    setSaving(true);
    await onSave({ academyName: name });
    setSaving(false);
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6">
       
       {/* General Settings Card */}
       <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
          <div className="px-6 py-4 border-b border-slate-100 bg-slate-50 flex items-center gap-2">
             <Building size={18} className="text-slate-500" />
             <h3 className="font-semibold text-slate-700">General Information</h3>
          </div>
          
          <div className="p-6">
            <label className="block text-sm font-medium text-slate-700 mb-2">Academy Organization Name</label>
            <div className="flex gap-2">
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="flex-1 px-4 py-2.5 border border-slate-200 rounded-lg focus:ring-2 focus:ring-brand-500 outline-none text-slate-800"
                placeholder="Enter academy name"
              />
            </div>
            <p className="text-xs text-slate-400 mt-2">This name will be visible on the dashboard and reminder messages.</p>
            
            <div className="mt-6 flex justify-end">
              <button
                onClick={handleSave}
                disabled={saving}
                className="px-6 py-2 bg-brand-600 text-white rounded-lg font-medium hover:bg-brand-700 shadow-sm flex items-center gap-2 disabled:opacity-70"
              >
                <Save size={18} />
                {saving ? 'Saving...' : 'Save Changes'}
              </button>
            </div>
          </div>
       </div>

       {/* Security Zone */}
       <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
          <div className="px-6 py-4 border-b border-slate-100 bg-slate-50 flex items-center gap-2">
             <ShieldCheck size={18} className="text-slate-500" />
             <h3 className="font-semibold text-slate-700">Session Management</h3>
          </div>
          <div className="p-6 flex items-center justify-between">
             <div>
               <h4 className="font-medium text-slate-800">Sign out</h4>
               <p className="text-sm text-slate-400">End your current session on this device.</p>
             </div>
             <button
              onClick={onLogout}
              className="px-4 py-2 border border-slate-200 text-slate-600 rounded-lg font-medium hover:bg-slate-50 flex items-center gap-2 hover:text-red-600 hover:border-red-200 transition-colors"
            >
              <LogOut size={18} />
              Logout
            </button>
          </div>
       </div>
       
       <div className="text-center pt-8">
         <p className="text-xs text-slate-400 font-mono">Academy Manager Pro v1.2.0</p>
       </div>
    </div>
  );
};

export default Settings;