const express = require('express');
const cors = require('cors');
const axios = require('axios');
const { createClient } = require('@supabase/supabase-js');

const app = express();
app.use(express.json());
app.use(cors());

// Halaman sambutan utama agar tidak muncul "Cannot GET /"
app.get('/', (req, res) => {
  res.send('ATFarmBot Backend is Running Smoothly! 🚀');
});

// Mengambil Kredensial dan Token dari Environment Variables (Aman dari Bocor)
const SUPABASE_URL = process.env.SUPABASE_URL || 'https://qsbdxllnsejngubrxexb.supabase.co';
const SUPABASE_KEY = process.env.SUPABASE_KEY || 'MASUKKAN_KEY_JIKA_DI_LOKAL';
const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

const TELEGRAM_BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN || 'MASUKKAN_TOKEN_BARU_ANDA';

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

// Endpoint 2: Menyimpan Pembaruan Game ke Database
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

// Endpoint 3: Validasi Tugas Telegram (getChatMember)[cite: 9]
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
module.exports = app;
