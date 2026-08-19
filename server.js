const express = require('express');
const axios = require('axios');
const cors = require('cors');
const app = express();

app.use(express.json());
app.use(cors());

// Token Bot Anda yang aman di server
const TELEGRAM_BOT_TOKEN = '8960943895:AAE_mbGf1TsYZbpjVpRH0br8Zt-Yt2YNN6Q';

// Contoh Endpoint Validasi Tugas Telegram (getChatMember)
app.post('/api/verify-telegram', async (req, res) => {
  const { userId, channelUsername } = req.body;
  try {
    const response = await axios.get(`https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/getChatMember`, {
      params: {
        chat_id: channelUsername,
        user_id: userId
      }
    });
    
    const status = response.data.result.status;
    if (['member', 'administrator', 'creator'].includes(status)) {
      res.json({ success: true, message: "User is verified member!" });
    } else {
      res.json({ success: false, message: "User has not joined the channel yet." });
    }
  } catch (error) {
    res.status(500).json({ success: false, error: "Failed to verify membership via Telegram API." });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`ATFarmBot Secure Backend running on port ${PORT}`);
});