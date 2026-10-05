import { createClient } from '@supabase/supabase-js';

export const SUPABASE_URL = 'https://iimajjknpugrmndnidte.supabase.co';
export const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImlpbWFqamtucHVncm1uZG5pZHRlIiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTEyMTc1NDUsImV4cCI6MjEwNjc5MzU0NX0.oXpDF5pSqGfBUg20V93tzzGwsVliJcm9w4ymuuyoyTQ';

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
