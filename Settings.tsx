import React, { useState, useEffect } from 'react';
import { createClient } from '@supabase/supabase-js';

// --- 直接內建連線資訊，解決所有找不到 services 資料夾的問題 ---
const supabaseUrl = 'https://rtzwvdwsyupkbuovzkhk.supabase.co';
const supabaseKey = 'sb_publishable_kb38CrjY3PFE7SGW3_Djjg_M9vwzitL';
const supabase = createClient(supabaseUrl, supabaseKey);

const Settings = () => {
  const [syncKey, setSyncKey] = useState(localStorage.getItem('syncKey') || '');
  const [status, setStatus] = useState('');

  useEffect(() => {
    localStorage.setItem('syncKey', syncKey);
  }, [syncKey]);

  const handleSyncToCloud = async () => {
    if (!syncKey.trim()) {
      alert('請先輸入一個「同步金鑰」！');
      return;
    }
    setStatus('同步中...');
    const allData = {
      pets: JSON.parse(localStorage.getItem('pets') || '[]'),
      bookings: JSON.parse(localStorage.getItem('bookings') || '[]'),
      rooms: JSON.parse(localStorage.getItem('rooms') || '[]')
    };
    const { error } = await supabase
      .from('settings')
      .upsert({ id: syncKey, data: allData, updated_at: new Date() });
    if (error) {
      setStatus('同步失敗');
      alert('同步失敗：' + error.message);
    } else {
      setStatus('✅ 已成功備份');
      alert('資料已安全存儲！');
    }
  };

  const handleLoadFromCloud = async () => {
    if (!syncKey.trim()) {
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
      alert('讀取失敗，請檢查金鑰');
    } else {
      const cloudData = data.data;
      localStorage.setItem('pets', JSON.stringify(cloudData.pets));
      localStorage.setItem('bookings', JSON.stringify(cloudData.bookings));
      localStorage.setItem('rooms', JSON.stringify(cloudData.rooms));
      setStatus('✅ 還原成功');
      alert('還原成功！系統即將重新整理');
      window.location.reload();
    }
  };

  return (
    <div className="p-6 max-w-2xl mx-auto bg-white rounded-xl shadow-md space-y-4">
      <h2 className="text-2xl font-bold text-gray-800">系統雲端設定</h2>
      <div className="p-6 bg-slate-900 text-white rounded-2xl border border-slate-700">
        <div className="flex items-center space-x-2 mb-6">
          <div className="w-3 h-3 bg-emerald-500 rounded-full animate-pulse"></div>
          <p className="text-emerald-400 font-mono font-bold">CONNECTED TO CLOUD</p>
        </div>
        <div className="space-y-6">
          <div>
            <label className="block text-sm text-slate-400 mb-2">同步金鑰 (YOUR SYNC KEY)</label>
            <input
              type="text" value={syncKey}
              onChange={(e) => setSyncKey(e.target.value)}
              placeholder="例如: moko-2026-backup"
              className="w-full px-4 py-3 bg-slate-800 border border-slate-600 rounded-xl text-white focus:ring-2 focus:ring-blue-500 outline-none transition"
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <button onClick={handleSyncToCloud} className="bg-blue-600 font-bold py-3 rounded-xl hover:bg-blue-700 active:scale-95 transition">🚀 同步至雲端</button>
            <button onClick={handleLoadFromCloud} className="bg-slate-700 font-bold py-3 rounded-xl hover:bg-slate-600 active:scale-95 transition">📥 從雲端還原</button>
          </div>
          {status && <p className="text-center text-sm text-slate-300">{status}</p>}
        </div>
      </div>
    </div>
  );
};

export default Settings;
