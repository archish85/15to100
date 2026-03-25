import React from 'react';
import { useGameStore } from '../store/gameStore';
import { HelpCircle } from 'lucide-react';
import { CATEGORIES } from '../constants/categories';

// --- 4. COMPONENTS ---

const HexagonTile = ({ onClick, onMouseEnter, onMouseLeave, active, disabled, icon: Icon, className, label, cost, shape = 'hexagon', defaultColor, hoverColor }) => (
    <div
        onClick={!disabled ? onClick : undefined}
        onMouseEnter={!disabled ? onMouseEnter : undefined}
        onMouseLeave={!disabled ? onMouseLeave : undefined}
        className={`
            relative flex flex-col items-center justify-center 
            text-white transition-all duration-300 group
            ${disabled ? 'opacity-30 grayscale cursor-not-allowed' : 'hover:scale-125 hover:rotate-6 cursor-pointer'}
            ${shape === 'circle' ? 'w-[72px] h-[72px] rounded-full' : (shape === 'square' ? 'w-[48px] h-[48px] lg:w-[64px] lg:h-[64px] rounded-lg' : 'w-[72px] h-[86px]')}
            ${className}
        `}
        style={shape === 'hexagon' ? { clipPath: 'polygon(50% 0%, 100% 25%, 100% 75%, 50% 100%, 0% 75%, 0% 25%)' } : undefined}
    >
        <div className={`
            absolute inset-0 
            ${active ? 'bg-brand-600' : disabled ? 'bg-slate-700' : (defaultColor || 'bg-slate-700') + ' ' + (hoverColor || 'group-hover:bg-slate-600')} 
            transition-colors duration-300
            ${shape === 'circle' ? 'rounded-full' : (shape === 'square' ? 'rounded-lg' : '')}
        `} />

        {/* Default State: Icon Only */}
        <div className="relative z-10 flex flex-col items-center group-hover:hidden transition-opacity duration-200">
            <Icon className={`w-6 h-6 ${active ? 'text-white' : 'text-gray-300'}`} />
        </div>

        {/* Hover State: Name + Cost */}
        <div className="relative z-10 hidden group-hover:flex flex-col items-center justify-center animate-in fade-in zoom-in duration-200 absolute inset-0 p-1">
            <span className="text-[8px] uppercase font-bold text-white tracking-wider text-center leading-tight mb-0.5">{label}</span>
            <span className="text-[10px] font-bold text-yellow-400">{cost}</span>
        </div>
    </div>
);

