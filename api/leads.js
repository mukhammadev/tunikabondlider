/**
 * Vercel Serverless Function: /api/leads
 * Secure lead collection, spam protection, Supabase persistence,
 * and dispatch to Telegram Private Channel.
 */

import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = 'https://iimajjknpugrmndnidte.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImlpbWFqamtucHVncm1uZG5pZHRlIiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTEyMTc1NDUsImV4cCI6MjEwNjc5MzU0NX0.oXpDF5pSqGfBUg20V93tzzGwsVliJcm9w4ymuuyoyTQ';

const getSupabase = () => createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// Helper to escape HTML characters for safe Telegram message rendering
function escapeHtml(str) {
  if (!str) return '';
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

export default async function handler(req, res) {
  // Restrict CORS origins if desired, allow preflight
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PATCH, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  const BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN;
  const CHANNEL_ID = process.env.TELEGRAM_CHANNEL_ID || "-1004415750690";

  // POST: Receive new lead with spam check & HTML sanitization
  if (req.method === 'POST') {
    const data = req.body || {};

    // 1. Honeypot spam check (hidden field submitted by bots)
    if (data.website || data.company_tax_id || data._hp) {
      // Silently discard bot spam
      return res.status(200).json({ success: true, message: "Ariza qabul qilindi" });
    }

    const rawName = String(data.name || '').trim().slice(0, 100);
    const rawPhone = String(data.phone || '').trim().slice(0, 30);
    const rawService = String(data.service || data.product || 'Tunikabond xizmatlari').trim().slice(0, 150);
    const rawMessage = String(data.message || '').trim().slice(0, 1000);
    const rawSource = String(data.source || 'Veb-sayt').trim().slice(0, 80);

    // Validate phone number (must have at least 9 digits)
    const digitsOnly = rawPhone.replace(/\D/g, '');
    if (digitsOnly.length < 9) {
      return res.status(400).json({ error: "Telefon raqami kamida 9 ta raqamdan iborat bo'lishi kerak" });
    }

    const leadRecord = {
      id: data.id || `lead-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
      name: rawName || "Noma'lum",
      phone: rawPhone,
      service: rawService,
      message: rawMessage,
      source: rawSource,
      calc_data: data.calcData || null,
      status: "new",
      created_at: new Date().toISOString()
    };

    // 2. Persist to Supabase database
    try {
      const supabase = getSupabase();
      await supabase.from('leads').upsert({
        id: leadRecord.id,
        name: leadRecord.name,
        phone: leadRecord.phone,
        service: leadRecord.service,
        message: leadRecord.message,
        source: leadRecord.source,
        calc_data: leadRecord.calc_data,
        status: leadRecord.status,
        created_at: leadRecord.created_at
      });
    } catch (dbErr) {
      console.warn("Supabase lead upsert error:", dbErr);
    }

    // 3. Dispatch to Telegram Channel via server-side Bot Token
    if (BOT_TOKEN) {
      const cleanName = escapeHtml(leadRecord.name);
      const cleanPhone = escapeHtml(leadRecord.phone);
      const cleanService = escapeHtml(leadRecord.service);
      const cleanMessage = escapeHtml(leadRecord.message);
      const cleanSource = escapeHtml(leadRecord.source);

      let calcSummary = '';
      if (leadRecord.calc_data) {
        const area = escapeHtml(String(leadRecord.calc_data.area || '-'));
        const cost = escapeHtml(String(leadRecord.calc_data.cost || '-'));
        calcSummary = `\n📊 <b>Kalkulyator Hisobi:</b>\n • Maydoni: ${area} m²\n • Narx: <b>${cost}</b>\n`;
      }

      const channelText =
        `🔥 <b>YANGI ARIZA — TUNIKABOND LIDER</b> 🔥\n\n` +
        `👤 <b>Mijoz:</b> ${cleanName}\n` +
        `📞 <b>Telefon:</b> <code>${cleanPhone}</code>\n` +
        (cleanService ? `🛠 <b>Xizmat / Mahsulot:</b> ${cleanService}\n` : '') +
        calcSummary +
        (cleanMessage ? `💬 <b>Qo'shimcha izoh:</b> ${cleanMessage}\n` : '') +
        `📍 <b>Manba:</b> ${cleanSource}\n` +
        `⏰ <b>Vaqt:</b> ${new Date().toLocaleString('uz-UZ')}\n` +
        `👨‍💼 <b>Mas'ul:</b> @Mukhammad_azez`;

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
      } catch (tgErr) {
        console.warn("Telegram channel dispatch warning:", tgErr);
      }
    }

    return res.status(201).json({
      success: true,
      message: "Ariza muvaffaqiyatli qabul qilindi",
      lead: leadRecord
    });
  }

  // GET: Fetch leads for Admin Panel
  if (req.method === 'GET') {
    try {
      const supabase = getSupabase();
      const { data, error } = await supabase
        .from('leads')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      return res.status(200).json(data || []);
    } catch (err) {
      console.warn("GET leads error:", err);
      return res.status(500).json({ error: "Arizalarni yuklashda xatolik" });
    }
  }

  // PATCH: Update lead status
  if (req.method === 'PATCH') {
    const { id, status } = req.body || {};
    if (!id || !status) {
      return res.status(400).json({ error: "ID va status talab qilinadi" });
    }

    try {
      const supabase = getSupabase();
      await supabase.from('leads').update({ status }).eq('id', String(id));
      return res.status(200).json({ success: true, id, status });
    } catch (err) {
      return res.status(500).json({ error: "Statusni yangilab bo'lmadi" });
    }
  }

  // DELETE: Delete lead
  if (req.method === 'DELETE') {
    const targetId = String(req.query?.id || req.body?.id || '');
    if (!targetId) {
      return res.status(400).json({ error: "O'chiriladigan ID ko'rsatilmadi" });
    }

    try {
      const supabase = getSupabase();
      await supabase.from('leads').delete().eq('id', targetId);
      return res.status(200).json({ success: true, id: targetId });
    } catch (err) {
      return res.status(500).json({ error: "Arizani o'chirib bo'lmadi" });
    }
  }

  return res.status(405).json({ error: "Method not allowed" });
}
