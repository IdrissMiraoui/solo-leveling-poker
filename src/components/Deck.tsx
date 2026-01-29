import React from 'react';

const CARDS = ['0', '1', '2', '3', '5', '8', '13', '?', '☕'];

interface DeckProps {
    onVote: (card: string) => void;
    selectedCard: string | undefined;
    disabled: boolean;
}

export const Deck: React.FC<DeckProps> = ({ onVote, selectedCard, disabled }) => {
    if (disabled) return null;

    return (
        <div className="w-full p-4 md:p-6 bg-gradient-to-t from-black to-transparent flex overflow-x-auto gap-2 md:gap-4 justify-center items-end pb-4 md:pb-8">
            {CARDS.map((card) => (
                <button
                    key={card}
                    onClick={() => !disabled && onVote(card)}
                    disabled={disabled}
                    className={`
            relative flex-shrink-0 w-10 h-14 md:w-16 md:h-24 rounded border flex items-center justify-center font-bold text-lg md:text-xl transition-all duration-200
            ${selectedCard === card
                            ? 'bg-solo-blue text-black -translate-y-2 md:-translate-y-4 shadow-[0_0_20px_rgba(45,212,191,0.6)]'
                            : 'bg-black/80 border-gray-700 text-gray-400 hover:bg-gray-900 hover:-translate-y-1 md:hover:-translate-y-2'}
            ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
          `}
                >
                    {card}
                </button>
            ))}
        </div>
    );
};
