import React, { useState, useMemo } from 'react';
import { 
  Plus, Edit, Trash2, Search, Download, Layers, Star, 
  X, Shield, MessageSquarePlus, Clock, ExternalLink, LogOut,
  CheckCircle2, Eye, EyeOff, Sparkles, Filter, ArrowUpDown,
  FileDown, Cloud, HardDrive, Smartphone, CheckSquare, Square,
  Send, AlertTriangle, ArrowRight, RefreshCw, BarChart3, Database
} from 'lucide-react';
import { AppModel, AppCategory, AppDemandRequest } from '../types/app';
import { resolveAppIcon, handleImageFallback } from '../utils/imageUtils';

interface AdminDashboardProps {
  apps: AppModel[];
  onAddApp: (newApp: AppModel) => void;
  onUpdateApp: (updatedApp: AppModel) => void;
  onDeleteApp: (appId: string) => void;
  onClose: () => void;
  onSelectApp: (app: AppModel) => void;
  demands: AppDemandRequest[];
  onUpdateDemandStatus: (demandId: string, newStatus: AppDemandRequest['status']) => void;
  onDeleteDemand: (demandId: string) => void;
  onUpdateDemandNotes?: (demandId: string, notes: string) => void;
  onLogout?: () => void;
}

const CATEGORIES: AppCategory[] = [
  'Games',
  'Productivity',
  'Tools',
  'Social',
  'Entertainment',
  'Finance',
  'Photography',
  'Health & Fitness'
];

type SortOption = 'downloads-desc' | 'rating-desc' | 'newest' | 'name-asc' | 'size';

