const express = require('express');
const cors = require('cors');
const axios = require('axios');
const { createClient } = require('@supabase/supabase-js');

const app = express();
app.use(express.json());
app.use(cors());

// Tambahkan baris ini agar saat URL utama dibuka, tidak muncul "Cannot GET /"
app.get('/', (req, res) => {
  res.send('ATFarmBot Backend is Running Smoothly! 🚀');
});

// Masukkan Kredensial Supabase Anda di sini (ambil dari Project Settings -> API Supabase)
const SUPABASE_URL = 'https://qsbdxllnsejngubrxexb.supabase.co';
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFzYmR4bGxuc2Vqbmd1YnJ4ZXhiIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc4NzE0MjA2NCwiZXhwIjoyMTAyNzE4MDY0fQ.8qnCMiRnJ7YWnitWrrOQUg0lW8Gekih70tv1_yXsLjw';
const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

const TELEGRAM_BOT_TOKEN = '8960943895:AAE_mbGf1TsYZbpjVpRH0br8Zt-Yt2YNN6Q';

// Endpoint 1: Mengambil atau Membuat Data Pemain di Supabase (Anti-Reset)
app.post('/api/get-player', async (req, res) => {
  const { telegramId } = req.body;
  if (!telegramId) return res.status(400).json({ error: 'Telegram ID required' });

  let { data, error } = await supabase
    .from('players')
    .select('*')
    .eq('id', telegramId)
    .single();

  if (error || !data) {
    // Jika pemain baru pertama kali masuk, buatkan data awal di database
    const initialData = {
      id: telegramId,
      coins: 0,
      atf: 0.00,
      inventory: { seed: 0, water: 0, fertilizer: 0, harvestedApples: 0, hasClaimedFree: false },
      plots: [
        { id: 0, status: 'empty', harvestTime: 0, totalDuration: 18000, unlocked: true },
        { id: 1, status: 'locked', harvestTime: 0, totalDuration: 18000, unlocked: false },
        { id: 2, status: 'locked', harvestTime: 0, totalDuration: 18000, unlocked: false },
        { id: 3, status: 'locked', harvestTime: 0, totalDuration: 18000, unlocked: false },
        { id: 4, status: 'locked', harvestTime: 0, totalDuration: 18000, unlocked: false },
        { id: 5, status: 'locked', harvestTime: 0, totalDuration: 18000, unlocked: false },
        { id: 6, status: 'locked', harvestTime: 0, totalDuration: 18000, unlocked: false },
        { id: 7, status: 'locked', harvestTime: 0, totalDuration: 18000, unlocked: false },
        { id: 8, status: 'locked', harvestTime: 0, totalDuration: 18000, unlocked: false }
      ]
    };

    const { data: newData, error: insertError } = await supabase
      .from('players')
      .insert([initialData])
      .select()
      .single();

    if (insertError) return res.status(500).json({ error: insertError.message });
    return res.json(newData);
  }

  res.json(data);
});

// Endpoint 2: Menyimpan Pembaruan Game (Koin, Inventaris, Lahan) ke Database
app.post('/api/save-player', async (req, res) => {
  const { telegramId, coins, atf, inventory, plots } = req.body;
  
  const { data, error } = await supabase
    .from('players')
    .update({ coins, atf, inventory, plots })
    .eq('id', telegramId)
    .select();

  if (error) return res.status(500).json({ success: false, error: error.message });
  res.json({ success: true, data });
});

// Endpoint 3: Validasi Tugas Telegram (getChatMember)
app.post('/api/verify-telegram', async (req, res) => {
  const { userId, channelUsername } = req.body;
  try {
    const response = await axios.get(`https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/getChatMember`, {
      params: { chat_id: channelUsername, user_id: userId }
    });
    const status = response.data.result.status;
    if (['member', 'administrator', 'creator'].includes(status)) {
      res.json({ success: true });
    } else {
      res.json({ success: false });
    }
  } catch (err) {
    res.json({ success: false, error: "Failed to verify" });
  }
});

const PORT = process.env.PORT || 3000;
// Di bagian paling bawah server.js, ganti app.listen(...) menjadi:
module.exports = app;