const CategoryPanel = () => {
    const { currentCategory, selectCategory, setHoveredCategory, categoryState } = useGameStore();

    // MATH SETTINGS (Orbit - Desktop)
    const radius = 75;
    const totalItems = CATEGORIES.length;
    const angleStep = 360 / totalItems;

    const isCategoryClosed = (id) => {
        const state = categoryState?.[id];
        return state?.status === 'closed';
    };

    const isWildcardDisabled = (currentCategory && currentCategory !== 'wildcard') || isCategoryClosed('wildcard');

    const renderTile = (cat, isWildcard = false) => {
        const id = isWildcard ? 'wildcard' : cat.id;
        const isDisabled = isWildcard ? isWildcardDisabled : ((currentCategory && currentCategory !== id) || isCategoryClosed(id));
        const cost = isWildcard ? (categoryState['wildcard']?.mix?.cost ?? 0) : (categoryState[id]?.mix?.cost ?? cat.cost);
        const icon = isWildcard ? HelpCircle : cat.icon;
        const label = isWildcard ? 'Wildcard' : cat.label;
        const shape = isWildcard ? (window.innerWidth >= 1024 ? 'circle' : 'square') : (window.innerWidth >= 1024 ? 'circle' : 'square'); // Initial server render safe-guard not needed here as client-only app, but dynamic shape via prop below

        const clickHandler = () => !isDisabled && selectCategory(id);
        const mouseEnterHandler = () => !isDisabled && setHoveredCategory(isWildcard ? {
            id: 'wildcard',
            label: 'Wildcard',
            icon: HelpCircle,
            description: 'Surprise me! A random mix of questions.',
            cost: cost,
            maxPoints: 60,
            questionMix: { purple: 2, orange: 1, yellow: 0 }
        } : { ...cat, cost: cost });

        return (
            <HexagonTile
                key={id}
                icon={icon}
                label={label}
                cost={cost}
                shape="square" /* Mobile default, Desktop overrides via prop or conditional rendering below */
                active={currentCategory === id}
                disabled={isDisabled}
                onClick={clickHandler}
                onMouseEnter={mouseEnterHandler}
                onMouseLeave={() => setHoveredCategory(null)}
                className=""
                defaultColor={isWildcard ? "bg-brand-900/80" : undefined}
                hoverColor={isWildcard ? "group-hover:bg-brand-800" : undefined}
            />
        );
    };

    // Helper for pure mobile render
    const renderMobileTile = (cat) => {
        const isDisabled = (currentCategory && currentCategory !== cat.id) || isCategoryClosed(cat.id);
        const dynamicCost = categoryState[cat.id]?.mix?.cost ?? cat.cost;

        // On Mobile: Click triggers "Hover" (Preview) state
        const clickHandler = () => !isDisabled && setHoveredCategory({ ...cat, cost: dynamicCost });

        return (
            <HexagonTile
                key={cat.id}
                icon={cat.icon}
                label={cat.label}
                cost={dynamicCost}
                shape="square" // Mobile specific
                active={currentCategory === cat.id}
                disabled={isDisabled}
                onClick={clickHandler}
            />
        );
    };

    const renderWildcardMobile = () => {
        return (
            <HexagonTile
                icon={HelpCircle}
                label="Wildcard"
                cost={categoryState['wildcard']?.mix?.cost ?? 0}
                shape="square"
                defaultColor="bg-brand-900/80"
                hoverColor="group-hover:bg-brand-800"
                active={currentCategory === 'wildcard'}
                disabled={isWildcardDisabled}
                onClick={() => !currentCategory && !isWildcardDisabled && setHoveredCategory({
                    id: 'wildcard',
                    label: 'Wildcard',
                    icon: HelpCircle,
                    description: 'Surprise me! A random mix of questions.',
                    cost: categoryState['wildcard']?.mix?.cost ?? 0,
                    maxPoints: 60,
                    questionMix: { purple: 2, orange: 1, yellow: 0 }
                })}
            />
        )
    }


    return (
        <div className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-md rounded-xl p-4 lg:p-6 flex-grow border border-slate-200 dark:border-slate-800 flex flex-col items-center lg:justify-center relative min-h-full w-full shadow-sm transition-colors duration-300">
            <h2 className="hidden lg:block text-lg font-bold mb-12 text-slate-500 dark:text-brand-300 text-center tracking-tight">
                Choose: <span className="text-slate-800 dark:text-white uppercase px-2">{currentCategory}</span>
            </h2>

            {/* --- MOBILE LAYOUT (< 1024px) --- */}
            <div className="lg:hidden flex flex-col gap-2 w-full h-full justify-center overflow-y-auto">
                {/*  
                      Rectangular Grid: 1 Column (6x1). 
                      Order: 5 Categories + 1 Wildcard = 6 items.
                      We will just map them sequentially and place Wildcard at the end or middle?
                      User request: "square tile with the wildcard tile in the center".
                      In a 1x6 grid, "center" is index 2 or 3. 
                      Let's do: Cat 0, Cat 1, Cat 2, Wildcard, Cat 3, Cat 4.
                  */}
                <div className="grid grid-cols-1 gap-3 place-items-center py-4">
                    {renderMobileTile(CATEGORIES[0])}
                    {renderMobileTile(CATEGORIES[1])}
                    {renderMobileTile(CATEGORIES[2])}
                    {renderWildcardMobile()}
                    {renderMobileTile(CATEGORIES[3])}
                    {renderMobileTile(CATEGORIES[4])}
                </div>
            </div>


            {/* --- DESKTOP LAYOUT (Orbit) (>= 1024px) --- */}
            <div className="hidden lg:flex relative w-[240px] h-[240px] items-center justify-center">

                {/* CENTER: Wildcard (Static) */}
                <div className="relative z-20">
                    <HexagonTile
                        icon={HelpCircle}
                        label="Wildcard"
                        cost={categoryState['wildcard']?.mix?.cost ?? 0}
                        shape="circle"
                        defaultColor="bg-brand-900/80"
                        hoverColor="group-hover:bg-brand-800"
                        active={currentCategory === 'wildcard'}
                        disabled={isWildcardDisabled}
                        onClick={() => !currentCategory && selectCategory('wildcard')}
                        onMouseEnter={() => !isWildcardDisabled && setHoveredCategory({
                            id: 'wildcard',
                            label: 'Wildcard',
                            icon: HelpCircle,
                            description: 'Surprise me! A random mix of questions.',
                            cost: categoryState['wildcard']?.mix?.cost ?? 0,
                            maxPoints: 60,
                            questionMix: { purple: 2, orange: 1, yellow: 0 }
                        })}
                        onMouseLeave={() => setHoveredCategory(null)}
                        className=""
                    />
                </div>

                {/* ORBIT: Dynamic Categories */}
                {CATEGORIES.map((cat, index) => {
                    const angle = (index * angleStep);
                    const isDisabled = (currentCategory && currentCategory !== cat.id) || isCategoryClosed(cat.id);
                    const dynamicCost = categoryState[cat.id]?.mix?.cost ?? cat.cost;

                    return (
                        <div
                            key={cat.id}
                            className="absolute z-10 top-1/2 left-1/2"
                            style={{
                                marginLeft: '-36px',
                                marginTop: '-36px',
                                transform: `rotate(${angle}deg) translate(${radius}px) rotate(-${angle}deg)`
                            }}
                        >
                            <HexagonTile
                                icon={cat.icon}
                                label={cat.label}
                                cost={dynamicCost}
                                shape="circle"
                                active={currentCategory === cat.id}
                                disabled={isDisabled}
                                onClick={() => !isDisabled && selectCategory(cat.id)}
                                onMouseEnter={() => !isDisabled && setHoveredCategory({ ...cat, cost: dynamicCost })}
                                onMouseLeave={() => setHoveredCategory(null)}
                                className=""
                            />
                        </div>
                    );
                })}
            </div>
        </div>
    );
}

export default CategoryPanel;
