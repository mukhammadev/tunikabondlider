/**
 * Vercel Serverless Function: /api/bot
 * Webhook handler for Telegram Bot (@tunikabondlider_rasmiy_bot)
 * Handles /start, greeting, Mini App guidance, and user messages
 * 
 * Rules:
 * 1. Leads from bot go ONLY to the private channel (-1004415750690), NOT to bot/personal chats.
 * 2. Applicant receives confirmation details ("Siz bilan tez orada bog'lanamiz").
 * 3. Channel messages have NO buttons (reply_markup is omitted).
 * 4. Leads are synchronized with Admin Panel.
 */

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  // Health check / GET
  if (req.method === 'GET') {
    return res.status(200).json({ status: "ok", bot: "@tunikabondlider_rasmiy_bot" });
  }

  const BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN || "8697018482:AAFwxsWVPoHl7sEfGpR9wPtQEtxBL3ivozA";
  const CHANNEL_ID = process.env.TELEGRAM_CHANNEL_ID || "-1004415750690";
  const CLOUD_LEADS_URL = "https://api.restful-api.dev/objects/ff808181a09d98f701a0fc19c245604c";

  const update = req.body || {};
  const message = update.message;

  if (!message || !message.chat) {
    return res.status(200).json({ ok: true });
  }

  const chatId = message.chat.id;
  const text = (message.text || '').trim();
  const firstName = message.from?.first_name || 'Hurmatli mijoz';
  const username = message.from?.username ? `@${message.from.username}` : '';

  // Helper: send message to Telegram
  const sendMessage = async (targetChatId, msgText, markup = null) => {
    try {
      const payload = {
        chat_id: targetChatId,
        text: msgText,
        parse_mode: 'HTML'
      };
      if (markup) {
        payload.reply_markup = markup;
      }
      await fetch(`https://api.telegram.org/bot${BOT_TOKEN}/sendMessage`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
    } catch (e) {
      console.warn("sendMessage error:", e);
    }
  };

  // Helper: sync lead to Admin Panel (both serverless API & cloud store)
  const syncLeadToAdminPanel = async (leadRecord) => {
    try {
      // 1. Post to Vercel serverless /api/leads
      fetch('https://tunikabondlider.vercel.app/api/leads', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(leadRecord)
      }).catch(() => {});
    } catch {}

    try {
      // 2. Sync to cloud leads store if accessible
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
    } catch (err) {
      console.warn("Cloud sync warning:", err);
    }
  };

  // 1. User sends /start
  if (text.startsWith('/start')) {
    const welcomeHtml = 
      `Assalomu alaykum, <b>${escapeHtml(firstName)}</b>! 🏢✨\n\n` +
      `<b>TUNIKABOND LIDER</b> rasmiy botiga xush kelibsiz!\n\n` +
      `Biz fasad va tom yopish sohasida yuqori sifatli xizmatlarni taqdim etamiz:\n` +
      `🔹 <b>Tunikabond & Alyukabond</b> fasad panellari\n` +
      `🔹 <b>Karnizlar, Naves va Profnastil</b> o‘rnatish\n` +
      `🔹 <b>Katta ranglar palitrasi</b> va individual hisob-kitob\n\n` +
      `📱 <b>Ariza qoldirish va narxlarni hisoblash:</b>\n` +
      `Quyidagi <b>«🚀 Ilovani ochish»</b> tugmasini bosib, barcha ishlarimizni ko‘rishingiz va o‘zingizga mos xizmat uchun bepul konsultatsiyaga ariza qoldirishingiz mumkin! 👇`;

    const inlineMarkup = {
      inline_keyboard: [
        [
          {
            text: "🚀 Ilovani ochish (Ariza qoldirish)",
            web_app: { url: "https://tunikabondlider.vercel.app" }
          }
        ],
        [
          {
            text: "🌐 Rasmiy sayt",
            url: "https://tunikabondlider.vercel.app"
          },
          {
            text: "📢 Rasmiy Kanal",
            url: "https://t.me/tunikabondLiderkanali"
          }
        ],
        [
          {
            text: "📞 Qo‘ng‘iroq qilish",
            url: "https://tunikabondlider.vercel.app/call.html?tel=998995333303"
          },
          {
            text: "👨‍💼 Admin: @Mukhammad_azez",
            url: "https://t.me/Mukhammad_azez"
          }
        ]
      ]
    };

    await sendMessage(chatId, welcomeHtml, inlineMarkup);
    return res.status(200).json({ ok: true });
  }

  // 2. User submits via Telegram WebApp Data (Mini App)
  const webAppDataRaw = message.web_app_data?.data;
  if (webAppDataRaw) {
    let lead = {};
    try {
      lead = JSON.parse(webAppDataRaw);
    } catch {
      lead = { message: webAppDataRaw };
    }

    const leadName = lead.name || firstName;
    const leadPhone = lead.phone || '';
    const leadService = lead.service || lead.product || 'Tunikabond xizmatlari';
    const leadCalc = lead.calcData;
    const leadMsg = lead.message || '';

    // A) Send confirmation only to the applicant with their data
    const userConfirmHtml = 
      `✅ <b>Arizangiz muvaffaqiyatli qabul qilindi!</b>\n\n` +
      `📋 <b>Ariza ma'lumotlari:</b>\n` +
      `👤 <b>Mijoz:</b> ${escapeHtml(leadName)}\n` +
      (leadPhone ? `📞 <b>Telefon:</b> <code>${escapeHtml(leadPhone)}</code>\n` : '') +
      `🛠 <b>Xizmat / Mahsulot:</b> ${escapeHtml(leadService)}\n` +
      (leadCalc ? `📊 <b>Kalkulyator hisobi:</b> ${escapeHtml(String(leadCalc.area || '-'))} m² (${escapeHtml(String(leadCalc.cost || '-'))})\n` : '') +
      (leadMsg ? `💬 <b>Qo'shimcha izoh:</b> ${escapeHtml(leadMsg)}\n` : '') +
      `⏰ <b>Vaqt:</b> ${new Date().toLocaleString('uz-UZ')}\n\n` +
      `🤝 <b>Siz bilan tez orada bog‘lanamiz!</b>`;

    await sendMessage(chatId, userConfirmHtml);

    // B) Forward lead ONLY to Private Channel WITHOUT buttons
    const leadNotification = 
      `🔥 <b>YANGI ARIZA (Mini App orqali)</b> 🔥\n\n` +
      `👤 <b>Mijoz:</b> ${escapeHtml(leadName)}\n` +
      `📞 <b>Telefon:</b> <code>${escapeHtml(leadPhone || '-')}</code>\n` +
      `🛠 <b>Xizmat:</b> ${escapeHtml(leadService)}\n` +
      (leadCalc ? `📊 <b>Kalkulyator:</b> ${escapeHtml(String(leadCalc.area || '-'))} m² (${escapeHtml(String(leadCalc.cost || '-'))})\n` : '') +
      (leadMsg ? `💬 <b>Izoh:</b> ${escapeHtml(leadMsg)}\n` : '') +
      `🆔 <b>Telegram ID:</b> <code>${chatId}</code> ${username ? `(${username})` : ''}\n` +
      `📍 <b>Manba:</b> Telegram Mini App\n` +
      `⏰ <b>Vaqt:</b> ${new Date().toLocaleString('uz-UZ')}\n` +
      `👨‍💼 <b>Mas'ul admin:</b> @Mukhammad_azez`;

    await sendMessage(CHANNEL_ID, leadNotification, null);

    // C) Sync to Admin Panel
    syncLeadToAdminPanel({
      id: `tg-miniapp-${chatId}-${Date.now()}`,
      name: leadName,
      phone: leadPhone,
      service: leadService,
      message: leadMsg,
      source: "Telegram Mini App",
      calcData: leadCalc || null,
      telegramUserId: chatId,
      timestamp: new Date().toISOString(),
      status: "new"
    });

    return res.status(200).json({ ok: true });
  }

  // 3. User shares contact via Telegram contact button
  const contactPhone = message.contact?.phone_number || '';
  if (contactPhone) {
    const contactName = [message.contact?.first_name, message.contact?.last_name].filter(Boolean).join(' ') || firstName;
    const formattedPhone = contactPhone.startsWith('+') ? contactPhone : `+${contactPhone}`;

    // A) Send confirmation only to the applicant
    const userConfirmHtml = 
      `✅ <b>Arizangiz muvaffaqiyatli qabul qilindi!</b>\n\n` +
      `📋 <b>Ariza ma'lumotlari:</b>\n` +
      `👤 <b>Mijoz:</b> ${escapeHtml(contactName)}\n` +
      `📞 <b>Telefon:</b> <code>${escapeHtml(formattedPhone)}</code>\n` +
      `🛠 <b>Xizmat:</b> Bepul konsultatsiya va o‘lchash\n` +
      `⏰ <b>Vaqt:</b> ${new Date().toLocaleString('uz-UZ')}\n\n` +
      `🤝 <b>Siz bilan tez orada bog‘lanamiz!</b>`;

    await sendMessage(chatId, userConfirmHtml);

    // B) Forward ONLY to Private Channel WITHOUT buttons
    const adminNotification = 
      `🔥 <b>YANGI ARIZA (Kontakt ulashildi)</b> 🔥\n\n` +
      `👤 <b>Mijoz:</b> ${escapeHtml(contactName)} ${username ? `(${username})` : ''}\n` +
      `📞 <b>Telefon:</b> <code>${formattedPhone}</code>\n` +
      `🆔 <b>Chat ID:</b> <code>${chatId}</code>\n` +
      `📍 <b>Manba:</b> Telegram Bot Kontakt\n` +
      `⏰ <b>Vaqt:</b> ${new Date().toLocaleString('uz-UZ')}\n` +
      `👨‍💼 <b>Mas'ul admin:</b> @Mukhammad_azez`;

    await sendMessage(CHANNEL_ID, adminNotification, null);

    // C) Sync to Admin Panel
    syncLeadToAdminPanel({
      id: `tg-contact-${chatId}-${Date.now()}`,
      name: contactName,
      phone: formattedPhone,
      service: "Bepul konsultatsiya va o‘lchash",
      message: "Kontakt orqali yuborilgan ariza",
      source: "Telegram Bot Kontakt",
      telegramUserId: chatId,
      timestamp: new Date().toISOString(),
      status: "new"
    });

    return res.status(200).json({ ok: true });
  }

  // 4. User sends a text message or phone number
  if (text && !text.startsWith('/')) {
    const phoneMatch = text.match(/(?:\+?998[\s-]?)?[0-9]{2}[\s-]?[0-9]{3}[\s-]?[0-9]{2}[\s-]?[0-9]{2}|[0-9]{9,12}/);
    const extractedPhone = phoneMatch ? phoneMatch[0] : '';

    // A) Send confirmation only to the applicant
    const userConfirmHtml = 
      `✅ <b>Arizangiz muvaffaqiyatli qabul qilindi!</b>\n\n` +
      `📋 <b>Ariza ma'lumotlari:</b>\n` +
      `👤 <b>Mijoz:</b> ${escapeHtml(firstName)} ${username ? `(${escapeHtml(username)})` : ''}\n` +
      (extractedPhone ? `📞 <b>Telefon:</b> <code>${escapeHtml(extractedPhone)}</code>\n` : '') +
      `💬 <b>Murojaat mazmuni:</b> ${escapeHtml(text)}\n` +
      `⏰ <b>Vaqt:</b> ${new Date().toLocaleString('uz-UZ')}\n\n` +
      `🤝 <b>Siz bilan tez orada bog‘lanamiz!</b>`;

    await sendMessage(chatId, userConfirmHtml);

    // B) Forward ONLY to Private Channel WITHOUT buttons
    const adminNotification = 
      `💬 <b>YANGI MUROJAAT (Telegram Bot)</b>\n\n` +
      `👤 <b>Foydalanuvchi:</b> ${escapeHtml(firstName)} ${username ? `(${username})` : ''}\n` +
      (extractedPhone ? `📞 <b>Telefon:</b> <code>${extractedPhone}</code>\n` : '') +
      `🆔 <b>Chat ID:</b> <code>${chatId}</code>\n` +
      `💬 <b>Xabar:</b> ${escapeHtml(text)}\n` +
      `📍 <b>Manba:</b> Telegram Bot Chat\n` +
      `⏰ <b>Vaqt:</b> ${new Date().toLocaleString('uz-UZ')}\n` +
      `👨‍💼 <b>Mas'ul admin:</b> @Mukhammad_azez`;

    await sendMessage(CHANNEL_ID, adminNotification, null);

    // C) Sync to Admin Panel
    syncLeadToAdminPanel({
      id: `tg-msg-${chatId}-${Date.now()}`,
      name: firstName,
      phone: extractedPhone || (username || `ID: ${chatId}`),
      service: "Telegram Bot Murojaati",
      message: text,
      source: username ? `Telegram Bot (${username})` : `Telegram Bot (${chatId})`,
      telegramUserId: chatId,
      timestamp: new Date().toISOString(),
      status: "new"
    });

    return res.status(200).json({ ok: true });
  }

  return res.status(200).json({ ok: true });
}

function escapeHtml(text) {
  if (!text) return '';
  return String(text)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}
