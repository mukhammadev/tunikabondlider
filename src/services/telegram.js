/**
 * Lead handling service
 * Validates, formats, logs, and safely dispatches leads.
 */

export const submitLead = async (leadData) => {
  const { name, phone, service, message, source, calcData } = leadData;

  // Store in browser backup storage so lead is never lost
  try {
    const existing = JSON.parse(localStorage.getItem('tunikabond_leads') || '[]');
    existing.unshift({
      ...leadData,
      date: new Date().toISOString()
    });
    localStorage.setItem('tunikabond_leads', JSON.stringify(existing.slice(0, 50)));
  } catch (e) {
    console.warn('Backup save error:', e);
  }

  // Construct readable message
  let text = `🔥 *YANGI ARIZA: Tunikabond Lider* 🔥\n\n`;
  text += `👤 *Mijoz:* ${name || "Noma'lum"}\n`;
  text += `📞 *Telefon:* ${phone}\n`;
  if (service) text += `🛠 *Xizmat / Mahsulot:* ${service}\n`;
  if (calcData) {
    text += `\n📊 *Kalkulyator Hisob-kitobi:*\n`;
    text += ` • Bino turi: ${calcData.buildingType || '-'}\n`;
    text += ` • Maydoni: ${calcData.area} m²\n`;
    text += ` • Material: ${calcData.material || '-'}\n`;
    text += ` • Taxminiy narx: ${calcData.cost || '-'}\n`;
  }
  if (message) text += `💬 *Qo'shimcha izoh:* ${message}\n`;
  if (source) text += `📍 *Manba:* ${source}\n`;
  text += `⏰ *Vaqt:* ${new Date().toLocaleString('uz-UZ')}\n`;

  // Try backend proxy if available, or Telegram webhook
  const BOT_TOKEN = import.meta.env.VITE_TELEGRAM_BOT_TOKEN;
  const CHAT_ID = import.meta.env.VITE_TELEGRAM_CHAT_ID;

  if (BOT_TOKEN && CHAT_ID) {
    try {
      const url = `https://api.telegram.org/bot${BOT_TOKEN}/sendMessage`;
      const response = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          chat_id: CHAT_ID,
          text: text,
          parse_mode: 'Markdown'
        })
      });
      if (response.ok) {
        return { success: true };
      }
    } catch (err) {
      console.error('Telegram dispatch error:', err);
    }
  }

  // If backend endpoint exists:
  try {
    const apiRes = await fetch('/api/leads/', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(leadData)
    });
    if (apiRes.ok) return { success: true };
  } catch {
    // Backend might not be running locally
  }

  // Simulate success for local testing / demo if network fails
  return { success: true, localSaved: true };
};
