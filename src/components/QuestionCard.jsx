import React from 'react';
import { useGameStore } from '../store/gameStore';
import { Check, X } from 'lucide-react';

const QuestionCard = ({ question }) => {
    const { revealQuestion, answerQuestion } = useGameStore();
    const { question_id, difficulty, revealed, answered, correct, options, question: questionText, answer, image_url } = question;
    const [selectedOption, setSelectedOption] = React.useState(null);

    const getColor = () => {
        switch (difficulty) {
            case 'Purple': return '!bg-purple-600 !border-purple-400 !shadow-purple-500/50';
            case 'Orange': return '!bg-orange-500 !border-orange-300 !shadow-orange-500/50';
            case 'Yellow': return '!bg-yellow-400 !border-yellow-200 !text-black !shadow-yellow-500/50';
            default: return '!bg-gray-600';
        }
    };

    const handleAnswer = (idx) => {
        if (selectedOption !== null) return; // Prevent multiple clicks
        setSelectedOption(idx);

        setTimeout(() => {
            answerQuestion(question_id, idx);
            setSelectedOption(null); // Reset local state after answering (though component might unmount/remount)
        }, 1000);
    };

    if (!revealed) {
        return (
            <button
                onClick={() => revealQuestion(question_id)}
                className={`
            !w-24 !h-24 !rounded-full ${getColor()} 
            !border-4 shadow-lg transform hover:scale-110 transition-all duration-300 
            flex items-center justify-center cursor-pointer relative overflow-hidden group
        `}
            >
                <div className="absolute inset-0 bg-white/20 opacity-0 group-hover:opacity-100 transition-opacity" />
                <span className={`font-bold text-3xl ${difficulty === 'Yellow' ? 'text-black' : 'text-white'}`}>
                    {difficulty === 'Purple' ? 15 : difficulty === 'Orange' ? 9 : 3}
                </span>
            </button>
        );
    }

    if (answered) {
        return (
            <div className={`
                !w-24 !h-24 !rounded-full 
                ${correct ? '!bg-green-900/50 !border-green-700' : '!bg-red-900/50 !border-red-700'} 
                !border-4 shadow-none opacity-50 cursor-not-allowed
                flex items-center justify-center relative overflow-hidden
            `}>
                {correct ? <Check className="w-10 h-10 text-green-500" /> : <X className="w-10 h-10 text-red-500" />}
            </div>
        );
    }

    return (
        <div className="w-full max-w-2xl bg-slate-800 p-8 rounded-2xl border border-slate-700 shadow-2xl animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="flex justify-between items-center mb-6">
                <div className={`px-4 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${getColor()} ${difficulty === 'Yellow' ? 'text-black' : 'text-white'}`}>
                    {difficulty} Question
                </div>
                <div className="text-gray-400 text-sm">Select an answer</div>
            </div>

            {image_url && (
                <div className="mb-6 overflow-hidden rounded-xl border border-slate-700/50 shadow-lg shrink-0">
                    <img src={image_url} alt="Question context" className="w-full max-h-64 object-cover" />
                </div>
            )}

            <h3 className="text-2xl font-bold text-white mb-8 leading-tight">{questionText}</h3>

            <div className="grid grid-cols-1 gap-4">
                {options.map((opt, idx) => {
                    let btnClass = "p-5 text-left rounded-xl border transition-all duration-200 group relative overflow-hidden ";

                    if (selectedOption !== null) {
                        if (idx === answer) {
                            // Correct answer (always green if selection made)
                            btnClass += "!bg-green-600 !border-green-400 ";
                        } else if (idx === selectedOption) {
                            // Wrong selection (red)
                            btnClass += "!bg-red-600 !border-red-400 ";
                        } else {
                            // Other options (dimmed)
                            btnClass += "!bg-slate-800 border-slate-700 opacity-50 ";
                        }
                    } else {
                        // Default state
                        btnClass += "!bg-slate-800 hover:!bg-brand-900/50 border-slate-600 hover:border-brand-500 ";
                    }

                    return (
                        <button
                            key={idx}
                            onClick={() => handleAnswer(idx)}
                            disabled={selectedOption !== null}
                            className={btnClass}
                        >
                            <span className={`inline-block w-8 font-bold transition-colors ${selectedOption !== null ? 'text-white' : 'text-gray-400 group-hover:text-brand-400'}`}>
                                {String.fromCharCode(65 + idx)}.
                            </span>
                            <span className={`transition-colors ${selectedOption !== null ? '!text-white' : '!text-white group-hover:text-brand-100'}`}>
                                {opt}
                            </span>
                        </button>
                    );
                })}
            </div>
        </div>
    );
};

export default QuestionCard;
