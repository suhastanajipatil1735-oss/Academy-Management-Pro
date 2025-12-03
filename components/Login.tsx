import React, { useState } from 'react';
import { Lock, ArrowRight, LayoutDashboard } from 'lucide-react';

interface LoginProps {
  onLogin: (password: string) => Promise<boolean>;
}

const Login: React.FC<LoginProps> = ({ onLogin }) => {
  const [password, setPassword] = useState('');
  const [error, setError] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(false);
    
    const success = await onLogin(password);
    if (!success) {
      setError(true);
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-slate-50">
      <div className="w-full max-w-md bg-white p-8 rounded-2xl shadow-xl border border-slate-100">
        
        <div className="flex flex-col items-center mb-8">
           <div className="w-12 h-12 bg-brand-600 rounded-xl flex items-center justify-center mb-4 text-white shadow-lg shadow-brand-200">
             <LayoutDashboard size={24} />
           </div>
           <h1 className="text-2xl font-bold text-slate-800 tracking-tight">Academy Manager</h1>
           <p className="text-slate-400 text-sm mt-1">Please sign in to continue</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
           <div className="space-y-1">
             <label className="text-xs font-semibold text-slate-500 uppercase ml-1">Password</label>
             <div className="relative">
               <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
               <input
                 type="password"
                 placeholder="Enter access code"
                 value={password}
                 onChange={(e) => setPassword(e.target.value)}
                 className={`w-full pl-11 pr-4 py-3 bg-slate-50 border ${error ? 'border-red-300 focus:ring-red-200' : 'border-slate-200 focus:ring-brand-100 focus:border-brand-500'} rounded-xl focus:outline-none focus:ring-4 transition-all text-slate-800`}
               />
             </div>
             {error && <p className="text-red-500 text-xs mt-1 ml-1 font-medium flex items-center gap-1">Invalid password</p>}
           </div>

           <button
             type="submit"
             disabled={loading}
             className="w-full py-3 bg-brand-600 text-white rounded-xl font-semibold text-base hover:bg-brand-700 shadow-lg shadow-brand-200 transition-all flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed"
           >
             {loading ? 'Authenticating...' : 'Sign In'}
             {!loading && <ArrowRight size={18} />}
           </button>
        </form>
        
        <div className="mt-8 text-center">
          <p className="text-xs text-slate-300">Protected System • Authorized Access Only</p>
        </div>
      </div>
    </div>
  );
};

export default Login;