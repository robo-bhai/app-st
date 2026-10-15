import React, { useState, useRef, useEffect } from 'react';
import { 
  Search, Download, Code2, LayoutDashboard, 
  Store, MessageSquarePlus, Menu, X, Smartphone
} from 'lucide-react';
import { AppModel } from '../types/app';
import { usePWAInstall, PWAHowToModal } from './PWAInstallBanner';
import { resolveAppIcon, handleImageFallback } from '../utils/imageUtils';

interface NavbarProps {
  apps: AppModel[];
  onSelectApp: (app: AppModel) => void;
  activeView: 'store' | 'admin' | 'django-code';
  setActiveView: (view: 'store' | 'admin' | 'django-code') => void;
  onDownloadApk: (app: AppModel) => void;
  onOpenDemandModal: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  apps,
  onSelectApp,
  activeView,
  setActiveView,
  onDownloadApk,
  onOpenDemandModal,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [showHowToModal, setShowHowToModal] = useState(false);
  const searchContainerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const { triggerInstall, isStandalone } = usePWAInstall();

  const handlePwaInstall = async () => {
    await triggerInstall(() => {
      setShowHowToModal(true);
    });
  };

  // Filter apps matching search query
  const searchResults = searchQuery.trim().length >= 1
    ? apps.filter(app =>
        app.app_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        app.developer_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        app.category.toLowerCase().includes(searchQuery.toLowerCase()) ||
        app.package_name.toLowerCase().includes(searchQuery.toLowerCase())
      ).slice(0, 6)
    : [];

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (searchContainerRef.current && !searchContainerRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Keyboard shortcut Ctrl+K or / to focus search
  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if ((e.key === 'k' && (e.metaKey || e.ctrlKey)) || (e.key === '/' && document.activeElement !== inputRef.current)) {
        e.preventDefault();
        inputRef.current?.focus();
      }
    }
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const handleKeyDownInInput = (e: React.KeyboardEvent) => {
    if (!isDropdownOpen || searchResults.length === 0) return;

    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelectedIndex((prev) => (prev + 1) % searchResults.length);
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedIndex((prev) => (prev - 1 + searchResults.length) % searchResults.length);
    } else if (e.key === 'Enter') {
      e.preventDefault();
      const selected = searchResults[selectedIndex];
      if (selected) {
        onSelectApp(selected);
        setIsDropdownOpen(false);
        setSearchQuery('');
      }
    } else if (e.key === 'Escape') {
      setIsDropdownOpen(false);
    }
  };

  return (
    <header className="sticky top-0 z-40 bg-[#120e0b]/95 backdrop-blur-xl border-b border-amber-500/15 transition-all">
      <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8">
        
        {/* Row 1: Logo & Brand + Quick Actions */}
        <div className="h-14 sm:h-20 flex items-center justify-between gap-3">
          
          {/* Brand Wordmark */}
          <button
            onClick={() => {
              setActiveView('store');
              setMobileMenuOpen(false);
            }}
            className="flex items-center gap-2 sm:gap-3 shrink-0 text-left group focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-400 rounded-xl"
            aria-label="Hadi88 Apps Home"
          >
            <div className="w-8 h-8 sm:w-11 sm:h-11 rounded-xl sm:rounded-2xl bg-gradient-to-br from-amber-400 via-amber-500 to-amber-600 flex items-center justify-center text-black font-display font-black text-base sm:text-2xl shadow-md shadow-amber-500/20 group-hover:scale-105 transition-all">
              H
            </div>
            <div className="flex flex-col">
              <span className="font-display font-extrabold text-base sm:text-2xl tracking-tight text-white group-hover:text-amber-400 transition-colors leading-none">
                Hadi88<span className="text-amber-400 ml-0.5">Apps</span>
              </span>
              <span className="hidden sm:block text-[10px] text-amber-300/80 font-medium tracking-tight mt-0.5 truncate max-w-[210px]">
                Find and ask for your dreaming apps
              </span>
            </div>
          </button>

          {/* Desktop Search Bar (Hidden on Mobile) */}
          <div ref={searchContainerRef} className="hidden sm:block relative flex-1 max-w-md lg:max-w-lg mx-4">
            <div className="relative">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-amber-400/80" />
              <input
                ref={inputRef}
                type="text"
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  setIsDropdownOpen(true);
                  setSelectedIndex(0);
                }}
                onFocus={() => setIsDropdownOpen(true)}
                onKeyDown={handleKeyDownInInput}
                placeholder="Search apps, tools, games, package..."
                className="w-full bg-[#1c1510]/90 text-xs sm:text-sm text-[#f5ede4] placeholder-stone-400 rounded-full pl-10 pr-12 py-2 border border-amber-500/25 focus:outline-none focus:border-amber-400 focus:ring-1 focus:ring-amber-400/20"
              />
              <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-1 text-[9px] font-mono text-stone-400 px-1 py-0.5 rounded bg-stone-900/80 border border-amber-500/10">
                <span>⌘K</span>
              </div>
            </div>

            {/* Desktop Live Search Results Dropdown */}
            {isDropdownOpen && searchQuery.trim().length >= 1 && (
              <div className="absolute top-full mt-2 w-full glass-panel rounded-2xl p-2 shadow-2xl z-50 max-h-96 overflow-y-auto border border-amber-500/25">
                {searchResults.length > 0 ? (
                  <div className="space-y-1">
                    <div className="px-3 py-1.5 text-[10px] font-semibold text-stone-400 flex items-center justify-between border-b border-amber-500/10">
                      <span>Matches ({searchResults.length})</span>
                      <span className="text-[9px]">Tap to view</span>
                    </div>
                    {searchResults.map((app, index) => (
                      <div
                        key={app.id}
                        onClick={() => {
                          onSelectApp(app);
                          setIsDropdownOpen(false);
                          setSearchQuery('');
                        }}
                        className={`flex items-center gap-2.5 p-2 rounded-xl cursor-pointer transition-colors ${
                          selectedIndex === index ? 'bg-amber-500/20 text-white' : 'hover:bg-amber-500/10 text-stone-200'
                        }`}
                      >
                        <img
                          src={resolveAppIcon(app.app_icon, app.app_name, app.category)}
                          alt={app.app_name}
                          onError={(e) => handleImageFallback(e, app.app_name, app.category)}
                          className="w-9 h-9 rounded-xl object-cover bg-stone-900 border border-amber-500/20 shrink-0"
                        />
                        <div className="flex-1 min-w-0">
                          <div className="text-xs sm:text-sm font-semibold truncate text-white">
                            {app.app_name}
                          </div>
                          <div className="text-[10px] text-stone-400 truncate">
                            {app.developer_name} · <span className="text-amber-300/80">{app.category}</span>
                          </div>
                        </div>
                        <div className="text-right shrink-0">
                          <div className="text-xs font-bold text-amber-400">★ {app.rating}</div>
                          <div className="text-[9px] text-stone-500">{app.file_size}</div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="p-4 text-center text-xs text-stone-400">
                    No applications found for "{searchQuery}".
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Desktop Right Zone Buttons */}
          <div className="hidden sm:flex items-center gap-2 shrink-0">
            {!isStandalone && (
              <button
                onClick={handlePwaInstall}
                className="px-3 py-1.5 rounded-xl text-xs font-bold bg-amber-500/20 hover:bg-amber-500 text-amber-300 hover:text-black border border-amber-500/40 shadow-sm transition-all flex items-center gap-1.5"
                title="Install Native App (PWA)"
              >
                <Smartphone className="w-3.5 h-3.5" />
                <span>Install App</span>
              </button>
            )}

            <button
              onClick={() => setActiveView('store')}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${
                activeView === 'store'
                  ? 'bg-amber-500 text-black shadow-md font-bold'
                  : 'text-stone-300 hover:text-amber-400 hover:bg-amber-500/10'
              }`}
            >
              <Store className="w-3.5 h-3.5 inline mr-1" />
              <span>Store</span>
            </button>

            <button
              onClick={onOpenDemandModal}
              className="px-3.5 py-1.5 rounded-xl text-xs font-bold bg-amber-500 hover:bg-amber-400 text-black shadow-md shadow-amber-500/20 transition-all flex items-center gap-1.5 whitespace-nowrap"
            >
              <MessageSquarePlus className="w-3.5 h-3.5" />
              <span>Ask for App</span>
            </button>

            <button
              onClick={() => setActiveView('django-code')}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold border transition-all ${
                activeView === 'django-code'
                  ? 'bg-amber-400 text-black border-amber-400 font-bold'
                  : 'border-amber-500/20 text-stone-300 hover:text-amber-400'
              }`}
            >
              <Code2 className="w-3.5 h-3.5 inline mr-1" />
              <span>Django Code</span>
            </button>
          </div>

          {/* Mobile Right Zone Actions (Clean, un-squished) */}
          <div className="flex sm:hidden items-center gap-1.5">
            {!isStandalone && (
              <button
                onClick={handlePwaInstall}
                className="px-2.5 py-1.5 rounded-xl text-[11px] font-bold bg-amber-500/20 text-amber-300 border border-amber-500/40 flex items-center gap-1 active:scale-95"
                title="Install App"
              >
                <Smartphone className="w-3 h-3" />
                <span>Install</span>
              </button>
            )}

            <button
              onClick={onOpenDemandModal}
              className="px-2.5 py-1.5 rounded-xl text-[11px] font-bold bg-amber-500 text-black shadow-md flex items-center gap-1 whitespace-nowrap"
            >
              <MessageSquarePlus className="w-3 h-3" />
              <span>Ask</span>
            </button>

            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-1.5 rounded-xl glass-panel text-stone-300 hover:text-white"
              aria-label="Toggle Navigation Menu"
            >
              {mobileMenuOpen ? <X className="w-4 h-4 text-amber-400" /> : <Menu className="w-4 h-4" />}
            </button>
          </div>

        </div>

        {/* Mobile Row 2: Full-Width Search Input (100% width, never squished) */}
        <div className="sm:hidden pb-2.5">
          <div className="relative w-full">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-amber-400/80" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setIsDropdownOpen(true);
                setSelectedIndex(0);
              }}
              onFocus={() => setIsDropdownOpen(true)}
              onKeyDown={handleKeyDownInInput}
              placeholder="Search apps, tools, games..."
              className="w-full bg-[#18120e]/95 text-xs text-amber-100 placeholder-stone-400 rounded-xl pl-9 pr-3 py-2 border border-amber-500/20 focus:outline-none focus:border-amber-400"
            />
          </div>

          {/* Mobile Live Search Dropdown */}
          {isDropdownOpen && searchQuery.trim().length >= 1 && (
            <div className="mt-1.5 w-full glass-panel rounded-xl p-1.5 shadow-2xl max-h-72 overflow-y-auto border border-amber-500/25">
              {searchResults.length > 0 ? (
                <div className="space-y-1">
                  {searchResults.map((app) => (
                    <div
                      key={app.id}
                      onClick={() => {
                        onSelectApp(app);
                        setIsDropdownOpen(false);
                        setSearchQuery('');
                      }}
                      className="flex items-center gap-2 p-1.5 rounded-lg hover:bg-amber-500/10 cursor-pointer"
                    >
                      <img
                        src={resolveAppIcon(app.app_icon, app.app_name, app.category)}
                        alt={app.app_name}
                        onError={(e) => handleImageFallback(e, app.app_name, app.category)}
                        className="w-7 h-7 rounded-lg object-cover bg-stone-900 shrink-0"
                      />
                      <div className="flex-1 min-w-0">
                        <div className="text-xs font-bold text-white truncate">{app.app_name}</div>
                        <div className="text-[10px] text-stone-400 truncate">{app.developer_name} · {app.category}</div>
                      </div>
                      <div className="text-[10px] text-amber-400 font-bold">★ {app.rating}</div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="p-3 text-center text-xs text-stone-400">
                  No matching apps.
                  <button onClick={() => { setIsDropdownOpen(false); onOpenDemandModal(); }} className="block mx-auto text-amber-400 font-bold underline mt-1">
                    Ask for this app →
                  </button>
                </div>
              )}
            </div>
          )}
        </div>

      </div>

      {/* Mobile Drawer Menu */}
      {mobileMenuOpen && (
        <div className="sm:hidden glass-panel border-t border-amber-500/20 px-3 py-2.5 space-y-1 bg-[#140e0b]">
          <button
            onClick={() => { setActiveView('store'); setMobileMenuOpen(false); }}
            className={`w-full flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-semibold ${
              activeView === 'store' ? 'bg-amber-500 text-black font-bold' : 'text-stone-300'
            }`}
          >
            <Store className="w-3.5 h-3.5" />
            <span>App Storefront</span>
          </button>
          <button
            onClick={() => { onOpenDemandModal(); setMobileMenuOpen(false); }}
            className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-bold text-amber-400"
          >
            <MessageSquarePlus className="w-3.5 h-3.5" />
            <span>Ask for Custom App</span>
          </button>
          <button
            onClick={() => { setActiveView('django-code'); setMobileMenuOpen(false); }}
            className={`w-full flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-semibold ${
              activeView === 'django-code' ? 'bg-amber-400 text-black font-bold' : 'text-stone-300'
            }`}
          >
            <Code2 className="w-3.5 h-3.5" />
            <span>Django Source Code (.zip)</span>
          </button>
        </div>
      )}

      {/* Manual PWA Install Guide Modal */}
      {showHowToModal && <PWAHowToModal onClose={() => setShowHowToModal(false)} />}
    </header>
  );
};
