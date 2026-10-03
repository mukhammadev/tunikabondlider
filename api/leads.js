/**
 * Vercel Serverless Function: /api/leads
 * Real-time synchronization of leads for Admin Panel and Telegram Private Channel
 * 
 * Rules:
 * 1. Leads from website go ONLY to the private channel (-1004415750690) and Admin Panel.
 * 2. NO personal bot chat sends (ADMIN_ID, OWNER_ID are not spammed).
 * 3. Channel messages have NO buttons (reply_markup is omitted for private internal channel).
 * 4. User receives confirmation details if telegram user ID is provided.
 */

// In-memory cache for warm lambda executions
const inMemoryLeads = [];

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PATCH, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  const BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN || "8697018482:AAFwxsWVPoHl7sEfGpR9wPtQEtxBL3ivozA";
  const CHANNEL_ID = process.env.TELEGRAM_CHANNEL_ID || "-1004415750690";
  const CLOUD_LEADS_URL = "https://api.restful-api.dev/objects/ff808181a09d98f701a0fc19c245604c";

  // POST: Receive new lead and dispatch to Telegram Private Channel and Admin Panel
  if (req.method === 'POST') {
    const data = req.body || {};
    const { name, phone, service, message, source, calcData } = data;

    if (!phone || String(phone).trim().length < 9) {
      return res.status(400).json({ error: "Telefon raqami kiritilishi shart" });
    }

    const leadRecord = {
      id: data.id || `lead-${Date.now()}`,
      name: name || "Noma'lum",
      phone: String(phone).trim(),
      service: service || data.product || "Tunikabond xizmatlari",
      message: message || "",
      source: source || "Veb-sayt",
      calcData: calcData || null,
      status: data.status || "new",
      timestamp: data.timestamp || new Date().toISOString()
    };

    // Cache in memory
    const existingIdx = inMemoryLeads.findIndex(l => String(l.id) === String(leadRecord.id));
    if (existingIdx >= 0) {
      inMemoryLeads[existingIdx] = leadRecord;
    } else {
      inMemoryLeads.unshift(leadRecord);
    }

    // 1. Send confirmation message directly to user if submitted via Telegram Mini App
    const userChatId = data.telegramUserId || data.chatId || data.userId;
    if (userChatId) {
      const userConfirmHtml = 
        `✅ <b>Arizangiz muvaffaqiyatli qabul qilindi!</b>\n\n` +
        `📋 <b>Ariza ma'lumotlari:</b>\n` +
        `👤 <b>Mijoz:</b> ${name || "Hurmatli mijoz"}\n` +
        `📞 <b>Telefon:</b> <code>${phone}</code>\n` +
        (service ? `🛠 <b>Xizmat / Mahsulot:</b> ${service}\n` : '') +
        (calcData ? `📊 <b>Kalkulyator Hisobi:</b> ${calcData.area || '-'} m² (${calcData.cost || '-'})\n` : '') +
        (message ? `💬 <b>Qo'shimcha izoh:</b> ${message}\n` : '') +
        `⏰ <b>Vaqt:</b> ${new Date().toLocaleString('uz-UZ')}\n\n` +
        `🤝 <b>Siz bilan tez orada bog‘lanamiz!</b>`;

      try {
        await fetch(`https://api.telegram.org/bot${BOT_TOKEN}/sendMessage`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            chat_id: userChatId,
            text: userConfirmHtml,
            parse_mode: 'HTML'
          })
        });
      } catch (e) {
        console.warn("User confirmation send error:", e);
      }
    }

    // 2. Dispatch ONLY to Private Channel WITHOUT buttons
    const channelText = 
      `🔥 <b>YANGI ARIZA — TUNIKABOND LIDER</b> 🔥\n\n` +
      `👤 <b>Mijoz:</b> ${name || "Noma'lum"}\n` +
      `📞 <b>Telefon:</b> <code>${phone}</code>\n` +
      (service ? `🛠 <b>Xizmat / Mahsulot:</b> ${service}\n` : '') +
      (calcData ? `\n📊 <b>Kalkulyator Hisobi:</b>\n • Maydoni: ${calcData.area || '-'} m²\n • Narx: <b>${calcData.cost || '-'}</b>\n` : '') +
      (message ? `💬 <b>Qo'shimcha izoh:</b> ${message}\n` : '') +
      `📍 <b>Manba:</b> ${source || "Veb-sayt"}\n` +
      `⏰ <b>Vaqt:</b> ${new Date().toLocaleString('uz-UZ')}\n` +
      `👨‍💼 <b>Mas'ul admin:</b> @Mukhammad_azez`;

    try {
      await fetch(`https://api.telegram.org/bot${BOT_TOKEN}/sendMessage`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          chat_id: CHANNEL_ID,
          text: channelText,
          parse_mode: 'HTML'
        })
      });
    } catch (e) {
      console.warn("Channel dispatch error:", e);
    }

    // 3. Sync to Cloud Leads Store for Admin Panel persistence
    try {
      const cRes = await fetch(CLOUD_LEADS_URL);
      if (cRes.ok) {
        const json = await cRes.json();
        const current = json?.data?.leads || [];
        const filtered = current.filter(l => String(l.id) !== String(leadRecord.id));
        await fetch(CLOUD_LEADS_URL, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            name: 'tunikabond_leads_v2',
            data: { leads: [leadRecord, ...filtered].slice(0, 100) }
          })
        });
      }
    } catch {}

    return res.status(201).json({
      success: true,
      message: "Ariza muvaffaqiyatli qabul qilindi va kanalga yuborildi",
      lead: leadRecord
    });
  }

  // GET: Fetch and sync all leads for Admin Panel
  if (req.method === 'GET') {
    const leads = [...inMemoryLeads];
    const seenIds = new Set(leads.map(l => String(l.id)));

    // Try fetching from Cloud Store
    try {
      const cRes = await fetch(CLOUD_LEADS_URL);
      if (cRes.ok) {
        const json = await cRes.json();
        if (json?.data?.leads && Array.isArray(json.data.leads)) {
          json.data.leads.forEach(l => {
            if (l && l.id && !seenIds.has(String(l.id))) {
              seenIds.add(String(l.id));
              leads.push(l);
            }
          });
        }
      }
    } catch {}

    // Sort newest first
    leads.sort((a, b) => {
      const tA = new Date(a.timestamp || a.date).getTime() || 0;
      const tB = new Date(b.timestamp || b.date).getTime() || 0;
      return tB - tA;
    });

    return res.status(200).json(leads);
  }

  return res.status(405).json({ error: "Method not allowed" });
}
