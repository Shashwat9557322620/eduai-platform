-- EduAI: Complete Database Schema
-- Includes: Refund System, Support Tracking, Hacker Detection with Geo-IP
-- Run this entire SQL in Supabase SQL Editor
--
-- ⚠️ IMPORTANT: ALTER TABLE statements are placed BEFORE CREATE INDEX
-- to ensure columns exist before indexes are created on them!

-- ============================================================
-- 1. HACKER INTRUSIONS (with Geo-IP & Device Fingerprinting)
-- ============================================================
CREATE TABLE IF NOT EXISTS hacker_intrusions (
  id BIGSERIAL PRIMARY KEY,
  ip_address TEXT NOT NULL,
  path TEXT DEFAULT '/unknown',
  event_type TEXT NOT NULL,
  severity TEXT DEFAULT 'low' CHECK (severity IN ('low', 'medium', 'high', 'critical')),
  user_agent TEXT,
  headers JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- 2. SUPPORT TICKETS (with tracking)
-- ============================================================
CREATE TABLE IF NOT EXISTS support_tickets (
  id BIGSERIAL PRIMARY KEY,
  user_email TEXT,
  subject TEXT DEFAULT 'No Subject',
  message TEXT NOT NULL,
  status TEXT DEFAULT 'open' CHECK (status IN ('open', 'in_progress', 'resolved', 'closed')),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- 3. REFUND REQUESTS
-- ============================================================
CREATE TABLE IF NOT EXISTS refund_requests (
  id BIGSERIAL PRIMARY KEY,
  user_id TEXT,
  user_email TEXT NOT NULL,
  order_id TEXT,
  amount INTEGER DEFAULT 0,
  reason TEXT NOT NULL,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'denied')),
  admin_note TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- 4. FEEDBACKS
-- ============================================================
CREATE TABLE IF NOT EXISTS feedbacks (
  id BIGSERIAL PRIMARY KEY,
  user_id TEXT DEFAULT 'anonymous',
  rating INTEGER DEFAULT 0,
  message TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- 5. PAYMENTS (Razorpay)
-- ============================================================
CREATE TABLE IF NOT EXISTS payments (
  id BIGSERIAL PRIMARY KEY,
  user_id TEXT,
  order_id TEXT UNIQUE,
  payment_id TEXT,
  amount INTEGER,
  currency TEXT DEFAULT 'INR',
  status TEXT DEFAULT 'pending',
  plan_name TEXT,
  credits_purchased INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- 6. USER HISTORY
-- ============================================================
CREATE TABLE IF NOT EXISTS user_history (
  id BIGSERIAL PRIMARY KEY,
  user_id TEXT,
  tool_name TEXT,
  input JSONB,
  output TEXT,
  credits_used INTEGER DEFAULT 1,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- 7. STUDY PLANS
-- ============================================================
CREATE TABLE IF NOT EXISTS study_plans (
  id BIGSERIAL PRIMARY KEY,
  syllabus TEXT,
  days TEXT,
  plan JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- 8. USER CREDITS
-- ============================================================
CREATE TABLE IF NOT EXISTS user_credits (
  id BIGSERIAL PRIMARY KEY,
  user_id TEXT UNIQUE,
  credits INTEGER DEFAULT 0,
  plan_name TEXT DEFAULT 'Free Trial',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- 9. ANONYMOUS USAGE TRACKING
-- ============================================================
CREATE TABLE IF NOT EXISTS anonymous_usage (
  id BIGSERIAL PRIMARY KEY,
  ip_address TEXT,
  tool_name TEXT,
  date DATE DEFAULT CURRENT_DATE,
  count INTEGER DEFAULT 1,
  UNIQUE(ip_address, tool_name, date)
);

-- ================================================================
-- 🚨 STEP 1: ADD MISSING COLUMNS FIRST (before any CREATE INDEX)
--    This ensures all columns exist before we create indexes on them
-- ================================================================
-- Add columns to hacker_intrusions if migrating from old schema
ALTER TABLE hacker_intrusions ADD COLUMN IF NOT EXISTS event_type TEXT DEFAULT 'unknown';
ALTER TABLE hacker_intrusions ADD COLUMN IF NOT EXISTS country TEXT;
ALTER TABLE hacker_intrusions ADD COLUMN IF NOT EXISTS country_code TEXT;
ALTER TABLE hacker_intrusions ADD COLUMN IF NOT EXISTS region TEXT;
ALTER TABLE hacker_intrusions ADD COLUMN IF NOT EXISTS city TEXT;
ALTER TABLE hacker_intrusions ADD COLUMN IF NOT EXISTS zip TEXT;
ALTER TABLE hacker_intrusions ADD COLUMN IF NOT EXISTS lat FLOAT;
ALTER TABLE hacker_intrusions ADD COLUMN IF NOT EXISTS lon FLOAT;
ALTER TABLE hacker_intrusions ADD COLUMN IF NOT EXISTS timezone TEXT;
ALTER TABLE hacker_intrusions ADD COLUMN IF NOT EXISTS isp TEXT;
ALTER TABLE hacker_intrusions ADD COLUMN IF NOT EXISTS org TEXT;
ALTER TABLE hacker_intrusions ADD COLUMN IF NOT EXISTS as_name TEXT;
ALTER TABLE hacker_intrusions ADD COLUMN IF NOT EXISTS as_number TEXT;
ALTER TABLE hacker_intrusions ADD COLUMN IF NOT EXISTS browser TEXT;
ALTER TABLE hacker_intrusions ADD COLUMN IF NOT EXISTS os TEXT;
ALTER TABLE hacker_intrusions ADD COLUMN IF NOT EXISTS device_type TEXT DEFAULT 'unknown';
ALTER TABLE hacker_intrusions ADD COLUMN IF NOT EXISTS is_mobile BOOLEAN DEFAULT FALSE;
ALTER TABLE hacker_intrusions ADD COLUMN IF NOT EXISTS is_proxy BOOLEAN DEFAULT FALSE;
ALTER TABLE hacker_intrusions ADD COLUMN IF NOT EXISTS is_vpn BOOLEAN DEFAULT FALSE;
ALTER TABLE hacker_intrusions ADD COLUMN IF NOT EXISTS is_tor BOOLEAN DEFAULT FALSE;
ALTER TABLE hacker_intrusions ADD COLUMN IF NOT EXISTS is_hosting BOOLEAN DEFAULT FALSE;
ALTER TABLE hacker_intrusions ADD COLUMN IF NOT EXISTS request_count INTEGER DEFAULT 1;

-- Add columns to support_tickets if missing
ALTER TABLE support_tickets ADD COLUMN IF NOT EXISTS tracking_id TEXT UNIQUE;
ALTER TABLE support_tickets ADD COLUMN IF NOT EXISTS admin_response TEXT;
ALTER TABLE support_tickets ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ DEFAULT NOW();

-- ================================================================
-- ✅ STEP 2: NOW CREATE ALL INDEXES (columns guaranteed to exist)
-- ================================================================
CREATE INDEX IF NOT EXISTS idx_hacker_intrusions_ip ON hacker_intrusions(ip_address);
CREATE INDEX IF NOT EXISTS idx_hacker_intrusions_severity ON hacker_intrusions(severity);
CREATE INDEX IF NOT EXISTS idx_hacker_intrusions_created ON hacker_intrusions(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_hacker_intrusions_country ON hacker_intrusions(country);
CREATE INDEX IF NOT EXISTS idx_hacker_intrusions_event ON hacker_intrusions(event_type);

CREATE INDEX IF NOT EXISTS idx_support_tickets_status ON support_tickets(status);
CREATE INDEX IF NOT EXISTS idx_support_tickets_tracking ON support_tickets(tracking_id);

CREATE INDEX IF NOT EXISTS idx_refund_requests_status ON refund_requests(status);
CREATE INDEX IF NOT EXISTS idx_refund_requests_email ON refund_requests(user_email);

CREATE INDEX IF NOT EXISTS idx_payments_user ON payments(user_id);
CREATE INDEX IF NOT EXISTS idx_payments_status ON payments(status);

CREATE INDEX IF NOT EXISTS idx_user_history_user ON user_history(user_id);
CREATE INDEX IF NOT EXISTS idx_user_history_created ON user_history(created_at DESC);

CREATE INDEX IF NOT EXISTS idx_user_credits_user ON user_credits(user_id);

-- ================================================================
-- ✅ STEP 3: ROW LEVEL SECURITY
-- ================================================================
ALTER TABLE hacker_intrusions ENABLE ROW LEVEL SECURITY;
ALTER TABLE support_tickets ENABLE ROW LEVEL SECURITY;
ALTER TABLE refund_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE feedbacks ENABLE ROW LEVEL SECURITY;
ALTER TABLE payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE study_plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_credits ENABLE ROW LEVEL SECURITY;
ALTER TABLE anonymous_usage ENABLE ROW LEVEL SECURITY;

-- ================================================================
-- ✅ STEP 4: RLS POLICIES (Allow all — secured via API layer)
-- ================================================================
DO $$
BEGIN
  -- Drop existing policies first to avoid conflicts
  DROP POLICY IF EXISTS "Allow all on hacker_intrusions" ON hacker_intrusions;
  DROP POLICY IF EXISTS "Allow all on support_tickets" ON support_tickets;
  DROP POLICY IF EXISTS "Allow all on refund_requests" ON refund_requests;
  DROP POLICY IF EXISTS "Allow all on feedbacks" ON feedbacks;
  DROP POLICY IF EXISTS "Allow all on payments" ON payments;
  DROP POLICY IF EXISTS "Allow all on user_history" ON user_history;
  DROP POLICY IF EXISTS "Allow all on study_plans" ON study_plans;
  DROP POLICY IF EXISTS "Allow all on user_credits" ON user_credits;
  DROP POLICY IF EXISTS "Allow all on anonymous_usage" ON anonymous_usage;
END $$;

CREATE POLICY "Allow all on hacker_intrusions" ON hacker_intrusions FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all on support_tickets" ON support_tickets FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all on refund_requests" ON refund_requests FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all on feedbacks" ON feedbacks FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all on payments" ON payments FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all on user_history" ON user_history FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all on study_plans" ON study_plans FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all on user_credits" ON user_credits FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all on anonymous_usage" ON anonymous_usage FOR ALL USING (true) WITH CHECK (true);
