import React, { useState, useRef } from 'react';

interface SettingsProps {
  onExport: () => string;
  onImport: (data: string) => boolean;
}

const Settings: React.FC<SettingsProps> = ({ onExport, onImport }) => {
  const [importString, setImportString] = useState('');
  const [copySuccess, setCopySuccess] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleExportText = () => {
    const data = onExport();
    navigator.clipboard.writeText(data);
    setCopySuccess(true);
    setTimeout(() => setCopySuccess(false), 2000);
  };

  const handleDownloadFile = () => {
    try {
      const base64Data = onExport();
      const jsonStr = decodeURIComponent(escape(atob(base64Data)));
      const blob = new Blob([jsonStr], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      const date = new Date().toISOString().split('T')[0];
      link.href = url;
      link.download = `FluffyMoko_Backup_${date}.json`;
      link.click();
      URL.revokeObjectURL(url);
    } catch (e) {
      alert('檔案產出失敗，請嘗試使用代碼複製功能。');
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const content = event.target?.result as string;
        // 驗證是否為有效的 JSON
        JSON.parse(content);
        // 轉回 base64 以適配現有的 onImport 邏輯
        const base64 = btoa(unescape(encodeURIComponent(content)));
        executeImport(base64);
      } catch (err) {
        alert('檔案格式錯誤，請確保上傳的是系統產出的 .json 備份檔。');
      }
    };
    reader.readAsText(file);
  };

  const handleImportText = () => {
    if (!importString.trim()) {
      alert('請先貼上匯入代碼');
      return;
    }
    executeImport(importString);
  };

  const executeImport = (data: string) => {
    if (confirm('⚠️ 警告：匯入操作將會「完全覆蓋」目前設備上的所有資料，確定要繼續嗎？')) {
      const success = onImport(data);
      if (success) {
        alert('✅ 資料匯入成功！系統將自動重新整理以載入新數據。');
        window.location.reload();
      } else {
        alert('❌ 匯入失敗：資料格式不正確，請確保代碼或檔案完整無誤。');
      }
    }
  };

  return (
    <div className="animate-fadeIn max-w-5xl mx-auto text-left pb-20">
      <header className="mb-12">
        <div className="flex items-center gap-4 mb-2">
          <div className="bg-indigo-600 w-3 h-10 rounded-full"></div>
          <h2 className="text-4xl font-black text-slate-900 tracking-tighter uppercase italic">System Settings</h2>
        </div>
        <p className="text-slate-500 font-bold ml-7">跨裝置同步、數據備份與旅館核心設定。</p>
      </header>

      <div className="grid grid-cols-1 gap-10">
        {/* Method 1: File Sync (Recommended) */}
        <section className="bg-white rounded-[3.5rem] p-12 border-2 border-slate-100 shadow-xl relative overflow-hidden group">
          <div className="relative z-10">
            <div className="flex items-center justify-between mb-8">
              <div>
                <h3 className="text-2xl font-black text-slate-800 flex items-center gap-3">
                  <span className="bg-emerald-100 p-2 rounded-2xl text-xl">📁</span> 專業檔案同步 (推薦)
                </h3>
                <p className="text-sm text-slate-400 mt-2 font-bold">最安全穩定，適合電腦與電腦、或大批量資料轉移。</p>
              </div>
              <div className="bg-emerald-50 text-emerald-600 px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest">Stable Release</div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="bg-slate-50 p-8 rounded-[2.5rem] border border-slate-100 flex flex-col justify-between">
                <div>
                  <h4 className="text-[11px] font-black text-slate-400 uppercase tracking-widest mb-2">下載備份</h4>
                  <p className="text-xs text-slate-500 leading-relaxed mb-6">將旅館所有資料打包成一個 .json 檔案，您可以將此檔案存放在雲端硬碟或隨身碟中。</p>
                </div>
                <button 
                  onClick={handleDownloadFile}
                  className="w-full py-5 bg-slate-900 text-white rounded-2xl font-black text-xs uppercase tracking-widest shadow-xl hover:bg-black transition-all flex items-center justify-center gap-3"
                >
                  📥 下載完整數據檔案
                </button>
              </div>

              <div className="bg-slate-50 p-8 rounded-[2.5rem] border border-slate-100 flex flex-col justify-between">
                <div>
                  <h4 className="text-[11px] font-black text-slate-400 uppercase tracking-widest mb-2">檔案還原</h4>
                  <p className="text-xs text-slate-500 leading-relaxed mb-6">在新的裝置上選擇您下載的備份檔案，系統會立即還原所有毛孩與預約紀錄。</p>
                </div>
                <input 
                  type="file" 
                  ref={fileInputRef} 
                  onChange={handleFileUpload} 
                  accept=".json" 
                  className="hidden" 
                />
                <button 
                  onClick={() => fileInputRef.current?.click()}
                  className="w-full py-5 bg-white border-2 border-emerald-500 text-emerald-600 rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-emerald-50 transition-all flex items-center justify-center gap-3"
                >
                  📤 上傳檔案進行還原
                </button>
              </div>
            </div>
          </div>
          <div className="absolute top-0 right-0 w-48 h-48 bg-emerald-50/30 rounded-bl-[120px] -z-0"></div>
        </section>

        {/* Method 2: Code Sync (Quick) */}
        <section className="bg-white rounded-[3.5rem] p-12 border-2 border-slate-100 shadow-xl relative overflow-hidden">
          <div className="relative z-10">
            <h3 className="text-2xl font-black text-slate-800 mb-8 flex items-center gap-3">
              <span className="bg-indigo-100 p-2 rounded-2xl text-xl">⚡</span> 快速代碼轉移
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="space-y-4">
                <div className="bg-indigo-50/50 p-8 rounded-[2.5rem] border border-indigo-100">
                  <h4 className="text-[11px] font-black text-indigo-600 uppercase tracking-widest mb-2">第一步：複製代碼</h4>
                  <p className="text-xs text-slate-500 mb-6">點擊下方按鈕，系統會將所有資料轉換成一串長代碼並自動複製到您的剪貼簿。</p>
                  <button 
                    onClick={handleExportText}
                    className="w-full py-4 bg-indigo-600 text-white rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-indigo-500 transition-all shadow-lg flex items-center justify-center gap-2"
                  >
                    {copySuccess ? '✅ 已複製成功' : '📋 複製數據代碼'}
                  </button>
                </div>
              </div>

              <div className="space-y-4">
                <div className="bg-slate-50 p-8 rounded-[2.5rem] border border-slate-200">
                  <h4 className="text-[11px] font-black text-slate-400 uppercase tracking-widest mb-2">第二步：貼上代碼</h4>
                  <p className="text-xs text-slate-500 mb-4">在另一台設備上，將複製的代碼貼在下方輸入框內並執行匯入。</p>
                  <textarea 
                    value={importString}
                    onChange={(e) => setImportString(e.target.value)}
                    placeholder="在此貼上代碼..."
                    className="w-full p-5 bg-white border-2 border-slate-100 rounded-2xl text-[10px] font-mono h-24 outline-none focus:border-indigo-600 transition-all mb-4"
                  />
                  <button 
                    onClick={handleImportText}
                    className="w-full py-4 bg-slate-900 text-white rounded-2xl font-black text-xs uppercase tracking-widest shadow-xl hover:bg-black transition-all"
                  >
                    🚀 執行代碼匯入
                  </button>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Pro Tip Section */}
        <section className="bg-indigo-600 text-white p-12 rounded-[3.5rem] shadow-2xl flex flex-col md:flex-row items-center gap-10">
          <div className="text-7xl animate-pulse">☁️</div>
          <div className="text-left">
            <h3 className="text-2xl font-black mb-3">想要更自動的跨裝置同步？</h3>
            <p className="text-indigo-100 font-bold opacity-80 leading-relaxed">
              手動同步雖好，但若您需要在手機、平板與櫃檯電腦間「零時差」看到最新資訊，升級雲端版是您的最佳選擇。
              我們將為您串接專屬的加密雲端資料庫，讓您在任何地方登入帳號，數據即刻更新。
            </p>
            <div className="mt-8 flex flex-wrap gap-4">
              <button className="bg-white text-indigo-600 px-8 py-4 rounded-2xl font-black uppercase text-[10px] tracking-widest hover:scale-105 transition-all">
                聯繫技術支援升級
              </button>
              <div className="flex items-center gap-2 px-6 py-4 bg-indigo-500/50 rounded-2xl border border-indigo-400">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping"></span>
                <span className="text-[10px] font-black uppercase tracking-widest">系統目前處於本地離線模式</span>
              </div>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
};

export default Settings;