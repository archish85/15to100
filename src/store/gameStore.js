import { create } from 'zustand'
import { supabase } from '../lib/supabase'
import { CATEGORIES } from '../constants/categories'

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

const shuffle = (items) => [...items].sort(() => 0.5 - Math.random())

const normalizeCategory = (value) => String(value || '').trim().toLowerCase()

export const useGameStore = create((set, get) => ({
    coins: 15,
    score: -100,
    currentCategory: null,
    hoveredCategory: null, // New state for hover interaction
    categoryState: {}, // { categoryId: { unlocked: boolean, questions: [], mix: {} } }
    activeCategories: [], // Dynamic 5 randomly picked categories for the current game
    answeredQuestionIds: [], // Track answered questions to prevent repetition
    streak: 0,
    history: {}, // { 'YYYY-MM-DD': { status: 'win'|'loss', categories: 0 } }
    bestCategory: null,
    loading: false,
    error: null,
    gameStatus: 'playing', // 'playing' | 'won' | 'lost'

    pickPlayableCategories: async (answeredQuestionIds) => {
        const { data, error } = await supabase
            .from('questions')
            .select('category, question_id')
            .eq('expiry_status', false)

        if (error || !data) {
            return shuffle(CATEGORIES).slice(0, 5)
        }

        const answeredSet = new Set(answeredQuestionIds || [])
        const availableCategoryIds = new Set(
            data
                .filter((row) => !answeredSet.has(row.question_id))
                .map((row) => normalizeCategory(row.category))
                .filter(Boolean)
        )

        const playable = CATEGORIES.filter((cat) => availableCategoryIds.has(cat.id))

        if (playable.length >= 5) {
            return shuffle(playable).slice(0, 5)
        }

        if (playable.length > 0) {
            const fillers = shuffle(CATEGORIES.filter((cat) => !availableCategoryIds.has(cat.id))).slice(0, 5 - playable.length)
            return [...shuffle(playable), ...fillers]
        }

        return shuffle(CATEGORIES).slice(0, 5)
    },

    buildCategoryState: async (selectedCategories, answeredQuestionIds) => {
        const { data } = await supabase
            .from('questions')
            .select('category, difficulty, question_id')
            .eq('expiry_status', false);
            
        const answeredSet = new Set(answeredQuestionIds || []);
        const validQs = (data || []).filter(q => !answeredSet.has(q.question_id));
        
        const counts = {};
        validQs.forEach(q => {
            const key = `${normalizeCategory(q.category)}-${String(q.difficulty || '').toLowerCase()}`;
            counts[key] = (counts[key] || 0) + 1;
        });

        const initialCategoryState = {};
            
        selectedCategories.forEach(cat => {
            const randomMix = MIX_OPTIONS[Math.floor(Math.random() * MIX_OPTIONS.length)]
            const catId = cat.id.toLowerCase();
            
            const safePurple = Math.min(randomMix.purple, counts[`${catId}-purple`] || 0);
            const safeOrange = Math.min(randomMix.orange, counts[`${catId}-orange`] || 0);
            const safeYellow = Math.min(randomMix.yellow, counts[`${catId}-yellow`] || 0);
            
            initialCategoryState[cat.id] = {
                status: 'unopened',
                unlocked: false, 
                mix: {
                    ...randomMix,
                    purple: safePurple,
                    orange: safeOrange,
                    yellow: safeYellow,
                    maxPoints: (safePurple * 15) + (safeOrange * 9) + (safeYellow * 3)
                },
                questions: [] 
            }
        })

        // Wildcard setup
        const wSafePurple = Math.min(2, counts[`wildcard-purple`] || 0);
        const wSafeOrange = Math.min(1, counts[`wildcard-orange`] || 0);
        const wSafeYellow = Math.min(0, counts[`wildcard-yellow`] || 0); // Requested 0
        
        initialCategoryState['wildcard'] = {
            status: 'unopened',
            unlocked: false,
            mix: { 
                 cost: 0, 
                 purple: wSafePurple, 
                 orange: wSafeOrange, 
                 yellow: wSafeYellow, 
                 maxPoints: (wSafePurple * 15) + (wSafeOrange * 9) + (wSafeYellow * 3)
            },
            questions: []
        }
        
        return initialCategoryState;
    },

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

    loadAnsweredQuestions: () => {
        try {
            const stored = localStorage.getItem('15to100_answered');
            if (stored) return JSON.parse(stored);
        } catch (e) {
            console.error("Failed to load answered questions", e);
        }
        return [];
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

            // Streak bonus: +1 coin per 3 streak days (max +3 bonus)
            const streakBonus = Math.min(3, Math.floor(streak / 3));
            const startingCoins = 15 + streakBonus;

            let initialGameStatus = 'playing';
            if (todayEntry) {
                // Map history status 'win'/'loss' to gameStatus 'won'/'lost'
                if (todayEntry.status === 'win') initialGameStatus = 'won';
                if (todayEntry.status === 'loss') initialGameStatus = 'lost';
            }

            const answeredQuestionIds = get().loadAnsweredQuestions();

            // Randomly select 5 categories for this specific game
            const selectedCategories = await get().pickPlayableCategories(answeredQuestionIds)

            const initialCategoryState = await get().buildCategoryState(selectedCategories, answeredQuestionIds);

            set({
                categoryState: initialCategoryState,
                activeCategories: selectedCategories,
                answeredQuestionIds,
                loading: false,
                history,
                streak,
                gameStatus: initialGameStatus,
                coins: startingCoins
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
                    .eq('expiry_status', false)
                    .order('date_added', { ascending: false })

                if (error) throw error
                
                // Filter out questions the user has already answered
                const answeredSet = new Set(get().answeredQuestionIds || []);
                let available = (data || []).filter(q => !answeredSet.has(q.question_id));
                
                // Fallback: If filtering leaves too few questions, include answered ones to avoid breaking
                if (available.length < count) {
                     available = data || [];
                }
                
                // Shuffle manually to ensure random questions on each fetch
                const shuffled = available.sort(() => 0.5 - Math.random());
                return shuffled.slice(0, count);
            }

            // Note: This logic is imperfect because we need random questions and to track 'asked_status'.
            // For this MVP, we'll just fetch whatever is there.

            const purpleQs = await fetchByDiff('Purple', mix.purple)
            const orangeQs = await fetchByDiff('Orange', mix.orange)
            const yellowQs = await fetchByDiff('Yellow', mix.yellow)

            let allQs = [...purpleQs, ...orangeQs, ...yellowQs];
            const neededCount = (mix.purple + mix.orange + mix.yellow) - allQs.length;

            if (neededCount > 0) {
                const existingIds = allQs.map(q => q.question_id);

                // 1. Try to fill deficit with ANY other questions from the SAME category
                const { data: fallbackData } = await supabase
                    .from('questions')
                    .select('*')
                    .ilike('category', categoryId === 'wildcard' ? 'Wildcard' : categoryId)
                    .eq('expiry_status', false)
                    .order('date_added', { ascending: false });

                let safeFallback = (fallbackData || []).filter(q => !existingIds.includes(q.question_id));
                safeFallback = safeFallback.sort(() => 0.5 - Math.random());
                const addedQs = safeFallback.slice(0, neededCount);
                allQs = [...allQs, ...addedQs];

                // 2. If STILL needed, pad with true Wildcard questions!
                const stillNeeded = neededCount - addedQs.length;
                if (stillNeeded > 0 && categoryId !== 'wildcard') {
                     const { data: panicData } = await supabase
                        .from('questions')
                        .select('*')
                        .ilike('category', 'Wildcard')
                        .eq('expiry_status', false)
                        .order('date_added', { ascending: false });
                        
                     let panicFallback = (panicData || []).filter(q => !existingIds.includes(q.question_id));
                     panicFallback = panicFallback.sort(() => 0.5 - Math.random());
                     allQs = [...allQs, ...panicFallback.slice(0, stillNeeded)];
                }
            }

            allQs = allQs.map(q => ({
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

        // Persist the question ID to local storage ONLY if answered correctly
        let nextAnsweredIds = state.answeredQuestionIds || [];
        if (isCorrect && !nextAnsweredIds.includes(questionId)) {
            nextAnsweredIds = [...nextAnsweredIds, questionId];
            localStorage.setItem('15to100_answered', JSON.stringify(nextAnsweredIds));
        }

        set(state => ({
            score: newScore,
            answeredQuestionIds: nextAnsweredIds,
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

        let bestCategoryName = null;
        let maxCorrect = -1;
        
        Object.entries(state.categoryState).forEach(([catId, cat]) => {
            if (cat.status === 'opened' || cat.status === 'closed') {
                const correctCount = cat.questions.filter(q => q.answered && q.correct).length;
                if (correctCount > maxCorrect && correctCount > 0) {
                    maxCorrect = correctCount;
                    bestCategoryName = catId.charAt(0).toUpperCase() + catId.slice(1);
                }
            }
        });

        newHistory[dateStr] = {
            status: isWin ? 'win' : 'loss',
            categories: categoriesUsed,
            bestCategory: bestCategoryName
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

    resetGame: async () => {
        const { history, streak } = get().loadHistory();
        const answeredQuestionIds = get().loadAnsweredQuestions();
        const streakBonus = Math.min(3, Math.floor(streak / 3));

        const selectedCategories = await get().pickPlayableCategories(answeredQuestionIds)
        
        const initialCategoryState = await get().buildCategoryState(selectedCategories, answeredQuestionIds);

        set({
            coins: 15 + streakBonus,
            score: -100,
            currentCategory: null,
            categoryState: initialCategoryState,
            activeCategories: selectedCategories,
            history,
            streak,
            answeredQuestionIds,
            gameStatus: 'playing'
        });
    },
}))
