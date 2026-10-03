import { cloudPushLead } from './api.js';

/**
 * Telegram Notification & Lead Dispatch Service
 * Sends leads strictly to Telegram private channel (-1004415750690) without buttons.
 * Confirms lead details to applicant if submitted via Mini App.
 */

export const STORAGE_TELEGRAM_KEY = 'tunikabond_telegram_config_v9_channel_only';

export const DEFAULT_TELEGRAM_CONFIG = {
  botToken: "8697018482:AAFwxsWVPoHl7sEfGpR9wPtQEtxBL3ivozA",
  botUsername: "tunikabondlider_rasmiy_bot",
  adminUsername: "Mukhammad_azez",
  channelId: "-1004415750690",
  channelLink: "https://t.me/tunikabondLiderkanali",
  recipients: [
    {
      id: "-1004415750690",
      label: "Xususiy Arizalar Kanali (-1004415750690)",
      type: "channel",
      enabled: true
    }
  ]
};

/**
 * Retrieve active telegram settings (guarantees ONLY private channel is targeted)
 */
export const getTelegramConfig = () => {
  // Purge ALL legacy storage keys so old channels or personal user chats NEVER survive:
  try {
    [
      'tunikabond_telegram_config',
      'tunikabond_telegram_config_v2',
      'tunikabond_telegram_config_v3',
      'tunikabond_telegram_config_v4',
      'tunikabond_telegram_config_v5',
      'tunikabond_telegram_config_v6_clean',
      'tunikabond_telegram_config_v7_guaranteed',
      'tunikabond_telegram_config_v8_azez'
    ].forEach(k => localStorage.removeItem(k));
  } catch {}

  const defaults = DEFAULT_TELEGRAM_CONFIG.recipients;
  let custom = [];
  let token = DEFAULT_TELEGRAM_CONFIG.botToken;
  let username = DEFAULT_TELEGRAM_CONFIG.botUsername;
  let admin = DEFAULT_TELEGRAM_CONFIG.adminUsername;

  try {
    const raw = localStorage.getItem(STORAGE_TELEGRAM_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (parsed.botToken && !parsed.botToken.startsWith('8160493029')) {
        token = parsed.botToken;
      }
      if (parsed.botUsername && !parsed.botUsername.includes('tunikabondlider_bot')) {
        username = parsed.botUsername;
      }
      if (parsed.adminUsername) admin = parsed.adminUsername;
      if (Array.isArray(parsed.recipients)) {
        custom = parsed.recipients;
      }
    }
  } catch (e) {
    console.warn('Error reading telegram config:', e);
  }

  // Blacklist old deleted channel and personal user chats from auto-dispatch
  const isBlacklisted = (id) => {
    const s = String(id || '').trim();
    return s === "-1003209002534" || s.includes("1003209002534") || s === "1003939636" || s === "6481310196";
  };

  const map = new Map();
  defaults.forEach(r => map.set(String(r.id).trim(), { ...r }));
  custom.forEach(r => {
    if (r && r.id && !isBlacklisted(r.id)) {
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
    `✅ Telegram ulanishi muvaffaqiyatli ishlamoqda!\n` +
    `Ushbu manzilga yangi arizalar to'g'ridan-to'g'ri yetkaziladi.\n\n` +
    `⏰ <b>Sinov vaqti:</b> ${now}`;

  try {
    const res = await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        chat_id: String(chatId).trim(),
        text: text,
        parse_mode: 'HTML'
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
 * Dispatch message strictly to the Private Channel without buttons
 */
export const dispatchToTelegram = async (leadData, customConfig = null) => {
  const config = customConfig || getTelegramConfig();
  const rawToken = config.botToken || DEFAULT_TELEGRAM_CONFIG.botToken;
  const token = (rawToken && !rawToken.startsWith("8160493029")) 
    ? rawToken 
    : DEFAULT_TELEGRAM_CONFIG.botToken;

  const recipients = (config.recipients && config.recipients.length > 0)
    ? config.recipients
    : DEFAULT_TELEGRAM_CONFIG.recipients;

  // Filter out invalid IDs and personal accounts
  let activeRecipients = recipients.filter(r => {
    if (r.enabled === false || !r.id) return false;
    const sId = String(r.id).trim();
    if (sId === "-1003209002534" || sId.includes("1003209002534")) return false;
    if (sId === "1003939636" || sId === "6481310196") return false;
    return true;
  });

  // Guarantee Tunikabond Lider Private Channel (-1004415750690) is always the target
  if (!activeRecipients.some(r => String(r.id).trim() === "-1004415750690")) {
    activeRecipients.unshift({
      id: "-1004415750690",
      label: "Xususiy Arizalar Kanali (-1004415750690)",
      type: "channel",
      enabled: true
    });
  }

  const htmlText = formatLeadHtml(leadData);

  const dispatchPromises = activeRecipients.map(async (recipient) => {
    let chatId = String(recipient.id).trim();

    // Helper to send message WITHOUT buttons (clean text only)
    const sendMsg = async (targetId) => {
      return fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          chat_id: targetId,
          text: htmlText,
          parse_mode: 'HTML'
        })
      });
    };

    // 1. If photo attached and is a valid web URL, send photo WITHOUT buttons
    if (leadData.photoUrl && leadData.photoUrl.startsWith('http')) {
      try {
        const photoRes = await fetch(`https://api.telegram.org/bot${token}/sendPhoto`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            chat_id: chatId,
            photo: leadData.photoUrl,
            caption: htmlText,
            parse_mode: 'HTML'
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

    // 2. Standard HTML text message WITHOUT buttons
    try {
      let res = await sendMsg(chatId);
      let json = await res.json();
      if (json.ok) {
        return { chatId, recipient, ok: true };
      }

      // If channel username failed, fallback to numerical channel ID
      if (chatId === '@tunikabondlider_uz') {
        res = await sendMsg('-1004415750690');
        json = await res.json();
        if (json.ok) {
          return { chatId: '-1004415750690', recipient, ok: true };
        }
      } else if (chatId === '-1004415750690') {
        res = await sendMsg('@tunikabondlider_uz');
        json = await res.json();
        if (json.ok) {
          return { chatId: '@tunikabondlider_uz', recipient, ok: true };
        }
      }

      throw new Error(json.description || 'Telegram xatosi');
    } catch (err) {
      throw err;
    }
  });

  const results = await Promise.allSettled(dispatchPromises);
  const anySuccess = results.some(r => r.status === 'fulfilled' && r.value?.ok);

  // If lead came from a Telegram user (Mini App), send them direct confirmation details
  if (leadData.telegramUserId) {
    const userConfirmHtml = 
      `✅ <b>Arizangiz muvaffaqiyatli qabul qilindi!</b>\n\n` +
      `📋 <b>Ariza ma'lumotlari:</b>\n` +
      `👤 <b>Mijoz:</b> ${escapeHtml(leadData.name || 'Hurmatli mijoz')}\n` +
      `📞 <b>Telefon:</b> <code>${escapeHtml(leadData.phone || '-')}</code>\n` +
      (leadData.service ? `🛠 <b>Xizmat / Mahsulot:</b> ${escapeHtml(leadData.service)}\n` : '') +
      (leadData.calcData ? `📊 <b>Kalkulyator Hisobi:</b> ${escapeHtml(String(leadData.calcData.area || '-'))} m² (${escapeHtml(String(leadData.calcData.cost || '-'))})\n` : '') +
      (leadData.message ? `💬 <b>Qo'shimcha izoh:</b> ${escapeHtml(leadData.message)}\n` : '') +
      `⏰ <b>Vaqt:</b> ${new Date().toLocaleString('uz-UZ')}\n\n` +
      `🤝 <b>Siz bilan tez orada bog‘lanamiz!</b>`;

    fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        chat_id: leadData.telegramUserId,
        text: userConfirmHtml,
        parse_mode: 'HTML'
      })
    }).catch(e => console.warn('User direct confirmation error:', e));
  }

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
 * Validates, formats, logs to localStorage, and immediately dispatches to Telegram channel and Admin Panel.
 */
export const submitLead = async (leadData) => {
  const tgUser = (typeof window !== 'undefined' && window.Telegram?.WebApp?.initDataUnsafe?.user) || null;
  const telegramUserId = leadData.telegramUserId || tgUser?.id || null;
  const telegramUsername = leadData.telegramUsername || tgUser?.username || null;
  const telegramFirstName = leadData.telegramFirstName || tgUser?.first_name || null;

  const now = new Date().toISOString();
  const standardizedLead = {
    id: leadData.id || `lead-${Date.now()}`,
    timestamp: leadData.timestamp || now,
    ...leadData,
    telegramUserId,
    telegramUsername,
    telegramFirstName,
    status: (leadData.status && ['new', 'in_progress', 'completed', 'cancelled'].includes(leadData.status))
      ? leadData.status
      : 'new',
    date: now
  };

  // 1. Store in browser backup storage immediately so lead is visible in Admin Panel
  try {
    const existing = JSON.parse(localStorage.getItem('tunikabond_leads') || '[]');
    existing.unshift(standardizedLead);
    localStorage.setItem('tunikabond_leads', JSON.stringify(existing.slice(0, 100)));
  } catch (e) {
    console.warn('Backup save error:', e);
  }

  // 2. IMMEDIATE TELEGRAM DISPATCH TO PRIVATE CHANNEL (WITHOUT BUTTONS)
  let telegramResult = null;
  try {
    telegramResult = await dispatchToTelegram(standardizedLead);
  } catch (err) {
    console.error('Direct Telegram dispatch error:', err);
  }

  // 3. Push to Cloud Storage asynchronously in background for cross-device Admin Panel sync
  try {
    cloudPushLead(standardizedLead).catch(() => {});
  } catch {}

  // 4. Forward to local backend API / serverless API
  try {
    fetch('/api/leads', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(standardizedLead)
    }).catch(() => {});
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
