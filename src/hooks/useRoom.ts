import { useEffect, useState, useRef } from 'react';
import { ref, onValue, set, update, push, remove, onDisconnect } from 'firebase/database';
import { db } from '../services/firebase';

export type Player = {
    id: string;
    name: string;
    avatar: string; // URL or ID
    vote?: string;
};

export type GameStatus = 'VOTING' | 'REVEALED';

export type RoomData = {
    id: string;
    status: GameStatus;
    players: Record<string, Player>;
    average?: number;
};

export const useRoom = (roomId: string | null, playerName: string, avatar: string) => {
    const [playerId, setPlayerId] = useState<string | null>(null);
    const [roomData, setRoomData] = useState<RoomData | null>(null);
    const [isConnected, setIsConnected] = useState(false);
    const isInitialLoad = useRef(true);

    // Connection Status
    useEffect(() => {
        const connectedRef = ref(db, ".info/connected");
        const unsub = onValue(connectedRef, (snap) => {
            setIsConnected(!!snap.val());
        });
        return () => unsub();
    }, []);

    // Join Room
    useEffect(() => {
        if (!roomId || !playerName) return;

        const sessionKey = `poker_session_${roomId}`;
        let currentPid = sessionStorage.getItem(sessionKey);

        // If no ID, generate one
        if (!currentPid) {
            const playersRef = ref(db, `rooms/${roomId}/players`);
            const newRef = push(playersRef);
            currentPid = newRef.key;
            if (currentPid) sessionStorage.setItem(sessionKey, currentPid);
        }

        if (currentPid) {
            setPlayerId(currentPid);

            // ALWAYS announce presence on mount (idempotent)
            const playerRef = ref(db, `rooms/${roomId}/players/${currentPid}`);
            update(playerRef, {
                id: currentPid,
                name: playerName,
                avatar,
                lastSeen: Date.now()
            }).then(() => {
                console.log("JOINED ROOM SUCCESS:", currentPid);
            }).catch(err => {
                console.error("JOIN FAILED:", err);
            });

            // Auto-remove on disconnect
            onDisconnect(playerRef).remove();
        }
    }, [roomId, playerName, avatar]);

    // Listen to Room
    useEffect(() => {
        if (!roomId) return;

        const roomRef = ref(db, `rooms/${roomId}`);
        const unsubscribe = onValue(roomRef, (snapshot) => {
            const data = snapshot.val();
            console.log("FIREBASE UPDATE:", data);
            if (data) {
                setRoomData(data); // Update state

                // Auto-Reset if First User & Stale State
                if (isInitialLoad.current) {
                    const playerIds = data.players ? Object.keys(data.players) : [];
                    // If we are the only one (or room is empty), and it's stuck on REVEALED
                    if (playerIds.length <= 1 && data.status === 'REVEALED') {
                        console.log("⚠️ AUTO-RESETTING STALE ROOM...");
                        const updates: Record<string, any> = {
                            [`rooms/${roomId}/status`]: 'VOTING',
                            [`rooms/${roomId}/average`]: null
                        };
                        // Clear votes for existing players too (if any)
                        playerIds.forEach(pid => {
                            updates[`rooms/${roomId}/players/${pid}/vote`] = null;
                        });
                        update(ref(db), updates);
                    }
                    isInitialLoad.current = false;
                }

            } else {
                // Room doesn't exist, init it
                set(ref(db, `rooms/${roomId}/status`), 'VOTING');
            }
        });

        return () => unsubscribe();
    }, [roomId]);

    // Self-Healing: If we think we are joined (playerId) but server doesn't have us (roomData), re-announce.
    useEffect(() => {
        if (!roomData || !playerId || !playerName) return;

        // If players object is missing or our specific ID is missing
        if (!roomData.players || !roomData.players[playerId]) {
            console.log("⚠️ DETECTED MISSING PLAYER DATA. ATTEMPTING SELF-HEAL...");
            const playerRef = ref(db, `rooms/${roomId}/players/${playerId}`);
            update(playerRef, {
                id: playerId,
                name: playerName,
                avatar,
                vote: null // Preserve vote if we want? Or reset? 
                // Better to strictly re-init basic info. 
                // Actually, if we were deleted, vote is gone too.
            }).catch(err => console.error("HEAL FAILED:", err));
        }
    }, [roomData, playerId, playerName, avatar, roomId]);

    const vote = (value: string) => {
        if (!roomId || !playerId) return;
        update(ref(db, `rooms/${roomId}/players/${playerId}`), { vote: value });
    };

    const reveal = () => {
        if (!roomId) return;
        update(ref(db, `rooms/${roomId}`), { status: 'REVEALED' });
    };

    const reset = () => {
        if (!roomId || !roomData?.players) return;

        const updates: Record<string, any> = {
            [`rooms/${roomId}/status`]: 'VOTING',
            [`rooms/${roomId}/average`]: null
        };

        Object.keys(roomData.players).forEach(pid => {
            updates[`rooms/${roomId}/players/${pid}/vote`] = null;
        });

        update(ref(db), updates);
    };

    // Manual Leave (Cleanup)
    const leave = () => {
        if (!roomId || !playerId) return;
        sessionStorage.removeItem(`poker_session_${roomId}`);
        remove(ref(db, `rooms/${roomId}/players/${playerId}`));
        setPlayerId(null);
    };

    const revote = () => {
        if (!roomId) return;
        update(ref(db), {
            [`rooms/${roomId}/status`]: 'VOTING',
            [`rooms/${roomId}/average`]: null
        });
    };

    return {
        playerId,
        roomData,
        vote,
        reveal,
        reset,
        revote,
        leave,
        isConnected // Export leave function
    };
};
