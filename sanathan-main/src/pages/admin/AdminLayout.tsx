import { useState } from 'react';
import { Link, useLocation, useNavigate, Outlet } from 'react-router-dom';
import {
  LayoutDashboard, Calendar, Image, Video, Users, Megaphone,
  Settings, LogOut, Menu, X, Sparkles, Film, Clock
} from 'lucide-react';
import { useAuth } from '@/lib/auth';

export function AdminLayout() {
  const { isAdmin, loading, signOut, adminInfo } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-cream">
        <div className="w-12 h-12 rounded-full border-4 border-primary-500 border-t-transparent animate-spin" />
      </div>
    );
  }

  if (!isAdmin) {
    navigate('/admin');
    return null;
  }

  const navItems = [
    { label: 'Dashboard', path: '/admin/dashboard', icon: LayoutDashboard },
    { label: 'Festival Years', path: '/admin/years', icon: Calendar },
    { label: 'Schedules', path: '/admin/schedules', icon: Clock },
    { label: 'Programs', path: '/admin/programs', icon: Sparkles },
    { label: 'Gallery', path: '/admin/photos', icon: Image },
    { label: 'Videos', path: '/admin/videos', icon: Video },
    { label: 'Members', path: '/admin/members', icon: Users },
    { label: 'Announcements', path: '/admin/announcements', icon: Megaphone },
    { label: 'Settings', path: '/admin/settings', icon: Settings },
  ];

  const handleSignOut = async () => {
    await signOut();
    navigate('/admin');
  };

  return (
    <div className="min-h-screen bg-cream bg-pattern flex">
      {/* Sidebar */}
      <aside className={`fixed lg:sticky top-0 left-0 h-screen w-64 bg-gradient-to-b from-maroon to-black z-50 transition-transform duration-300 ${sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}`}>
        <div className="p-6">
          <Link to="/admin/dashboard" className="flex items-center gap-3 mb-8">
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary-500 to-primary-700 flex items-center justify-center text-white font-display font-bold text-lg shadow-lg">
              ॐ
            </div>
            <div>
              <div className="font-display font-bold text-gold text-sm">SANATHAN YOUTH</div>
              <div className="text-[10px] text-cream/60 tracking-widest">ADMIN PANEL</div>
            </div>
          </Link>

          <nav className="space-y-1">
            {navItems.map(item => {
              const Icon = item.icon;
              const active = location.pathname === item.path;
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  onClick={() => setSidebarOpen(false)}
                  className={`flex items-center gap-3 px-4 py-2.5 rounded-xl font-heading font-medium text-sm transition-all ${
                    active
                      ? 'bg-gradient-to-r from-primary-500 to-primary-600 text-white shadow-lg'
                      : 'text-cream/70 hover:bg-white/10 hover:text-gold'
                  }`}
                >
                  <Icon size={18} /> {item.label}
                </Link>
              );
            })}
          </nav>

          <div className="absolute bottom-6 left-6 right-6">
            <div className="glass-dark rounded-xl p-3 mb-3">
              <p className="text-cream/60 text-xs">Signed in as</p>
              <p className="text-cream font-heading font-semibold text-sm truncate">{adminInfo?.email}</p>
            </div>
            <button
              onClick={handleSignOut}
              className="w-full flex items-center gap-2 px-4 py-2.5 rounded-xl text-accent-300 hover:bg-accent-500/20 transition-colors font-heading font-medium text-sm"
            >
              <LogOut size={18} /> Sign Out
            </button>
            <Link to="/" className="w-full flex items-center gap-2 px-4 py-2.5 rounded-xl text-cream/60 hover:bg-white/10 transition-colors font-heading font-medium text-sm mt-1">
              <Film size={18} /> View Website
            </Link>
          </div>
        </div>
      </aside>

      {sidebarOpen && (
        <div className="fixed inset-0 bg-black/50 z-40 lg:hidden" onClick={() => setSidebarOpen(false)} />
      )}

      {/* Main Content */}
      <div className="flex-1 min-w-0">
        <header className="sticky top-0 z-30 bg-cream/95 backdrop-blur-lg border-b border-primary-200 px-4 py-3 flex items-center justify-between lg:hidden">
          <button onClick={() => setSidebarOpen(true)} className="p-2 rounded-lg text-maroon hover:bg-primary-100">
            <Menu size={24} />
          </button>
          <span className="font-display font-bold text-maroon">Admin Panel</span>
          <div className="w-10" />
        </header>

        <main className="p-4 md:p-8 pb-24 lg:pb-8">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
