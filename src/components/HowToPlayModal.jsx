import { createPortal } from 'react-dom';

const STEPS = [
  { icon: '🪙', title: 'Start with 15 coins', desc: 'Every game begins with 15 coins. Spend them wisely.' },
  { icon: '📂', title: 'Choose a category', desc: 'Hover over a category to see its cost, difficulty mix, and max points. Click to unlock it.' },
  { icon: '🟣🟠🟡', title: 'Pick your difficulty', desc: 'Purple = Hard (15 pts), Orange = Medium (9 pts), Yellow = Easy (3 pts). Higher risk, higher reward.' },
  { icon: '🎯', title: 'Reach 100 points', desc: 'You start 100 points away from the goal. Answer correctly to close the gap.' },
  { icon: '💀', title: "Don't run out of coins", desc: 'Each category costs coins to enter. If you can\'t afford any category, the game ends.' },
  { icon: '🔥', title: 'Build your streak', desc: 'Win daily to build a streak. Come back tomorrow for a new challenge.' },
];

export default function HowToPlayModal({ onClose }) {
  return createPortal(
    <div
      className="fixed inset-0 z-[100] flex flex-col items-center p-4 sm:p-8 overflow-y-auto bg-black/60 backdrop-blur-sm"
      onClick={e => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div className="bg-slate-900 border border-slate-700 rounded-2xl w-full max-w-md p-6 shadow-2xl my-auto flex-shrink-0">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold text-white">How to Play</h2>
          <button onClick={onClose} className="text-slate-500 hover:text-white transition-colors">✕</button>
        </div>

        <div className="flex flex-col gap-4">
          {STEPS.map((step, i) => (
            <div key={i} className="flex items-start gap-3">
              <span className="text-2xl leading-none mt-0.5">{step.icon}</span>
              <div>
                <div className="text-white font-semibold text-sm">{step.title}</div>
                <div className="text-slate-400 text-sm mt-0.5">{step.desc}</div>
              </div>
            </div>
          ))}
        </div>

        <button
          onClick={onClose}
          className="mt-6 w-full py-2.5 !bg-brand-600 hover:!bg-brand-500 !text-white font-bold rounded-lg transition-colors text-sm"
        >
          Let's Play!
        </button>
      </div>
    </div>,
    document.body
  );
}
