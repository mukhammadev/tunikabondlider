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
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  const BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN;
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

    // 2. Broadcast clean human-readable review notification to Telegram channel (no raw JSON / tags)
    if (BOT_TOKEN && !data.skipTelegram) {
      try {
        const starCount = Math.min(5, Math.max(1, Number(reviewRecord.rating) || 5));
        const stars = '⭐'.repeat(starCount);
        const text =
          `⭐ <b>YANGI MIJOZ SHARHI — TUNIKABOND LIDER</b> ⭐\n\n` +
          `👤 <b>Mijoz:</b> ${escapeHtml(reviewRecord.name)}\n` +
          `🌟 <b>Baho:</b> ${stars} (${starCount}/5)\n` +
          `💼 <b>Obyekt:</b> ${escapeHtml(reviewRecord.project)}\n` +
          `📍 <b>Manzil:</b> ${escapeHtml(reviewRecord.location)}\n` +
          `💬 <b>Sharh:</b> <i>"${escapeHtml(reviewRecord.comment)}"</i>\n` +
          `⏰ <b>Sana:</b> ${escapeHtml(reviewRecord.date)}`;

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

    return res.status(200).json([]);
  }

  return res.status(405).json({ error: "Method not allowed" });
}
