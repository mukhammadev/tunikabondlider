import { cloudPushLead } from './api.js';

/**
 * Telegram Notification & Lead Dispatch Service
 * Sends leads to Telegram channel, dedicated personal account, and any configured recipients.
 */

export const STORAGE_TELEGRAM_KEY = 'tunikabond_telegram_config_v5';

export const DEFAULT_TELEGRAM_CONFIG = {
  botToken: "8697018482:AAFwxsWVPoHl7sEfGpR9wPtQEtxBL3ivozA",
  botUsername: "tunikabondlider_rasmiy_bot",
  adminUsername: "mukhammadew",
  recipients: [
    {
      id: "6481310196",
      label: "Bosh Menejer Bot Lichkasi (@mukhammadew)",
      type: "user",
      enabled: true
    },
    {
      id: "-1004415750690",
      label: "Telegram Kanal (@tunikabondlider_uz)",
      type: "channel",
      enabled: true
    },
    {
      id: "1003939636",
      label: "Menejer Muhammadaziz (@Mukhammad_azez)",
      type: "user",
      enabled: true
    }
  ]
};

/**
 * Retrieve active telegram settings (guarantees mandatory targets are ALWAYS present)
 */
export const getTelegramConfig = () => {
  const defaults = DEFAULT_TELEGRAM_CONFIG.recipients;
  let custom = [];
  let token = DEFAULT_TELEGRAM_CONFIG.botToken;
  let username = DEFAULT_TELEGRAM_CONFIG.botUsername;
  let admin = DEFAULT_TELEGRAM_CONFIG.adminUsername;

  try {
    const raw = localStorage.getItem(STORAGE_TELEGRAM_KEY) 
      || localStorage.getItem('tunikabond_telegram_config_v2')
      || localStorage.getItem('tunikabond_telegram_config');

    if (raw) {
      const parsed = JSON.parse(raw);
      if (parsed.botToken) token = parsed.botToken;
      if (parsed.botUsername) username = parsed.botUsername;
      if (parsed.adminUsername) admin = parsed.adminUsername;
      if (Array.isArray(parsed.recipients)) {
        custom = parsed.recipients;
      }
    }
  } catch (e) {
    console.warn('Error reading telegram config:', e);
  }

  // Build merged map by id so mandatory targets (6481310196 and -1004415750690) ALWAYS exist
  const map = new Map();
  defaults.forEach(r => map.set(String(r.id).trim(), { ...r }));
  custom.forEach(r => {
    if (r && r.id) {
      const idKey = String(r.id).trim();
      if (map.has(idKey)) {
        map.set(idKey, { ...map.get(idKey), ...r, enabled: r.enabled !== false });
      } else {
        map.set(idKey, { ...r, enabled: r.enabled !== false });
      }
    }
  });

  const merged = {
    botToken: token,
    botUsername: username,
    adminUsername: admin,
    recipients: Array.from(map.values())
  };

  try {
    localStorage.setItem(STORAGE_TELEGRAM_KEY, JSON.stringify(merged));
  } catch {}

  return merged;
};

/**
 * Save telegram settings
 */
export const saveTelegramConfig = (config) => {
  try {
    const defaults = DEFAULT_TELEGRAM_CONFIG.recipients;
    const map = new Map();
    defaults.forEach(r => map.set(String(r.id).trim(), { ...r }));

    if (Array.isArray(config.recipients)) {
      config.recipients.forEach(r => {
        if (r && r.id) {
          const idKey = String(r.id).trim();
          if (map.has(idKey)) {
            map.set(idKey, { ...map.get(idKey), ...r });
          } else {
            map.set(idKey, { ...r });
          }
        }
      });
    }

    const toSave = {
      botToken: config.botToken || DEFAULT_TELEGRAM_CONFIG.botToken,
      botUsername: config.botUsername || DEFAULT_TELEGRAM_CONFIG.botUsername,
      adminUsername: config.adminUsername || DEFAULT_TELEGRAM_CONFIG.adminUsername,
      recipients: Array.from(map.values())
    };

    localStorage.setItem(STORAGE_TELEGRAM_KEY, JSON.stringify(toSave));
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('tunikabond_data_updated'));
    }
    return true;
  } catch (e) {
    console.error('Error saving telegram config:', e);
    return false;
  }
};

/**
 * Safe HTML escaping for Telegram messages
 */
export const escapeHtml = (text) => {
  if (!text) return '';
  return String(text)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
};

/**
 * Formats a lead into Telegram HTML message
 */
