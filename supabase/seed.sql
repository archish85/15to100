-- Seed data for Questions

INSERT INTO public.questions (category, difficulty, question, options, answer, date_added, source, submitted_by, corrected_date, corrected_by) VALUES
-- History
('History', 'Purple', 'Who was the first Emperor of Rome?', '["Julius Caesar", "Augustus", "Nero", "Caligula"]'::jsonb, 1, NOW(), 'Britannica', 'admin', NULL, NULL),
('History', 'Orange', 'In which year did the Titanic sink?', '["1910", "1912", "1914", "1916"]'::jsonb, 1, NOW(), 'Wikipedia', 'user1', '2023-01-15', 'editor'),
('History', 'Yellow', 'Who discovered America?', '["Christopher Columbus", "Vasco da Gama"]'::jsonb, 0, NOW(), 'HistoryChannel', 'admin', NULL, NULL),

-- Technology
('Technology', 'Purple', 'What does CPU stand for?', '["Central Processing Unit", "Central Process Unit", "Computer Personal Unit", "Central Processor Unit"]'::jsonb, 0, NOW(), 'TechTerms', 'geek1', NULL, NULL),
('Technology', 'Orange', 'Which company developed Java?', '["Microsoft", "Apple", "Sun Microsystems", "Google"]'::jsonb, 2, NOW(), 'OracleDocs', 'dev_guru', NULL, NULL),
('Technology', 'Yellow', 'Is Python a programming language?', '["Yes", "No"]'::jsonb, 0, NOW(), 'Python.org', 'admin', NULL, NULL),

-- Sports
('Sports', 'Purple', 'Which country won the first FIFA World Cup?', '["Brazil", "Argentina", "Uruguay", "Italy"]'::jsonb, 2, NOW(), 'FIFA.com', 'sports_fan', NULL, NULL),
('Sports', 'Orange', 'How many players are in a cricket team?', '["10", "11", "12", "9"]'::jsonb, 1, NOW(), 'ICC', 'cricket_lover', NULL, NULL),
('Sports', 'Yellow', 'Is Golf played with a ball?', '["Yes", "No"]'::jsonb, 0, NOW(), 'CommonKnowledge', 'admin', NULL, NULL),

-- Culture
('Culture', 'Purple', 'Who wrote "Romeo and Juliet"?', '["Charles Dickens", "William Shakespeare", "Jane Austen", "Mark Twain"]'::jsonb, 1, NOW(), 'Literature101', 'bookworm', NULL, NULL),
('Culture', 'Orange', 'Which is the largest film industry by output?', '["Hollywood", "Bollywood", "Nollywood", "Tollywood"]'::jsonb, 1, NOW(), 'FilmStats', 'movie_buff', NULL, NULL),
('Culture', 'Yellow', 'Is "Mona Lisa" a painting?', '["Yes", "No"]'::jsonb, 0, NOW(), 'Louvre', 'art_lover', NULL, NULL),

-- Connect
('Connect', 'Purple', 'Find the connection: Apple, Banana, Cherry, Date. What comes next?', '["Elderberry", "Carrot", "Potato", "Onion"]'::jsonb, 0, NOW(), 'LogicPuzzles', 'puzzle_master', NULL, NULL), -- Fruits A-E
('Connect', 'Orange', 'Find the connection: Red, Blue, Green. What comes next?', '["Yellow", "Dark", "Light", "Soft"]'::jsonb, 0, NOW(), 'ColorTheory', 'designer', NULL, NULL),
('Connect', 'Yellow', 'Sun, Moon, Stars. What fits?', '["Sky", "Ocean"]'::jsonb, 0, NOW(), 'Nature', 'admin', NULL, NULL),

-- Wildcard
('Wildcard', 'Purple', 'What is the capital of Australia?', '["Sydney", "Melbourne", "Canberra", "Perth"]'::jsonb, 2, NOW(), 'GeoFacts', 'traveler', NULL, NULL),
('Wildcard', 'Orange', 'Which planet is known as the Red Planet?', '["Venus", "Mars", "Jupiter", "Saturn"]'::jsonb, 1, NOW(), 'NASA', 'astro_nerd', NULL, NULL),
('Wildcard', 'Yellow', 'Is water wet?', '["Yes", "No"]'::jsonb, 0, NOW(), 'Philosophy', 'thinker', NULL, NULL);
