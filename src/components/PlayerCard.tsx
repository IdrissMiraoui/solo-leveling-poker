import React from 'react';
import { motion } from 'framer-motion';
import { useLanguage } from '../contexts/LanguageContext';
import type { Player } from '../hooks/useRoom';

interface PlayerCardProps {
    player: Player;
    isRevealed: boolean;
    score?: number; // Calculated delta or actual vote
    status: 'SAFE' | 'PUNISHED' | 'NORMAL';
}

export const PlayerCard: React.FC<PlayerCardProps> = ({ player, isRevealed, status }) => {
    const { t } = useLanguage();
    return (
        <motion.div
            layoutId={player.id}
            className={`flex flex-col items-center ${status === 'PUNISHED' ? 'z-50' : ''}`}
            transition={{ type: "spring", stiffness: 300, damping: 30 }}
        >
            {/* Avatar */}
            <div className={`relative w-12 h-12 md:w-16 md:h-16 rounded-full border-2 ${status === 'PUNISHED' ? 'border-red-600 shadow-[0_0_30px_rgba(239,68,68,0.8)]' : 'border-solo-blue'} overflow-hidden bg-black mb-1 md:mb-2`}>
                <img src={player.avatar} alt={player.name} className="w-full h-full object-cover" />
            </div>

            {/* Name */}
            <span className="text-[10px] md:text-xs text-gray-400 font-mono mb-1 md:mb-2">{player.name}</span>

            {/* Card */}
            <div className="relative w-12 h-16 md:w-16 md:h-24 perspective-1000">
                <motion.div
                    className="w-full h-full relative preserve-3d"
                    animate={{ rotateY: isRevealed ? 180 : 0 }}
                    transition={{ duration: 0.6 }}
                    style={{ transformStyle: 'preserve-3d' }}
                >
                    {/* Front (Hidden) */}
                    <div className="absolute w-full h-full backface-hidden bg-gradient-to-br from-gray-800 to-black border border-gray-600 rounded flex items-center justify-center">
                        {player.vote ? (
                            <div className="w-6 h-6 md:w-8 md:h-8 rounded-full bg-solo-blue/20 flex items-center justify-center">
                                <div className="w-3 h-3 md:w-4 md:h-4 bg-solo-blue rounded-full animate-pulse"></div>
                            </div>
                        ) : (
                            <span className="text-gray-600 text-lg md:text-2xl">?</span>
                        )}
                    </div>

                    {/* Back (Revealed) */}
                    <div className="absolute w-full h-full backface-hidden bg-white text-black border-2 border-solo-blue rounded flex items-center justify-center font-bold text-xl md:text-2xl shadow-[0_0_15px_rgba(45,212,191,0.5)]" style={{ transform: "rotateY(180deg)" }}>
                        {player.vote}
                    </div>
                </motion.div>
            </div>

            {/* Punishment Dialogue */}
            {status === 'PUNISHED' && isRevealed && (
                <motion.div
                    initial={{ opacity: 0, scale: 0.5 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="absolute -top-16 left-1/2 -translate-x-1/2 w-48 bg-black/90 border border-red-500 text-red-500 p-2 text-xs font-mono rounded text-center whitespace-normal"
                >
                    {t('punishment_message')}
                </motion.div>
            )}
        </motion.div>
    );
};
