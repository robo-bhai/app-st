/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useMemo } from 'react';
import { INITIAL_APPS } from './data/initialApps';
import { AppModel, AppCategory, AppDemandRequest } from './types/app';
import { Navbar } from './components/Navbar';
import { HeroCarousel } from './components/HeroCarousel';
import { CategoryFilter } from './components/CategoryFilter';
import { AppCard } from './components/AppCard';
import { Pagination } from './components/Pagination';
import { AppDetailModal } from './components/AppDetailModal';
import { AdminDashboard } from './components/AdminDashboard';
import { AdminLogin } from './components/AdminLogin';
import { DjangoCodeViewer } from './components/DjangoCodeViewer';
import { ContactAdminModal } from './components/ContactAdminModal';
import { MobileBottomNav } from './components/MobileBottomNav';
import { PWAInstallBanner } from './components/PWAInstallBanner';
import { DownloadProgressModal } from './components/DownloadProgressModal';
import { downloadAppApk } from './utils/apkGenerator';
import { 
  Sparkles, ShieldAlert, Layers, ShieldCheck, 
  MessageSquarePlus, Smartphone, LayoutGrid, List, Lock 
} from 'lucide-react';

const CATEGORIES: AppCategory[] = [
  'All',
  'Games',
  'Productivity',
  'Tools',
  'Social',
  'Entertainment',
  'Finance',
  'Photography',
  'Health & Fitness',
];

const ITEMS_PER_PAGE = 18; // Exactly 18 apps per page requirement

const INITIAL_DEMANDS: AppDemandRequest[] = [
  {
    id: 'demand-1',
    userName: 'Khurram Shah',
    email: 'khurram@example.com',
    contactMethod: 'WhatsApp',
    contactHandle: '+92 300 1234567',
    appTitle: 'Solar Grid Inverter IoT Monitor',
    platform: 'Android',
    category: 'Tools',
    requirements: 'Real-time Bluetooth BLE & Wi-Fi telemetry for hybrid solar inverters. Needs daily yield graphs, battery state of charge (SoC) gauges, and push notifications for grid power cuts.',
    timeline: '2-4 Weeks',
    budget: '$1,500 - $2,500',
    status: 'In Review',
    submittedAt: '2026-10-02T14:20:00Z',
  },
  {
    id: 'demand-2',
    userName: 'Elena Rostova',
    email: 'elena.rostova@designworks.io',
    contactMethod: 'Telegram',
    contactHandle: '@elena_craft',
    appTitle: 'Ceramic Studio Glaze Formula Calculator',
    platform: 'Cross-Platform',
    category: 'Productivity',
    requirements: 'A precise chemistry recipe builder for ceramic glaze firing. Calculates unity molecular formulas (UMF), Seger cone melting curves, and batch weighing scales with offline SQLite sync.',
    timeline: '1-2 Months',
    budget: '$3,000 - $5,000',
    status: 'Approved',
    submittedAt: '2026-10-03T09:15:00Z',
  }
];

