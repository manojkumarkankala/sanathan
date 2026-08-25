import { BrowserRouter, Routes, Route, useLocation } from 'react-router-dom';
import { useEffect } from 'react';
import { AuthProvider } from '@/lib/auth';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { MobileNav } from '@/components/MobileNav';

// Public pages
import { HomePage } from '@/pages/HomePage';
import { AllYearsPage } from '@/pages/AllYearsPage';
import { YearPage } from '@/pages/YearPage';
import { GalleryPage } from '@/pages/GalleryPage';
import { VideosPage } from '@/pages/VideosPage';
import { MembersPage } from '@/pages/MembersPage';
import { PortfolioPage } from '@/pages/PortfolioPage';
import { AboutPage } from '@/pages/AboutPage';
import { ContactPage } from '@/pages/ContactPage';
import { SearchPage } from '@/pages/SearchPage';

// Admin pages
import { AdminLogin } from '@/pages/admin/AdminLogin';
import { AdminLayout } from '@/pages/admin/AdminLayout';
import { AdminDashboard } from '@/pages/admin/AdminDashboard';
import { AdminYears } from '@/pages/admin/AdminYears';
import { AdminPhotos } from '@/pages/admin/AdminPhotos';
import { AdminVideos } from '@/pages/admin/AdminVideos';
import { AdminMembers } from '@/pages/admin/AdminMembers';
import { AdminSchedules } from '@/pages/admin/AdminSchedules';
import { AdminPrograms } from '@/pages/admin/AdminPrograms';
import { AdminAnnouncements } from '@/pages/admin/AdminAnnouncements';
import { AdminSettings } from '@/pages/admin/AdminSettings';

function ScrollToTop() {
  const { pathname } = useLocation();
  useEffect(() => { window.scrollTo(0, 0); }, [pathname]);
  return null;
}

function PublicLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <Header />
      <main className="min-h-screen pb-20 lg:pb-0">{children}</main>
      <Footer />
      <MobileNav />
    </>
  );
}

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <ScrollToTop />
        <Routes>
          {/* Admin routes - no public layout */}
          <Route path="/admin" element={<AdminLogin />} />
          <Route path="/admin" element={<AdminLayout />}>
            <Route path="dashboard" element={<AdminDashboard />} />
            <Route path="years" element={<AdminYears />} />
            <Route path="schedules" element={<AdminSchedules />} />
            <Route path="programs" element={<AdminPrograms />} />
            <Route path="photos" element={<AdminPhotos />} />
            <Route path="videos" element={<AdminVideos />} />
            <Route path="members" element={<AdminMembers />} />
            <Route path="announcements" element={<AdminAnnouncements />} />
            <Route path="settings" element={<AdminSettings />} />
          </Route>

          {/* Public routes with layout */}
          <Route path="/" element={<PublicLayout><HomePage /></PublicLayout>} />
          <Route path="/vinayaka-chavithi" element={<PublicLayout><AllYearsPage /></PublicLayout>} />
          <Route path="/vinayaka-chavithi/:year" element={<PublicLayout><YearPage /></PublicLayout>} />
          <Route path="/gallery" element={<PublicLayout><GalleryPage /></PublicLayout>} />
          <Route path="/videos" element={<PublicLayout><VideosPage /></PublicLayout>} />
          <Route path="/members" element={<PublicLayout><MembersPage /></PublicLayout>} />
          <Route path="/portfolio/:slug" element={<PublicLayout><PortfolioPage /></PublicLayout>} />
          <Route path="/about" element={<PublicLayout><AboutPage /></PublicLayout>} />
          <Route path="/contact" element={<PublicLayout><ContactPage /></PublicLayout>} />
          <Route path="/search" element={<PublicLayout><SearchPage /></PublicLayout>} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
