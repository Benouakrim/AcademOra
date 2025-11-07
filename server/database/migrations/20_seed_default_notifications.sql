-- Migration 20: Seed default notifications for all users

BEGIN;

WITH template(type, title, message, action_url, metadata) AS (
  VALUES
    ('system', 'Welcome to AcademOra', 'Thanks for joining! Explore your personalized dashboard to get started.', '/dashboard', '{"icon":"sparkles"}'::jsonb),
    ('guidance', 'Build your profile', 'Complete your profile to unlock tailored financial aid insights and mentorship matches.', '/profile', '{"icon":"user"}'::jsonb),
    ('feature', 'Discover universities', 'Use the orientation hub to browse universities that match your interests.', '/orientation/schools', '{"icon":"map"}'::jsonb),
    ('feature', 'Save your favorites', 'Tap the heart icon on any university page to bookmark it for later.', '/dashboard?saved=universities', '{"icon":"heart"}'::jsonb),
    ('insight', 'Track your progress', 'Check the notifications panel regularly for updates on saved content and advisor tips.', '/dashboard', '{"icon":"bell"}'::jsonb)
)
INSERT INTO notifications (user_id, type, title, message, action_url, metadata)
SELECT u.id, t.type, t.title, t.message, t.action_url, t.metadata
FROM users u
CROSS JOIN template t
WHERE NOT EXISTS (
  SELECT 1
  FROM notifications n
  WHERE n.user_id = u.id
    AND n.title = t.title
);

COMMIT;


