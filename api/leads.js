/**
 * Vercel Serverless Function: /api/leads
 * Real-time synchronization of leads from Telegram Channel (@tunikabondlider_uz)
 * and direct Telegram Bot updates (@tunikabondlider_rasmiy_bot)
 */

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  const BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN || "8697018482:AAFwxsWVPoHl7sEfGpR9wPtQEtxBL3ivozA";
  const CHANNEL_ID = process.env.TELEGRAM_CHANNEL_ID || "-1004415750690";
  const ADMIN_ID = process.env.TELEGRAM_ADMIN_ID || "6481310196";

  // POST: Receive new lead and dispatch to Telegram
  if (req.method === 'POST') {
    const data = req.body || {};
    const { name, phone, service, message, source, calcData } = data;

    if (!phone || String(phone).trim().length < 9) {
      return res.status(400).json({ error: "Telefon raqami kiritilishi shart" });
    }

    const cleanPhone = String(phone).replace(/\D/g, '');
    const callUrl = `https://tunikabondlider.vercel.app/call.html?tel=${cleanPhone || '998995333303'}`;
    const tgUrl = `https://t.me/+${cleanPhone}`;

    const text = `🔥 <b>YANGI ARIZA — TUNIKABOND LIDER</b> 🔥\n\n` +
      `👤 <b>Mijoz:</b> ${name || "Noma'lum"}\n` +
      `📞 <b>Telefon:</b> <code>${phone}</code>\n` +
      (service ? `🛠 <b>Xizmat / Mahsulot:</b> ${service}\n` : '') +
      (calcData ? `\n📊 <b>Kalkulyator Hisobi:</b>\n • Maydoni: ${calcData.area || '-'} m²\n • Narx: <b>${calcData.cost || '-'}</b>\n` : '') +
      (message ? `💬 <b>Qo'shimcha izoh:</b> ${message}\n` : '') +
      `📍 <b>Manba:</b> ${source || "Veb-sayt"}\n` +
      `⏰ <b>Vaqt:</b> ${new Date().toLocaleString('uz-UZ')}\n` +
      `👨‍💼 <b>Mas'ul admin:</b> @mukhammadew`;

    const channelMarkup = {
      inline_keyboard: [
        [
          { text: "📞 Telefon qilish", url: callUrl },
          ...(cleanPhone ? [{ text: "💬 Telegramdan yozish", url: tgUrl }] : [])
        ],
        [
          { text: "🌐 Saytni ochish", url: "https://tunikabondlider.vercel.app" },
          { text: "👨‍💼 Admin: @mukhammadew", url: "https://t.me/mukhammadew" }
        ]
      ]
    };

    const targets = [ADMIN_ID, CHANNEL_ID, "@tunikabondlider_uz"];
    for (const target of targets) {
      try {
        await fetch(`https://api.telegram.org/bot${BOT_TOKEN}/sendMessage`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            chat_id: target,
            text: text,
            parse_mode: 'HTML',
            reply_markup: channelMarkup
          })
        });
      } catch {}
    }

    return res.status(201).json({
      success: true,
      message: "Ariza muvaffaqiyatli qabul qilindi va Telegramga yuborildi",
      lead: {
        id: `lead-${Date.now()}`,
        ...data,
        status: "new",
        timestamp: new Date().toISOString()
      }
    });
  }

  // GET: Fetch and sync all leads from Telegram Channel & Bot
  if (req.method === 'GET') {
    const leads = [];
    const seenKeys = new Set();

    // 1. Parse all public posts from Telegram channel https://t.me/s/tunikabondlider_uz
    try {
      const chanRes = await fetch("https://t.me/s/tunikabondlider_uz", {
        headers: { "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64)" }
      });

      if (chanRes.ok) {
        const html = await chanRes.text();
        const msgRegex = /<div class="tgme_widget_message_text js-message_text"[^>]*>([\s\S]*?)<\/div>/g;
        let match;
        let idx = 1;

        while ((match = msgRegex.exec(html)) !== null) {
          const raw = match[1];
          if (raw.includes("YANGI ARIZA") || raw.includes("Mijoz:") || raw.includes("Telefon:")) {
            const cleanText = raw
              .replace(/<br\s*\/?>/gi, "\n")
              .replace(/<[^>]+>/g, "")
              .replace(/&amp;/g, "&")
              .replace(/&lt;/g, "<")
              .replace(/&gt;/g, ">")
              .replace(/&#39;/g, "'")
              .replace(/&quot;/g, '"');

            const nameM = cleanText.match(/Mijoz:\s*([^\n]+)/);
            const phoneM = cleanText.match(/Telefon:\s*([^\n]+)/);
            const serviceM = cleanText.match(/Xizmat(?:\/Mahsulot|\s*\/\s*Mahsulot)?:\s*([^\n]+)/);
            const noteM = cleanText.match(/Qo['\u2019]shimcha izoh:\s*([^\n]+)/);
            const srcM = cleanText.match(/Manba:\s*([^\n]+)/);
            const timeM = cleanText.match(/Vaqt:\s*([^\n]+)/);

            if (phoneM) {
              const phone = phoneM[1].trim();
              const timeStr = timeM ? timeM[1].trim() : '';
              const key = `${phone}_${timeStr}`;

              if (!seenKeys.has(key)) {
                seenKeys.add(key);
                leads.push({
                  id: `tg-channel-${idx++}`,
                  name: nameM ? nameM[1].trim() : "Mijoz",
                  phone: phone,
                  service: serviceM ? serviceM[1].trim() : "Tunikabond Lider",
                  message: noteM ? noteM[1].trim() : "",
                  source: srcM ? `Telegram (${srcM[1].trim()})` : "Telegram Kanal (@tunikabondlider_uz)",
                  timestamp: timeStr || new Date().toISOString(),
                  status: "new"
                });
              }
            }
          }
        }
      }
    } catch (err) {
      console.warn("Channel read error:", err);
    }

    // 2. Fetch direct messages / contacts from Telegram Bot (getUpdates)
    try {
      const updatesRes = await fetch(`https://api.telegram.org/bot${BOT_TOKEN}/getUpdates?limit=50`);
      if (updatesRes.ok) {
        const uJson = await updatesRes.json();
        if (uJson.ok && Array.isArray(uJson.result)) {
          uJson.result.forEach(u => {
            const m = u.message;
            if (m && m.from && !m.from.is_bot) {
              const fromName = `${m.from.first_name || ''} ${m.from.last_name || ''}`.trim() || m.from.username || 'Telegram Mijoz';
              const text = (m.text || '').trim();
              const contactPhone = m.contact?.phone_number || '';
              const phoneMatch = text.match(/\+?998\s*\d{2}\s*\d{3}\s*\d{2}\s*\d{2}|\b\d{9}\b/);
              const phone = contactPhone || (phoneMatch ? phoneMatch[0] : (m.from.username ? `@${m.from.username}` : `ID: ${m.from.id}`));

              const key = `bot-msg-${m.from.id}-${m.date}`;
              if (!seenKeys.has(key)) {
                seenKeys.add(key);
                leads.push({
                  id: `tg-bot-${m.message_id}-${m.date}`,
                  name: fromName,
                  phone: phone,
                  service: "Telegram Bot Murojaati",
                  message: text !== '/start' ? text : "Botga /start bosdi",
                  source: m.from.username ? `Telegram Bot (@${m.from.username})` : `Telegram Bot (${m.from.id})`,
                  timestamp: new Date(m.date * 1000).toISOString(),
                  status: "new"
                });
              }
            }
          });
        }
      }
    } catch (err) {
      console.warn("Updates read error:", err);
    }

    // Sort newest first
    leads.sort((a, b) => {
      const tA = new Date(a.timestamp).getTime() || 0;
      const tB = new Date(b.timestamp).getTime() || 0;
      return tB - tA;
    });

    return res.status(200).json(leads);
  }

  return res.status(405).json({ error: "Method not allowed" });
}
