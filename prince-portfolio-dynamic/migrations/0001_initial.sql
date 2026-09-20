CREATE TABLE IF NOT EXISTS projects (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  title TEXT NOT NULL,
  category TEXT NOT NULL DEFAULT 'Web',
  description TEXT NOT NULL,
  tech TEXT NOT NULL DEFAULT '',
  image_url TEXT DEFAULT '',
  live_url TEXT DEFAULT '',
  github_url TEXT DEFAULT '',
  featured INTEGER NOT NULL DEFAULT 0,
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS messages (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  message TEXT NOT NULL,
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  read INTEGER NOT NULL DEFAULT 0
);

CREATE TABLE IF NOT EXISTS skills (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL,
  category TEXT NOT NULL DEFAULT 'Other',
  level INTEGER NOT NULL DEFAULT 80,
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);

INSERT INTO skills (name, category, level) VALUES
('HTML', 'Frontend', 95),
('CSS', 'Frontend', 90),
('JavaScript', 'Frontend', 85),
('React', 'Frontend', 80),
('PHP', 'Backend', 80),
('Java / Spring Boot', 'Backend', 70),
('Cloudflare Workers', 'Backend', 75),
('Git / GitHub', 'Tools', 85);

INSERT INTO projects (title, category, description, tech, live_url, featured) VALUES
('Saif Food Corner', 'Web', 'Full-stack food ordering website with a modern ordering flow.', 'React, Java, Spring Boot', '', 1),
('Durga Modern Inter College', 'Web', 'School portfolio and information website with bilingual content.', 'HTML, CSS, JavaScript, PHP', '', 1),
('Developer Portfolio', 'Web', 'This portfolio, powered by React, Cloudflare Workers and D1.', 'React, Cloudflare Workers, D1', '', 1);
