/**
 * Vercel Serverless Function: /api/bot
 * Webhook handler for Telegram Bot (@tunikabondlider_rasmiy_bot)
 * Handles /start, greeting, Mini App guidance, and user messages
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
  const ADMIN_ID = process.env.TELEGRAM_ADMIN_ID || "1003939636"; // @Mukhammad_azez
  const OWNER_ID = "6481310196"; // @mukhammadew
  const CHANNEL_ID = process.env.TELEGRAM_CHANNEL_ID || "-1004415750690";

  const update = req.body || {};
  const message = update.message;

  if (!message || !message.chat) {
    return res.status(200).json({ ok: true });
  }

  const chatId = message.chat.id;
  const text = (message.text || '').trim();
  const firstName = message.from?.first_name || 'Hurmatli mijoz';
  const username = message.from?.username ? `@${message.from.username}` : '';

  // Helper: send message
  const sendMessage = async (targetChatId, msgText, markup = null) => {
    try {
      await fetch(`https://api.telegram.org/bot${BOT_TOKEN}/sendMessage`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          chat_id: targetChatId,
          text: msgText,
          parse_mode: 'HTML',
          reply_markup: markup
        })
      });
    } catch (e) {
      console.warn("sendMessage error:", e);
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

  // Helper buttons for user confirmation responses
  const userConfirmMarkup = {
    inline_keyboard: [
      [
        {
          text: "🚀 Ilovani ochish (Katalog & Narxlar)",
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
          text: "👨‍💼 Admin: @Mukhammad_azez",
          url: "https://t.me/Mukhammad_azez"
        }
      ]
    ]
  };

  // 2. User submits via Telegram WebApp Data (Mini App sendData)
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
    const cleanPhone = String(leadPhone).replace(/\D/g, '');
    const callUrl = `https://tunikabondlider.vercel.app/call.html?tel=${cleanPhone || '998995333303'}`;
    const tgUrl = `https://t.me/+${cleanPhone}`;

    // A) Send confirmation to user with application details + "Siz bilan tez orada bog'lanamiz!"
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

    await sendMessage(chatId, userConfirmHtml, userConfirmMarkup);

    // B) Forward lead to Admin, Owner, and Channels
    const leadNotification = 
      `🔥 <b>YANGI ARIZA (Mini App orqali)</b> 🔥\n\n` +
      `👤 <b>Mijoz:</b> ${escapeHtml(leadName)}\n` +
      `📞 <b>Telefon:</b> <code>${escapeHtml(leadPhone || '-')}</code>\n` +
      `🛠 <b>Xizmat:</b> ${escapeHtml(leadService)}\n` +
      (leadCalc ? `📊 <b>Kalkulyator:</b> ${escapeHtml(String(leadCalc.area || '-'))} m² (${escapeHtml(String(leadCalc.cost || '-'))})\n` : '') +
      (leadMsg ? `💬 <b>Izoh:</b> ${escapeHtml(leadMsg)}\n` : '') +
      `🆔 <b>Telegram ID:</b> <code>${chatId}</code> ${username ? `(${username})` : ''}\n` +
      `⏰ <b>Vaqt:</b> ${new Date().toLocaleString('uz-UZ')}\n` +
      `👨‍💼 <b>Mas'ul admin:</b> @Mukhammad_azez`;

    const channelMarkup = {
      inline_keyboard: [
        [
          { text: "📞 Telefon qilish", url: callUrl },
          { text: "💬 Telegramdan yozish", url: "https://t.me/Mukhammad_azez" }
        ],
        [
          { text: "🌐 Rasmiy sayt", url: "https://tunikabondlider.vercel.app" },
          { text: "📢 Rasmiy Kanal", url: "https://t.me/tunikabondLiderkanali" }
        ],
        [
          { text: "👨‍💼 Admin: @Mukhammad_azez", url: "https://t.me/Mukhammad_azez" }
        ]
      ]
    };

    await sendMessage(ADMIN_ID, leadNotification, channelMarkup);
    if (OWNER_ID !== ADMIN_ID) await sendMessage(OWNER_ID, leadNotification, channelMarkup);
    await sendMessage(CHANNEL_ID, leadNotification, channelMarkup);
    await sendMessage("@tunikabondLiderkanali", leadNotification, channelMarkup);

    return res.status(200).json({ ok: true });
  }

  // 3. User shares contact via Telegram contact button
  const contactPhone = message.contact?.phone_number || '';
  if (contactPhone) {
    const contactName = [message.contact?.first_name, message.contact?.last_name].filter(Boolean).join(' ') || firstName;
    const formattedPhone = contactPhone.startsWith('+') ? contactPhone : `+${contactPhone}`;
    const cleanPhone = formattedPhone.replace(/\D/g, '');
    const callUrl = `https://tunikabondlider.vercel.app/call.html?tel=${cleanPhone}`;
    const tgUrl = `https://t.me/+${cleanPhone}`;

    // A) Send confirmation to user with their details + "Siz bilan tez orada bog'lanamiz!"
    const userConfirmHtml = 
      `✅ <b>Arizangiz muvaffaqiyatli qabul qilindi!</b>\n\n` +
      `📋 <b>Ariza ma'lumotlari:</b>\n` +
      `👤 <b>Mijoz:</b> ${escapeHtml(contactName)}\n` +
      `📞 <b>Telefon:</b> <code>${escapeHtml(formattedPhone)}</code>\n` +
      `🛠 <b>Xizmat:</b> Bepul konsultatsiya va o‘lchash\n` +
      `⏰ <b>Vaqt:</b> ${new Date().toLocaleString('uz-UZ')}\n\n` +
      `🤝 <b>Siz bilan tez orada bog‘lanamiz!</b>`;

    await sendMessage(chatId, userConfirmHtml, userConfirmMarkup);

    // B) Forward to Admin, Owner, Channel
    const adminNotification = 
      `🔥 <b>YANGI ARIZA (Kontakt ulashildi)</b> 🔥\n\n` +
      `👤 <b>Mijoz:</b> ${escapeHtml(contactName)} ${username ? `(${username})` : ''}\n` +
      `📞 <b>Telefon:</b> <code>${formattedPhone}</code>\n` +
      `🆔 <b>Chat ID:</b> <code>${chatId}</code>\n` +
      `📍 <b>Manba:</b> Telegram Bot Kontakt\n` +
      `⏰ <b>Vaqt:</b> ${new Date().toLocaleString('uz-UZ')}\n` +
      `👨‍💼 <b>Mas'ul admin:</b> @Mukhammad_azez`;

    const adminMarkup = {
      inline_keyboard: [
        [
          { text: "📞 Telefon qilish", url: callUrl },
          { text: "💬 Telegramdan yozish", url: "https://t.me/Mukhammad_azez" }
        ],
        [
          { text: "🌐 Rasmiy sayt", url: "https://tunikabondlider.vercel.app" },
          { text: "📢 Rasmiy Kanal", url: "https://t.me/tunikabondLiderkanali" }
        ],
        [
          { text: "👨‍💼 Admin: @Mukhammad_azez", url: "https://t.me/Mukhammad_azez" }
        ]
      ]
    };

    await sendMessage(ADMIN_ID, adminNotification, adminMarkup);
    if (OWNER_ID !== ADMIN_ID) await sendMessage(OWNER_ID, adminNotification, adminMarkup);
    await sendMessage(CHANNEL_ID, adminNotification, adminMarkup);
    await sendMessage("@tunikabondLiderkanali", adminNotification, adminMarkup);

    return res.status(200).json({ ok: true });
  }

  // 4. User sends a text message or phone number
  if (text && !text.startsWith('/')) {
    const phoneMatch = text.match(/(?:\+?998[\s-]?)?[0-9]{2}[\s-]?[0-9]{3}[\s-]?[0-9]{2}[\s-]?[0-9]{2}|[0-9]{9,12}/);
    const extractedPhone = phoneMatch ? phoneMatch[0] : '';
    const cleanPhone = extractedPhone ? extractedPhone.replace(/\D/g, '') : '';
    const callUrl = cleanPhone ? `https://tunikabondlider.vercel.app/call.html?tel=${cleanPhone}` : '';
    const tgUrl = cleanPhone ? `https://t.me/+${cleanPhone}` : '';

    // A) Send confirmation to user with application details + "Siz bilan tez orada bog'lanamiz!"
    const userConfirmHtml = 
      `✅ <b>Arizangiz muvaffaqiyatli qabul qilindi!</b>\n\n` +
      `📋 <b>Ariza ma'lumotlari:</b>\n` +
      `👤 <b>Mijoz:</b> ${escapeHtml(firstName)} ${username ? `(${escapeHtml(username)})` : ''}\n` +
      (extractedPhone ? `📞 <b>Telefon:</b> <code>${escapeHtml(extractedPhone)}</code>\n` : '') +
      `💬 <b>Murojaat mazmuni:</b> ${escapeHtml(text)}\n` +
      `⏰ <b>Vaqt:</b> ${new Date().toLocaleString('uz-UZ')}\n\n` +
      `🤝 <b>Siz bilan tez orada bog‘lanamiz!</b>`;

    await sendMessage(chatId, userConfirmHtml, userConfirmMarkup);

    // B) Forward lead to Admin, Owner, Channel
    const adminNotification = 
      `💬 <b>YANGI MUROJAAT (Telegram Bot)</b>\n\n` +
      `👤 <b>Foydalanuvchi:</b> ${escapeHtml(firstName)} ${username ? `(${username})` : ''}\n` +
      (extractedPhone ? `📞 <b>Telefon:</b> <code>${extractedPhone}</code>\n` : '') +
      `🆔 <b>Chat ID:</b> <code>${chatId}</code>\n` +
      `💬 <b>Xabar:</b> ${escapeHtml(text)}\n` +
      `⏰ <b>Vaqt:</b> ${new Date().toLocaleString('uz-UZ')}\n` +
      `👨‍💼 <b>Mas'ul admin:</b> @Mukhammad_azez`;

    const adminMarkup = {
      inline_keyboard: [
        [
          ...(callUrl ? [{ text: "📞 Telefon qilish", url: callUrl }] : []),
          { text: "💬 Foydalanuvchiga yozish", url: username ? `https://t.me/${username.replace('@', '')}` : `tg://user?id=${chatId}` }
        ],
        [
          { text: "🌐 Rasmiy sayt", url: "https://tunikabondlider.vercel.app" },
          { text: "📢 Rasmiy Kanal", url: "https://t.me/tunikabondLiderkanali" }
        ],
        [
          { text: "👨‍💼 Admin: @Mukhammad_azez", url: "https://t.me/Mukhammad_azez" }
        ]
      ]
    };

    await sendMessage(ADMIN_ID, adminNotification, adminMarkup);
    if (OWNER_ID !== ADMIN_ID) await sendMessage(OWNER_ID, adminNotification, adminMarkup);
    await sendMessage(CHANNEL_ID, adminNotification, adminMarkup);
    await sendMessage("@tunikabondLiderkanali", adminNotification, adminMarkup);

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
