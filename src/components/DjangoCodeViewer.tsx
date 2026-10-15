import React, { useState } from 'react';
import { DJANGO_FILES } from '../data/djangoCodebase';
import { DjangoFile } from '../types/app';
import { 
  Copy, Check, Download, FileCode, FolderArchive, 
  Terminal, ChevronRight, CheckCircle2 
} from 'lucide-react';
import JSZip from 'jszip';

export const DjangoCodeViewer: React.FC = () => {
  const [selectedFile, setSelectedFile] = useState<DjangoFile>(DJANGO_FILES[0]);
  const [copied, setCopied] = useState(false);
  const [isZipping, setIsZipping] = useState(false);
  const [zipSuccess, setZipSuccess] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(selectedFile.content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownloadZip = async () => {
    if (isZipping) return;
    setIsZipping(true);

    try {
      const zip = new JSZip();

      // Project structure
      DJANGO_FILES.forEach((file) => {
        zip.file(file.path, file.content);
      });

      // Add a standard manage.py
      zip.file(
        'manage.py',
        `#!/usr/bin/env python
"""Django's command-line utility for administrative tasks."""
import os
import sys

def main():
    os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'appstore_project.settings')
    try:
        from django.core.management import execute_from_command_line
    except ImportError as exc:
        raise ImportError(
            "Couldn't import Django. Are you sure it's installed and "
            "available on your PYTHONPATH environment variable?"
        ) from exc
    execute_from_command_line(sys.argv)

if __name__ == '__main__':
    main()
`
      );

      // Add wsgi.py and asgi.py
      zip.file(
        'appstore_project/wsgi.py',
        `import os
from django.core.wsgi import get_wsgi_application
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'appstore_project.settings')
application = get_wsgi_application()
`
      );

      zip.file(
        'appstore_project/urls.py',
        `from django.contrib import admin
from django.urls import path, include

urlpatterns = [
    path('admin/', admin.site.urls),
    path('', include('store.urls')),
]
`
      );

      zip.file('store/__init__.py', '');
      zip.file(
        'store/apps.py',
        `from django.apps import AppConfig
class StoreConfig(AppConfig):
    default_auto_field = 'django.db.models.BigAutoField'
    name = 'store'
`
      );

      const content = await zip.generateAsync({ type: 'blob' });
      const a = document.createElement('a');
      a.href = URL.createObjectURL(content);
      a.download = 'hadi88_appstore_django.zip';
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);

      setZipSuccess(true);
      setTimeout(() => setZipSuccess(false), 3000);
    } catch (err) {
      console.error('Failed to create zip:', err);
    } finally {
      setIsZipping(false);
    }
  };

  return (
    <div className="space-y-4 sm:space-y-8 animate-fade-in">
      
      {/* Header Banner */}
      <div className="glass-panel rounded-2xl sm:rounded-3xl p-3.5 sm:p-7 border border-amber-500/20 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-1.5 text-[10px] sm:text-xs font-bold text-amber-400 uppercase tracking-wider">
            <FolderArchive className="w-3.5 h-3.5" />
            <span>Python / Django Production Codebase</span>
          </div>
          <h1 className="text-lg sm:text-2xl font-display font-extrabold text-white mt-0.5">
            Hadi88 Apps Django Architecture
          </h1>
          <p className="text-[10px] sm:text-xs text-stone-300 mt-0.5">
            Step-by-step models, views (18-item pagination), live search, templates, and full project .zip.
          </p>
        </div>

        <button
          onClick={handleDownloadZip}
          disabled={isZipping}
          className={`w-full sm:w-auto px-4 sm:px-6 py-2 sm:py-3 rounded-xl font-bold text-xs flex items-center justify-center gap-1.5 shadow-md transition-all shrink-0 ${
            zipSuccess
              ? 'bg-emerald-500 text-black shadow-emerald-500/30'
              : 'bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-black shadow-amber-500/25'
          }`}
        >
          {zipSuccess ? (
            <>
              <CheckCircle2 className="w-3.5 h-3.5 stroke-[2.5]" />
              <span>Project Zip Downloaded!</span>
            </>
          ) : (
            <>
              <Download className="w-3.5 h-3.5" />
              <span>{isZipping ? 'Packaging...' : 'Download Project (.zip)'}</span>
            </>
          )}
        </button>
      </div>

      {/* Quickstart commands (compact on mobile) */}
      <div className="glass-panel rounded-xl sm:rounded-2xl p-3 sm:p-4 border border-amber-500/15">
        <div className="flex items-center gap-1.5 text-[10px] sm:text-xs font-bold text-amber-400 mb-1.5">
          <Terminal className="w-3.5 h-3.5" />
          <span>Quickstart Execution Commands</span>
        </div>
        <div className="bg-[#120e0b] rounded-lg sm:rounded-xl p-2.5 sm:p-3 font-mono text-[10px] sm:text-xs text-stone-300 overflow-x-auto space-y-0.5 border border-amber-500/10">
          <div><span className="text-amber-400">$</span> python -m venv venv && source venv/bin/activate</div>
          <div><span className="text-amber-400">$</span> pip install django django-crispy-forms pillow</div>
          <div><span className="text-amber-400">$</span> python manage.py migrate && python manage.py runserver</div>
        </div>
      </div>

      {/* Mobile File Selector Dropdown (sm:hidden) so mobile users immediately see the code */}
      <div className="sm:hidden glass-panel rounded-xl p-2.5 border border-amber-500/15 space-y-1.5">
        <label className="text-[10px] font-bold text-stone-400 uppercase tracking-wider block">
          Select Django Source File:
        </label>
        <select
          value={selectedFile.name}
          onChange={(e) => {
            const found = DJANGO_FILES.find(f => f.name === e.target.value);
            if (found) setSelectedFile(found);
          }}
          className="w-full bg-[#18120e] text-xs font-mono text-amber-300 rounded-lg px-2.5 py-2 border border-amber-500/25 focus:outline-none"
        >
          {DJANGO_FILES.map(f => (
            <option key={f.name} value={f.name}>{f.name} ({f.path})</option>
          ))}
        </select>
      </div>

      {/* Code Browser Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 sm:gap-6 items-start">
        
        {/* Left: File Tree Directory (hidden on very small screens since dropdown is active, visible on lg) */}
        <div className="hidden sm:block lg:col-span-4 glass-panel rounded-2xl p-3 sm:p-4 border border-amber-500/15 space-y-2">
          <div className="px-2 py-1 text-[11px] font-bold text-stone-400 uppercase tracking-wider">
            Project Files ({DJANGO_FILES.length})
          </div>

          <div className="space-y-1">
            {DJANGO_FILES.map((file) => {
              const isSelected = selectedFile.name === file.name;
              return (
                <button
                  key={file.path}
                  onClick={() => setSelectedFile(file)}
                  className={`w-full text-left p-2 rounded-xl transition-all flex items-center justify-between text-xs ${
                    isSelected
                      ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30 font-semibold'
                      : 'hover:bg-amber-500/10 text-stone-300'
                  }`}
                >
                  <div className="flex items-center gap-2 truncate">
                    <FileCode className={`w-3.5 h-3.5 shrink-0 ${isSelected ? 'text-amber-400' : 'text-stone-500'}`} />
                    <div className="truncate">
                      <div className="font-mono text-white text-xs">{file.name}</div>
                      <div className="text-[10px] text-stone-400 truncate">{file.path}</div>
                    </div>
                  </div>
                  <ChevronRight className={`w-3 h-3 shrink-0 ${isSelected ? 'text-amber-400' : 'text-stone-600'}`} />
                </button>
              );
            })}
          </div>
        </div>

        {/* Right: Code Viewer */}
        <div className="lg:col-span-8 glass-panel rounded-2xl sm:rounded-3xl overflow-hidden border border-amber-500/20 shadow-xl">
          
          {/* Header of code block */}
          <div className="bg-[#120e0b] px-3.5 sm:px-5 py-2.5 sm:py-3.5 border-b border-amber-500/15 flex items-center justify-between gap-2">
            <div className="min-w-0">
              <div className="font-mono text-[11px] sm:text-xs font-bold text-amber-300 flex items-center gap-1.5">
                <span className="truncate">{selectedFile.path}</span>
                <span className="text-[9px] text-stone-500 uppercase px-1 py-0.2 rounded bg-stone-900 border border-stone-800 shrink-0">
                  {selectedFile.language}
                </span>
              </div>
              <div className="text-[10px] sm:text-xs text-stone-400 truncate mt-0.5">
                {selectedFile.description}
              </div>
            </div>

            <button
              onClick={handleCopy}
              className="px-2.5 py-1 rounded-lg glass-panel text-[11px] font-semibold text-stone-300 hover:text-amber-400 flex items-center gap-1 transition-colors shrink-0"
            >
              {copied ? (
                <>
                  <Check className="w-3 h-3 text-emerald-400" />
                  <span>Copied</span>
                </>
              ) : (
                <>
                  <Copy className="w-3 h-3" />
                  <span>Copy</span>
                </>
              )}
            </button>
          </div>

          {/* Syntax block with scroll */}
          <div className="p-3 sm:p-5 bg-[#0a0705] overflow-x-auto max-h-[500px] font-mono text-[10px] sm:text-xs leading-relaxed text-stone-200">
            <pre>
              <code>{selectedFile.content}</code>
            </pre>
          </div>

        </div>

      </div>

    </div>
  );
};
