import React, { useState } from 'react';
import { Save, LogOut } from 'lucide-react';
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
    <div className="pb-20 space-y-6">
       <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
          <h2 className="text-xl font-bold text-gray-800 mb-6">Academy Settings</h2>
          
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">Academy Name</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-brand-500 outline-none"
            />
          </div>

          <button
            onClick={handleSave}
            disabled={saving}
            className="w-full py-3 bg-brand-600 text-white rounded-xl font-semibold hover:bg-brand-700 shadow-md flex items-center justify-center gap-2 mb-8"
          >
            <Save size={20} />
            {saving ? 'Saving...' : 'Update Name'}
          </button>

          <div className="border-t pt-6">
            <button
              onClick={onLogout}
              className="w-full py-3 border-2 border-red-100 text-red-600 bg-red-50 rounded-xl font-semibold hover:bg-red-100 flex items-center justify-center gap-2"
            >
              <LogOut size={20} />
              Logout
            </button>
          </div>
       </div>
    </div>
  );
};

export default Settings;