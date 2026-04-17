import { BookOpen, Cpu, Trophy, Palette, Link, FlaskConical, Globe, Film, Music, BookText, TreePine, Flame, Coffee, Rocket, Gamepad2 } from 'lucide-react';

export const CATEGORIES = [
    { id: 'history', label: 'History', icon: BookOpen, description: 'Journey through time and events.', cost: 100, maxPoints: 500 },
    { id: 'technology', label: 'Tech', icon: Cpu, description: 'Innovations shaping our future.', cost: 150, maxPoints: 750 },
    { id: 'sports', label: 'Sports', icon: Trophy, description: 'Athletes, games, and records.', cost: 100, maxPoints: 500 },
    { id: 'culture', label: 'Culture', icon: Palette, description: 'Art, music, and traditions.', cost: 120, maxPoints: 600 },
    { id: 'connect', label: 'Connect', icon: Link, description: 'Find the missing link.', cost: 200, maxPoints: 1000 },
    { id: 'science', label: 'Science', icon: FlaskConical, description: 'Physics, chemistry, and biology.', cost: 130, maxPoints: 650 },
    { id: 'geography', label: 'Geography', icon: Globe, description: 'Continents, countries, and capitals.', cost: 110, maxPoints: 550 },
    { id: 'movies', label: 'Movies', icon: Film, description: 'Cinema, directors, and famous quotes.', cost: 140, maxPoints: 700 },
    { id: 'music', label: 'Music', icon: Music, description: 'Bands, genres, and hits.', cost: 120, maxPoints: 600 },
    { id: 'literature', label: 'Literature', icon: BookText, description: 'Classic books and famous authors.', cost: 150, maxPoints: 750 },
    { id: 'nature', label: 'Nature', icon: TreePine, description: 'Plants, weather, and environments.', cost: 100, maxPoints: 500 },
    { id: 'mythology', label: 'Mythology', icon: Flame, description: 'Gods, heroes, and ancient tales.', cost: 140, maxPoints: 700 },
    { id: 'food', label: 'Food', icon: Coffee, description: 'Cuisine, dishes, and ingredients.', cost: 110, maxPoints: 550 },
    { id: 'space', label: 'Space', icon: Rocket, description: 'Stars, planets, and galaxies.', cost: 160, maxPoints: 800 },
    { id: 'gaming', label: 'Gaming', icon: Gamepad2, description: 'Video games and consoles.', cost: 130, maxPoints: 650 }
];
