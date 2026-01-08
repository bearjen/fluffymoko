import React, { useState, useEffect } from 'react';
import { createClient } from '@supabase/supabase-js';

// --- 直接封裝連線資訊，解決所有路徑找不到的問題 ---
const supabaseUrl = 'https://rtzwvdwsyupkbuovzkhk.supabase.co';
const supabaseKey = 'sb_publishable_kb38CrjY3PFE7SGW3_Djjg_M9vwzitL';
const supabase = createClient(supabaseUrl, supabaseKey);
// ----------------------------------------------

const Settings = () => {
  const [syncKey, setSyncKey] = useState(localStorage.getItem('syncKey') || '');
  const [status, setStatus] = useState('');

  // 當金鑰變動時，自動存到瀏覽器，下次打開不用重打
  useEffect(() => {
    localStorage.setItem('syncKey', syncKey);
  }, [syncKey]);

  // 功能：將資料備份到雲端
  const handleSyncToCloud = async () => {
    if (!syncKey) {
      alert('請先輸入同步金鑰！');
      return;
    }
    
    setStatus('同步中...');
    
    // 抓取本地所有寵物、預約與房間資料
    const allData = {
      pets: JSON.parse(localStorage.getItem('pets') || '[]'),
      bookings: JSON.parse(localStorage.getItem('bookings') || '[]'),
      rooms: JSON.parse(localStorage.getItem('rooms') || '[]')
    };

    const { error } = await supabase
      .from('settings')
      .upsert({ 
        id: syncKey, 
        data: allData,
        updated_at: new Date() 
      });

    if (error) {
      console.error(error);
      setStatus('同步失敗');
      alert('同步失敗：' + error.message);
    } else {
      setStatus('✅ 已成功備份至雲端');
      alert('資料已安全存儲！');
    }
  };

  // 功能：從雲端抓回資料
  const handleLoadFromCloud = async () => {
    if (!syncKey) {
      alert('請先輸入同步金鑰！');
      return;
    }

    setStatus('連線中...');
    const { data, error } = await supabase
      .from('settings')
      .select('data')
      .eq('id', syncKey)
      .single();

    if (error || !data) {
      setStatus('找不到雲端資料');
      alert('讀取失敗，請檢查金鑰是否輸入正確');
    } else {
      const cloudData = data.data;
      // 更新本地存儲
      localStorage.setItem('pets', JSON.stringify(cloudData.pets));
      localStorage.setItem('bookings', JSON.stringify(cloudData.bookings));
      localStorage.setItem('rooms', JSON.stringify(cloudData.rooms));
      
      setStatus('✅ 資料還原成功');
      alert('還原成功！系統即將重新整理');
      window.location.reload();
    }
  };

  return (
    <div className="p-6 max-w-2xl mx-auto bg-white rounded-xl shadow-md space-y-4">
      <h2 className="text-2xl font-bold text-gray-800">系統雲端設定</h2>
      
      {/* 雲端引擎介面 */}
      <div className="p-6 bg-slate-900 text-white border border-slate-700 rounded-2xl">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 bg-emerald-500 rounded-full animate-pulse"></div>
            <p className="text-emerald-400 font-mono font-bold">CONNECTED TO CLOUD</p>
          </div>
          <span className="text-slate-500 text-xs">Supabase Engine v2.0</span>
        </div>
        
        <div className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-slate-400 mb-2">
              同步金鑰 (YOUR SYNC KEY)
            </label>
            <input
              type="text"
              value={syncKey}
              onChange={(e) => setSyncKey(e.target.value)}
              placeholder="輸入密碼，例如: mypetapp2026"
              className="mt-1 block w-full px-4 py-3 bg-slate-800 border border-slate-600 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
            />
            <p className="mt-2 text-xs text-slate-500">
              * 只要在不同裝置輸入相同金鑰，即可同步所有毛孩資料。
            </p>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <button
              onClick={handleSyncToCloud}
              className="bg-blue-600 text-white font-bold py-3 px-4 rounded-xl hover:bg-blue-700 active:scale-95 transition-all shadow-lg shadow-blue-900/20"
            >
              🚀 同步至雲端
            </button>
            <button
              onClick={handleLoadFromCloud}
              className="bg-slate-700 text-white font-bold py-3 px-4 rounded-xl hover:bg-slate-600 active:scale-95 transition-all"
            >
              📥 從雲端還原
            </button>
          </div>
          
          {status && (
            <div className="text-center py-2 bg-slate-800/50 rounded-lg">
              <p className="text-sm font-medium text-slate-300">{status}</p>
            </div>
          )}
        </div>
      </div>
      
      <div className="p-4 bg-amber-50 border border-amber-200 rounded-lg">
        <p className="text-xs text-amber-700">
          ⚠️ 提示：還原功能會覆蓋掉目前這台裝置上的資料。建議在還原前，先確認另一端已經按過「同步至雲端」。
        </p>
      </div>
    </div>
  );
};

export default Settings;
