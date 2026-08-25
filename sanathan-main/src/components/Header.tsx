import { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Menu, X, Home, Calendar, Images, Video, Users, Info, Search, Shield } from 'lucide-react';

export function Header() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const location = useLocation();

  useEffect(() => {
    setMobileOpen(false);
    setSearchOpen(false);
  }, [location.pathname]);

  useEffect(() => {
    const handler = () => setScrolled(window.scrollY > 40);
    window.addEventListener('scroll', handler);
    return () => window.removeEventListener('scroll', handler);
  }, []);

  const navLinks = [
    { label: 'Home', path: '/', icon: Home },
    { label: 'Vinayaka Chavithi', path: '/vinayaka-chavithi', icon: Calendar },
    { label: 'Gallery', path: '/gallery', icon: Images },
    { label: 'Videos', path: '/videos', icon: Video },
    { label: 'Members', path: '/members', icon: Users },
    { label: 'About', path: '/about', icon: Info },
  ];

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      window.location.href = `/search?q=${encodeURIComponent(searchQuery.trim())}`;
    }
  };

  return (
    <>
      <header
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${
          scrolled ? 'bg-cream/95 backdrop-blur-lg shadow-lg py-2' : 'bg-transparent py-4'
        }`}
      >
        <div className="container-festival flex items-center justify-between">
          <Link to="/" className="flex items-center gap-3 group">
            <div className="w-11 h-11 rounded-full bg-gradient-to-br from-primary-500 to-primary-700 flex items-center justify-center text-white font-display font-bold text-xl shadow-lg group-hover:scale-110 transition-transform duration-300">
              ॐ
            </div>
            <div className="hidden sm:block">
              <div className={`font-display font-bold text-lg leading-none ${scrolled ? 'text-maroon' : 'text-white text-shadow-md'}`}>
                SANATHAN YOUTH
              </div>
              <div className={`text-[10px] font-heading tracking-widest ${scrolled ? 'text-primary-600' : 'text-gold text-shadow-sm'}`}>
                VINAYAKA CHAVITHI
              </div>
            </div>
          </Link>

          <nav className="hidden lg:flex items-center gap-8">
            {navLinks.map((link) => (
              <Link
                key={link.path}
                to={link.path}
                className={`nav-link ${scrolled ? 'text-maroon' : 'text-white text-shadow-sm'}`}
              >
                {link.label}
              </Link>
            ))}
          </nav>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setSearchOpen(!searchOpen)}
              className={`p-2 rounded-full transition-colors ${scrolled ? 'text-maroon hover:bg-primary-100' : 'text-white hover:bg-white/20'}`}
              aria-label="Search"
            >
              <Search size={20} />
            </button>
            <Link
              to="/admin"
              className={`p-2 rounded-full transition-colors ${scrolled ? 'text-maroon hover:bg-primary-100' : 'text-white hover:bg-white/20'}`}
              aria-label="Admin"
            >
              <Shield size={20} />
            </Link>
            <button
              onClick={() => setMobileOpen(!mobileOpen)}
              className={`lg:hidden p-2 rounded-full transition-colors ${scrolled ? 'text-maroon hover:bg-primary-100' : 'text-white hover:bg-white/20'}`}
              aria-label="Menu"
            >
              {mobileOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>

        {searchOpen && (
          <div className="absolute top-full left-0 right-0 bg-cream/95 backdrop-blur-lg shadow-lg border-t border-primary-200 animate-fade-in-down">
            <div className="container-festival py-4">
              <form onSubmit={handleSearch} className="flex gap-3">
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search festival years, memories, members..."
                  className="input-festival flex-1"
                  autoFocus
                />
                <button type="submit" className="btn-festival">
                  <Search size={18} /> Search
                </button>
              </form>
            </div>
          </div>
        )}

        {mobileOpen && (
          <nav className="lg:hidden absolute top-full left-0 right-0 bg-cream/98 backdrop-blur-lg shadow-2xl border-t border-primary-200 animate-fade-in-down">
            <div className="container-festival py-4 flex flex-col gap-1">
              {navLinks.map((link) => {
                const Icon = link.icon;
                return (
                  <Link
                    key={link.path}
                    to={link.path}
                    className="flex items-center gap-3 px-4 py-3 rounded-xl text-maroon font-heading font-medium hover:bg-primary-100 transition-colors"
                  >
                    <Icon size={20} className="text-primary-600" />
                    {link.label}
                  </Link>
                );
              })}
            </div>
          </nav>
        )}
      </header>
      <div className="h-20" />
    </>
  );
}
