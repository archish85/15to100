import { BookOpen, Cpu, Trophy, Palette, Link } from 'lucide-react';

export const CATEGORIES = [
    {
        id: 'history',
        label: 'History',
        icon: BookOpen,
        description: 'Journey through time and events.',
        cost: 100,
        maxPoints: 500,
        questionMix: { purple: 3, orange: 3, yellow: 2 }
    },
    {
        id: 'technology',
        label: 'Tech',
        icon: Cpu,
        description: 'Innovations shaping our future.',
        cost: 150,
        maxPoints: 750,
        questionMix: { purple: 2, orange: 4, yellow: 2 }
    },
    {
        id: 'sports',
        label: 'Sports',
        icon: Trophy,
        description: 'Athletes, games, and records.',
        cost: 100,
        maxPoints: 500,
        questionMix: { purple: 3, orange: 2, yellow: 3 }
    },
    {
        id: 'culture',
        label: 'Culture',
        icon: Palette,
        description: 'Art, music, and traditions.',
        cost: 120,
        maxPoints: 600,
        questionMix: { purple: 4, orange: 2, yellow: 2 }
    },
    {
        id: 'connect',
        label: 'Connect',
        icon: Link,
        description: 'Find the missing link.',
        cost: 200,
        maxPoints: 1000,
        questionMix: { purple: 2, orange: 2, yellow: 4 }
    },
];
