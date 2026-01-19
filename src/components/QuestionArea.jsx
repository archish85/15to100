import React from 'react';
import { useGameStore } from '../store/gameStore';
import QuestionCard from './QuestionCard';
import { CATEGORIES } from '../constants/categories';
import GameEndScreen from './GameEndScreen';

const QuestionArea = () => {
    const { currentCategory, categoryState, forfeitCategory, hoveredCategory, selectCategory, gameStatus } = useGameStore();

    // 0. GAME END STATE check moved to end of function to avoid hook violation

    // 3. ACTIVE GAME STATE CALCULATIONS (Must be before conditional returns)
    const categoryData = currentCategory ? categoryState[currentCategory] : null;
    const questions = categoryData?.questions || [];
    const activeQuestion = questions.find(q => q.revealed && !q.answered);
    const allAnswered = questions.length > 0 && questions.every(q => q.answered);

    React.useEffect(() => {
        if (allAnswered && currentCategory && gameStatus === 'playing') {
            const timer = setTimeout(() => {
                useGameStore.getState().completeCategory();
            }, 2000);
            return () => clearTimeout(timer);
        }
    }, [allAnswered, currentCategory, gameStatus]);

    // Verification Log
    React.useEffect(() => {
        if (activeQuestion) {
            console.log("Active Question Data:", {
                id: activeQuestion.question_id,
                text: activeQuestion.question,
                source: activeQuestion.source,
                submitted_by: activeQuestion.submitted_by,
                corrected_date: activeQuestion.corrected_date,
                corrected_by: activeQuestion.corrected_by
            });
        }
    }, [activeQuestion]);

    // 1. HOVER STATE (Takes Precedence only if no category selected)
    if (hoveredCategory && !currentCategory) {
        // Fetch dynamic data from store if available
        const dynamicData = categoryState[hoveredCategory.id];
        const mix = dynamicData?.mix || hoveredCategory.questionMix;
        const cost = dynamicData?.mix?.cost ?? hoveredCategory.cost;
        const maxPoints = dynamicData?.mix?.maxPoints ?? hoveredCategory.maxPoints;

        return (
            <div className="bg-slate-900/50 rounded-xl p-8 border border-slate-800 h-full flex flex-col items-center justify-center text-center shadow-2xl animate-in fade-in zoom-in duration-200 relative">
                <div
                    onClick={() => selectCategory(hoveredCategory.id)}
                    className={`w-24 h-24 rounded-full bg-slate-800 flex items-center justify-center mb-2 border border-slate-700 transition-all duration-300 group ${gameStatus === 'playing' ? 'cursor-pointer hover:border-brand-500 hover:scale-110' : 'cursor-not-allowed opacity-80'}`}
                >
                    <hoveredCategory.icon className="w-12 h-12 text-brand-400 group-hover:text-brand-300" />
                </div>

                {/* Mobile Instruction */}
                {gameStatus === 'playing' && (
                    <p className="text-sm text-yellow-400 mb-6 lg:hidden animate-pulse font-medium">Click the icon to select the category</p>
                )}

                <h2 className="text-4xl font-bold text-white mb-2">{hoveredCategory.label}</h2>
                <p className="text-xl text-gray-400 mb-8 max-w-md">{hoveredCategory.description}</p>

                <div className="grid grid-cols-2 gap-4 lg:gap-8 w-full max-w-sm mb-8">
                    <div className="bg-slate-800/50 p-4 rounded-lg border border-slate-700">
                        <div className="text-sm text-gray-500 uppercase tracking-wider mb-1">Entry Cost</div>
                        <div className="text-xl lg:text-3xl font-bold text-yellow-400">{cost} Coins</div>
                    </div>
                    <div className="bg-slate-800/50 p-4 rounded-lg border border-slate-700">
                        <div className="text-sm text-gray-500 uppercase tracking-wider mb-1">Max Points</div>
                        <div className="text-xl lg:text-3xl font-bold text-green-400">{maxPoints}</div>
                    </div>
                </div>

                <div className="flex gap-4 items-center">
                    <div className="flex flex-col items-center">
                        <div className="w-3 h-3 rounded-full bg-purple-500 mb-2" />
                        <span className="text-sm text-gray-400 font-medium">{mix.purple} Purple</span>
                    </div>
                    <div className="flex flex-col items-center">
                        <div className="w-3 h-3 rounded-full bg-orange-500 mb-2" />
                        <span className="text-sm text-gray-400 font-medium">{mix.orange} Orange</span>
                    </div>
                    <div className="flex flex-col items-center">
                        <div className="w-3 h-3 rounded-full bg-yellow-500 mb-2" />
                        <span className="text-sm text-gray-400 font-medium">{mix.yellow} Yellow</span>
                    </div>
                </div>
            </div>
        );
    }

    // 0. GAME END STATE (Must be after hooks)
    if (gameStatus !== 'playing') {
        return <GameEndScreen status={gameStatus} />;
    }

    // 2. DEFAULT WELCOME STATE
    if (!currentCategory) {
        return (
            <div className="bg-slate-900/50 rounded-xl p-8 border border-slate-800 h-full flex flex-col items-center justify-center text-center shadow-2xl relative">
                <h1 className="text-5xl font-bold mb-4 text-white">
                    Welcome to <span className="text-brand-400">15 to 100</span>
                </h1>
                <p className="text-lg text-gray-300 mb-8 max-w-lg leading-relaxed">
                    Use your <span className="text-yellow-400 font-bold">15 coins</span> to select categories. Answer questions to score points and reach 100 before you run out of coins!
                </p>
            </div>
        );
    }

    // 3. ACTIVE GAME STATE (Loading Check)
    if (!categoryData) {
        return <div className="flex items-center justify-center h-full text-white">Loading...</div>;
    }

    return (
        <div className="bg-slate-900/50 rounded-xl p-6 border border-slate-800 h-full flex flex-col shadow-2xl relative">
            <div className="flex justify-between items-center mb-6">
                <div>
                    <h2 className="text-3xl font-bold text-white capitalize flex items-center">
                        {currentCategory}
                        {allAnswered && <span className="text-green-400 text-lg ml-4 font-normal">(Completed)</span>}
                    </h2>
                    {CATEGORIES.find(c => c.id === currentCategory)?.description && (
                        <p className="text-gray-400 text-sm mt-1">
                            {CATEGORIES.find(c => c.id === currentCategory).description}
                        </p>
                    )}
                </div>
            </div>

            <div className="flex-grow flex flex-col items-center justify-center overflow-y-auto w-full relative">
                {!activeQuestion && !allAnswered && (
                    <p className="text-gray-400 mb-6 text-lg animate-pulse">Select a question to answer</p>
                )}

                {activeQuestion ? (
                    <QuestionCard question={activeQuestion} />
                ) : (
                    <div className="flex flex-col items-center w-full">
                        <div className="flex flex-wrap justify-center gap-6 mb-8">
                            {questions.map((q) => (
                                <QuestionCard key={q.question_id} question={q} />
                            ))}
                        </div>

                        {!allAnswered && gameStatus === 'playing' && (
                            <div className="flex flex-col items-center gap-4">
                                <div className="bg-slate-800/50 px-4 py-2 rounded-full border border-slate-700 text-gray-300 text-sm font-medium">
                                    Max Points Remaining : <span className="text-green-400 font-bold ml-1">
                                        {questions.reduce((acc, q) => {
                                            if (q.answered) return acc;
                                            const points = q.difficulty === 'Purple' ? 15 : q.difficulty === 'Orange' ? 9 : 3;
                                            return acc + points;
                                        }, 0)}
                                    </span>
                                </div>
                                <button
                                    onClick={forfeitCategory}
                                    className="px-3 py-1.5 rounded bg-red-500/10 text-red-400 hover:bg-red-500/20 text-xs font-medium transition-colors border border-red-500/20"
                                >
                                    Forfeit
                                </button>
                            </div>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
};

export default QuestionArea;
