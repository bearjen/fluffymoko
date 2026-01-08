import React, { useState, useRef } from 'react';
import { supabase } from '../services/supabaseClient';

interface SettingsProps {
  onExport: () => string;
  onImport: (data: string) => boolean;
}

const Settings: React.FC<SettingsProps> = ({ onExport, onImport }) => {
  const [syncId, setSyncId] = useState(() => localStorage.getItem('fm_sync_id') || '');
  const [isSyncing, setIsSyncing] = useState(false);
  const [isFetching, setIsFetching] = useState(false);
  const [lastSyncTime, setLastSyncTime] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // 執行雲端備份 (Sync to Cloud)
  const handleCloudSync = async () => {
    if (!syncId.trim()) {
      alert('請先輸入一個「同步金鑰」，這將作為您跨裝置存取的憑證。');
      return;
    }

    setIsSyncing(true);
    try {
      // 取得目前的 base64 資料並轉回 JSON 物件
      const base64Data = onExport();
      const rawJson = JSON.parse(decodeURIComponent(escape(atob(base64Data))));
      
      const { error } = await supabase
        .from('settings')
        .upsert({ 
          id: syncId.trim(), 
          data: rawJson,
          updated_at: new Date().toISOString()
        });

      if (error) throw error;

      localStorage.setItem('fm_sync_id', syncId.trim());
      setLastSyncTime(new Date().toLocaleTimeString());
      alert('✅ 雲端同步成功！資料已安全存儲在 Supabase 資料庫。');
    } catch (err: any) {
      console.error('Sync error:', err);
      alert(`❌ 同步失敗：${err.message || '請確認網路連線或資料庫權限'}`);
    } finally {
      setIsSyncing(false);
    }
  };

  // 執行雲端還原 (Restore from Cloud)
  const handleCloudRestore = async () => {
    if (!syncId.trim()) {
      alert('請輸入您的「同步金鑰」以進行還原。');
      return;
    }

    if (!confirm('⚠️ 警告：還原操作將會「完全覆蓋」目前設備上的所有資料，確定要繼續嗎？')) {
      return;
    }

    setIsFetching(true);
    try {
      const { data, error } = await supabase
        .from('settings')
        .select('data')
        .eq('id', syncId.trim())
        .single();

      if (error) {
        if (error.code === 'PGRST116') {
          throw new Error('找不到該金鑰對應的備份資料，請檢查金鑰是否輸入正確。');
        }
        throw error;
      }

      if (data && data.data) {
        // 將 JSON 轉回 base64 以適配現有的 onImport 邏輯
        const base64 = btoa(unescape(encodeURIComponent(JSON.stringify(data.data))));
        const success = onImport(base64);
        
        if (success) {
          localStorage.setItem('fm_sync_id', syncId.trim());
          alert('✅ 資料還原成功！系統將自動重新整理以應用新數據。');
          window.location.reload();
        } else {
          throw new Error('資料格式校驗失敗。');
        }
      }
    } catch (err: any) {
      console.error('Restore error:', err);
      alert(`❌ 還原失敗：${err.message}`);
    } finally {
      setIsFetching(false);
    }
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
      alert('檔案產出失敗。');
    }
  };

  import React, { useState, useEffect } from 'react';
import { createClient } from '@supabase/supabase-js';

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
    if (!syncKey.trim()) { alert('請先輸入金鑰'); return; }
    setStatus('同步中...');
    const allData = {
      pets: JSON.parse(localStorage.getItem('pets') || '[]'),
      bookings: JSON.parse(localStorage.getItem('bookings') || '[]'),
      rooms: JSON.parse(localStorage.getItem('rooms') || '[]')
    };
    const { error } = await supabase.from('settings').upsert({ id: syncKey, data: allData, updated_at: new Date() });
    if (error) { setStatus('失敗'); alert(error.message); } 
    else { setStatus('✅ 已備份'); alert('備份成功！'); }
  };

  const handleLoadFromCloud = async () => {
    if (!syncKey.trim()) { alert('請輸入金鑰'); return; }
    setStatus('載入中...');
    const { data, error } = await supabase.from('settings').select('data').eq('id', syncKey).single();
    if (error || !data) { setStatus('找不到資料'); alert('請檢查金鑰'); } 
    else {
      localStorage.setItem('pets', JSON.stringify(data.data.pets));
      localStorage.setItem('bookings', JSON.stringify(data.data.bookings));
      localStorage.setItem('rooms', JSON.stringify(data.data.rooms));
      setStatus('✅ 還原成功'); alert('還原成功！正在重新整理'); window.location.reload();
    }
  };

  return (
    <div style={{ padding: '20px', maxWidth: '600px', margin: '40px auto', fontFamily: 'sans-serif' }}>
      <h2 style={{ fontSize: '24px', fontWeight: 'bold', marginBottom: '20px' }}>系統雲端設定</h2>
      <div style={{ padding: '30px', backgroundColor: '#0f172a', color: 'white', borderRadius: '20px', border: '1px solid #334155' }}>
        <div style={{ display: 'flex', alignItems: 'center', marginBottom: '20px' }}>
          <div style={{ width: '10px', height: '10px', backgroundColor: '#10b981', borderRadius: '50%', marginRight: '10px' }}></div>
          <p style={{ color: '#34d399', fontWeight: 'bold', margin: 0 }}>CLOUD CONNECTED</p>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          <div>
            <label style={{ display: 'block', fontSize: '13px', color: '#94a3b8', marginBottom: '8px' }}>同步金鑰 (YOUR SYNC KEY)</label>
            <input
              type="text" value={syncKey} onChange={(e) => setSyncKey(e.target.value)}
              placeholder="例如: moko2026"
              style={{ width: '100%', padding: '12px', backgroundColor: '#1e293b', border: '1px solid #475569', borderRadius: '8px', color: 'white', boxSizing: 'border-box' }}
            />
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
            <button onClick={handleSyncToCloud} style={{ padding: '12px', backgroundColor: '#2563eb', color: 'white', border: 'none', borderRadius: '8px', fontWeight: 'bold', cursor: 'pointer' }}>🚀 同步雲端</button>
            <button onClick={handleLoadFromCloud} style={{ padding: '12px', backgroundColor: '#334155', color: 'white', border: 'none', borderRadius: '8px', fontWeight: 'bold', cursor: 'pointer' }}>📥 雲端還原</button>
          </div>
          {status && <p style={{ textAlign: 'center', color: '#94a3b8', fontSize: '14px' }}>{status}</p>}
        </div>
      </div>
    </div>
  );
};

export default Settings;
