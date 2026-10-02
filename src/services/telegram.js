import { cloudPushLead } from './api.js';

/**
 * Telegram Notification & Lead Dispatch Service
 * Sends leads to Telegram channel, dedicated personal account, and any configured recipients.
 */

export const STORAGE_TELEGRAM_KEY = 'tunikabond_telegram_config';

export const DEFAULT_TELEGRAM_CONFIG = {
  botToken: "8160493029:AAHA2wWKlaSR__UTzByJtLt24rWXtsxV3c4",
  botUsername: "tunikabondlider_bot",
  adminUsername: "Mukhammad_azez",
  recipients: [
    {
      id: "-1003209002534",
      label: "Telegram Kanal (Tunikabond Lider)",
      type: "channel",
      enabled: true
    },
    {
      id: "1003939636",
      label: "Alohida Arizalar Akkounti (@Mukhammad_azez)",
      type: "user",
      enabled: true
    }
  ]
};

/**
 * Retrieve active telegram settings (from localStorage or defaults)
 */
export const getTelegramConfig = () => {
  try {
    const saved = localStorage.getItem(STORAGE_TELEGRAM_KEY);
    if (saved) {
      const parsed = JSON.parse(saved);
      return {
        botToken: parsed.botToken || DEFAULT_TELEGRAM_CONFIG.botToken,
        botUsername: parsed.botUsername || DEFAULT_TELEGRAM_CONFIG.botUsername,
        adminUsername: parsed.adminUsername || DEFAULT_TELEGRAM_CONFIG.adminUsername,
        recipients: Array.isArray(parsed.recipients) && parsed.recipients.length > 0
          ? parsed.recipients
          : DEFAULT_TELEGRAM_CONFIG.recipients
      };
    }
  } catch (e) {
    console.warn('Error reading telegram config:', e);
  }
  return DEFAULT_TELEGRAM_CONFIG;
};

/**
 * Save telegram settings
 */
export const saveTelegramConfig = (config) => {
  try {
    const toSave = {
      botToken: config.botToken || DEFAULT_TELEGRAM_CONFIG.botToken,
      botUsername: config.botUsername || DEFAULT_TELEGRAM_CONFIG.botUsername,
      adminUsername: config.adminUsername || DEFAULT_TELEGRAM_CONFIG.adminUsername,
      recipients: Array.isArray(config.recipients) ? config.recipients : DEFAULT_TELEGRAM_CONFIG.recipients
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
  html += `👨‍💼 <b>Mas'ul admin:</b> @Mukhammad_azez\n`;

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

  const replyMarkup = {
    inline_keyboard: [
      [
        { text: "👨‍💼 Admin: @Mukhammad_azez", url: "https://t.me/Mukhammad_azez" },
        { text: "🌐 Saytga o'tish", url: "https://tunikabondlider.uz" }
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

  if (!token || activeRecipients.length === 0) {
    return { success: false, error: "Telegram qabul qiluvchilar sozlanmagan" };
  }

  const htmlText = formatLeadHtml(leadData);
  const cleanPhone = (leadData.phone || '').replace(/\D/g, '');

  const replyMarkup = {
    inline_keyboard: [
      [
        ...(cleanPhone ? [{ text: "💬 Mijozga yozish", url: `https://t.me/+${cleanPhone}` }] : []),
        { text: "👨‍💼 Mas'ul: @Mukhammad_azez", url: "https://t.me/Mukhammad_azez" }
      ],
      [
        { text: "🌐 Tunikabond Lider Sayti", url: "https://tunikabondlider.uz" }
      ]
    ]
  };

  const dispatchPromises = activeRecipients.map(async (recipient) => {
    const chatId = String(recipient.id).trim();

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

    // 2. Standard HTML text message
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
    } else {
      throw new Error(json.description || 'Telegram xatosi');
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
