import React, { useState } from 'react';
import { Lock, ArrowRight } from 'lucide-react';

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
    // If success, parent handles navigation
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-6 bg-gradient-to-br from-brand-50 to-white">
      <div className="w-full max-w-md bg-white p-8 rounded-3xl shadow-xl border border-gray-100">
        <div className="text-center mb-8">
           <div className="w-16 h-16 bg-brand-100 rounded-full flex items-center justify-center mx-auto mb-4 text-brand-600">
             <Lock size={32} />
           </div>
           <h1 className="text-2xl font-bold text-gray-800">Welcome Back</h1>
           <p className="text-gray-500 mt-2">Enter your password to access the dashboard</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
           <div>
             <input
               type="password"
               placeholder="Enter Password"
               value={password}
               onChange={(e) => setPassword(e.target.value)}
               className="w-full px-5 py-4 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-500 text-lg"
             />
             {error && <p className="text-red-500 text-sm mt-2 ml-1">Incorrect password. Please try again.</p>}
           </div>

           <button
             type="submit"
             disabled={loading}
             className="w-full py-4 bg-brand-600 text-white rounded-xl font-bold text-lg hover:bg-brand-700 shadow-lg hover:shadow-xl transition-all flex items-center justify-center gap-2"
           >
             {loading ? 'Verifying...' : 'Login'}
             {!loading && <ArrowRight size={20} />}
           </button>
        </form>
      </div>
    </div>
  );
};

export default Login;