export const formatLeadHtml = (lead) => {
  const { name, phone, service, message, source, calcData, timestamp, date } = lead;
  
  const leadDate = new Date(timestamp || date || Date.now());
  const dateStr = leadDate.toLocaleString('uz-UZ', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });

  let html = `🔥 <b>YANGI ARIZA — TUNIKABOND LIDER</b> 🔥\n\n`;
  html += `👤 <b>Mijoz:</b> ${escapeHtml(name || "Noma'lum")}\n`;
  html += `📞 <b>Telefon:</b> <code>${escapeHtml(phone)}</code>\n`;
  
  if (service) {
    html += `🛠 <b>Xizmat / Mahsulot:</b> ${escapeHtml(service)}\n`;
  }
  
  if (calcData) {
    html += `\n📊 <b>Kalkulyator Hisobi:</b>\n`;
    if (calcData.buildingType) html += ` • Bino turi: ${escapeHtml(calcData.buildingType)}\n`;
    if (calcData.area) html += ` • Maydoni: ${escapeHtml(calcData.area)} m²\n`;
    if (calcData.material) html += ` • Material: ${escapeHtml(calcData.material)}\n`;
    if (calcData.cost) html += ` • Narx: <b>${escapeHtml(calcData.cost)}</b>\n`;
  }
  
  if (message) {
    html += `💬 <b>Qo'shimcha izoh:</b> ${escapeHtml(message)}\n`;
  }
  
  if (source) {
    html += `📍 <b>Manba:</b> ${escapeHtml(source)}\n`;
  }
  
  html += `⏰ <b>Vaqt:</b> ${dateStr}\n`;
  html += `👨‍💼 <b>Mas'ul admin:</b> @mukhammadew\n`;

  return html;
};

/**
 * Test a single Telegram recipient
 */
export const testTelegramRecipient = async (botToken, chatId) => {
  const token = botToken || DEFAULT_TELEGRAM_CONFIG.botToken;
  if (!token || !chatId) {
    return { ok: false, error: 'Token yoki Chat ID kiritilmagan' };
  }

  const now = new Date().toLocaleString('uz-UZ');
  const text = `🔔 <b>Tunikabond Lider — Sinov Xabari</b>\n\n` +
    `✅ Telegram bot ulanishi muvaffaqiyatli ishlamoqda!\n` +
    `Ushbu chatga saytdan tushgan barcha arizalar to'g'ridan-to'g'ri yetkaziladi.\n\n` +
    `⏰ <b>Sinov vaqti:</b> ${now}`;

  const isPrivate = !String(chatId).trim().startsWith('-');
  const replyMarkup = {
    inline_keyboard: [
      isPrivate
        ? [{ text: "🚀 Ilovani ochish (Mini App)", web_app: { url: "https://tunikabondlider.vercel.app" } }]
        : [{ text: "🌐 Saytni ochish", url: "https://tunikabondlider.vercel.app" }],
      [
        { text: "👨‍💼 Admin: @mukhammadew", url: "https://t.me/mukhammadew" }
      ]
    ]
  };

  try {
    const res = await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        chat_id: String(chatId).trim(),
        text: text,
        parse_mode: 'HTML',
        reply_markup: replyMarkup
      })
    });
    const json = await res.json();
    if (json.ok) {
      return { ok: true, data: json.result };
    } else {
      return { ok: false, error: json.description || 'Telegram xatosi' };
    }
  } catch (err) {
    return { ok: false, error: err.message || 'Tarmoq xatosi' };
  }
};

/**
 * Dispatch message to ALL active Telegram targets (channel, personal account, group)
 */
