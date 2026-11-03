/**
 * Vercel Serverless Function: /api/reviews
 * Real-time cross-device synchronization of Customer Reviews via Supabase
 * - GET: Fetches from Supabase first, falls back to Telegram feed
 * - POST: Saves to Supabase + sends Telegram notification
 * - DELETE: Deletes from Supabase permanently
 */

import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = 'https://iimajjknpugrmndnidte.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImlpbWFqamtucHVncm1uZG5pZHRlIiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTEyMTc1NDUsImV4cCI6MjEwNjc5MzU0NX0.oXpDF5pSqGfBUg20V93tzzGwsVliJcm9w4ymuuyoyTQ';

const getSupabase = () => createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  const BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN || "8697018482:AAFwxsWVPoHl7sEfGpR9wPtQEtxBL3ivozA";
  const CHANNEL_ID = process.env.TELEGRAM_CHANNEL_ID || "-1004415750690";

  // DELETE: Remove review permanently from Supabase
  if (req.method === 'DELETE') {
    const targetId = String(req.query?.id || req.body?.id || '');
    if (!targetId) {
      return res.status(400).json({ error: "ID talab qilinadi" });
    }

    try {
      const supabase = getSupabase();
      // Try deleting by string id first, then by numeric id
      const { error } = await supabase
        .from('reviews')
        .delete()
        .eq('id', targetId);

      if (error) {
        console.warn('Supabase delete error:', error);
        // Try as integer fallback
        const numId = parseInt(targetId, 10);
        if (!isNaN(numId)) {
          await supabase.from('reviews').delete().eq('id', numId);
        }
      }
    } catch (e) {
      console.warn('Supabase delete exception:', e);
    }

    return res.status(200).json({ success: true });
  }

  // POST: Receive new customer review
  if (req.method === 'POST') {
    const data = req.body || {};
    const { name, comment, rating, project, location, role } = data;

    if (!name || !comment) {
      return res.status(400).json({ error: "Ism va sharh matni talab qilinadi" });
    }

    const reviewRecord = {
      id: data.id || `rev-${Date.now()}`,
      name: String(name).trim(),
      role: role ? String(role).trim() : "Mijoz",
      project: project ? String(project).trim() : "Fasad yoki naves montaji",
      location: location ? String(location).trim() : "Toshkent shahri",
      rating: Number(rating) || 5,
      comment: String(comment).trim(),
      date: data.date || new Date().toLocaleDateString('uz-UZ', { month: 'long', year: 'numeric' }),
      timestamp: Date.now()
    };

    // 1. Save to Supabase
    try {
      const supabase = getSupabase();
      await supabase.from('reviews').upsert({
        id: String(reviewRecord.id),
        name: reviewRecord.name,
        role: reviewRecord.role,
        project: reviewRecord.project,
        location: reviewRecord.location,
        rating: reviewRecord.rating,
        comment: reviewRecord.comment,
        date: reviewRecord.date,
        created_at: new Date().toISOString()
      });
    } catch (e) {
      console.warn('Supabase upsert error:', e);
    }

    // 2. Broadcast to Telegram channel with #REV_DATA tag
    try {
      const escapedJson = JSON.stringify(reviewRecord);
      const text =
        `#REV_DATA\n\n` +
        `⭐ <b>YANGI MIJOZ SHARHI (${reviewRecord.rating}/5)</b>\n\n` +
        `👤 <b>Ism:</b> ${reviewRecord.name}\n` +
        `💼 <b>Obyekt:</b> ${reviewRecord.project}\n` +
        `📍 <b>Manzil:</b> ${reviewRecord.location}\n` +
        `💬 <b>Sharh:</b> <i>"${reviewRecord.comment}"</i>\n` +
        `⏰ <b>Sana:</b> ${reviewRecord.date}\n\n` +
        `<code>${escapedJson}</code>`;

      await fetch(`https://api.telegram.org/bot${BOT_TOKEN}/sendMessage`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          chat_id: CHANNEL_ID,
          text: text,
          parse_mode: 'HTML'
        })
      });
    } catch (err) {
      console.warn("Review dispatch error:", err);
    }

    return res.status(201).json({
      success: true,
      review: reviewRecord
    });
  }

  // GET: Fetch all reviews
  if (req.method === 'GET') {
    // Primary: Fetch from Supabase
    try {
      const supabase = getSupabase();
      const { data, error } = await supabase
        .from('reviews')
        .select('*')
        .order('created_at', { ascending: false });

      if (!error && Array.isArray(data) && data.length >= 0) {
        return res.status(200).json(data);
      }
    } catch (e) {
      console.warn('Supabase GET reviews error:', e);
    }

    // Fallback: Sync from Telegram channel feed (#REV_DATA)
    const list = [];
    const seenIds = new Set();
    try {
      const feedRes = await fetch('https://t.me/s/tunikabondlider_uz?q=%23REV_DATA', {
        headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)' }
      });
      if (feedRes.ok) {
        const html = await feedRes.text();
        const codeRegex = /<code[^>]*>(.*?)<\/code>/gis;
        let match;
        while ((match = codeRegex.exec(html)) !== null) {
          try {
            const raw = match[1]
              .replace(/&quot;/g, '"')
              .replace(/&amp;/g, '&')
              .replace(/&lt;/g, '<')
              .replace(/&gt;/g, '>')
              .replace(/&#39;/g, "'");
            const parsed = JSON.parse(raw);
            if (parsed && parsed.id && parsed.comment && !seenIds.has(String(parsed.id))) {
              seenIds.add(String(parsed.id));
              list.push(parsed);
            }
          } catch {}
        }
      }
    } catch (e) {
      console.warn("Feed fetch error:", e);
    }

    list.sort((a, b) => (b.timestamp || 0) - (a.timestamp || 0));
    return res.status(200).json(list);
  }

  return res.status(405).json({ error: "Method not allowed" });
}
