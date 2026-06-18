-- EduAI Hacker Trap: Intrusion Detection System
-- Run this SQL in your Supabase SQL editor

-- 1. Create hacker_intrusions table for tracking security events
-- (Used by the middleware intrusion detection & admin panel)
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

CREATE INDEX IF NOT EXISTS idx_hacker_intrusions_ip ON hacker_intrusions(ip_address);
CREATE INDEX IF NOT EXISTS idx_hacker_intrusions_severity ON hacker_intrusions(severity);
CREATE INDEX IF NOT EXISTS idx_hacker_intrusions_created ON hacker_intrusions(created_at DESC);

-- 2. Create support_tickets table
CREATE TABLE IF NOT EXISTS support_tickets (
  id BIGSERIAL PRIMARY KEY,
  user_email TEXT,
  subject TEXT DEFAULT 'No Subject',
  message TEXT NOT NULL,
  status TEXT DEFAULT 'open' CHECK (status IN ('open', 'in_progress', 'resolved', 'closed')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_support_tickets_status ON support_tickets(status);

-- 3. Create feedbacks table
CREATE TABLE IF NOT EXISTS feedbacks (
  id BIGSERIAL PRIMARY KEY,
  user_id TEXT DEFAULT 'anonymous',
  rating INTEGER DEFAULT 0,
  message TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. Create payments table (for Razorpay transactions)
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

CREATE INDEX IF NOT EXISTS idx_payments_user ON payments(user_id);
CREATE INDEX IF NOT EXISTS idx_payments_status ON payments(status);

-- 5. Create user_history table
CREATE TABLE IF NOT EXISTS user_history (
  id BIGSERIAL PRIMARY KEY,
  user_id TEXT,
  tool_name TEXT,
  input JSONB,
  output TEXT,
  credits_used INTEGER DEFAULT 1,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_user_history_user ON user_history(user_id);
CREATE INDEX IF NOT EXISTS idx_user_history_created ON user_history(created_at DESC);

-- 6. Create study_plans table (used by Curriculum Optimizer)
CREATE TABLE IF NOT EXISTS study_plans (
  id BIGSERIAL PRIMARY KEY,
  syllabus TEXT,
  days TEXT,
  plan JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 7. Create anonymous_usage table for free tier tracking
CREATE TABLE IF NOT EXISTS anonymous_usage (
  id BIGSERIAL PRIMARY KEY,
  ip_address TEXT,
  tool_name TEXT,
  date DATE DEFAULT CURRENT_DATE,
  count INTEGER DEFAULT 1,
  UNIQUE(ip_address, tool_name, date)
);

-- 8. Enable Row Level Security
ALTER TABLE hacker_intrusions ENABLE ROW LEVEL SECURITY;
ALTER TABLE support_tickets ENABLE ROW LEVEL SECURITY;
ALTER TABLE feedbacks ENABLE ROW LEVEL SECURITY;
ALTER TABLE payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE study_plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE anonymous_usage ENABLE ROW LEVEL SECURITY;

-- 9. Create policies (allow all access for now — enhance for production)
CREATE POLICY "Allow all on hacker_intrusions" ON hacker_intrusions FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all on support_tickets" ON support_tickets FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all on feedbacks" ON feedbacks FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all on payments" ON payments FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all on user_history" ON user_history FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all on study_plans" ON study_plans FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all on anonymous_usage" ON anonymous_usage FOR ALL USING (true) WITH CHECK (true);

-- 10. Create user_credits table (used by the app)
CREATE TABLE IF NOT EXISTS user_credits (
  id BIGSERIAL PRIMARY KEY,
  user_id TEXT UNIQUE,
  credits INTEGER DEFAULT 0,
  plan_name TEXT DEFAULT 'Free Trial',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_user_credits_user ON user_credits(user_id);

ALTER TABLE user_credits ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow all on user_credits" ON user_credits FOR ALL USING (true) WITH CHECK (true);
