-- Demo users for testing public profiles
BEGIN;

INSERT INTO public.users (email, password, role, full_name, username, title, headline, location, bio, avatar_url, website_url, linkedin_url, github_url, twitter_url, portfolio_url, is_profile_public)
VALUES
('alice@example.com', '$2b$10$9oC3Z7bHn8H8H8H8H8H8HuKqz2mQ8wK5P0w0Jm6B0M2J9y9x9x9x', 'user', 'Alice Johnson', 'alice', 'Product Designer', 'Designing delightful experiences', 'Paris, France', 'Design + UX + Accessibility', 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?q=80&w=300&auto=format&fit=crop', 'https://alice.design', 'https://linkedin.com/in/example-alice', NULL, NULL, NULL, TRUE),
('ben@example.com', '$2b$10$9oC3Z7bHn8H8H8H8H8H8HuKqz2mQ8wK5P0w0Jm6B0M2J9y9x9x9x', 'user', 'Ben Carter', 'benc', 'Software Engineer', 'Full-stack JS/TS', 'Austin, USA', 'Building reliable systems', 'https://images.unsplash.com/photo-1502685104226-ee32379fefbe?q=80&w=300&auto=format&fit=crop', NULL, 'https://linkedin.com/in/example-ben', 'https://github.com/example-ben', 'https://twitter.com/example_ben', NULL, TRUE),
('chloe@example.com', '$2b$10$9oC3Z7bHn8H8H8H8H8H8HuKqz2mQ8wK5P0w0Jm6B0M2J9y9x9x9x', 'user', 'Chloé Martin', 'chloe', 'Data Scientist', 'ML and analytics', 'Lyon, France', 'Turning data into insights', 'https://images.unsplash.com/photo-1527980965255-d3b416303d12?q=80&w=300&auto=format&fit=crop', NULL, 'https://linkedin.com/in/example-chloe', 'https://github.com/example-chloe', NULL, NULL, TRUE),
('diego@example.com', '$2b$10$9oC3Z7bHn8H8H8H8H8H8HuKqz2mQ8wK5P0w0Jm6B0M2J9y9x9x9x', 'user', 'Diego Alvarez', 'diego', 'University Counselor', 'Helping students succeed', 'Madrid, Spain', 'Advising international applicants', 'https://images.unsplash.com/photo-1547425260-76bcadfb4f2c?q=80&w=300&auto=format&fit=crop', NULL, NULL, NULL, NULL, NULL, TRUE),
('emma@example.com', '$2b$10$9oC3Z7bHn8H8H8H8H8H8HuKqz2mQ8wK5P0w0Jm6B0M2J9y9x9x9x', 'user', 'Emma Rossi', 'emma', 'Student', 'CS undergraduate', 'Milan, Italy', 'Interested in AI/ML research', 'https://images.unsplash.com/photo-1544005316-04ce1a8d5f57?q=80&w=300&auto=format&fit=crop', NULL, NULL, NULL, NULL, NULL, TRUE);

COMMIT;


