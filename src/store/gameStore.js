import { create } from 'zustand'
import { supabase } from '../lib/supabase'

// Constants for scoring
const POINTS = {
    Purple: 15,
    Orange: 9,
    Yellow: 3,
    'Wildcard Purple': 20,
    'Wildcard Orange': 15,
}

// Mix configurations
const MIX_OPTIONS = [
    { cost: 4, purple: 3, orange: 2, yellow: 1, maxPoints: 66 },
    { cost: 5, purple: 3, orange: 3, yellow: 2, maxPoints: 78 },
    { cost: 7, purple: 2, orange: 3, yellow: 3, maxPoints: 66 },
    { cost: 3, purple: 2, orange: 2, yellow: 2, maxPoints: 54 },
    { cost: 3, purple: 1, orange: 2, yellow: 3, maxPoints: 42 },
    { cost: 4, purple: 1, orange: 3, yellow: 2, maxPoints: 48 },
]

export const useGameStore = create((set, get) => ({
    coins: 15,
    score: -100,
    currentCategory: null,
    hoveredCategory: null, // New state for hover interaction
    categoryState: {}, // { categoryId: { unlocked: boolean, questions: [], mix: {} } }
    streak: 0,
    history: {}, // { 'YYYY-MM-DD': { status: 'win'|'loss', categories: 0 } }
    bestCategory: null,
    loading: false,
    error: null,
    gameStatus: 'playing', // 'playing' | 'won' | 'lost'

    // Helper to load history
    loadHistory: () => {
        try {
            const stored = localStorage.getItem('15to100_history');
            if (stored) {
                const parsed = JSON.parse(stored);
                let streak = 0;
                let date = new Date();
                date.setHours(0, 0, 0, 0);

                // Check yesterday backwards
                date.setDate(date.getDate() - 1);

                while (true) {
                    const dateStr = date.toISOString().split('T')[0];
                    const entry = parsed[dateStr];
                    if (entry && entry.status === 'win') {
                        streak++;
                        date.setDate(date.getDate() - 1);
                    } else {
                        break;
                    }
                }

                // Check today (for streak calculation if recently won)
                const todayStr = new Date().toISOString().split('T')[0];
                if (parsed[todayStr] && parsed[todayStr].status === 'win') {
                    streak++;
                }

                return { history: parsed, streak };
            }
        } catch (e) {
            console.error("Failed to load history", e);
        }
        return { history: {}, streak: 0 };
    },

    setHoveredCategory: (category) => set({ hoveredCategory: category }),

    // Initialize Game (Load questions, etc.)
    initGame: async () => {
        set({ loading: true })
        try {
            // Check if played today
            const { history, streak } = get().loadHistory();
            const todayStr = new Date().toISOString().split('T')[0];
            const todayEntry = history[todayStr];

            let initialGameStatus = 'playing';
            if (todayEntry) {
                // Map history status 'win'/'loss' to gameStatus 'won'/'lost'
                if (todayEntry.status === 'win') initialGameStatus = 'won';
                if (todayEntry.status === 'loss') initialGameStatus = 'lost';
            }

            // In a real app, we'd fetch questions here or per category.
            // For now, we'll just set up the category mixes.
            const initialCategoryState = {}
            const categories = ['history', 'technology', 'sports', 'culture', 'connect']

            categories.forEach(cat => {
                const randomMix = MIX_OPTIONS[Math.floor(Math.random() * MIX_OPTIONS.length)]
                initialCategoryState[cat] = {
                    status: 'unopened', // State Machine: unopened -> opened -> closed
                    unlocked: false, // Keeping for backward compat if needed, but status replaces it
                    mix: randomMix,
                    questions: [] // Will be populated on unlock
                }
            })

            // Wildcard setup
            initialCategoryState['wildcard'] = {
                status: 'unopened',
                unlocked: false,
                mix: { cost: 0, purple: 2, orange: 1, yellow: 0, maxPoints: 60 }, // Example mix
                questions: []
            }

            set({
                categoryState: initialCategoryState,
                loading: false,
                history,
                streak,
                gameStatus: initialGameStatus
            })

        } catch (err) {
            set({ error: err.message, loading: false })
        }
    },

    // Select/Unlock Category
    selectCategory: async (categoryId) => {
        const state = get()
        if (state.gameStatus !== 'playing') return; // Prevent moves if game ended

        const catState = state.categoryState[categoryId]

        if (!catState) return

        // State Machine Check: Only allow opening if 'unopened'
        // If already 'opened' (current), do nothing (or just view)
        // If 'closed', do nothing
        if (catState.status === 'closed') return;
        if (state.currentCategory === categoryId) return; // Already selected/opened

        // If previously unlocked but somehow not current (shouldn't happen in strict mode but good safety)
        if (catState.status === 'opened') {
            set({ currentCategory: categoryId })
            return
        }

        // Check coins
        if (state.coins < catState.mix.cost) {
            alert("Not enough coins!")
            return
        }

        // Deduct coins and unlock (Transition to 'opened')
        set(state => ({
            coins: state.coins - catState.mix.cost,
            currentCategory: categoryId,
            categoryState: {
                ...state.categoryState,
                [categoryId]: {
                    ...catState,
                    status: 'opened',
                    unlocked: true
                }
            }
        }))

        // Fetch questions for this category
        await get().fetchQuestionsForCategory(categoryId)
    },

    fetchQuestionsForCategory: async (categoryId) => {
        set({ loading: true })
        const state = get()
        const mix = state.categoryState[categoryId].mix

        try {
            // Fetch questions from Supabase based on mix
            // This is a simplified fetch. In reality, we need to query by difficulty and limit.
            // We'll simulate fetching for now using the seed data structure logic.

            // Helper to fetch N questions of difficulty D
            const fetchByDiff = async (diff, count) => {
                if (count === 0) return []
                const { data, error } = await supabase
                    .from('questions')
                    .select('*')
                    .ilike('category', categoryId === 'wildcard' ? 'Wildcard' : categoryId)
                    .eq('difficulty', diff)
                    .limit(count)

                if (error) throw error
                return data || []
            }

            // Note: This logic is imperfect because we need random questions and to track 'asked_status'.
            // For this MVP, we'll just fetch whatever is there.

            const purpleQs = await fetchByDiff('Purple', mix.purple)
            const orangeQs = await fetchByDiff('Orange', mix.orange)
            const yellowQs = await fetchByDiff('Yellow', mix.yellow)

            console.log(`[DEBUG] Fetching for ${categoryId}:`, mix);
            console.log(`[DEBUG] Got: Purple=${purpleQs.length}, Orange=${orangeQs.length}, Yellow=${yellowQs.length}`);

            const allQs = [...purpleQs, ...orangeQs, ...yellowQs].map(q => ({
                ...q,
                revealed: false,
                answered: false,
                correct: false
            }))

            set(state => ({
                categoryState: {
                    ...state.categoryState,
                    [categoryId]: {
                        ...state.categoryState[categoryId],
                        questions: allQs
                    }
                },
                loading: false
            }))

        } catch (err) {
            console.error("Error fetching questions:", err)
            set({ error: err.message, loading: false })
        }
    },

    // Answer Question
    answerQuestion: (questionId, optionIndex) => {
        const state = get()
        if (state.gameStatus !== 'playing') return;

        const categoryId = state.currentCategory
        if (!categoryId) return

        const questions = state.categoryState[categoryId].questions
        const qIndex = questions.findIndex(q => q.question_id === questionId)
        if (qIndex === -1) return

        const question = questions[qIndex]
        if (question.answered) return

        const isCorrect = question.answer === optionIndex
        const points = isCorrect ? (POINTS[question.difficulty] || 0) : 0

        const newQuestions = [...questions]
        newQuestions[qIndex] = { ...question, answered: true, correct: isCorrect, revealed: true }

        // Calculate potential new score
        const newScore = state.score + points;

        set(state => ({
            score: newScore,
            categoryState: {
                ...state.categoryState,
                [categoryId]: {
                    ...state.categoryState[categoryId],
                    questions: newQuestions
                }
            }
        }))

        // Check for win condition
        if (newScore >= 0) {
            get().handleGameEnd(true);
            get().saveGameResults();
        } else {
            get().checkLossCondition();
        }
    },

    saveGameResults: async () => {
        const state = get();
        const userId = crypto.randomUUID();

        try {
            // 1. Create User Session
            const { error: userError } = await supabase
                .from('users')
                .insert([{ user_id: userId }]);

            if (userError) {
                console.error("Error creating user:", userError);
                return;
            }

            // 2. Prepare Responses
            const allQuestions = Object.values(state.categoryState)
                .flatMap(c => c.questions)
                .filter(q => q.answered);

            if (allQuestions.length === 0) return;

            const responses = allQuestions.map(q => ({
                user_id: userId,
                question_id: q.question_id,
                is_answered_correctly: q.correct,
                date_asked: new Date().toISOString()
            }));

            // 3. Insert Responses
            const { error: responseError } = await supabase
                .from('responses')
                .insert(responses);

            if (responseError) {
                console.error("Error saving responses:", responseError);
            } else {
                console.log("Game results saved successfully for user:", userId);
            }

        } catch (err) {
            console.error("Unexpected error saving results:", err);
        }
    },

    revealQuestion: (questionId) => {
        const state = get()
        if (state.gameStatus !== 'playing') return;

        const categoryId = state.currentCategory
        if (!categoryId) return

        const questions = state.categoryState[categoryId].questions
        const qIndex = questions.findIndex(q => q.question_id === questionId)
        if (qIndex === -1) return

        const newQuestions = [...questions]
        newQuestions[qIndex] = { ...newQuestions[qIndex], revealed: true }

        set(state => ({
            categoryState: {
                ...state.categoryState,
                [categoryId]: {
                    ...state.categoryState[categoryId],
                    questions: newQuestions
                }
            }
        }))
    },

    forfeitCategory: () => {
        const state = get();
        if (state.gameStatus !== 'playing') return;

        const currentCat = state.currentCategory;
        if (!currentCat) return;

        set(state => ({
            currentCategory: null,
            categoryState: {
                ...state.categoryState,
                [currentCat]: {
                    ...state.categoryState[currentCat],
                    status: 'closed'
                }
            }
        }))
    },

    completeCategory: () => {
        const state = get();
        if (state.gameStatus !== 'playing') return;

        const currentCat = state.currentCategory;
        if (!currentCat) return;

        set(state => ({
            currentCategory: null,
            categoryState: {
                ...state.categoryState,
                [currentCat]: {
                    ...state.categoryState[currentCat],
                    status: 'closed'
                }
            }
        }))
    },

    checkLossCondition: () => {
        const state = get();
        const minCost = 3;
        const canOpenNew = state.coins >= minCost;

        let canAnswerCurrent = false;
        if (state.currentCategory) {
            const cat = state.categoryState[state.currentCategory];
            if (cat && cat.status === 'opened') {
                const hasUnanswered = cat.questions.some(q => !q.answered);
                if (hasUnanswered) canAnswerCurrent = true;
            }
        }

        if (!canOpenNew && !canAnswerCurrent && state.score < 0) {
            get().handleGameEnd(false);
        }
    },

    handleGameEnd: (isWin) => {
        const state = get();

        // Prevent re-processing if already ended
        if (state.gameStatus !== 'playing') return;

        const dateStr = new Date().toISOString().split('T')[0];
        const newHistory = { ...state.history };

        const categoriesUsed = Object.values(state.categoryState).filter(c => c.status === 'opened' || c.status === 'closed').length;

        newHistory[dateStr] = {
            status: isWin ? 'win' : 'loss',
            categories: categoriesUsed
        };

        let newStreak = state.streak;

        if (isWin) {
            if (!state.history[dateStr] || state.history[dateStr].status !== 'win') {
                const yesterday = new Date();
                yesterday.setDate(yesterday.getDate() - 1);
                const yStr = yesterday.toISOString().split('T')[0];
                const yWin = newHistory[yStr] && newHistory[yStr].status === 'win';

                if (yWin) {
                    newStreak = state.streak + 1;
                } else {
                    newStreak = 1;
                }
            }
        } else {
            newStreak = 0;
        }

        set({
            history: newHistory,
            streak: newStreak,
            gameStatus: isWin ? 'won' : 'lost'
        });
        localStorage.setItem('15to100_history', JSON.stringify(newHistory));
    },

    resetGame: () => {
        const { history, streak } = get().loadHistory();
        set({
            coins: 15,
            score: -100,
            currentCategory: null,
            categoryState: {},
            history,
            streak,
            gameStatus: 'playing'
        });
    },
}))