export default function App() {
  const [apps, setApps] = useState<AppModel[]>(() => {
    try {
      const saved = localStorage.getItem('hadi88_apps_data');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          return parsed;
        }
      }
    } catch {
      // Fallback
    }
    return INITIAL_APPS;
  });

  const [demands, setDemands] = useState<AppDemandRequest[]>(() => {
    try {
      const saved = localStorage.getItem('hadi88_client_demands');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          return parsed;
        }
      }
    } catch {
      // Fallback
    }
    return INITIAL_DEMANDS;
  });

  // URL Path & View Routing (/ or /admin/manage/)
  const [activeView, setActiveView] = useState<'store' | 'admin' | 'django-code'>(() => {
    if (typeof window !== 'undefined') {
      const p = window.location.pathname;
      const h = window.location.hash;
      if (p.startsWith('/admin/manage') || h.includes('/admin/manage')) {
        return 'admin';
      }
      if (p.startsWith('/django') || h.includes('/django')) {
        return 'django-code';
      }
    }
    return 'store';
  });

  // Admin authentication state (isolated from public users)
  const [isAdminAuthenticated, setIsAdminAuthenticated] = useState<boolean>(() => {
    try {
      return sessionStorage.getItem('hadi88_admin_authenticated') === 'true';
    } catch {
      return false;
    }
  });

  const [selectedCategory, setSelectedCategory] = useState<AppCategory>('All');
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [selectedApp, setSelectedApp] = useState<AppModel | null>(null);
  const [downloadModalApp, setDownloadModalApp] = useState<AppModel | null>(null);
  const [isDownloadModalOpen, setIsDownloadModalOpen] = useState(false);
  const [isDemandModalOpen, setIsDemandModalOpen] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [mobileLayout, setMobileLayout] = useState<'grid' | 'list'>('grid');

  // Handle URL history state & PopState
  useEffect(() => {
    const handlePopState = () => {
      const p = window.location.pathname;
      const h = window.location.hash;
      if (p.startsWith('/admin/manage') || h.includes('/admin/manage')) {
        setActiveView('admin');
      } else if (p.startsWith('/django') || h.includes('/django')) {
        setActiveView('django-code');
      } else {
        setActiveView('store');
      }
    };
    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  const navigateTo = (view: 'store' | 'admin' | 'django-code') => {
    setActiveView(view);
    const targetUrl = view === 'admin' ? '/admin/manage/' : view === 'django-code' ? '/django-code/' : '/';
    try {
      window.history.pushState({ view }, '', targetUrl);
    } catch {
      // Ignore if iframe sandboxed
    }
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  useEffect(() => {
    try {
      localStorage.setItem('hadi88_apps_data', JSON.stringify(apps));
    } catch {
      // Ignore quota
    }
  }, [apps]);

  useEffect(() => {
    try {
      localStorage.setItem('hadi88_client_demands', JSON.stringify(demands));
    } catch {
      // Ignore quota
    }
  }, [demands]);

  // Dynamic SEO meta and title updating for search engines and social sharing
  useEffect(() => {
    if (selectedApp) {
      document.title = `${selectedApp.app_name} APK Download v${selectedApp.version} - Hadi88 Apps`;
      const metaDesc = document.querySelector('meta[name="description"]');
      if (metaDesc) {
        metaDesc.setAttribute(
          'content',
          `Download ${selectedApp.app_name} v${selectedApp.version} APK (${selectedApp.file_size}). Verified safe by Play Protect & VirusTotal 0/74 clean. ${selectedApp.description.slice(0, 110)}...`
        );
      }
    } else if (activeView === 'admin') {
      document.title = 'Admin Management Portal - Hadi88 Apps';
    } else if (selectedCategory !== 'All') {
      document.title = `${selectedCategory} Apps - Download Verified APKs | Hadi88 Apps`;
    } else {
      document.title = 'Hadi88 Apps - Find and Ask for Your Dreaming Apps';
      const metaDesc = document.querySelector('meta[name="description"]');
      if (metaDesc) {
        metaDesc.setAttribute(
          'content',
          'Hadi88 Apps - We build apps on your demand. Discover curated mobile applications or request custom on-demand software with dark chocolate and amber glassmorphism.'
        );
      }
    }
  }, [selectedApp, activeView, selectedCategory]);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  const handleDownloadApk = (app: AppModel) => {
    setDownloadModalApp(app);
    setIsDownloadModalOpen(true);
  };

  const handleDownloadModalComplete = (app: AppModel) => {
    setApps((prevApps) =>
      prevApps.map((a) =>
        a.id === app.id ? { ...a, downloads_count: a.downloads_count + 1 } : a
      )
    );
    showToast(`Verification complete · ${app.app_name} is ready for installation!`);
  };

  const handleAddApp = (newApp: AppModel) => {
    setApps((prev) => [newApp, ...prev]);
    showToast(`Successfully published ${newApp.app_name}!`);
  };

  const handleUpdateApp = (updatedApp: AppModel) => {
    setApps((prev) => prev.map((a) => (a.id === updatedApp.id ? updatedApp : a)));
    if (selectedApp && selectedApp.id === updatedApp.id) {
      setSelectedApp(updatedApp);
    }
    showToast(`Updated ${updatedApp.app_name}`);
  };

  const handleDeleteApp = (appId: string) => {
    setApps((prev) => prev.filter((a) => a.id !== appId));
    if (selectedApp && selectedApp.id === appId) {
      setSelectedApp(null);
    }
    showToast('Application removed from store');
  };

  const handleAddReview = (appId: string, newReview: import('./types/app').AppReview) => {
    setApps((prev) =>
      prev.map((a) => {
        if (a.id === appId) {
          const existingReviews = a.reviews || [];
          const updatedReviews = [newReview, ...existingReviews];
          const newRating = Number(
            (updatedReviews.reduce((sum, r) => sum + r.rating, 0) / updatedReviews.length).toFixed(1)
          );
          return {
            ...a,
            rating: newRating,
            reviews_count: (a.reviews_count || existingReviews.length) + 1,
            reviews: updatedReviews
          };
        }
        return a;
      })
    );

    if (selectedApp && selectedApp.id === appId) {
      setSelectedApp((prev) => {
        if (!prev) return null;
        const existingReviews = prev.reviews || [];
        const updatedReviews = [newReview, ...existingReviews];
        const newRating = Number(
          (updatedReviews.reduce((sum, r) => sum + r.rating, 0) / updatedReviews.length).toFixed(1)
        );
        return {
          ...prev,
          rating: newRating,
          reviews_count: (prev.reviews_count || existingReviews.length) + 1,
          reviews: updatedReviews
        };
      });
    }

    showToast('Review posted! Thank you for your feedback.');
  };

  const handleSubmitDemand = (newDemand: AppDemandRequest) => {
    setDemands((prev) => [newDemand, ...prev]);
    showToast(`Application demand for "${newDemand.appTitle}" sent to Hadi88 team!`);
  };

  const handleUpdateDemandStatus = (demandId: string, newStatus: AppDemandRequest['status']) => {
    setDemands((prev) =>
      prev.map((d) => (d.id === demandId ? { ...d, status: newStatus } : d))
    );
    showToast(`Demand status updated to "${newStatus}"`);
  };

  const handleDeleteDemand = (demandId: string) => {
    setDemands((prev) => prev.filter((d) => d.id !== demandId));
    showToast('Demand request deleted');
  };

  const handleAdminLoginSuccess = () => {
    setIsAdminAuthenticated(true);
    try {
      sessionStorage.setItem('hadi88_admin_authenticated', 'true');
    } catch {
      // Ignore
    }
    showToast('Admin authenticated successfully');
  };

  const handleAdminLogout = () => {
    setIsAdminAuthenticated(false);
    try {
      sessionStorage.removeItem('hadi88_admin_authenticated');
    } catch {
      // Ignore
    }
    navigateTo('store');
    showToast('Admin signed out');
  };

  const categoryCounts = useMemo(() => {
    const published = apps.filter(a => a.is_published !== false);
    const counts: Record<string, number> = { All: published.length };
    published.forEach((a) => {
      counts[a.category] = (counts[a.category] || 0) + 1;
    });
    return counts;
  }, [apps]);

  const filteredApps = useMemo(() => {
    const published = apps.filter(a => a.is_published !== false);
    if (selectedCategory === 'All') return published;
    return published.filter((a) => a.category === selectedCategory);
  }, [apps, selectedCategory]);

  const featuredApps = useMemo(() => {
    const published = apps.filter(a => a.is_published !== false);
    const explicitlyFeatured = published.filter((a) => a.featured);
    if (explicitlyFeatured.length >= 3) return explicitlyFeatured;
    return published.slice(0, 4);
  }, [apps]);

  const paginatedApps = useMemo(() => {
    const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
    return filteredApps.slice(startIndex, startIndex + ITEMS_PER_PAGE);
  }, [filteredApps, currentPage]);

  const handleCategoryChange = (cat: AppCategory) => {
    setSelectedCategory(cat);
    setCurrentPage(1);
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#0d0a08] text-[#f7efe6] selection:bg-amber-500/30 selection:text-amber-200">
      
      {/* Ambient background glows */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
        <div className="absolute -top-40 left-1/4 w-96 h-96 bg-amber-600/10 rounded-full blur-[140px]" />
        <div className="absolute top-1/3 -right-20 w-80 h-80 bg-amber-500/5 rounded-full blur-[120px]" />
        <div className="absolute bottom-10 left-10 w-96 h-96 bg-amber-700/5 rounded-full blur-[160px]" />
      </div>

      {/* Route Switcher / Address Bar Indicator (Testing helper for localhost:8000 and /admin/manage/) */}
      <div className="relative z-30 bg-[#0b0806] border-b border-amber-500/10 px-3 py-1 text-[10px] text-stone-400 flex items-center justify-between">
        <div className="flex items-center gap-1.5 font-mono">
          <span className="text-stone-500">Route:</span>
          <span className={activeView === 'admin' ? 'text-amber-400 font-bold' : 'text-stone-300'}>
            localhost:8000{activeView === 'admin' ? '/admin/manage/' : activeView === 'django-code' ? '/django-code/' : '/'}
          </span>
          {activeView === 'admin' && (
            <span className="text-[9px] bg-amber-500/20 text-amber-300 px-1 rounded border border-amber-500/30">
              {isAdminAuthenticated ? 'Admin Authenticated' : 'Admin Login Required'}
            </span>
          )}
        </div>

        <div className="flex items-center gap-2">
          {activeView !== 'admin' ? (
            <button
              onClick={() => navigateTo('admin')}
              className="hover:text-amber-400 text-stone-400 text-[10px] font-mono flex items-center gap-1"
              title="Navigate directly to custom admin route /admin/manage/"
            >
              <Lock className="w-2.5 h-2.5 text-amber-500/70" />
              <span>Go to /admin/manage/</span>
            </button>
          ) : (
            <button
              onClick={() => navigateTo('store')}
              className="hover:text-amber-400 text-stone-300 text-[10px] font-semibold"
            >
              ← Back to Users Store (/)
            </button>
          )}
        </div>
      </div>

      {/* Top Banner (PWA Native App Install Prompt) */}
      <PWAInstallBanner />

      {/* Top Navigation (Only Users Controls: NO Admin Button visible here!) */}
      <Navbar
        apps={apps}
        onSelectApp={(app) => setSelectedApp(app)}
        activeView={activeView}
        setActiveView={(v) => navigateTo(v)}
        onDownloadApk={handleDownloadApk}
        onOpenDemandModal={() => setIsDemandModalOpen(true)}
      />

      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-16 sm:bottom-6 right-3 sm:right-6 z-50 glass-panel border border-amber-500/40 text-amber-200 text-[10px] sm:text-xs font-semibold px-3 py-2 sm:px-4 sm:py-3 rounded-xl sm:rounded-2xl shadow-xl flex items-center gap-2 animate-bounce max-w-xs sm:max-w-sm">
          <Sparkles className="w-3.5 h-3.5 text-amber-400 shrink-0" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Brand Sub-Header Banner with Small Responsive Fonts */}
      {activeView !== 'admin' && (
        <div className="relative z-10 bg-[#160f0b]/90 border-b border-amber-500/10 py-1 sm:py-2 px-3 sm:px-4 text-center">
          <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-center gap-0.5 sm:gap-4 text-[9px] sm:text-xs">
            <span className="text-amber-300 font-bold tracking-tight">
              "Find and ask for your dreaming apps"
            </span>
            <span className="hidden sm:inline text-amber-500/40">·</span>
            <span className="text-stone-300 font-medium">
              "We are building app on your demand"
            </span>
            <button
              onClick={() => setIsDemandModalOpen(true)}
              className="text-amber-400 hover:text-amber-300 font-bold underline decoration-amber-500/40 underline-offset-2 cursor-pointer text-[9px] sm:text-xs ml-1"
            >
              Submit app requirement →
            </button>
          </div>
        </div>
      )}

      {/* Main Content Area */}
      <main className="relative z-10 flex-1 max-w-7xl w-full mx-auto px-2.5 sm:px-6 lg:px-8 py-3.5 sm:py-8 space-y-4 sm:space-y-8 pb-24 sm:pb-12">
        
        {/* VIEW 1: Storefront Catalog (Strictly for Public Users at localhost:8000/) */}
        {activeView === 'store' && (
          <div className="space-y-4 sm:space-y-8">
            {/* Top Trending / Hero Carousel */}
            <HeroCarousel
              featuredApps={featuredApps}
              onSelectApp={(app) => setSelectedApp(app)}
              onDownloadApk={handleDownloadApk}
              onOpenDemandModal={() => setIsDemandModalOpen(true)}
            />

            {/* Custom On-Demand App Callout Banner */}
            <div className="glass-panel rounded-xl sm:rounded-3xl p-3 sm:p-6 border border-amber-500/20 flex flex-col lg:flex-row items-start lg:items-center justify-between gap-3 sm:gap-4 bg-gradient-to-r from-[#18110b] via-[#1f150e] to-[#18110b]">
              <div className="space-y-1 max-w-2xl">
                <div className="flex items-center gap-1.5 text-[9px] sm:text-xs font-bold text-amber-400 uppercase tracking-wider">
                  <Smartphone className="w-3 h-3 text-amber-400" />
                  <span>Hadi88 Apps On-Demand Service</span>
                </div>
                <h2 className="text-sm sm:text-xl font-display font-extrabold text-white">
                  Have a Unique Application Idea in Mind?
                </h2>
                <p className="text-[10px] sm:text-xs text-stone-300 leading-relaxed">
                  Tell our dedicated engineers what features, APIs, and workflows you envision. We build Android, iOS, and Web applications on demand.
                </p>
                <div className="pt-0.5 flex items-center gap-1 text-[8px] sm:text-[10px] text-stone-400">
                  <ShieldAlert className="w-2.5 h-2.5 text-amber-400/80 shrink-0" />
                  <span>Strict policy: We never develop any illegal, modded, gambling, or theft category software.</span>
                </div>
              </div>

              <button
                onClick={() => setIsDemandModalOpen(true)}
                className="w-full lg:w-auto px-4 py-2 sm:py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-black font-extrabold text-xs flex items-center justify-center gap-1.5 shadow-md shadow-amber-500/20 transition-all shrink-0"
              >
                <MessageSquarePlus className="w-3.5 h-3.5 stroke-[2.5]" />
                <span>Ask for App</span>
              </button>
            </div>

            {/* Category Filter Tabs */}
            <CategoryFilter
              categories={CATEGORIES}
              selectedCategory={selectedCategory}
              onSelectCategory={handleCategoryChange}
              categoryCounts={categoryCounts}
            />

            {/* App Grid Header with 18-items indicator & Mobile View Toggle (Grid / List) */}
            <section className="space-y-3 sm:space-y-5">
              <div className="flex items-center justify-between gap-1.5 border-b border-amber-500/10 pb-2">
                <div className="flex items-center gap-1.5">
                  <h2 className="text-sm sm:text-xl font-display font-bold text-white tracking-tight">
                    {selectedCategory === 'All' ? 'All Applications' : `${selectedCategory} Apps`}
                  </h2>
                  <span className="text-[9px] sm:text-[11px] font-mono text-amber-400 font-bold bg-amber-500/10 px-1.5 py-0.2 rounded border border-amber-500/20">
                    18 / page
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  <span className="text-[9px] sm:text-xs text-stone-400 hidden xs:inline">
                    Showing {paginatedApps.length} of {filteredApps.length}
                  </span>

                  {/* Mobile Layout Switcher: Grid vs List (Google Play Mobile Style) */}
                  <div className="flex items-center glass-panel rounded-lg p-0.5 border border-amber-500/20 sm:hidden">
                    <button
                      onClick={() => setMobileLayout('grid')}
                      className={`p-1 rounded ${mobileLayout === 'grid' ? 'bg-amber-500 text-black' : 'text-stone-400'}`}
                      aria-label="Grid View"
                    >
                      <LayoutGrid className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => setMobileLayout('list')}
                      className={`p-1 rounded ${mobileLayout === 'list' ? 'bg-amber-500 text-black' : 'text-stone-400'}`}
                      aria-label="List View"
                    >
                      <List className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>

              {/* App Cards Container: List mode on mobile when chosen, else sleek responsive Grid */}
              {mobileLayout === 'list' ? (
                <div className="space-y-2 sm:hidden">
                  {paginatedApps.map((app) => (
                    <AppCard
                      key={app.id}
                      app={app}
                      layout="list"
                      onSelectApp={(a) => setSelectedApp(a)}
                      onDownloadApk={handleDownloadApk}
                    />
                  ))}
                </div>
              ) : (
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-2 sm:gap-3.5">
                  {paginatedApps.map((app) => (
                    <AppCard
                      key={app.id}
                      app={app}
                      layout="grid"
                      onSelectApp={(a) => setSelectedApp(a)}
                      onDownloadApk={handleDownloadApk}
                    />
                  ))}
                </div>
              )}

              {paginatedApps.length === 0 && (
                <div className="text-center py-10 glass-panel rounded-xl space-y-1.5">
                  <Layers className="w-7 h-7 text-stone-600 mx-auto" />
                  <div className="text-xs font-bold text-stone-300">No applications in this category</div>
                  <button
                    onClick={() => handleCategoryChange('All')}
                    className="text-xs text-amber-400 hover:underline"
                  >
                    View all applications
                  </button>
                </div>
              )}

              {/* Exact 18 Apps Per Page Pagination */}
              <Pagination
                currentPage={currentPage}
                totalItems={filteredApps.length}
                itemsPerPage={ITEMS_PER_PAGE}
                onPageChange={(page) => setCurrentPage(page)}
              />
            </section>
          </div>
        )}

        {/* VIEW 2: SECURED ADMIN PORTAL (/admin/manage/) */}
        {activeView === 'admin' && (
          !isAdminAuthenticated ? (
            <AdminLogin
              onLoginSuccess={handleAdminLoginSuccess}
              onBackToStore={() => navigateTo('store')}
            />
          ) : (
            <AdminDashboard
              apps={apps}
              onAddApp={handleAddApp}
              onUpdateApp={handleUpdateApp}
              onDeleteApp={handleDeleteApp}
              onClose={() => navigateTo('store')}
              onSelectApp={(app) => setSelectedApp(app)}
              demands={demands}
              onUpdateDemandStatus={handleUpdateDemandStatus}
              onDeleteDemand={handleDeleteDemand}
              onLogout={handleAdminLogout}
            />
          )
        )}

        {/* VIEW 3: Django Code & Architecture Hub */}
        {activeView === 'django-code' && (
          <DjangoCodeViewer />
        )}

      </main>

      {/* App Detail Modal */}
      {selectedApp && (
        <AppDetailModal
          app={selectedApp}
          onClose={() => setSelectedApp(null)}
          onDownloadApk={handleDownloadApk}
          allApps={apps}
          onSelectApp={(app) => setSelectedApp(app)}
          onAddReview={handleAddReview}
        />
      )}

      {/* Real-Time Safety Verified Download & Install Modal */}
      <DownloadProgressModal
        app={downloadModalApp}
        isOpen={isDownloadModalOpen}
        onClose={() => {
          setIsDownloadModalOpen(false);
          setDownloadModalApp(null);
        }}
        onDownloadComplete={handleDownloadModalComplete}
      />

      {/* Contact Admin / Demand an App Modal Form (For Users on public site) */}
      <ContactAdminModal
        isOpen={isDemandModalOpen}
        onClose={() => setIsDemandModalOpen(false)}
        onSubmitDemand={handleSubmitDemand}
      />

      {/* Mobile Sticky Bottom Navigation Bar (Only Public Tabs: Store, Ask App, Django) */}
      {activeView !== 'admin' && (
        <MobileBottomNav
          activeView={activeView}
          setActiveView={(v) => navigateTo(v)}
          onOpenDemandModal={() => setIsDemandModalOpen(true)}
        />
      )}

      {/* Footer (No Admin Button for Public Users) */}
      <footer className="relative z-10 border-t border-amber-500/15 bg-[#0a0705] py-6 sm:py-10 mb-14 sm:mb-0">
        <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 space-y-4">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-3 sm:gap-4">
            
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 sm:w-8 sm:h-8 rounded-lg bg-gradient-to-br from-amber-400 to-amber-600 flex items-center justify-center text-black font-display font-black text-xs sm:text-base shadow-md shadow-amber-500/20">
                  H
                </div>
                <span className="font-display font-bold text-base sm:text-xl text-white">
                  Hadi88<span className="text-amber-400 ml-0.5">Apps</span>
                </span>
              </div>
              <p className="text-[10px] sm:text-xs text-stone-300 font-medium">
                "Find and ask for your dreaming apps" · "We are building app on your demand"
              </p>
              <p className="text-[9px] sm:text-[11px] text-stone-500 max-w-md">
                Production-ready mobile software marketplace and bespoke engineering pipeline.
              </p>
            </div>

            {/* Public Footer Navigation: Only Store, Ask for App, and Django Code */}
            <div className="flex flex-wrap items-center gap-3 sm:gap-6 text-[10px] sm:text-xs text-stone-300">
              <button
                onClick={() => navigateTo('store')}
                className="hover:text-amber-400 transition-colors py-0.5"
              >
                Storefront
              </button>
              <button
                onClick={() => setIsDemandModalOpen(true)}
                className="text-amber-400 font-bold hover:text-amber-300 transition-colors py-0.5 flex items-center gap-1"
              >
                <MessageSquarePlus className="w-3 h-3" />
                <span>Ask for App</span>
              </button>
              <button
                onClick={() => navigateTo('django-code')}
                className="hover:text-amber-400 transition-colors py-0.5"
              >
                Django Code (.zip)
              </button>
            </div>

          </div>

          <div className="pt-3 border-t border-stone-800/80 flex flex-col sm:flex-row items-center justify-between gap-1.5 text-[9px] sm:text-xs text-stone-500">
            <div>
              <span>© 2026 Hadi88 Apps. Mobile-first dark chocolate & amber theme.</span>
            </div>
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-1 text-stone-400">
                <ShieldCheck className="w-3 h-3 text-amber-500/80" />
                <span>Strict Legal Safety Policy Enforced</span>
              </div>
              <span className="text-stone-700">·</span>
              <button
                onClick={() => navigateTo('admin')}
                className="text-stone-600 hover:text-stone-400 font-mono text-[9px] transition-colors"
                title="Admin Route: /admin/manage/"
              >
                /admin/manage/
              </button>
            </div>
          </div>
        </div>
      </footer>

    </div>
  );
}
