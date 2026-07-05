-- Seed the shared channel taxonomy.

insert into channels (name, type, platform) values
  ('Instagram',        'influencer', 'meta'),
  ('TikTok',           'influencer', 'tiktok'),
  ('YouTube',          'influencer', 'youtube'),
  ('Facebook Ads',     'digital',    'meta'),
  ('Instagram Ads',    'digital',    'meta'),
  ('Google Search Ads','digital',    'google'),
  ('Google Display Ads','digital',  'google'),
  ('TikTok Ads',       'digital',   'tiktok'),
  ('YouTube Ads',      'digital',   'youtube'),
  ('Email Newsletter', 'digital',   'email'),
  ('Local Event',      'local',     'local'),
  ('Print',            'print',     null),
  ('Podcast',          'organic',   null),
  ('Organic Social',   'organic',   'meta');
