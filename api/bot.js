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
  const ADMIN_ID = process.env.TELEGRAM_ADMIN_ID || "6481310196";
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
            text: "📞 Qo‘ng‘iroq qilish",
            url: "https://tunikabondlider.vercel.app/call.html?tel=998995333303"
          },
          {
            text: "📢 Rasmiy Kanal",
            url: "https://t.me/tunikabondlider_uz"
          }
        ],
        [
          {
            text: "👨‍💼 Bosh Menejer bilan aloqa",
            url: "https://t.me/mukhammadew"
          }
        ]
      ]
    };

    await sendMessage(chatId, welcomeHtml, inlineMarkup);
    return res.status(200).json({ ok: true });
  }

  // 2. User sends contact or message
  const contactPhone = message.contact?.phone_number || '';
  if (contactPhone || (text && !text.startsWith('/'))) {
    // Acknowledge to user
    const replyHtml = 
      `Rahmat, <b>${escapeHtml(firstName)}</b>! ✅\n\n` +
      `Xabaringiz qabul qilindi. Menejerimiz tez orada siz bilan bog‘lanadi.\n\n` +
      `Katalog va xizmatlar bilan tanishish uchun quyidagi ilovadan foydalanishingiz mumkin:`;

    const appMarkup = {
      inline_keyboard: [
        [
          {
            text: "🚀 Ilovani ochish (Katalog & Narxlar)",
            web_app: { url: "https://tunikabondlider.vercel.app" }
          }
        ]
      ]
    };
    await sendMessage(chatId, replyHtml, appMarkup);

    // Forward lead to admin & channel
    const adminNotification = 
      `💬 <b>YANGI MUROJAAT (Telegram Bot)</b>\n\n` +
      `👤 <b>Foydalanuvchi:</b> ${escapeHtml(firstName)} ${username}\n` +
      (contactPhone ? `📞 <b>Telefon:</b> <code>${contactPhone}</code>\n` : '') +
      `🆔 <b>Chat ID:</b> <code>${chatId}</code>\n` +
      `💬 <b>Xabar:</b> ${escapeHtml(text || 'Kontakt ulashildi')}\n` +
      `⏰ <b>Vaqt:</b> ${new Date().toLocaleString('uz-UZ')}`;

    const adminMarkup = {
      inline_keyboard: [
        [
          { text: "💬 Foydalanuvchiga yozish", url: username ? `https://t.me/${username.replace('@', '')}` : `tg://user?id=${chatId}` }
        ]
      ]
    };
    await sendMessage(ADMIN_ID, adminNotification, adminMarkup);
    await sendMessage(CHANNEL_ID, adminNotification);
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
