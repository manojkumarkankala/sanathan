import { Link, useLocation } from 'react-router-dom';
import { Home, Calendar, Images, Video, Users } from 'lucide-react';

export function MobileNav() {
  const location = useLocation();

  const items = [
    { label: 'Home', path: '/', icon: Home },
    { label: 'Festival', path: '/vinayaka-chavithi', icon: Calendar },
    { label: 'Gallery', path: '/gallery', icon: Images },
    { label: 'Videos', path: '/videos', icon: Video },
    { label: 'Members', path: '/members', icon: Users },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 bg-cream/95 backdrop-blur-lg border-t border-primary-200 shadow-2xl lg:hidden">
      <div className="flex items-center justify-around py-2">
        {items.map((item) => {
          const Icon = item.icon;
          const active = location.pathname === item.path || (item.path !== '/' && location.pathname.startsWith(item.path));
          return (
            <Link
              key={item.path}
              to={item.path}
              className={`flex flex-col items-center gap-1 px-3 py-1.5 rounded-xl transition-all ${
                active ? 'text-primary-600 bg-primary-50' : 'text-maroon/60'
              }`}
            >
              <Icon size={22} className={active ? 'scale-110' : ''} />
              <span className="text-[10px] font-heading font-medium">{item.label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
