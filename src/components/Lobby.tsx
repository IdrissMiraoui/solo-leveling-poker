import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useLanguage } from '../contexts/LanguageContext';
import { db } from '../services/firebase';
import { ref, onValue } from 'firebase/database';

// Avatars
import jinWooAvatar from '../assets/avatars/jin_woo_new.jpg';
import chaHaeAvatar from '../assets/avatars/cha_hae.jpg';
import wooJinAvatar from '../assets/avatars/woo_jin.jpg';
import thomasAvatar from '../assets/avatars/thomas_andre.jpg';
import beruAvatar from '../assets/avatars/beru_new.jpg';
import igrisAvatar from '../assets/avatars/igris.jpg';
import extra1Avatar from '../assets/avatars/extra_1.jpg';
import extra2Avatar from '../assets/avatars/extra_2.jpg';

const AVATARS = [
    jinWooAvatar,
    chaHaeAvatar,
    wooJinAvatar,
    thomasAvatar,
    beruAvatar,
    igrisAvatar,
    extra1Avatar,
    extra2Avatar
];

interface LobbyProps {
    onJoin: (name: string, avatar: string, roomId: string) => void;
    initialRoomId?: string;
}

export const Lobby: React.FC<LobbyProps> = ({ onJoin, initialRoomId = '' }) => {
    const { t } = useLanguage();
    const [name, setName] = useState('');
    const [roomId, setRoomId] = useState(initialRoomId);
    const [selectedAvatar, setSelectedAvatar] = useState(AVATARS[0]);
    const [error, setError] = useState('');
    const [takenAvatars, setTakenAvatars] = useState<string[]>([]);

    // Load saved name on mount
    useEffect(() => {
        const savedName = localStorage.getItem('player_name');
        if (savedName) setName(savedName);
    }, []);

    // Monitor Room for Taken Avatars
    useEffect(() => {
        if (!roomId || roomId.length < 3) {
            setTakenAvatars([]);
            return;
        }

        const roomRef = ref(db, `rooms/${roomId}/players`);
        const unsubscribe = onValue(roomRef, (snapshot) => {
            const data = snapshot.val();
            if (data) {
                const taken = Object.values(data).map((p: any) => p.avatar);
                setTakenAvatars(taken);
            } else {
                setTakenAvatars([]);
            }
        });

        return () => unsubscribe();
    }, [roomId]);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        if (takenAvatars.includes(selectedAvatar)) {
            setError("This avatar is already taken by another hunter.");
            return;
        }

        if (!name.trim() || !roomId.trim()) {
            setError(t('system_alert_missing'));
            return;
        }
        setError('');

        // Save name for future sessions
        localStorage.setItem('player_name', name.trim());

        onJoin(name, selectedAvatar, roomId.trim());
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-solo-bg p-4 bg-[url('https://wallpapers.com/images/hd/solo-leveling-desktop-3840-x-2160-b60580.jpg')] bg-cover bg-center bg-no-repeat bg-blend-multiply">
            <motion.div
                initial={{ opacity: 0, y: 50 }}
                animate={{ opacity: 1, y: 0 }}
                className="w-full max-w-md bg-black/80 backdrop-blur-md border border-solo-blue rounded-xl p-8 shadow-[0_0_20px_rgba(45,212,191,0.3)]"
            >
                <h1 className="text-3xl font-bold text-center mb-8 text-transparent bg-clip-text bg-gradient-to-r from-solo-blue to-blue-600 font-mono tracking-tighter">
                    {t('system_access')}
                </h1>

                <form onSubmit={handleSubmit} className="space-y-6">
                    <div>
                        <label className="block text-solo-blue text-sm mb-2 font-mono">{t('player_name')} <span className="text-red-500">*</span></label>
                        <input
                            type="text"
                            name="player_name"
                            autoComplete="given-name"
                            value={name}
                            onChange={(e) => {
                                setName(e.target.value);
                                if (error) setError('');
                            }}
                            className="w-full bg-black/50 border border-gray-700 focus:border-solo-blue rounded p-3 text-white outline-none transition-colors"
                            placeholder={t('name_placeholder')}
                            required
                        />
                    </div>

                    <div>
                        <div className="flex justify-between items-end mb-2">
                            <label className="block text-solo-blue text-sm font-mono">{t('room_id')} <span className="text-red-500">*</span></label>
                            <button
                                type="button"
                                onClick={() => {
                                    const randomId = Math.random().toString(36).substring(2, 8).toUpperCase();
                                    setRoomId(randomId);
                                    if (error) setError('');
                                }}
                                className="text-xs text-solo-blue/70 hover:text-solo-blue underline font-mono cursor-pointer"
                            >
                                [ {t('generate_new')} ]
                            </button>
                        </div>
                        <input
                            type="text"
                            value={roomId}
                            onChange={(e) => {
                                setRoomId(e.target.value);
                                if (error) setError('');
                            }}
                            className="w-full bg-black/50 border border-gray-700 focus:border-solo-blue rounded p-3 text-white outline-none transition-colors tracking-widest font-bold"
                            placeholder={t('room_placeholder')}
                            required
                        />
                    </div>

                    <div>
                        <label className="block text-solo-blue text-sm mb-2 font-mono">{t('avatar_class')}</label>
                        <div className="grid grid-cols-4 gap-2">
                            {AVATARS.map((avatar) => {
                                const isTaken = takenAvatars.includes(avatar);
                                return (
                                    <button
                                        key={avatar}
                                        type="button"
                                        disabled={isTaken}
                                        onClick={() => setSelectedAvatar(avatar)}
                                        className={`relative w-14 h-14 rounded-full border-2 transition-all duration-300 overflow-hidden 
                                        ${selectedAvatar === avatar
                                                ? 'border-solo-blue shadow-[0_0_15px_rgba(45,212,191,0.6)] scale-110'
                                                : isTaken
                                                    ? 'border-red-900 opacity-30 grayscale cursor-not-allowed'
                                                    : 'border-gray-700 grayscale-[0.5] hover:grayscale-0 hover:border-gray-500 hover:scale-105'
                                            }`}
                                    >
                                        <img src={avatar} alt="avatar" className="w-full h-full object-cover" />
                                        {isTaken && (
                                            <div className="absolute inset-0 bg-red-900/50 flex items-center justify-center">
                                                <span className="text-red-500 text-xs font-bold">X</span>
                                            </div>
                                        )}
                                    </button>
                                );
                            })}
                        </div>
                    </div>

                    {error && (
                        <div className="text-red-500 text-xs font-mono text-center animate-pulse border border-red-500/50 p-2 bg-red-900/20 rounded">
                            {error}
                        </div>
                    )}

                    <button
                        type="submit"
                        className="w-full bg-solo-blue hover:bg-solo-blue-dim text-black font-bold py-3 rounded transition-all transform hover:scale-[1.02] shadow-[0_0_15px_rgba(45,212,191,0.5)] cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {t('enter_dungeon')}
                    </button>
                </form>
            </motion.div>
        </div>
    );
};
