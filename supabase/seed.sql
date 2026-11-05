-- Materna Seed Data for Postpartum Mode

-- Insert Default Demo Profile
INSERT INTO profiles (id, full_name, baby_name, baby_birth_date)
VALUES (
  '00000000-0000-0000-0000-000000000001',
  'Sarah',
  'Leo',
  CURRENT_DATE - INTERVAL '44 days'
)
ON CONFLICT (id) DO NOTHING;

-- Insert Seed Baby Logs
INSERT INTO baby_logs (user_id, log_type, details, timestamp)
VALUES
  ('00000000-0000-0000-0000-000000000001', 'feed', '{"side": "left", "duration_mins": 22, "amount_ml": 120}', NOW() - INTERVAL '15 minutes'),
  ('00000000-0000-0000-0000-000000000001', 'diaper', '{"type": "wet"}', NOW() - INTERVAL '45 minutes'),
  ('00000000-0000-0000-0000-000000000001', 'sleep', '{"duration_mins": 90, "notes": "Morning crib nap"}', NOW() - INTERVAL '100 minutes')
ON CONFLICT DO NOTHING;

-- Insert Seed Mood Log
INSERT INTO maternal_mood_logs (user_id, score, tags, notes, logged_date)
VALUES
  ('00000000-0000-0000-0000-000000000001', 4, ARRAY['Sleepy', 'Grateful'], 'Centered after nursing session and gentle diaphragmatic breathing.', CURRENT_DATE)
ON CONFLICT DO NOTHING;
