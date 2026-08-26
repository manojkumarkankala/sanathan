import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Lock, Mail, ArrowLeft, AlertCircle } from 'lucide-react';
import { useAuth } from '@/lib/auth';
import { SEO } from '@/components/SEO';
import { Link } from 'react-router-dom';

export function AdminLogin() {
  const { signIn, isAdmin, loading } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!loading && isAdmin) navigate('/admin/dashboard');
  }, [loading, isAdmin, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError('');
    const { error } = await signIn(email, password);
    if (error) {
      setError(error);
      setSubmitting(false);
    }
  };

  return (
    <>
      <SEO title="Admin Login — Sanathan Youth" description="Admin access to Sanathan Youth dashboard." />
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-maroon via-black to-maroon relative overflow-hidden">
        <div className="absolute inset-0 bg-mandala opacity-10" />
        <div className="absolute inset-0">
          <div className="absolute top-10 left-10 w-32 h-32 rounded-full bg-primary-500/20 blur-3xl animate-float" />
          <div className="absolute bottom-10 right-10 w-40 h-40 rounded-full bg-gold/20 blur-3xl animate-float" style={{ animationDelay: '2s' }} />
        </div>

        <div className="relative z-10 w-full max-w-md px-4">
          <Link to="/" className="flex items-center gap-2 text-cream/60 hover:text-gold transition-colors mb-6 text-sm">
            <ArrowLeft size={16} /> Back to website
          </Link>

          <div className="glass-dark rounded-3xl p-8 shadow-2xl">
            <div className="text-center mb-8">
              <div className="w-16 h-16 mx-auto rounded-full bg-gradient-to-br from-primary-500 to-primary-700 flex items-center justify-center text-white font-display font-bold text-3xl shadow-lg mb-4">
                ॐ
              </div>
              <h1 className="font-display font-bold text-2xl text-gold">Admin Login</h1>
              <p className="text-cream/60 text-sm mt-1">Sanathan Youth Dashboard</p>
            </div>

            {error && (
              <div className="mb-4 p-3 rounded-xl bg-accent-500/20 border border-accent-500/40 text-accent-300 text-sm flex items-center gap-2">
                <AlertCircle size={16} /> {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="text-sm font-heading text-cream/70 block mb-1">Email</label>
                <div className="relative">
                  <Mail size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-cream/40" />
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 rounded-xl bg-white/10 border border-white/20 text-cream placeholder-cream/40 focus:ring-2 focus:ring-gold focus:border-transparent outline-none transition-all"
                    placeholder="admin@sanathanyouth.org"
                  />
                </div>
              </div>
              <div>
                <label className="text-sm font-heading text-cream/70 block mb-1">Password</label>
                <div className="relative">
                  <Lock size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-cream/40" />
                  <input
                    type="password"
                    required
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 rounded-xl bg-white/10 border border-white/20 text-cream placeholder-cream/40 focus:ring-2 focus:ring-gold focus:border-transparent outline-none transition-all"
                    placeholder="••••••••"
                  />
                </div>
              </div>
              <button
                type="submit"
                disabled={submitting}
                className="w-full py-3 rounded-xl bg-gradient-to-r from-primary-500 to-primary-700 text-white font-heading font-semibold shadow-lg hover:shadow-xl transition-all disabled:opacity-50"
              >
                {submitting ? 'Signing in...' : 'Sign In'}
              </button>
            </form>

            <p className="text-cream/40 text-xs text-center mt-6">
              Default credentials: THIS IS FOR ONLY ADMIN
            </p>
          </div>
        </div>
      </div>
    </>
  );
}
