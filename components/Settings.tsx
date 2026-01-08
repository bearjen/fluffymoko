import React, { useState, useEffect } from 'react';
import { supabase } from '../services/supabaseClient';

const Settings = () => {
  const [syncKey, setSyncKey] = useState(localStorage.getItem('syncKey') || '');
  const [status, setStatus] = useState('');

  // 儲存金鑰到本地
  useEffect(() => {
    localStorage.setItem('syncKey', syncKey);
  }, [syncKey]);

  // 【備份至雲端】的功能
  const handleSyncToCloud = async () => {
    if (!syncKey) {
      alert('請先輸入同步金鑰！');
      return;
    }
    
    setStatus('同步中...');
    
    // 抓取目前所有的資料
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
      setStatus('已成功同步至雲端');
      alert('資料已成功備份！');
    }
  };

  // 【從雲端還原】的功能
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
      // 把抓回來的資料存進 localStorage
      const cloudData = data.data;
      localStorage.setItem('pets', JSON.stringify(cloudData.pets));
      localStorage.setItem('bookings', JSON.stringify(cloudData.bookings));
      localStorage.setItem('rooms', JSON.stringify(cloudData.rooms));
      
      setStatus('資料已從雲端恢復');
      alert('還原成功！請重新整理頁面');
      window.location.reload();
    }
  };

  return (
    <div className="p-6 max-w-2xl mx-auto bg-white rounded-xl shadow-md space-y-4">
      <h2 className="text-2xl font-bold text-gray-800">系統雲端設定</h2>
      <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
        <p className="text-blue-700 font-semibold mb-2">☁️ 雲端狀態: CONNECTED TO SERVICES</p>
        
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">同步金鑰 (SYNC KEY)</label>
            <input
              type="text"
              value={syncKey}
              onChange={(e) => setSyncKey(e.target.value)}
              placeholder="輸入您的專屬密碼 (例如: my-moko-data)"
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
            />
          </div>

          <div className="flex space-x-4">
            <button
              onClick={handleSyncToCloud}
              className="flex-1 bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 transition"
            >
              同步至雲端
            </button>
            <button
              onClick={handleLoadFromCloud}
              className="flex-1 bg-green-600 text-white py-2 px-4 rounded-md hover:bg-green-700 transition"
            >
              從雲端還原
            </button>
          </div>
          {status && <p className="text-sm text-center text-gray-500">{status}</p>}
        </div>
      </div>
    </div>
  );
};

export default Settings;