export const AdminDashboard: React.FC<AdminDashboardProps> = ({
  apps,
  onAddApp,
  onUpdateApp,
  onDeleteApp,
  onClose,
  onSelectApp,
  demands,
  onUpdateDemandStatus,
  onDeleteDemand,
  onUpdateDemandNotes,
  onLogout,
}) => {
  const [activeTab, setActiveTab] = useState<'apps' | 'demands' | 'analytics' | 'backup'>('apps');
  const [searchFilter, setSearchFilter] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<string>('All');
  const [statusFilter, setStatusFilter] = useState<'all' | 'published' | 'draft' | 'featured'>('all');
  const [demandStatusFilter, setDemandStatusFilter] = useState<string>('All');
  const [sortBy, setSortBy] = useState<SortOption>('newest');
  
  // Selection for bulk actions
  const [selectedAppIds, setSelectedAppIds] = useState<string[]>([]);
  
  // Modals
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const [editingApp, setEditingApp] = useState<AppModel | null>(null);
  const [deletingAppId, setDeletingAppId] = useState<string | null>(null);
  const [deletingDemandId, setDeletingDemandId] = useState<string | null>(null);
  const [viewingDemand, setViewingDemand] = useState<AppDemandRequest | null>(null);

  // Form state for Add / Edit
  const [formData, setFormData] = useState({
    app_name: '',
    package_name: '',
    developer_name: '',
    category: 'Productivity' as AppCategory,
    version: '1.0.0',
    file_size: '35 MB',
    rating: 4.5,
    description: '',
    whats_new: '',
    apk_file: '',
    app_icon: '',
    featured: false,
    is_published: true,
  });

  // KPI Calculations
  const totalDownloads = useMemo(() => apps.reduce((acc, a) => acc + a.downloads_count, 0), [apps]);
  const publishedAppsCount = useMemo(() => apps.filter(a => a.is_published !== false).length, [apps]);
  const draftAppsCount = useMemo(() => apps.filter(a => a.is_published === false).length, [apps]);
  const featuredAppsCount = useMemo(() => apps.filter(a => a.featured).length, [apps]);
  
  const avgRating = useMemo(() => {
    if (apps.length === 0) return '0.00';
    return (apps.reduce((acc, a) => acc + a.rating, 0) / apps.length).toFixed(2);
  }, [apps]);

  const pendingDemandsCount = useMemo(() => demands.filter(d => d.status === 'Pending').length, [demands]);

  // Filtering & Sorting Apps
  const filteredApps = useMemo(() => {
    return apps.filter(app => {
      const matchesSearch = 
        app.app_name.toLowerCase().includes(searchFilter.toLowerCase()) ||
        app.developer_name.toLowerCase().includes(searchFilter.toLowerCase()) ||
        app.package_name.toLowerCase().includes(searchFilter.toLowerCase());
      
      const matchesCategory = categoryFilter === 'All' || app.category === categoryFilter;

      let matchesStatus = true;
      if (statusFilter === 'published') matchesStatus = app.is_published !== false;
      else if (statusFilter === 'draft') matchesStatus = app.is_published === false;
      else if (statusFilter === 'featured') matchesStatus = !!app.featured;

      return matchesSearch && matchesCategory && matchesStatus;
    }).sort((a, b) => {
      if (sortBy === 'downloads-desc') return b.downloads_count - a.downloads_count;
      if (sortBy === 'rating-desc') return b.rating - a.rating;
      if (sortBy === 'name-asc') return a.app_name.localeCompare(b.app_name);
      if (sortBy === 'size') return parseInt(b.file_size || '0') - parseInt(a.file_size || '0');
      // default newest
      return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
    });
  }, [apps, searchFilter, categoryFilter, statusFilter, sortBy]);

  // Filtering Demands
  const filteredDemands = useMemo(() => {
    return demands.filter(d => {
      if (demandStatusFilter !== 'All' && d.status !== demandStatusFilter) return false;
      return true;
    });
  }, [demands, demandStatusFilter]);

  // Bulk selection handlers
  const handleToggleSelectAll = () => {
    if (selectedAppIds.length === filteredApps.length) {
      setSelectedAppIds([]);
    } else {
      setSelectedAppIds(filteredApps.map(a => a.id));
    }
  };

  const handleToggleSelectOne = (id: string) => {
    setSelectedAppIds(prev => 
      prev.includes(id) ? prev.filter(item => item !== id) : [...prev, id]
    );
  };

  const handleBulkPublish = () => {
    selectedAppIds.forEach(id => {
      const app = apps.find(a => a.id === id);
      if (app && app.is_published === false) {
        onUpdateApp({ ...app, is_published: true, updated_at: new Date().toISOString() });
      }
    });
    setSelectedAppIds([]);
  };

  const handleBulkUnpublish = () => {
    selectedAppIds.forEach(id => {
      const app = apps.find(a => a.id === id);
      if (app && app.is_published !== false) {
        onUpdateApp({ ...app, is_published: false, updated_at: new Date().toISOString() });
      }
    });
    setSelectedAppIds([]);
  };

  const handleBulkDelete = () => {
    if (window.confirm(`Are you sure you want to delete ${selectedAppIds.length} selected applications?`)) {
      selectedAppIds.forEach(id => onDeleteApp(id));
      setSelectedAppIds([]);
    }
  };

  // 1-Click Fast Toggles
  const handleTogglePublish = (app: AppModel) => {
    const isNowPublished = app.is_published === false ? true : false;
    onUpdateApp({
      ...app,
      is_published: isNowPublished,
      updated_at: new Date().toISOString()
    });
  };

  const handleToggleFeatured = (app: AppModel) => {
    onUpdateApp({
      ...app,
      featured: !app.featured,
      updated_at: new Date().toISOString()
    });
  };

  // Convert Demand to App Action
  const handleConvertDemandToApp = (demand: AppDemandRequest) => {
    setEditingApp(null);
    const generatedSlug = `com.hadi88.${demand.appTitle.toLowerCase().replace(/[^a-z0-9]/g, '')}`;
    setFormData({
      app_name: demand.appTitle,
      package_name: generatedSlug,
      developer_name: 'Hadi88 Studio',
      category: demand.category,
      version: '1.0.0',
      file_size: '30 MB',
      rating: 4.8,
      description: demand.requirements,
      whats_new: `Initial bespoke delivery built on custom request by ${demand.userName}.`,
      apk_file: `${generatedSlug}-v1.0.0.apk`,
      app_icon: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=500&auto=format&fit=crop&q=80',
      featured: true,
      is_published: true,
    });
    // Automatically update demand status to In Development
    onUpdateDemandStatus(demand.id, 'In Development');
    setIsUploadModalOpen(true);
  };

  // Open Create
  const handleOpenCreate = () => {
    setEditingApp(null);
    setFormData({
      app_name: '',
      package_name: '',
      developer_name: 'Hadi88 Studio',
      category: 'Productivity',
      version: '1.0.0',
      file_size: '35 MB',
      rating: 4.5,
      description: '',
      whats_new: 'Initial stable release on Hadi88 Apps Store.',
      apk_file: '',
      app_icon: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=500&auto=format&fit=crop&q=80',
      featured: false,
      is_published: true,
    });
    setIsUploadModalOpen(true);
  };

  // Open Edit
  const handleOpenEdit = (app: AppModel) => {
    setEditingApp(app);
    setFormData({
      app_name: app.app_name,
      package_name: app.package_name,
      developer_name: app.developer_name,
      category: app.category,
      version: app.version,
      file_size: app.file_size,
      rating: app.rating,
      description: app.description,
      whats_new: app.whats_new || '',
      apk_file: app.apk_file,
      app_icon: app.app_icon || '',
      featured: !!app.featured,
      is_published: app.is_published !== false,
    });
    setIsUploadModalOpen(true);
  };

  // Submit Form
  const handleSubmitForm = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.app_name.trim() || !formData.developer_name.trim()) return;

    const packageName = formData.package_name.trim() || 
      `com.hadi88.${formData.app_name.toLowerCase().replace(/[^a-z0-9]/g, '')}`;

    if (editingApp) {
      const updated: AppModel = {
        ...editingApp,
        app_name: formData.app_name,
        package_name: packageName,
        developer_name: formData.developer_name,
        category: formData.category,
        version: formData.version,
        file_size: formData.file_size,
        rating: Number(formData.rating),
        description: formData.description,
        whats_new: formData.whats_new,
        featured: formData.featured,
        is_published: formData.is_published,
        app_icon: formData.app_icon || editingApp.app_icon,
        apk_file: formData.apk_file || editingApp.apk_file,
        updated_at: new Date().toISOString(),
      };
      onUpdateApp(updated);
    } else {
      const newApp: AppModel = {
        id: `app-${Date.now()}`,
        app_name: formData.app_name,
        package_name: packageName,
        developer_name: formData.developer_name,
        category: formData.category,
        app_icon: formData.app_icon || 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=500&auto=format&fit=crop&q=80',
        description: formData.description || 'Modern mobile application built by Hadi88 engineering.',
        whats_new: formData.whats_new || 'Initial stable release on Hadi88 Apps Store.',
        version: formData.version || '1.0.0',
        apk_file: formData.apk_file || `${packageName}-v${formData.version || '1.0.0'}.apk`,
        file_size: formData.file_size || '35 MB',
        downloads_count: 0,
        rating: Number(formData.rating) || 4.5,
        reviews_count: 0,
        screenshots: [],
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        featured: formData.featured,
        is_published: formData.is_published,
      };
      onAddApp(newApp);
    }

    setIsUploadModalOpen(false);
  };

  // Export JSON Catalog
  const handleExportCatalog = () => {
    const data = {
      store: 'Hadi88 Apps',
      exported_at: new Date().toISOString(),
      stats: {
        total_apps: apps.length,
        published: publishedAppsCount,
        drafts: draftAppsCount,
        downloads: totalDownloads,
        demands: demands.length,
      },
      apps,
      demands,
    };
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `hadi88_catalog_export_${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-4 sm:space-y-6 animate-fade-in pb-16 sm:pb-8">
      
      {/* Top Header Card */}
      <div className="glass-panel rounded-2xl sm:rounded-3xl p-3.5 sm:p-6 border border-amber-500/20 flex flex-col md:flex-row items-start md:items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-1.5 text-[10px] sm:text-xs font-bold text-amber-400 uppercase tracking-wider">
            <Shield className="w-3.5 h-3.5" />
            <span>Hadi88 Enterprise Admin Portal · Route: /admin/manage/</span>
          </div>
          <h1 className="text-lg sm:text-2xl font-display font-extrabold text-white mt-0.5">
            Application Store Operations &amp; Control
          </h1>
          <p className="text-[10px] sm:text-xs text-stone-300 mt-0.5">
            Publish packages, manage public live status, fulfill client demands, and maintain Google Drive persistence.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2 w-full md:w-auto">
          <button
            onClick={handleOpenCreate}
            className="flex-1 sm:flex-initial px-3.5 sm:px-5 py-2 sm:py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-black font-extrabold text-[11px] sm:text-xs flex items-center justify-center gap-1.5 shadow-md shadow-amber-500/20 transition-all"
          >
            <Plus className="w-3.5 h-3.5 stroke-[2.5]" />
            <span>Publish App</span>
          </button>

          <button
            onClick={handleExportCatalog}
            className="px-3 py-2 sm:py-2.5 rounded-xl glass-panel text-amber-300 hover:text-amber-200 border border-amber-500/30 text-[11px] sm:text-xs font-semibold flex items-center gap-1.5 transition-colors"
            title="Download full catalog backup JSON"
          >
            <FileDown className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Export JSON</span>
          </button>

          <button
            onClick={onClose}
            className="px-3 sm:px-4 py-2 sm:py-2.5 rounded-xl glass-panel text-stone-300 hover:text-white text-[11px] sm:text-xs font-semibold"
          >
            Storefront
          </button>

          {onLogout && (
            <button
              onClick={onLogout}
              className="px-3 py-2 sm:py-2.5 rounded-xl bg-red-950/40 text-red-300 hover:bg-red-900/60 border border-red-500/30 text-[11px] sm:text-xs font-semibold flex items-center gap-1.5 transition-colors"
              title="Sign Out of Admin"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span className="hidden xs:inline">Sign Out</span>
            </button>
          )}
        </div>
      </div>

      {/* KPI Stats Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-2 sm:gap-3.5">
        <div className="glass-panel rounded-xl sm:rounded-2xl p-2.5 sm:p-4 border border-amber-500/15">
          <div className="flex items-center justify-between">
            <span className="text-[9px] sm:text-xs text-stone-400 font-semibold uppercase tracking-wider">Downloads</span>
            <Download className="w-3.5 h-3.5 text-amber-400" />
          </div>
          <div className="text-base sm:text-2xl font-display font-bold text-amber-400 font-mono tabular-nums mt-1">
            {totalDownloads.toLocaleString()}
          </div>
          <div className="text-[8px] sm:text-[10px] text-stone-500 mt-0.5">Global APK installs</div>
        </div>

        <div className="glass-panel rounded-xl sm:rounded-2xl p-2.5 sm:p-4 border border-amber-500/15">
          <div className="flex items-center justify-between">
            <span className="text-[9px] sm:text-xs text-stone-400 font-semibold uppercase tracking-wider">Live Public</span>
            <Eye className="w-3.5 h-3.5 text-emerald-400" />
          </div>
          <div className="text-base sm:text-2xl font-display font-bold text-emerald-400 font-mono tabular-nums mt-1">
            {publishedAppsCount}
          </div>
          <div className="text-[8px] sm:text-[10px] text-stone-500 mt-0.5">Visible to users</div>
        </div>

        <div className="glass-panel rounded-xl sm:rounded-2xl p-2.5 sm:p-4 border border-amber-500/15">
          <div className="flex items-center justify-between">
            <span className="text-[9px] sm:text-xs text-stone-400 font-semibold uppercase tracking-wider">Draft / Hidden</span>
            <EyeOff className="w-3.5 h-3.5 text-amber-500" />
          </div>
          <div className="text-base sm:text-2xl font-display font-bold text-amber-500 font-mono tabular-nums mt-1">
            {draftAppsCount}
          </div>
          <div className="text-[8px] sm:text-[10px] text-stone-500 mt-0.5">Not shown on store</div>
        </div>

        <div className="glass-panel rounded-xl sm:rounded-2xl p-2.5 sm:p-4 border border-amber-500/15">
          <div className="flex items-center justify-between">
            <span className="text-[9px] sm:text-xs text-stone-400 font-semibold uppercase tracking-wider">Demands</span>
            <MessageSquarePlus className="w-3.5 h-3.5 text-amber-400" />
          </div>
          <div className="text-base sm:text-2xl font-display font-bold text-amber-300 font-mono tabular-nums mt-1">
            {pendingDemandsCount} <span className="text-[10px] font-normal text-stone-400">pending</span>
          </div>
          <div className="text-[8px] sm:text-[10px] text-stone-500 mt-0.5">{demands.length} total client requests</div>
        </div>

        <div className="glass-panel rounded-xl sm:rounded-2xl p-2.5 sm:p-4 border border-amber-500/15 col-span-2 md:col-span-4 lg:col-span-1">
          <div className="flex items-center justify-between">
            <span className="text-[9px] sm:text-xs text-stone-400 font-semibold uppercase tracking-wider">Avg Rating</span>
            <Star className="w-3.5 h-3.5 text-amber-400 fill-amber-400" />
          </div>
          <div className="text-base sm:text-2xl font-display font-bold text-white font-mono tabular-nums mt-1">
            ★ {avgRating}
          </div>
          <div className="text-[8px] sm:text-[10px] text-stone-500 mt-0.5">Store satisfaction score</div>
        </div>
      </div>

      {/* Navigation Sub-Tabs */}
      <div className="flex items-center gap-1 sm:gap-2 border-b border-amber-500/15 pb-2 overflow-x-auto no-scrollbar">
        <button
          onClick={() => setActiveTab('apps')}
          className={`px-3 sm:px-4 py-1.5 sm:py-2 rounded-xl text-xs sm:text-sm font-bold flex items-center gap-1.5 transition-colors whitespace-nowrap ${
            activeTab === 'apps'
              ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
              : 'text-stone-400 hover:text-white hover:bg-stone-800/40'
          }`}
        >
          <Layers className="w-3.5 h-3.5" />
          <span>App Catalog ({apps.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('demands')}
          className={`px-3 sm:px-4 py-1.5 sm:py-2 rounded-xl text-xs sm:text-sm font-bold flex items-center gap-1.5 transition-colors whitespace-nowrap relative ${
            activeTab === 'demands'
              ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
              : 'text-stone-400 hover:text-white hover:bg-stone-800/40'
          }`}
        >
          <MessageSquarePlus className="w-3.5 h-3.5" />
          <span>Client Demands ({demands.length})</span>
          {pendingDemandsCount > 0 && (
            <span className="w-2 h-2 rounded-full bg-amber-400 animate-ping ml-0.5" />
          )}
        </button>

        <button
          onClick={() => setActiveTab('analytics')}
          className={`px-3 sm:px-4 py-1.5 sm:py-2 rounded-xl text-xs sm:text-sm font-bold flex items-center gap-1.5 transition-colors whitespace-nowrap ${
            activeTab === 'analytics'
              ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
              : 'text-stone-400 hover:text-white hover:bg-stone-800/40'
          }`}
        >
          <BarChart3 className="w-3.5 h-3.5" />
          <span>Store Analytics</span>
        </button>

        <button
          onClick={() => setActiveTab('backup')}
          className={`px-3 sm:px-4 py-1.5 sm:py-2 rounded-xl text-xs sm:text-sm font-bold flex items-center gap-1.5 transition-colors whitespace-nowrap ${
            activeTab === 'backup'
              ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
              : 'text-stone-400 hover:text-white hover:bg-stone-800/40'
          }`}
        >
          <Database className="w-3.5 h-3.5" />
          <span>Google Drive Cloud Sync</span>
        </button>
      </div>

      {/* ========================================================================= */}
      {/* TAB 1: APPS INVENTORY & MANAGEMENT */}
      {/* ========================================================================= */}
      {activeTab === 'apps' && (
        <div className="space-y-3 sm:space-y-4">
          
          {/* Controls: Search, Filters & Sorting */}
          <div className="glass-panel rounded-2xl p-3 sm:p-4 border border-amber-500/15 space-y-3">
            <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-2.5">
              
              {/* Search Bar */}
              <div className="relative flex-1">
                <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-stone-500" />
                <input
                  type="text"
                  placeholder="Search app name, package id, or developer..."
                  value={searchFilter}
                  onChange={(e) => setSearchFilter(e.target.value)}
                  className="w-full pl-8 pr-3 py-1.5 sm:py-2 rounded-xl bg-[#140e0b] border border-amber-500/20 text-white placeholder-stone-500 text-xs focus:outline-none focus:border-amber-400"
                />
              </div>

              {/* Status Filter */}
              <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar text-xs">
                {(['all', 'published', 'draft', 'featured'] as const).map(s => (
                  <button
                    key={s}
                    onClick={() => setStatusFilter(s)}
                    className={`px-2.5 py-1 rounded-lg capitalize whitespace-nowrap font-semibold text-[11px] transition-colors ${
                      statusFilter === s
                        ? 'bg-amber-500 text-black font-extrabold'
                        : 'bg-stone-800/50 text-stone-400 hover:text-stone-200'
                    }`}
                  >
                    {s}
                  </button>
                ))}
              </div>

              {/* Category Filter */}
              <select
                value={categoryFilter}
                onChange={(e) => setCategoryFilter(e.target.value)}
                className="bg-[#140e0b] text-stone-300 text-xs rounded-xl px-2.5 py-1.5 sm:py-2 border border-amber-500/20 focus:outline-none"
              >
                <option value="All">All Categories</option>
                {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
              </select>

              {/* Sort By */}
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as SortOption)}
                className="bg-[#140e0b] text-stone-300 text-xs rounded-xl px-2.5 py-1.5 sm:py-2 border border-amber-500/20 focus:outline-none"
              >
                <option value="newest">Sort: Newest</option>
                <option value="downloads-desc">Sort: Downloads (High-Low)</option>
                <option value="rating-desc">Sort: Highest Rating</option>
                <option value="name-asc">Sort: Name (A-Z)</option>
                <option value="size">Sort: File Size</option>
              </select>
            </div>

            {/* Bulk Action Bar (when any selected) */}
            {selectedAppIds.length > 0 && (
              <div className="p-2 sm:p-2.5 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-between text-xs animate-fade-in">
                <div className="flex items-center gap-2">
                  <span className="font-bold text-amber-300">
                    {selectedAppIds.length} apps selected
                  </span>
                </div>
                <div className="flex items-center gap-1.5">
                  <button
                    onClick={handleBulkPublish}
                    className="px-2.5 py-1 rounded-lg bg-emerald-950/60 text-emerald-300 border border-emerald-500/40 hover:bg-emerald-900/60 text-[11px] font-semibold"
                  >
                    Publish Selected
                  </button>
                  <button
                    onClick={handleBulkUnpublish}
                    className="px-2.5 py-1 rounded-lg bg-amber-950/60 text-amber-300 border border-amber-500/40 hover:bg-amber-900/60 text-[11px] font-semibold"
                  >
                    Draft Selected
                  </button>
                  <button
                    onClick={handleBulkDelete}
                    className="px-2.5 py-1 rounded-lg bg-red-950/60 text-red-300 border border-red-500/40 hover:bg-red-900/60 text-[11px] font-semibold"
                  >
                    Delete Selected
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Desktop Table View */}
          <div className="glass-panel rounded-2xl overflow-hidden border border-amber-500/20 hidden md:block">
            <table className="w-full text-left text-xs">
              <thead className="bg-[#140e0b] text-stone-400 border-b border-amber-500/15">
                <tr>
                  <th className="p-3 w-8">
                    <button onClick={handleToggleSelectAll} className="text-stone-400 hover:text-white">
                      {selectedAppIds.length === filteredApps.length && filteredApps.length > 0 ? (
                        <CheckSquare className="w-4 h-4 text-amber-400" />
                      ) : (
                        <Square className="w-4 h-4" />
                      )}
                    </button>
                  </th>
                  <th className="p-3">Application</th>
                  <th className="p-3">Category</th>
                  <th className="p-3">Version &amp; Size</th>
                  <th className="p-3">Downloads</th>
                  <th className="p-3">Rating</th>
                  <th className="p-3">Visibility</th>
                  <th className="p-3">Featured</th>
                  <th className="p-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-amber-500/10">
                {filteredApps.map((app) => (
                  <tr key={app.id} className="hover:bg-amber-500/5 transition-colors">
                    <td className="p-3">
                      <button onClick={() => handleToggleSelectOne(app.id)} className="text-stone-400 hover:text-white">
                        {selectedAppIds.includes(app.id) ? (
                          <CheckSquare className="w-4 h-4 text-amber-400" />
                        ) : (
                          <Square className="w-4 h-4" />
                        )}
                      </button>
                    </td>

                    <td className="p-3">
                      <div className="flex items-center gap-2.5">
                        <img 
                          src={resolveAppIcon(app.app_icon, app.app_name, app.category)} 
                          alt="" 
                          onError={(e) => handleImageFallback(e, app.app_name, app.category)}
                          className="w-8 h-8 rounded-lg object-cover bg-stone-900 border border-amber-500/20 shrink-0" 
                        />
                        <div className="min-w-0">
                          <button
                            onClick={() => onSelectApp(app)}
                            className="font-bold text-white hover:text-amber-300 text-left truncate block max-w-xs"
                          >
                            {app.app_name}
                          </button>
                          <div className="text-[10px] text-stone-400 font-mono truncate">{app.package_name}</div>
                        </div>
                      </div>
                    </td>

                    <td className="p-3">
                      <span className="px-2 py-0.5 rounded bg-stone-800 text-stone-300 text-[10px]">
                        {app.category}
                      </span>
                    </td>

                    <td className="p-3 font-mono text-stone-300">
                      <div>v{app.version}</div>
                      <div className="text-[10px] text-stone-500">{app.file_size}</div>
                    </td>

                    <td className="p-3 font-mono text-amber-400 font-bold">
                      {app.downloads_count.toLocaleString()}
                    </td>

                    <td className="p-3">
                      <div className="flex items-center gap-1 text-amber-400 font-bold">
                        <Star className="w-3 h-3 fill-amber-400" />
                        <span>{app.rating.toFixed(1)}</span>
                      </div>
                    </td>

                    <td className="p-3">
                      <button
                        onClick={() => handleTogglePublish(app)}
                        className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold border transition-all ${
                          app.is_published !== false
                            ? 'bg-emerald-950/50 text-emerald-300 border-emerald-500/40 hover:bg-emerald-900/60'
                            : 'bg-amber-950/50 text-amber-300 border-amber-500/40 hover:bg-amber-900/60'
                        }`}
                        title="Click to toggle Public / Draft status"
                      >
                        <span className={`w-1.5 h-1.5 rounded-full ${app.is_published !== false ? 'bg-emerald-400' : 'bg-amber-400'}`} />
                        <span>{app.is_published !== false ? 'Published (Live)' : 'Draft (Hidden)'}</span>
                      </button>
                    </td>

                    <td className="p-3">
                      <button
                        onClick={() => handleToggleFeatured(app)}
                        className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-lg text-[11px] transition-colors ${
                          app.featured
                            ? 'text-amber-400 font-bold bg-amber-500/10 border border-amber-500/30'
                            : 'text-stone-500 hover:text-stone-300'
                        }`}
                        title="Click to toggle Hero Featured"
                      >
                        <Star className={`w-3.5 h-3.5 ${app.featured ? 'fill-amber-400 text-amber-400' : ''}`} />
                        <span>{app.featured ? 'Featured' : 'Normal'}</span>
                      </button>
                    </td>

                    <td className="p-3 text-right">
                      <div className="flex items-center justify-end gap-1">
                        <button
                          onClick={() => handleOpenEdit(app)}
                          className="p-1.5 text-stone-400 hover:text-amber-300 rounded hover:bg-amber-500/10"
                          title="Edit Details"
                        >
                          <Edit className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => setDeletingAppId(app.id)}
                          className="p-1.5 text-stone-400 hover:text-red-400 rounded hover:bg-red-500/10"
                          title="Delete App"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Mobile Card List View */}
          <div className="grid grid-cols-1 gap-2 md:hidden">
            {filteredApps.map((app) => (
              <div 
                key={app.id} 
                className="glass-panel rounded-xl p-3 border border-amber-500/15 space-y-2.5"
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-2 min-w-0">
                    <img 
                      src={resolveAppIcon(app.app_icon, app.app_name, app.category)} 
                      alt="" 
                      onError={(e) => handleImageFallback(e, app.app_name, app.category)}
                      className="w-10 h-10 rounded-xl object-cover bg-stone-900 border border-amber-500/20 shrink-0" 
                    />
                    <div className="min-w-0">
                      <div className="font-bold text-white text-xs truncate">{app.app_name}</div>
                      <div className="text-[10px] text-stone-400 font-mono truncate">{app.package_name}</div>
                      <div className="flex items-center gap-2 text-[10px] text-stone-400 mt-0.5">
                        <span className="text-amber-400 font-bold">★ {app.rating.toFixed(1)}</span>
                        <span>·</span>
                        <span>{app.downloads_count} installs</span>
                      </div>
                    </div>
                  </div>

                  <span className="px-1.5 py-0.5 rounded bg-stone-800 text-stone-300 text-[9px] shrink-0">
                    {app.category}
                  </span>
                </div>

                <div className="flex items-center justify-between gap-2 pt-2 border-t border-amber-500/10 text-xs">
                  <div className="flex items-center gap-1.5">
                    <button
                      onClick={() => handleTogglePublish(app)}
                      className={`px-2 py-0.5 rounded text-[10px] font-bold border ${
                        app.is_published !== false
                          ? 'bg-emerald-950/40 text-emerald-300 border-emerald-500/30'
                          : 'bg-amber-950/40 text-amber-300 border-amber-500/30'
                      }`}
                    >
                      {app.is_published !== false ? 'Live' : 'Draft'}
                    </button>

                    <button
                      onClick={() => handleToggleFeatured(app)}
                      className={`px-2 py-0.5 rounded text-[10px] font-semibold border ${
                        app.featured
                          ? 'bg-amber-500/20 text-amber-300 border-amber-500/40'
                          : 'bg-stone-800 text-stone-400 border-stone-700'
                      }`}
                    >
                      ★ {app.featured ? 'Featured' : 'Hero'}
                    </button>
                  </div>

                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => handleOpenEdit(app)}
                      className="px-2 py-1 rounded bg-stone-800 text-stone-300 text-[10px] font-semibold hover:bg-stone-700"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => setDeletingAppId(app.id)}
                      className="px-2 py-1 rounded bg-red-950/40 text-red-300 border border-red-500/30 text-[10px] font-semibold"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>

        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 2: CLIENT DEMANDS MANAGEMENT */}
      {/* ========================================================================= */}
      {activeTab === 'demands' && (
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div>
              <h2 className="text-sm sm:text-base font-bold text-white flex items-center gap-2">
                <MessageSquarePlus className="w-4 h-4 text-amber-400" />
                <span>Client Bespoke App Demands ({demands.length})</span>
              </h2>
              <p className="text-[11px] text-stone-400">
                Fulfill user requests ("We are building app on your demand"), update status, or convert into a store app.
              </p>
            </div>

            <div className="flex items-center gap-2">
              <select
                value={demandStatusFilter}
                onChange={(e) => setDemandStatusFilter(e.target.value)}
                className="bg-[#140e0b] text-stone-300 text-xs rounded-xl px-2.5 py-1.5 border border-amber-500/20 focus:outline-none"
              >
                <option value="All">All Statuses</option>
                <option value="Pending">Pending</option>
                <option value="In Review">In Review</option>
                <option value="Approved">Approved</option>
                <option value="In Development">In Development</option>
                <option value="Completed">Completed</option>
                <option value="Rejected">Rejected</option>
              </select>
            </div>
          </div>

          <div className="space-y-3">
            {filteredDemands.map((demand) => (
              <div
                key={demand.id}
                className="glass-panel rounded-2xl p-3.5 sm:p-5 border border-amber-500/20 space-y-3"
              >
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-2">
                  <div className="space-y-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="font-bold text-white text-sm sm:text-base">{demand.appTitle}</span>
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30">
                        {demand.platform}
                      </span>
                      <span className="px-2 py-0.5 rounded text-[10px] bg-stone-800 text-stone-300">
                        {demand.category}
                      </span>
                      <span className="text-[10px] text-stone-400 font-mono">
                        {new Date(demand.submittedAt).toLocaleDateString()}
                      </span>
                    </div>

                    <div className="text-xs text-stone-300 flex flex-wrap items-center gap-2">
                      <span>Client: <strong className="text-white">{demand.userName}</strong></span>
                      <span>·</span>
                      <a href={`mailto:${demand.email}`} className="text-amber-400 hover:underline">{demand.email}</a>
                      {demand.contactHandle && (
                        <>
                          <span>·</span>
                          <span className="text-stone-400">{demand.contactMethod}: <span className="text-stone-200">{demand.contactHandle}</span></span>
                        </>
                      )}
                      {demand.budget && (
                        <>
                          <span>·</span>
                          <span className="text-emerald-400 font-mono font-semibold">Budget: {demand.budget}</span>
                        </>
                      )}
                    </div>
                  </div>

                  {/* Status select */}
                  <div className="flex items-center gap-2">
                    <select
                      value={demand.status}
                      onChange={(e) => onUpdateDemandStatus(demand.id, e.target.value as any)}
                      className="bg-[#140e0b] text-xs font-semibold text-amber-300 rounded-xl px-2.5 py-1.5 border border-amber-500/30 focus:outline-none"
                    >
                      <option value="Pending">⏳ Pending</option>
                      <option value="In Review">🔍 In Review</option>
                      <option value="Approved">✅ Approved</option>
                      <option value="In Development">⚙️ In Development</option>
                      <option value="Completed">🎉 Completed</option>
                      <option value="Rejected">❌ Rejected</option>
                    </select>
                  </div>
                </div>

                {/* Requirements Text */}
                <div className="bg-[#100b08]/80 rounded-xl p-3 border border-amber-500/10 text-xs text-stone-200 leading-relaxed">
                  <div className="text-[10px] text-stone-400 uppercase font-semibold mb-1">Requirements &amp; Feature Workflow:</div>
                  <p>{demand.requirements}</p>
                </div>

                {/* Action Bar */}
                <div className="flex flex-wrap items-center justify-between gap-2 pt-1 border-t border-amber-500/10 text-xs">
                  <div className="flex items-center gap-2">
                    {/* Convert Demand to Live App */}
                    <button
                      onClick={() => handleConvertDemandToApp(demand)}
                      className="px-3 py-1.5 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-black font-extrabold text-xs flex items-center gap-1.5 shadow-sm transition-all"
                    >
                      <Sparkles className="w-3.5 h-3.5" />
                      <span>Convert Demand to App</span>
                    </button>
                  </div>

                  <div className="flex items-center gap-2">
                    {demand.contactMethod === 'WhatsApp' && demand.contactHandle ? (
                      <a
                        href={`https://wa.me/${demand.contactHandle.replace(/[^0-9]/g, '')}`}
                        target="_blank"
                        rel="noreferrer"
                        className="px-3 py-1.5 rounded-xl bg-emerald-950/40 text-emerald-300 border border-emerald-500/30 hover:bg-emerald-900/60 font-semibold"
                      >
                        WhatsApp Client
                      </a>
                    ) : demand.contactMethod === 'Telegram' && demand.contactHandle ? (
                      <a
                        href={`https://t.me/${demand.contactHandle.replace('@', '')}`}
                        target="_blank"
                        rel="noreferrer"
                        className="px-3 py-1.5 rounded-xl bg-sky-950/40 text-sky-300 border border-sky-500/30 hover:bg-sky-900/60 font-semibold"
                      >
                        Telegram Client
                      </a>
                    ) : (
                      <a
                        href={`mailto:${demand.email}?subject=Regarding%20your%20app%20demand:%20${encodeURIComponent(demand.appTitle)}`}
                        className="px-3 py-1.5 rounded-xl bg-stone-800 text-stone-200 hover:bg-stone-700 font-semibold"
                      >
                        Email Client
                      </a>
                    )}

                    <button
                      onClick={() => setDeletingDemandId(demand.id)}
                      className="px-3 py-1.5 rounded-xl bg-red-950/40 text-red-300 border border-red-500/30 hover:bg-red-900/60 font-semibold"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              </div>
            ))}

            {filteredDemands.length === 0 && (
              <div className="glass-panel rounded-2xl p-8 text-center text-stone-400 text-xs">
                No client app requests match the selected status filter.
              </div>
            )}
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 3: STORE ANALYTICS & METRICS */}
      {/* ========================================================================= */}
      {activeTab === 'analytics' && (
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            
            {/* Category Breakdown */}
            <div className="glass-panel rounded-2xl p-4 sm:p-5 border border-amber-500/20 space-y-3">
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <BarChart3 className="w-4 h-4 text-amber-400" />
                <span>Catalog Distribution by Category</span>
              </h3>
              <div className="space-y-2">
                {CATEGORIES.map(cat => {
                  const count = apps.filter(a => a.category === cat).length;
                  const pct = apps.length > 0 ? (count / apps.length) * 100 : 0;
                  return (
                    <div key={cat} className="space-y-1">
                      <div className="flex items-center justify-between text-xs">
                        <span className="text-stone-300">{cat}</span>
                        <span className="text-amber-400 font-mono font-bold">{count} apps ({pct.toFixed(0)}%)</span>
                      </div>
                      <div className="w-full h-1.5 rounded-full bg-stone-900 overflow-hidden">
                        <div 
                          className="h-full bg-gradient-to-r from-amber-500 to-amber-400 rounded-full"
                          style={{ width: `${pct}%` }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Top Downloaded Apps Leaderboard */}
            <div className="glass-panel rounded-2xl p-4 sm:p-5 border border-amber-500/20 space-y-3">
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <Download className="w-4 h-4 text-amber-400" />
                <span>Top Downloaded Applications</span>
              </h3>
              <div className="space-y-2.5">
                {[...apps].sort((a, b) => b.downloads_count - a.downloads_count).slice(0, 5).map((app, idx) => (
                  <div key={app.id} className="flex items-center justify-between p-2 rounded-xl bg-[#140e0b] border border-amber-500/10 text-xs">
                    <div className="flex items-center gap-2">
                      <span className="w-5 h-5 rounded-full bg-amber-500/20 text-amber-300 font-mono font-bold text-[10px] flex items-center justify-center">
                        #{idx + 1}
                      </span>
                      <div>
                        <div className="font-bold text-white">{app.app_name}</div>
                        <div className="text-[10px] text-stone-500">{app.category} · v{app.version}</div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="font-mono font-bold text-amber-400">{app.downloads_count.toLocaleString()}</div>
                      <div className="text-[9px] text-stone-500">installs</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 4: GOOGLE DRIVE CLOUD PERSISTENCE HUB */}
      {/* ========================================================================= */}
      {activeTab === 'backup' && (
        <div className="space-y-4">
          <div className="glass-panel rounded-2xl sm:rounded-3xl p-4 sm:p-6 border border-emerald-500/20 bg-emerald-950/10 space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
                <Cloud className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-bold text-white">Google Drive Persistence Architecture</h3>
                <p className="text-xs text-stone-300">Continuous cloud sync and zero-data-loss protection mechanism.</p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs">
              <div className="p-3 rounded-xl bg-[#140e0b] border border-emerald-500/20 space-y-1">
                <div className="text-stone-400 font-semibold">1. Startup Restore</div>
                <div className="text-emerald-300 font-bold">Auto-Restores from Drive</div>
                <p className="text-[11px] text-stone-300">
                  When GitHub Actions begins, <code className="text-amber-300">rclone copyto</code> immediately downloads <code className="text-amber-300">db.sqlite3</code> and media assets.
                </p>
              </div>

              <div className="p-3 rounded-xl bg-[#140e0b] border border-emerald-500/20 space-y-1">
                <div className="text-stone-400 font-semibold">2. Live Background Daemon</div>
                <div className="text-emerald-300 font-bold">5-Minute Periodic Push</div>
                <p className="text-[11px] text-stone-300">
                  A background daemon executes SQLite checkpoint flush and syncs modified database tables to <code className="text-amber-300">gdrive:AppStoreBackup/</code>.
                </p>
              </div>

              <div className="p-3 rounded-xl bg-[#140e0b] border border-emerald-500/20 space-y-1">
                <div className="text-stone-400 font-semibold">3. Shutdown Hook</div>
                <div className="text-emerald-300 font-bold">WAL TRUNCATE &amp; Push</div>
                <p className="text-[11px] text-stone-300">
                  When workflow is cancelled or completed, <code className="text-amber-300">if: always()</code> commits all transactions and writes a timestamped snapshot backup.
                </p>
              </div>
            </div>

            <div className="flex items-center justify-between pt-2 border-t border-emerald-500/20">
              <div className="text-xs text-stone-400 font-mono">
                Remote Storage Path: <span className="text-amber-300">gdrive:AppStoreBackup/</span>
              </div>
              <button
                onClick={handleExportCatalog}
                className="px-4 py-2 rounded-xl bg-emerald-500 text-black font-extrabold text-xs flex items-center gap-1.5 shadow-md"
              >
                <Download className="w-3.5 h-3.5 stroke-[2.5]" />
                <span>Export Local JSON Snapshot</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* PUBLISH / EDIT MODAL */}
      {/* ========================================================================= */}
      {isUploadModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-md overflow-y-auto">
          <div className="glass-panel w-full max-w-2xl rounded-2xl sm:rounded-3xl p-4 sm:p-6 border border-amber-500/30 my-8 shadow-2xl space-y-4">
            
            <div className="flex items-center justify-between border-b border-amber-500/15 pb-3">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-amber-500/20 flex items-center justify-center text-amber-400 font-bold">
                  {editingApp ? <Edit className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
                </div>
                <div>
                  <h3 className="text-base font-bold text-white">
                    {editingApp ? `Edit Application: ${editingApp.app_name}` : 'Publish New Mobile Application'}
                  </h3>
                  <p className="text-[11px] text-stone-400">Configure APK metadata, package parameters, and release visibility.</p>
                </div>
              </div>
              <button
                onClick={() => setIsUploadModalOpen(false)}
                className="p-1 rounded-lg text-stone-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmitForm} className="space-y-3.5 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-stone-300 font-semibold mb-1">App Name</label>
                  <input
                    type="text"
                    required
                    value={formData.app_name}
                    onChange={(e) => setFormData({ ...formData, app_name: e.target.value })}
                    placeholder="e.g. Apex Optimizer Pro"
                    className="w-full px-3 py-2 rounded-xl bg-[#140e0b] border border-amber-500/20 text-white focus:outline-none focus:border-amber-400"
                  />
                </div>

                <div>
                  <label className="block text-stone-300 font-semibold mb-1">Package Name (Slug)</label>
                  <input
                    type="text"
                    value={formData.package_name}
                    onChange={(e) => setFormData({ ...formData, package_name: e.target.value })}
                    placeholder="e.g. com.hadi88.apexoptimizer"
                    className="w-full px-3 py-2 rounded-xl bg-[#140e0b] border border-amber-500/20 text-white font-mono focus:outline-none focus:border-amber-400"
                  />
                </div>

                <div>
                  <label className="block text-stone-300 font-semibold mb-1">Developer / Studio Name</label>
                  <input
                    type="text"
                    required
                    value={formData.developer_name}
                    onChange={(e) => setFormData({ ...formData, developer_name: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl bg-[#140e0b] border border-amber-500/20 text-white focus:outline-none focus:border-amber-400"
                  />
                </div>

                <div>
                  <label className="block text-stone-300 font-semibold mb-1">Category</label>
                  <select
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value as AppCategory })}
                    className="w-full px-3 py-2 rounded-xl bg-[#140e0b] border border-amber-500/20 text-white focus:outline-none focus:border-amber-400"
                  >
                    {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>

                <div>
                  <label className="block text-stone-300 font-semibold mb-1">Version Number</label>
                  <input
                    type="text"
                    value={formData.version}
                    onChange={(e) => setFormData({ ...formData, version: e.target.value })}
                    placeholder="1.0.0"
                    className="w-full px-3 py-2 rounded-xl bg-[#140e0b] border border-amber-500/20 text-white font-mono focus:outline-none focus:border-amber-400"
                  />
                </div>

                <div>
                  <label className="block text-stone-300 font-semibold mb-1">File Size</label>
                  <input
                    type="text"
                    value={formData.file_size}
                    onChange={(e) => setFormData({ ...formData, file_size: e.target.value })}
                    placeholder="35 MB"
                    className="w-full px-3 py-2 rounded-xl bg-[#140e0b] border border-amber-500/20 text-white focus:outline-none focus:border-amber-400"
                  />
                </div>

                <div>
                  <label className="block text-stone-300 font-semibold mb-1">Rating (1.0 - 5.0)</label>
                  <input
                    type="number"
                    step="0.1"
                    min="1.0"
                    max="5.0"
                    value={formData.rating}
                    onChange={(e) => setFormData({ ...formData, rating: parseFloat(e.target.value) || 4.5 })}
                    className="w-full px-3 py-2 rounded-xl bg-[#140e0b] border border-amber-500/20 text-white font-mono focus:outline-none focus:border-amber-400"
                  />
                </div>

                <div>
                  <label className="block text-stone-300 font-semibold mb-1">APK Binary Filename</label>
                  <input
                    type="text"
                    value={formData.apk_file}
                    onChange={(e) => setFormData({ ...formData, apk_file: e.target.value })}
                    placeholder="app-release.apk"
                    className="w-full px-3 py-2 rounded-xl bg-[#140e0b] border border-amber-500/20 text-white font-mono focus:outline-none focus:border-amber-400"
                  />
                </div>
              </div>

              <div>
                <label className="block text-stone-300 font-semibold mb-1">App Icon Image URL</label>
                <input
                  type="url"
                  value={formData.app_icon}
                  onChange={(e) => setFormData({ ...formData, app_icon: e.target.value })}
                  placeholder="https://images.unsplash.com/..."
                  className="w-full px-3 py-2 rounded-xl bg-[#140e0b] border border-amber-500/20 text-white focus:outline-none focus:border-amber-400"
                />
              </div>

              <div>
                <label className="block text-stone-300 font-semibold mb-1">Application Description</label>
                <textarea
                  rows={3}
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Detailed feature description..."
                  className="w-full px-3 py-2 rounded-xl bg-[#140e0b] border border-amber-500/20 text-white focus:outline-none focus:border-amber-400"
                />
              </div>

              <div>
                <label className="block text-stone-300 font-semibold mb-1">What's New / Changelog</label>
                <input
                  type="text"
                  value={formData.whats_new}
                  onChange={(e) => setFormData({ ...formData, whats_new: e.target.value })}
                  placeholder="Highlights in this build..."
                  className="w-full px-3 py-2 rounded-xl bg-[#140e0b] border border-amber-500/20 text-white focus:outline-none focus:border-amber-400"
                />
              </div>

              {/* Toggles */}
              <div className="flex flex-wrap items-center gap-4 p-3 rounded-xl bg-[#140e0b] border border-amber-500/15">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.is_published}
                    onChange={(e) => setFormData({ ...formData, is_published: e.target.checked })}
                    className="rounded text-amber-500 focus:ring-0"
                  />
                  <span className="font-semibold text-stone-200">Publicly Published (Visible on store)</span>
                </label>

                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.featured}
                    onChange={(e) => setFormData({ ...formData, featured: e.target.checked })}
                    className="rounded text-amber-500 focus:ring-0"
                  />
                  <span className="font-semibold text-stone-200">Showcase in Hero Carousel</span>
                </label>
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsUploadModalOpen(false)}
                  className="px-4 py-2 rounded-xl glass-panel text-stone-300 hover:text-white font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-2 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-black font-extrabold shadow-md"
                >
                  {editingApp ? 'Save Changes' : 'Publish Application'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal for Apps */}
      {deletingAppId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="glass-panel w-full max-w-sm rounded-2xl p-5 border border-red-500/30 text-center space-y-3">
            <div className="w-12 h-12 rounded-full bg-red-500/20 text-red-400 flex items-center justify-center mx-auto">
              <AlertTriangle className="w-6 h-6" />
            </div>
            <h4 className="text-base font-bold text-white">Delete Application?</h4>
            <p className="text-xs text-stone-300">
              This action will remove the application and its APK from the store.
            </p>
            <div className="flex items-center justify-center gap-2 pt-2">
              <button
                onClick={() => setDeletingAppId(null)}
                className="px-4 py-2 rounded-xl glass-panel text-stone-300 text-xs font-semibold"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  onDeleteApp(deletingAppId);
                  setDeletingAppId(null);
                }}
                className="px-4 py-2 rounded-xl bg-red-600 hover:bg-red-500 text-white text-xs font-bold"
              >
                Confirm Delete
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal for Demands */}
      {deletingDemandId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="glass-panel w-full max-w-sm rounded-2xl p-5 border border-red-500/30 text-center space-y-3">
            <div className="w-12 h-12 rounded-full bg-red-500/20 text-red-400 flex items-center justify-center mx-auto">
              <AlertTriangle className="w-6 h-6" />
            </div>
            <h4 className="text-base font-bold text-white">Delete Client Demand?</h4>
            <p className="text-xs text-stone-300">
              Are you sure you want to remove this client app demand?
            </p>
            <div className="flex items-center justify-center gap-2 pt-2">
              <button
                onClick={() => setDeletingDemandId(null)}
                className="px-4 py-2 rounded-xl glass-panel text-stone-300 text-xs font-semibold"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  onDeleteDemand(deletingDemandId);
                  setDeletingDemandId(null);
                }}
                className="px-4 py-2 rounded-xl bg-red-600 hover:bg-red-500 text-white text-xs font-bold"
              >
                Confirm Delete
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
