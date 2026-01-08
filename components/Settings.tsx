import React, { useState, useEffect } from 'react';
import { createClient } from '@supabase/supabase-js';

// --- 直接把連線資訊寫在這裡，不依賴外部檔案 ---
const supabaseUrl = 'https://rtzwvdwsyupkbuovzkhk.supabase.co';
const supabaseKey = 'sb_publishable_kb38CrjY3PFE7SGW3_Djjg_M9vwzitL';
const supabase = createClient(supabaseUrl, supabaseKey);
// ------------------------------------------

const Settings = () => {
  const [syncKey, setSyncKey] = useState(localStorage.getItem('syncKey') || '');
  const [status, setStatus] = useState('');

  useEffect(() => {
    localStorage.setItem('syncKey', syncKey);
  }, [syncKey]);

  const handleSyncToCloud = async () => {
    if (!syncKey) {
      alert('請先輸入同步金鑰！');
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
      setStatus('已成功同步至雲端');
      alert('資料已成功備份！');
    }
  };

  const handleLoadFromCloud = async () => {
    if (!syncKey) {
      alert('請先輸入同步金鑰！');
      return;
    }
    setStatus('讀取中...');
    const { data, error } = await supabase
      .from('settings')
      .select('data')
      .eq('id', syncKey)
      .single();
    if (error || !data) {
      setStatus('找不到雲端資料');
      alert('讀取失敗，請確認金鑰是否正確');
    } else {
      const cloudData = data.data;
      localStorage.setItem('pets', JSON.stringify(cloudData.pets));
      localStorage.setItem('bookings', JSON.stringify(cloudData.bookings));
      localStorage.setItem('rooms', JSON.stringify(cloudData.rooms));
      setStatus('還原成功');
      alert('還原成功！請重新整理頁面');
      window.location.reload();
    }
  };

  return (
    <div className="p-6 max-w-2xl mx-auto bg-white rounded-xl shadow-md space-y-4">
      <h2 className="text-2xl font-bold text-gray-800">系統雲端設定</h2>
      <div className="p-4 bg-slate-900 text-white border border-slate-700 rounded-lg">
        <p className="text-emerald-400 font-semibold mb-2">● CONNECTED TO SERVICES</p>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-300">同步金鑰 (SYNC KEY)</label>
            <input
              type="text"
              value={syncKey}
              onChange={(e) => setSyncKey(e.target.value)}
              placeholder="例如: moko-private-key"
              className="mt-1 block w-full px-3 py-2 bg-slate-800 border border-slate-600 rounded-md text-white focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
          <div className="flex space-x-4">
            <button onClick={handleSyncToCloud} className="flex-1 bg-blue-600 py-2 px-4 rounded-md hover:bg-blue-700">同步至雲端</button>
            <button onClick={handleLoadFromCloud} className="flex-1 bg-slate-700 py-2 px-4 rounded-md hover:bg-slate-600">從雲端還原</button>
          </div>
          {status && <p className="text-sm text-center text-slate-400">{status}</p>}
        </div>
      </div>
    </div>
  );
};

export default Settings;
