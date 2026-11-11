-- =============================================================================
-- FORGE — reference data (categories + starter skills)
-- =============================================================================
-- This lives in a migration (not seed.sql) because production needs it too.
-- Admins can add/rename categories and skills later from the admin dashboard.
-- =============================================================================

insert into public.categories (slug, name, description, icon, sort_order) values
  ('website-development',   'Website Development',            'Landing pages, portfolios, business sites and web apps.',          'globe',          1),
  ('mobile-app-development','Mobile App Development',         'Android, iOS and cross-platform apps.',                            'smartphone',     2),
  ('software-development',  'Software Development',           'Desktop tools, backends, APIs, scripts and automation.',           'code-2',         3),
  ('ui-ux-design',          'UI/UX Design',                   'Wireframes, prototypes, design systems and user research.',        'pen-tool',       4),
  ('graphic-design',        'Graphic Design',                 'Logos, branding, posters, social media creatives.',                'palette',        5),
  ('ai-ml',                 'AI and Machine Learning',        'Model training, data pipelines, LLM apps and integrations.',      'brain-circuit',  6),
  ('data-analysis',         'Data Analysis',                  'Dashboards, Excel, SQL, visualisation and reporting.',             'bar-chart-3',    7),
  ('python-java',           'Python and Java Projects',       'Applications, tools and utilities in Python or Java.',             'file-code-2',    8),
  ('tech-support',          'Technical Support and Debugging','Fixing bugs, deployment help, setup and troubleshooting.',        'wrench',         9),
  ('video-editing',         'Video Editing',                  'Reels, YouTube edits, motion graphics and subtitles.',            'clapperboard',  10),
  ('content-creative',      'Content and Creative Services',  'Copywriting, blogs, scripts and social media content.',           'pen-line',      11),
  ('research-assistance',   'Research Assistance',            'Literature surveys, market research and data collection.',        'search',        12),
  ('documentation',         'Documentation and Report Formatting', 'Technical docs, formatting, proofreading and presentations.', 'file-text',     13),
  ('tutoring-mentoring',    'Tutoring and Mentoring',         'One-on-one learning, concept explanations and guidance.',         'graduation-cap',14),
  ('other',                 'Other Professional Services',    'Anything legitimate that does not fit the categories above.',      'sparkles',      15)
on conflict (slug) do nothing;

insert into public.skills (slug, name, category_id)
select s.slug, s.name, c.id
from (values
  ('html-css',         'HTML & CSS',          'website-development'),
  ('javascript',       'JavaScript',          'website-development'),
  ('typescript',       'TypeScript',          'website-development'),
  ('react',            'React',               'website-development'),
  ('nextjs',           'Next.js',             'website-development'),
  ('tailwind-css',     'Tailwind CSS',        'website-development'),
  ('wordpress',        'WordPress',           'website-development'),
  ('nodejs',           'Node.js',             'software-development'),
  ('django',           'Django',              'software-development'),
  ('spring-boot',      'Spring Boot',         'software-development'),
  ('rest-apis',        'REST APIs',           'software-development'),
  ('postgresql',       'PostgreSQL',          'software-development'),
  ('mongodb',          'MongoDB',             'software-development'),
  ('firebase',         'Firebase',            'mobile-app-development'),
  ('flutter',          'Flutter',             'mobile-app-development'),
  ('react-native',     'React Native',        'mobile-app-development'),
  ('kotlin',           'Kotlin',              'mobile-app-development'),
  ('swift',            'Swift',               'mobile-app-development'),
  ('figma',            'Figma',               'ui-ux-design'),
  ('wireframing',      'Wireframing',         'ui-ux-design'),
  ('prototyping',      'Prototyping',         'ui-ux-design'),
  ('photoshop',        'Adobe Photoshop',     'graphic-design'),
  ('illustrator',      'Adobe Illustrator',   'graphic-design'),
  ('canva',            'Canva',               'graphic-design'),
  ('logo-design',      'Logo Design',         'graphic-design'),
  ('machine-learning', 'Machine Learning',    'ai-ml'),
  ('deep-learning',    'Deep Learning',       'ai-ml'),
  ('llm-apps',         'LLM Applications',    'ai-ml'),
  ('computer-vision',  'Computer Vision',     'ai-ml'),
  ('pandas',           'Pandas',              'data-analysis'),
  ('excel',            'Microsoft Excel',     'data-analysis'),
  ('power-bi',         'Power BI',            'data-analysis'),
  ('sql',              'SQL',                 'data-analysis'),
  ('python',           'Python',              'python-java'),
  ('java',             'Java',                'python-java'),
  ('c-cpp',            'C / C++',             'python-java'),
  ('debugging',        'Debugging',           'tech-support'),
  ('git-github',       'Git & GitHub',        'tech-support'),
  ('deployment',       'Deployment & Hosting','tech-support'),
  ('premiere-pro',     'Premiere Pro',        'video-editing'),
  ('after-effects',    'After Effects',       'video-editing'),
  ('davinci-resolve',  'DaVinci Resolve',     'video-editing'),
  ('copywriting',      'Copywriting',         'content-creative'),
  ('content-writing',  'Content Writing',     'content-creative'),
  ('social-media',     'Social Media',        'content-creative'),
  ('market-research',  'Market Research',     'research-assistance'),
  ('technical-writing','Technical Writing',   'documentation'),
  ('ms-word',          'Microsoft Word',      'documentation'),
  ('latex',            'LaTeX',               'documentation'),
  ('presentations',    'Presentations',       'documentation'),
  ('mentoring',        'Mentoring',           'tutoring-mentoring'),
  ('dsa',              'Data Structures & Algorithms', 'tutoring-mentoring')
) as s(slug, name, category_slug)
join public.categories c on c.slug = s.category_slug
on conflict (slug) do nothing;