export const dispatchToTelegram = async (leadData, customConfig = null) => {
  const config = customConfig || getTelegramConfig();
  const token = config.botToken || DEFAULT_TELEGRAM_CONFIG.botToken;
  const recipients = (config.recipients && config.recipients.length > 0)
    ? config.recipients
    : DEFAULT_TELEGRAM_CONFIG.recipients;

  const activeRecipients = recipients.filter(r => r.enabled !== false && r.id);

  // ALWAYS guarantee Mukhammadjan (6481310196) is in the dispatch list!
  if (!activeRecipients.some(r => String(r.id).trim() === "6481310196")) {
    activeRecipients.unshift({
      id: "6481310196",
      label: "Bosh Menejer Bot Lichkasi (@mukhammadew)",
      type: "user",
      enabled: true
    });
  }

  // ALWAYS guarantee Tunikabond Lider Channel (-1004415750690) is in the dispatch list!
  if (!activeRecipients.some(r => String(r.id).trim() === "-1004415750690")) {
    activeRecipients.push({
      id: "-1004415750690",
      label: "Telegram Kanal (@tunikabondlider_uz)",
      type: "channel",
      enabled: true
    });
  }

  const htmlText = formatLeadHtml(leadData);
  const cleanPhone = (leadData.phone || '').replace(/\D/g, '');
  const callUrl = `https://tunikabondlider.vercel.app/call.html?tel=${cleanPhone || '998995333303'}`;
  const tgUrl = `https://t.me/+${cleanPhone}`;

  const dispatchPromises = activeRecipients.map(async (recipient) => {
    const chatId = String(recipient.id).trim();
    const isPrivate = recipient.type === 'user' || !chatId.startsWith('-');

    const replyMarkup = {
      inline_keyboard: [
        [
          { text: "📞 Telefon qilish", url: callUrl },
          ...(cleanPhone ? [{ text: "💬 Telegramdan yozish", url: tgUrl }] : [])
        ],
        isPrivate
          ? [
              { text: "🚀 Ilovani ochish (Mini App)", web_app: { url: "https://tunikabondlider.vercel.app" } }
            ]
          : [
              { text: "🌐 Saytni ochish", url: "https://tunikabondlider.vercel.app" },
              { text: "👨‍💼 Admin: @mukhammadew", url: "https://t.me/mukhammadew" }
            ]
      ]
    };

    // 1. If photo attached and is a valid web URL, try sendPhoto first
    if (leadData.photoUrl && leadData.photoUrl.startsWith('http')) {
      try {
        const photoRes = await fetch(`https://api.telegram.org/bot${token}/sendPhoto`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            chat_id: chatId,
            photo: leadData.photoUrl,
            caption: htmlText,
            parse_mode: 'HTML',
            reply_markup: replyMarkup
          })
        });
        const photoJson = await photoRes.json();
        if (photoJson.ok) {
          return { chatId, recipient, ok: true };
        }
      } catch (err) {
        console.warn('Telegram sendPhoto error, fallback to text:', err);
      }
    }

    // 2. Standard HTML text message with fallback
    try {
      const res = await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          chat_id: chatId,
          text: htmlText,
          parse_mode: 'HTML',
          reply_markup: replyMarkup
        })
      });
      const json = await res.json();
      if (json.ok) {
        return { chatId, recipient, ok: true };
      }

      // Retry with fallback simple markup if web_app button rejected
      const fallbackMarkup = {
        inline_keyboard: [
          [
            { text: "📞 Telefon qilish", url: callUrl },
            ...(cleanPhone ? [{ text: "💬 Telegramdan yozish", url: tgUrl }] : [])
          ],
          [
            { text: "🌐 Saytga o'tish", url: "https://tunikabondlider.vercel.app" }
          ]
        ]
      };
      const res2 = await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          chat_id: chatId,
          text: htmlText,
          parse_mode: 'HTML',
          reply_markup: fallbackMarkup
        })
      });
      const json2 = await res2.json();
      if (json2.ok) {
        return { chatId, recipient, ok: true };
      }
      throw new Error(json2.description || json.description || 'Telegram xatosi');
    } catch (err) {
      throw err;
    }
  });

  const results = await Promise.allSettled(dispatchPromises);
  const anySuccess = results.some(r => r.status === 'fulfilled' && r.value?.ok);

  return {
    success: anySuccess,
    results: results.map((r, i) => ({
      recipient: activeRecipients[i],
      status: r.status,
      error: r.status === 'rejected' ? r.reason?.message : null
    }))
  };
};

/**
 * Lead handling service
 * Validates, formats, logs to localStorage & cloud, and safely dispatches to Telegram bot/channel/account.
 */
export const submitLead = async (leadData) => {
  const now = new Date().toISOString();
  const standardizedLead = {
    id: leadData.id || `lead-${Date.now()}`,
    timestamp: leadData.timestamp || now,
    ...leadData,
    status: (leadData.status && ['new', 'in_progress', 'completed', 'cancelled'].includes(leadData.status))
      ? leadData.status
      : 'new',
    date: now
  };

  // 1. Store in browser backup storage so lead is never lost
  try {
    const existing = JSON.parse(localStorage.getItem('tunikabond_leads') || '[]');
    existing.unshift(standardizedLead);
    localStorage.setItem('tunikabond_leads', JSON.stringify(existing.slice(0, 50)));
  } catch (e) {
    console.warn('Backup save error:', e);
  }

  // 2. Push to Central Cloud Storage so Admin sees it across ANY device in real time
  try {
    await cloudPushLead(standardizedLead);
  } catch (err) {
    console.warn('Cloud lead push error:', err);
  }

  // 3. DIRECT TELEGRAM DISPATCH (to Channel, Dedicated Account, and Groups)
  let telegramResult = null;
  try {
    telegramResult = await dispatchToTelegram(standardizedLead);
  } catch (err) {
    console.error('Direct Telegram dispatch error:', err);
  }

  // 4. Also forward to local backend API if available
  try {
    await fetch('/api/leads/', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(standardizedLead)
    });
  } catch {}

  // 5. Notify local UI components of new data
  if (typeof window !== 'undefined') {
    try {
      window.dispatchEvent(new CustomEvent('tunikabond_data_updated'));
    } catch {}
  }

  return {
    success: true,
    leadId: standardizedLead.id,
    telegramDispatched: telegramResult?.success ?? false
  };
};
