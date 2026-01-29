import React, { useMemo, useState, useEffect } from 'react';
import { motion, AnimatePresence, LayoutGroup } from 'framer-motion';
import { Copy, Check, Globe, LogOut } from 'lucide-react';
import { useRoom } from '../hooks/useRoom';
import { useLanguage } from '../contexts/LanguageContext';
import { Deck } from './Deck';
import { PlayerCard } from './PlayerCard';

// ... assets ...
import statueNeutral from '../assets/images/statue_neutral.jpg';
import statueAngry from '../assets/images/statue_smile.jpg'; // Using the close-up for more impact
import backgroundArena from '../assets/images/background_arena.jpg';

interface ArenaProps {
    roomId: string;
    playerName: string;
    avatar: string;
    onLeave: () => void;
}

export const Arena: React.FC<ArenaProps> = ({ roomId, playerName, avatar, onLeave }) => {
    const { t, language, setLanguage } = useLanguage();
    const { playerId, roomData, vote, reveal, reset, revote, leave, isConnected } = useRoom(roomId, playerName, avatar);

    const handleLeave = () => {
        leave();
        onLeave();
    }

    // Logic
    const { average, punishedIds, isRevealed, isUnanimous } = useMemo(() => {
        if (!roomData?.players) return { average: 0, punishedIds: [] as string[], isRevealed: false, isUnanimous: false };

        const players = Object.values(roomData.players);
        const votes = players
            .map(p => parseFloat(p.vote || '0'))
            .filter(v => !isNaN(v) && v > 0);

        if (roomData.status !== 'REVEALED') return { average: 0, punishedIds: [] as string[], isRevealed: false, isUnanimous: false };
        if (votes.length === 0) return { average: 0, punishedIds: [] as string[], isRevealed: true, isUnanimous: false };

        const sum = votes.reduce((a, b) => a + b, 0); // 0 (start)
        const avg = sum / votes.length;

        // Max Delta
        let maxDelta = -1;
        players.forEach(p => {
            const v = parseFloat(p.vote || '0');
            if (!isNaN(v) && v > 0) {
                const delta = Math.abs(v - avg);
                if (delta > maxDelta) maxDelta = delta;
            }
        });

        const punished = players
            .filter(p => {
                const v = parseFloat(p.vote || '0');
                if (isNaN(v) || v <= 0) return false;
                return Math.abs(v - avg) === maxDelta && maxDelta > 0;
            })
            .map(p => p.id);

        if (maxDelta === 0 && votes.length > 1) {
            return { average: avg, punishedIds: [] as string[], isRevealed: true, isUnanimous: true };
        }

        return { average: avg, punishedIds: punished, isRevealed: true, isUnanimous: false };
    }, [roomData]);

    // Optimistic UI: If we are logged in (playerId) but not in the list yet, show us anyway.
    const optimisticPlayers = useMemo(() => {
        const serverPlayers = roomData?.players ? Object.values(roomData.players) : [];

        if (playerId && !serverPlayers.find(p => p.id === playerId)) {
            const me: any = {
                id: playerId,
                name: playerName,
                avatar: avatar,
                vote: undefined,
                status: 'OPTIMISTIC' // Internal marker
            };
            return [...serverPlayers, me];
        }
        return serverPlayers;
    }, [roomData, playerId, playerName, avatar]);

    const currentPlayer = playerId && roomData?.players?.[playerId] ? roomData.players[playerId] :
        (playerId ? { id: playerId, name: playerName, avatar } as any : undefined);

    const allPlayers = optimisticPlayers;

    // Identify state for statue
    // Responsive Radius State to prevent overflow on small screens
    const [dimensions, setDimensions] = useState({ width: window.innerWidth, height: window.innerHeight });

    useEffect(() => {
        const handleResize = () => setDimensions({ width: window.innerWidth, height: window.innerHeight });
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    // Dynamic Radius: Shrink on smaller screens
    const radiusX = Math.min(350, dimensions.width * 0.35);
    const radiusY = Math.min(320, dimensions.height * 0.35);

    const isAngry = isRevealed && punishedIds.length > 0;

    return (
        <LayoutGroup>
            <div className="h-screen w-full bg-black overflow-hidden relative font-sans selection:bg-solo-blue selection:text-black flex flex-col">

                {/* 1. Background Layer */}
                <div className="absolute inset-0 z-0">
                    <img src={backgroundArena} alt="Temple Floor" className="w-full h-full object-cover opacity-60" />
                    <div className="absolute inset-0 bg-gradient-to-t from-black via-black/50 to-transparent" />
                    {/* Vignette Overlay */}
                    <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,transparent_0%,#000000_100%)] opacity-80 pointer-events-none" />
                </div>

                {/* 1.5 Header Layer (Top Right) */}
                <div className="absolute top-4 right-4 z-50 flex flex-col items-end gap-2">
                    {/* SYSTEM STATUS */}
                    <div className={`flex items-center gap-2 px-3 py-1 rounded border backdrop-blur-md transition-colors ${isConnected ? 'bg-green-900/20 border-green-500/50' : 'bg-red-900/20 border-red-500/50'}`}>
                        <div className={`w-3 h-3 rounded-full ${isConnected ? 'bg-green-500 shadow-[0_0_10px_#22c55e]' : 'bg-red-500 shadow-[0_0_10px_#ef4444] animate-pulse'}`} />
                        <span className={`text-xs font-mono font-bold tracking-wider ${isConnected ? 'text-green-400' : 'text-red-500'}`}>
                            {isConnected ? t('system_online') : t('disconnected')}
                        </span>
                    </div>

                    {/* Language Selector */}
                    <div className="flex items-center gap-2 bg-black/60 backdrop-blur border border-solo-blue/30 px-3 py-1 rounded-sm">
                        <Globe className="w-4 h-4 text-solo-blue" />
                        <select
                            className="bg-transparent text-solo-blue text-xs font-mono outline-none cursor-pointer uppercase tracking-wider"
                            value={language}
                            onChange={(e) => setLanguage(e.target.value as any)}
                        >
                            <option value="en" className="bg-black text-white">English</option>
                            <option value="fr" className="bg-black text-white">Français</option>
                            <option value="es" className="bg-black text-white">Español</option>
                        </select>
                    </div>

                    {/* Room ID & Copy & Leave */}
                    <div className="flex items-center gap-2">
                        <div className="bg-black/80 backdrop-blur border border-solo-blue text-white px-4 py-2 font-mono tracking-widest text-sm shadow-[0_0_15px_rgba(45,212,191,0.2)]">
                            {t('room')}: <span className="text-solo-blue font-bold">{roomId}</span>
                        </div>
                        <CopyButton text={roomId} copiedText={t('copied')} />

                        <button
                            onClick={handleLeave}
                            className="p-2 bg-red-900/20 border border-red-500/50 text-red-500 hover:bg-red-500 hover:text-black transition-all rounded-sm"
                            title={t('leave_room')}
                        >
                            <LogOut className="w-5 h-5" />
                        </button>
                    </div>
                </div>


                {/* DEBUG OVERLAY */}
                <div className="fixed top-24 left-4 z-[100] text-xs font-mono text-green-500 bg-black/90 p-4 border border-green-500/30 rounded max-w-xs pointer-events-none opacity-50 hover:opacity-100 transition-opacity">
                    <div>{t('status')}: {isConnected ? t('online') : t('offline')}</div>
                    <div>{t('pid')}: {playerId?.slice(0, 6)}...</div>
                    <div>{t('players')}: {allPlayers.length}</div>
                    <div className="mt-1 border-t border-gray-800 pt-1">
                        {allPlayers.map(p => (
                            <div key={p.id} className="truncate">
                                - {p.name} {p.id === playerId ? `(${t('you')})` : ''}
                            </div>
                        ))}
                    </div>
                </div>

                {/* 2. Main Game Layer */}
                <div className="relative z-10 h-full flex flex-col pointer-events-none">

                    <LayoutGroup>

                        {/* STATUE ZONE (Top) */}
                        <div className="flex-none h-1/3 w-full relative flex justify-center pt-8">
                            {/* Statue Image */}
                            <motion.img
                                key={isAngry ? 'angry' : 'neutral'}
                                src={isAngry ? statueAngry : statueNeutral}
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1, scale: isAngry ? 1.05 : 1 }}
                                transition={{ duration: 0.5 }}
                                className="h-[60%] md:h-[80%] object-contain drop-shadow-[0_0_50px_rgba(45,212,191,0.1)]"
                                style={{
                                    filter: isAngry ? 'drop-shadow(0 0 30px rgba(239,68,68,0.4))' : 'grayscale(0.5)'
                                }}
                            />
                        </div>

                        {/* PUNISHMENT ZONE - ABSOLUTE CENTER */}
                        <div className="absolute inset-0 flex items-center justify-center z-[80] pointer-events-none">
                            <AnimatePresence>
                                {allPlayers.map(player => {
                                    if (!punishedIds.includes(player.id)) return null;
                                    return (
                                        <motion.div
                                            key={player.id}
                                            layoutId={player.id}
                                            initial={{ opacity: 0, scale: 0.5, y: 100 }}
                                            animate={{ opacity: 1, scale: 1.5, y: 0 }}
                                            exit={{ opacity: 0, scale: 0 }}
                                            transition={{ type: 'spring', stiffness: 60, damping: 15 }}
                                            className="relative z-50 pointer-events-auto"
                                        >
                                            <PlayerCard player={player} isRevealed={isRevealed} status="PUNISHED" />
                                        </motion.div>
                                    );
                                })}
                            </AnimatePresence>
                        </div>

                        {/* PLAYER ZONE (Centered on Screen) */}
                        <div className="absolute inset-0 flex items-center justify-center z-[60] pointer-events-none">
                            {/* Circular Container (Pointer events auto to allow clicking cards) */}
                            <div className="relative w-full h-full flex items-center justify-center pointer-events-auto">
                                <AnimatePresence>
                                    {allPlayers.map((player) => {
                                        // Skip if punished (they are at the statue)
                                        if (punishedIds.includes(player.id)) return null;

                                        // Calculate Index
                                        const activePlayers = allPlayers.filter(p => !punishedIds.includes(p.id));
                                        const activeIndex = activePlayers.findIndex(p => p.id === player.id);
                                        const totalActive = activePlayers.length;

                                        // Open Circle Math
                                        const arcSize = 280;
                                        const startAngle = 90 + (arcSize / 2);
                                        const totalSteps = totalActive > 1 ? totalActive - 1 : 1;
                                        const step = totalActive > 1 ? arcSize / totalSteps : 0;

                                        const angle = totalActive === 1 ? 180 : startAngle - (activeIndex * step);
                                        const rad = (angle * Math.PI) / 180;

                                        // Use Dynamic Radius
                                        const x = radiusX * Math.cos(rad);
                                        const y = radiusY * Math.sin(rad);

                                        return (
                                            <motion.div
                                                key={player.id}
                                                initial={{ opacity: 0, scale: 0 }}
                                                animate={{ opacity: 1, scale: 1, x: x, y: y }}
                                                transition={{ type: "spring", stiffness: 100, damping: 20 }}
                                                className="absolute -ml-8 -mt-12"
                                                style={{ zIndex: 60 - activeIndex }}
                                            >
                                                <div className="relative group">
                                                    <PlayerCard player={player} isRevealed={isRevealed} status="NORMAL" />
                                                    <div className="absolute -bottom-4 left-1/2 -translate-x-1/2 w-20 h-4 bg-black/50 blur-md rounded-[50%]" />
                                                </div>
                                            </motion.div>
                                        );
                                    })}
                                </AnimatePresence>
                            </div>
                        </div>

                    </LayoutGroup>

                    {/* HUD / CONTROLS (Bottom Fixed) */}
                    <div className="absolute bottom-0 left-0 w-full z-[70] flex flex-col items-center gap-2 md:gap-4 bg-gradient-to-t from-black via-black/80 to-transparent pt-10 pointer-events-auto">

                        {/* Controls */}
                        <div className="flex items-center gap-6 mb-2">
                            {/* Button Group */}
                            {!isRevealed && (
                                <button
                                    onClick={reveal}
                                    className="bg-solo-blue text-black font-bold py-3 px-12 rounded-sm shadow-[0_0_20px_rgba(45,212,191,0.5)] hover:bg-white hover:shadow-[0_0_30px_rgba(255,255,255,0.6)] transition-all uppercase font-mono tracking-widest clip-path-polygon z-50 relative"
                                    style={{ clipPath: "polygon(10% 0, 100% 0, 100% 70%, 90% 100%, 0 100%, 0 30%)" }}
                                >
                                    {t('reveal')}
                                </button>
                            )}
                            {isRevealed && (
                                <div className="flex items-center gap-4">
                                    <button
                                        onClick={reset}
                                        className="bg-gray-800 text-white border border-gray-600 font-bold py-3 px-8 rounded-sm hover:bg-gray-700 transition-colors uppercase font-mono tracking-widest z-50 relative"
                                        style={{ clipPath: "polygon(10% 0, 100% 0, 100% 70%, 90% 100%, 0 100%, 0 30%)" }}
                                    >
                                        {t('reset')}
                                    </button>

                                    {!isUnanimous && (
                                        <button
                                            onClick={revote}
                                            className="bg-gray-800 text-white border border-gray-600 font-bold py-3 px-8 rounded-sm hover:bg-gray-700 transition-colors uppercase font-mono tracking-widest z-50 relative"
                                            style={{ clipPath: "polygon(10% 0, 100% 0, 100% 70%, 90% 100%, 0 100%, 0 30%)" }}
                                        >
                                            {t('revote')}
                                        </button>
                                    )}

                                    {/* Average - Moved here */}
                                    <motion.div
                                        initial={{ opacity: 0, x: -20 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        className="px-6 py-2 border border-solo-blue/50 bg-black/80 backdrop-blur text-solo-blue font-mono tracking-[0.2em] shadow-[0_0_20px_rgba(45,212,191,0.2)]"
                                    >
                                        {t('system_avg')}: {average.toFixed(1)}
                                    </motion.div>
                                </div>
                            )}
                        </div>

                        {/* Deck */}
                        <Deck
                            onVote={vote}
                            selectedCard={currentPlayer?.vote || undefined}
                            disabled={isRevealed}
                        />
                    </div>

                    {/* DUNGEON CLEARED OVERLAY */}
                    <AnimatePresence>
                        {isUnanimous && isRevealed && (
                            <motion.div
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                exit={{ opacity: 0 }}
                                className="absolute inset-0 z-[100] bg-black/80 flex items-center justify-center"
                            >
                                <motion.div
                                    initial={{ scale: 0.8, y: 50 }}
                                    animate={{ scale: 1, y: 0 }}
                                    className="relative py-12 px-24 border-y-4 border-[#FFD700] bg-gradient-to-r from-transparent via-black to-transparent"
                                >
                                    <h1 className="text-6xl md:text-8xl font-black text-[#FFD700] drop-shadow-[0_0_30px_rgba(255,215,0,0.6)] tracking-tight text-center">
                                        {t('dungeon_cleared').split(' ')[0]}<br />{t('dungeon_cleared').split(' ').slice(1).join(' ')}
                                    </h1>
                                    <div className="text-[#FFD700] text-center font-mono mt-4 tracking-[0.5em] text-sm opacity-80">
                                        {t('unanimity_achieved')}
                                    </div>
                                </motion.div>
                            </motion.div>
                        )}
                    </AnimatePresence>

                </div>
            </div>
        </LayoutGroup >
    );
};

const CopyButton: React.FC<{ text: string, copiedText: string }> = ({ text, copiedText }) => {
    const [copied, setCopied] = useState(false);

    const handleCopy = () => {
        navigator.clipboard.writeText(text);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    return (
        <button
            onClick={handleCopy}
            className="p-2 bg-solo-blue/10 border border-solo-blue text-solo-blue hover:bg-solo-blue hover:text-black transition-all rounded-sm group relative"
            title="Copy Room ID"
        >
            {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}

            {/* Tooltip confirmation */}
            <AnimatePresence>
                {copied && (
                    <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0 }}
                        className="absolute top-full right-0 mt-2 text-[10px] bg-solo-blue text-black px-2 py-1 font-bold font-mono whitespace-nowrap"
                    >
                        {copiedText}
                    </motion.div>
                )}
            </AnimatePresence>
        </button>
    );
};
