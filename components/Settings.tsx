import React, { useState } from 'react';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  'https://rtzwvdwsyupkbuovzkhk.supabase.co',
  'sb_publishable_kb38CrjY3PFE7SGW3_Djjg_M9vwzitL'
);

const Settings = () => {
  const [syncKey, setSyncKey] = useState(localStorage.getItem('syncKey') || '');
  const [status, setStatus] = useState('');

  const handleSync = async () => {
    if (!syncKey) return alert('請輸入金鑰');
    setStatus('同步中...');
    const data = {
      pets: JSON.parse(localStorage.getItem('pets') || '[]'),
      bookings: JSON.parse(localStorage.getItem('bookings') || '[]')
    };
    const { error } = await supabase.from('settings').upsert({ id: syncKey, data });
    setStatus(error ? '失敗' : '✅ 同步成功');
  };

  return (
    <div style={{ padding: '50px', textAlign: 'center', backgroundColor: '#f0f4f8', minHeight: '100vh', color: '#333' }}>
      <h1 style={{ color: '#1a365d' }}>Moko 雲端同步系統</h1>
      <div style={{ background: 'white', padding: '30px', borderRadius: '15px', display: 'inline-block', boxShadow: '0 4px 6px rgba(0,0,0,0.1)' }}>
        <input 
          type="text" value={syncKey} onChange={(e) => setSyncKey(e.target.value)}
          placeholder="輸入同步金鑰" style={{ padding: '10px', width: '250px', marginBottom: '10px', border: '1px solid #ccc' }}
        />
        <br />
        <button onClick={handleSync} style={{ padding: '10px 20px', backgroundColor: '#2b6cb0', color: 'white', border: 'none', borderRadius: '5px', cursor: 'pointer' }}>
          🚀 開始備份
        </button>
        {status && <p>{status}</p>}
      </div>
    </div>
  );
};

export default Settings;
